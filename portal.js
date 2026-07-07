import { decodeQrzipPayload } from './decode.js';
const $ = (selector) => document.querySelector(selector);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function utf8Bytes(text) {
  return encoder.encode(text).length;
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function toBase64Url(text) {
  const bytes = encoder.encode(text);
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64ToBytes(base64) {
  if (!base64) return new Uint8Array();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlToBytes(base64url) {
  const padding = "=".repeat((4 - (base64url.length % 4 || 4)) % 4);
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/") + padding;
  return base64ToBytes(base64);
}



function isAsciiOnly(text) {
  for (const char of text) {
    if (char.charCodeAt(0) > 0x7f) return false;
  }
  return true;
}

function buildFreePayload(text) {
  if (isAsciiOnly(text)) return `QZ1|T|${text}`;
  return `QZ1|B|${toBase64Url(text)}`;
}



async function extractQrFromImage(file) {
  if (typeof Html5Qrcode === "undefined") throw new Error("html5_qrcode_not_loaded");
  const reader = new FileReader();
  const imageDataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });

  try {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const result = await html5QrCode.scanFile(file, true);
    return { payload: result, preview: imageDataUrl };
  } catch (err) {
    console.error("html5-qrcode scan error:", err);
    throw new Error("qr_not_found");
  }
}

function renderQr(container, payload, size = 220, isBinary = false) {
  container.innerHTML = "";
  if (typeof qrcode === "undefined") {
    container.textContent = "ยังโหลด QR library ไม่สำเร็จ";
    return false;
  }
  try {
    // 0 = auto version, "M" = medium error correction
    const qr = qrcode(0, "M");
    // qrcode-generator only takes lower 8 bits by default. 
    // We MUST convert JS string to a UTF-8 byte string first for languages like Thai.
    const utf8Payload = isBinary ? payload : unescape(encodeURIComponent(payload));
    qr.addData(utf8Payload);
    qr.make();
    
    const count = qr.getModuleCount();
    const margin = 4;
    const canvasModules = count + margin * 2;
    
    const canvas = document.createElement("canvas");
    canvas.width = canvasModules;
    canvas.height = canvasModules;
    // Scale canvas to the desired size using CSS
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.imageRendering = "pixelated";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasModules, canvasModules);
    ctx.fillStyle = "#000000";
    
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(col + margin, row + margin, 1, 1);
        }
      }
    }
    
    container.appendChild(canvas);
    return true;
  } catch (err) {
    console.error("QR Generation error:", err);
    container.textContent = "ขนาดยาวเกินขีดจำกัดของ QR (เกิน V40)";
    return false;
  }
}

async function apiGet(url) {
  const headers = {};
  const token = localStorage.getItem("adminToken");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "api_error");
  }
  return data;
}

async function apiPost(url, body) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("adminToken");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "api_error");
  }
  return data;
}

function saveMember(member) {
  localStorage.setItem("qrzip_member", JSON.stringify(member));
}

function loadMember() {
  try {
    return JSON.parse(localStorage.getItem("qrzip_member") || "null");
  } catch {
    return null;
  }
}

function memberBadgeText(member) {
  if (!member) return "ยังไม่ได้เป็นสมาชิก";
  return `${member.name} (${member.plan})`;
}

function parseRef(value) {
  const text = (value || "").trim();
  if (!text) return "";
  return text.startsWith("QZR|") ? text.slice(4) : text;
}

function setText(selector, value) {
  const node = $(selector);
  if (node) {
    if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
      node.value = value;
    } else {
      node.textContent = value;
    }
  }
}

async function initHomePage() {
  const member = loadMember();
  setText("#memberState", memberBadgeText(member));

  async function handleQrFile(file) {
    if (!file) return;
    setText("#scanStatus", "กำลังสแกนจากรูป...");
    try {
      const { payload, preview } = await extractQrFromImage(file);
      $("#scanPreview").src = preview;
      $("#scanPreview").style.display = "block";
      $("#scanPayloadInput").value = payload;
      console.log("[QR Scanner] Decoded raw payload:", payload);
      
      const decoded = await decodeQrzipPayload(payload);
      setText("#scanStatus", `สแกนสำเร็จ | ${decoded.meta}`);
      setText("#scanDecoded", decoded.text);
      setText("#scanFreeHint", payload.startsWith("QZ1|") ? "ใช่, อันนี้เป็น QR แบบฟรี (self-contained)" : "อันนี้เป็น QR แบบสมาชิก/ref");
      $("#result-scan")?.classList.remove("hidden");
    } catch (error) {
      console.error(error);
      setText("#scanStatus", "สแกนไม่สำเร็จ: " + error.message);
      setText("#scanDecoded", "");
      setText("#scanFreeHint", "");
    }
  }

  $("#freeCreateBtn")?.addEventListener("click", () => {
    const text = $("#homeText").value;
    if (!text.trim()) {
      setText("#freeStatus", "กรุณาใส่ข้อความก่อน");
      return;
    }
    
    // Generate Raw QR
    const rawOk = renderQr($("#rawQr"), text);
    if (rawOk) {
      setText("#rawStatus", `ขนาดเดิม: ${utf8Bytes(text).toLocaleString()} bytes`);
    } else {
      setText("#rawStatus", "ข้อความยาวเกินไปสำหรับ QR แบบปกติ!");
    }

    // Generate Compressed QR
    // Using engine from qrzip_engine.js
    const stats = typeof analyzeText === 'function' ? analyzeText(text) : null;
    let payload = null;
    let displayPayload = null;
    let finalBytes = 0;
    let savedBytes = 0;
    let modelName = "";

    if (stats) {
      // Find best method dynamically
      const selectorInfo = selectAutoCandidates(stats, text);
      const methods = selectorInfo.candidates;
      const results = methods.map((method) => evaluateMethod(method, text)).filter(Boolean);
      const rankedInfo = rankResults(results, "scan", 0.82);
      
      if (rankedInfo && rankedInfo.ranked.length > 0) {
        const best = rankedInfo.ranked[0];
        payload = best.finalQrText;
        displayPayload = best.finalPayload; // For the text box
        finalBytes = best.finalPayloadBytes; // True byte size of the QR payload
        savedBytes = utf8Bytes(text) - finalBytes;
        modelName = best.label;
      }
    }
    
    if (!payload) {
        // Fallback if engine fails
        payload = buildFreePayload(text);
        displayPayload = payload;
        finalBytes = utf8Bytes(payload);
        savedBytes = utf8Bytes(text) - finalBytes;
        modelName = "Base64 (Fallback)";
    }

    const ok = renderQr($("#freeQr"), payload, 220, true);
    if (ok) {
      const savedPercent = savedBytes > 0 ? Math.round((savedBytes / utf8Bytes(text)) * 100) : 0;
      setText("#freeStatus", `บีบอัดเหลือ: ${finalBytes.toLocaleString()} bytes (ประหยัด ${savedPercent}%)`);
      setText("#freePayload", displayPayload);
      if ($("#modelName")) setText("#modelName", `โมเดล: ${modelName}`);
    } else {
      setText("#freeStatus", "ข้อความยาวเกินสำหรับ Free 1 QR | แนะนำให้ใช้โหมดสมาชิก");
      setText("#freePayload", displayPayload);
      if ($("#modelName")) setText("#modelName", `โมเดล: ${modelName}`);
    }
  });

  $("#resolveBtn")?.addEventListener("click", async () => {
    const rid = parseRef($("#resolveInput").value);
    if (!rid) {
      setText("#resolveStatus", "กรุณาวาง QZR|<id> หรือ <id>");
      return;
    }
    setText("#resolveStatus", "กำลังดึงข้อมูล...");
    try {
      const data = await apiGet(`/api/get/${encodeURIComponent(rid)}`);
      setText("#resolveStatus", `ดึงข้อมูลสำเร็จ | mode ${data.mode || "unknown"}`);
      setText("#resolvedText", data.text || "");
    } catch {
      setText("#resolveStatus", "ดึงข้อมูลไม่สำเร็จ");
      setText("#resolvedText", "");
    }
  });

  $("#scanQrFile")?.addEventListener("change", async (event) => {
    await handleQrFile(event.target.files?.[0]);
  });

  $("#scanPickBtn")?.addEventListener("click", () => {
    $("#scanQrFile")?.click();
  });

  $("#copyDecodedBtn")?.addEventListener("click", () => {
    const text = $("#scanDecoded")?.value;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = $("#copyDecodedBtn");
        const originalText = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => btn.textContent = originalText, 2000);
      }).catch(err => console.error("Copy failed", err));
    }
  });

  let html5QrCodeScannerInstance = null;

  $("#cameraScanBtn")?.addEventListener("click", async () => {
    try {
      const container = $("#cameraContainer");
      if (!container) return;
      container.style.display = "block";
      setText("#scanStatus", "กำลังมองหา QR Code จากกล้อง...");
      $("#result-scan")?.classList.remove("hidden");
      
      if (!html5QrCodeScannerInstance) {
        html5QrCodeScannerInstance = new Html5Qrcode("camera-reader");
      }
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCodeScannerInstance.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          stopCamera();
          try {
            const decoded = await decodeQrzipPayload(decodedText);
            setText("#scanStatus", `สแกนสำเร็จ | ${decoded.meta}`);
            setText("#scanPayloadInput", decodedText);
            setText("#scanDecoded", decoded.text);
            setText("#scanFreeHint", decodedText.startsWith("QZ1|") ? "ใช่, อันนี้เป็น QR แบบฟรี (self-contained)" : "อันนี้เป็น QR แบบสมาชิก/ref");
          } catch(e) {
            setText("#scanStatus", "สแกนไม่สำเร็จ: " + e.message);
            setText("#scanPayloadInput", decodedText);
          }
        },
        (errorMessage) => {
          // ignore error
        }
      );
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้: " + err.message);
      $("#cameraContainer").style.display = "none";
    }
  });

  $("#cameraStopBtn")?.addEventListener("click", () => {
    stopCamera();
  });

  function stopCamera() {
    if (html5QrCodeScannerInstance && html5QrCodeScannerInstance.isScanning) {
      html5QrCodeScannerInstance.stop().then(() => {
        $("#cameraContainer").style.display = "none";
        setText("#scanStatus", "");
      }).catch(err => console.error(err));
    } else {
      const container = $("#cameraContainer");
      if (container) container.style.display = "none";
      setText("#scanStatus", "");
    }
  }

  const dropzone = $("#scanDropzone");
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("active");
    });
  });
  ["dragleave", "dragend"].forEach((eventName) => {
    dropzone?.addEventListener(eventName, () => {
      dropzone.classList.remove("active");
    });
  });
  dropzone?.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropzone.classList.remove("active");
    const file = event.dataTransfer?.files?.[0];
    await handleQrFile(file);
  });
}

async function initSignupPage() {
  const adminToken = localStorage.getItem("qrzip_admin_token");
  if (adminToken) {
    $("#loginOverlay").style.display = "none";
    $("#adminDashboard").style.display = "flex";
    loadAdminMembers(adminToken);
  }

  $("#adminLoginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = $("#adminUser").value.trim();
    const pass = $("#adminPass").value.trim();
    setText("#loginStatus", "กำลังตรวจสอบ...");
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("qrzip_admin_token", data.token);
        $("#loginOverlay").style.display = "none";
        $("#adminDashboard").style.display = "flex";
        loadAdminMembers(data.token);
      } else {
        setText("#loginStatus", data.error || "รหัสผ่านไม่ถูกต้อง");
      }
    } catch (e) {
      setText("#loginStatus", "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  });

  $("#adminLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("qrzip_admin_token");
    location.reload();
  });
}

let currentMembers = [];

async function loadAdminMembers(token) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/admin/members", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      currentMembers = data.items || [];
      renderMembersTable();
    } else if (res.status === 401) {
      localStorage.removeItem("qrzip_admin_token");
      location.reload();
    }
  } catch (e) {
    console.error("Failed to load members", e);
  }
}

function renderMembersTable() {
  const tbody = $("#managementTable");
  if (!tbody) return;
  
  if (currentMembers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">ไม่มีข้อมูลสมาชิก</td></tr>`;
    return;
  }
  
  tbody.innerHTML = currentMembers.map(m => {
    const isBanned = m.banned;
    return `
      <tr>
        <td><code>${m.id}</code></td>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>
          <span class="tag ${m.plan === 'pro' ? 'admin' : ''}">${m.plan}</span>
          ${isBanned ? '<span class="tag banned" style="margin-left:4px;">BANNED</span>' : ''}
        </td>
        <td style="color:var(--muted); font-size:13px;">${new Date(m.createdAt).toLocaleString('th-TH')}</td>
        <td>
          <button class="action-btn edit" onclick="openEditModal('${m.id}')">แก้ไข</button>
          <button class="action-btn ban" onclick="toggleBan('${m.id}', ${!isBanned})">${isBanned ? 'ปลดแบน' : 'แบน'}</button>
          <button class="action-btn delete" onclick="deleteMember('${m.id}')">ลบ</button>
        </td>
      </tr>
    `;
  }).join("");
}

function openEditModal(id) {
  const m = currentMembers.find(x => x.id === id);
  if (!m) return;
  $("#editId").value = m.id;
  $("#editName").value = m.name;
  $("#editEmail").value = m.email;
  $("#editPlan").value = m.plan;
  $("#editModal").style.display = "flex";
}

window.closeEditModal = function() {
  $("#editModal").style.display = "none";
}

window.openEditModal = openEditModal;

window.saveEditMember = async function() {
  const token = localStorage.getItem("qrzip_admin_token");
  if (!token) return;
  
  const id = $("#editId").value;
  const name = $("#editName").value;
  const email = $("#editEmail").value;
  const plan = $("#editPlan").value;
  
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/members/${id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, plan })
    });
    if (res.ok) {
      closeEditModal();
      loadAdminMembers(token);
    } else {
      alert("แก้ไขไม่สำเร็จ");
    }
  } catch (e) {
    alert("เชื่อมต่อไม่สำเร็จ");
  }
}

window.toggleBan = async function(id, banState) {
  if (!confirm(`คุณต้องการ ${banState ? 'แบน' : 'ปลดแบน'} สมาชิกนี้ใช่หรือไม่?`)) return;
  
  const token = localStorage.getItem("qrzip_admin_token");
  if (!token) return;
  
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/members/${id}/ban`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ banned: banState })
    });
    if (res.ok) loadAdminMembers(token);
  } catch (e) {
    console.error(e);
  }
}

window.deleteMember = async function(id) {
  if (!confirm("คุณต้องการลบสมาชิกนี้ถาวรใช่หรือไม่? (ไม่สามารถกู้คืนได้)")) return;
  
  const token = localStorage.getItem("qrzip_admin_token");
  if (!token) return;
  
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/members/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) loadAdminMembers(token);
  } catch (e) {
    console.error(e);
  }
}

window.openAddModal = function() {
  $("#addName").value = "";
  $("#addEmail").value = "";
  $("#addPlan").value = "member";
  $("#addModal").style.display = "flex";
}

window.closeAddModal = function() {
  $("#addModal").style.display = "none";
}

window.saveAddMember = async function() {
  const name = $("#addName").value.trim();
  const email = $("#addEmail").value.trim();
  const plan = $("#addPlan").value;
  
  if (!name || !email) {
    alert("กรุณากรอกชื่อและอีเมล");
    return;
  }
  
  const token = localStorage.getItem("qrzip_admin_token");
  try {
    const res = await fetch("http://127.0.0.1:8000/api/member/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, plan })
    });
    if (res.ok) {
      closeAddModal();
      if (token) loadAdminMembers(token);
    } else {
      alert("เพิ่มสมาชิกไม่สำเร็จ");
    }
  } catch (e) {
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
  }
}

async function initMemberPage() {
  const member = loadMember();
  if (!member) {
    setText("#memberModeStatus", "ยังไม่มีสมาชิกในเครื่องนี้ กรุณาสมัครก่อน");
    return;
  }
  setText("#memberCard", `${member.name} | ${member.email} | ${member.id}`);

  $("#memberCreateBtn")?.addEventListener("click", async () => {
    const text = $("#memberText").value;
    if (!text.trim()) {
      setText("#memberModeStatus", "กรุณาใส่ข้อความก่อน");
      return;
    }
    setText("#memberModeStatus", "กำลังสร้าง QR สมาชิก...");
    try {
      const data = await apiPost("/api/store", {
        text,
        payload: "",
        memberId: member.id,
        mode: "member"
      });
      const ref = `QZR|${data.id}`;
      const ok = renderQr($("#memberQr"), ref);
      setText("#memberModeStatus", ok
        ? `สร้าง Member QR 1 ใบแล้ว | payload ${utf8Bytes(ref).toLocaleString()} bytes`
        : "สร้าง ref ได้แล้ว แต่ QR แสดงผลไม่สำเร็จ");
      setText("#memberPayload", ref);
      $("#memberResolveInput").value = ref;
    } catch {
      setText("#memberModeStatus", "สร้าง QR สมาชิกไม่สำเร็จ");
    }
  });

  $("#memberResolveBtn")?.addEventListener("click", async () => {
    const rid = parseRef($("#memberResolveInput").value);
    if (!rid) {
      setText("#memberResolveStatus", "กรุณาวาง ref");
      return;
    }
    setText("#memberResolveStatus", "กำลังดึงข้อมูล...");
    try {
      const data = await apiGet(`/api/get/${encodeURIComponent(rid)}`);
      setText("#memberResolveStatus", "ดึงข้อมูลสำเร็จ");
      setText("#memberResolvedText", data.text || "");
    } catch {
      setText("#memberResolveStatus", "ดึงข้อมูลไม่สำเร็จ");
    }
  });
}

function renderRows(tableSelector, rows, mapper) {
  const tbody = $(tableSelector);
  if (!tbody) return;
  tbody.innerHTML = rows.map(mapper).join("");
}

async function initAdminPage() {
  const token = localStorage.getItem("adminToken");
  
  if (!token) {
    $("#loginOverlay").style.display = "flex";
    $("#adminDashboard").style.display = "none";
  } else {
    $("#loginOverlay").style.display = "none";
    $("#adminDashboard").style.display = "flex";
    loadAdminData();
  }

  $("#adminLoginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#adminUser").value;
    const password = $("#adminPass").value;
    setText("#loginStatus", "กำลังตรวจสอบ...");
    try {
      const res = await apiPost("/api/admin/login", { username, password });
      localStorage.setItem("adminToken", res.token);
      $("#loginOverlay").style.display = "none";
      $("#adminDashboard").style.display = "flex";
      loadAdminData();
    } catch {
      setText("#loginStatus", "รหัสผ่านไม่ถูกต้อง");
    }
  });

  $("#adminLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");
    window.location.reload();
  });
}

async function loadAdminData() {
  try {
    const [overview, refs, members] = await Promise.all([
      apiGet("/api/admin/overview"),
      apiGet("/api/admin/refs"),
      apiGet("/api/admin/members")
    ]);

    setText("#metricRefs", String(overview.totals.refs));
    setText("#metricMembers", String(overview.totals.members));
    setText("#metricFree", String(overview.totals.freeRefs));
    setText("#metricMemberRefs", String(overview.totals.memberRefs));

    renderRows("#refsTable", refs.items || [], (item) => `
      <tr>
        <td><code>${item.id}</code></td>
        <td><span class="tag">${item.mode || "free"}</span></td>
        <td><code>${item.memberId || "-"}</code></td>
        <td>${(item.text || "").slice(0, 80)}</td>
        <td>${item.createdAt || "-"}</td>
      </tr>
    `);

    renderRows("#membersTable", members.items || [], (item) => `
      <tr>
        <td><code>${item.id}</code></td>
        <td>${item.name || "-"}</td>
        <td>${item.email || "-"}</td>
        <td><span class="tag">${item.plan || "member"}</span></td>
        <td>${item.createdAt || "-"}</td>
      </tr>
    `);
  } catch {
    setText("#adminStatus", "โหลดข้อมูลแอดมินไม่สำเร็จ (Token อาจหมดอายุ)");
    localStorage.removeItem("adminToken");
    setTimeout(() => window.location.reload(), 1500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "signup") initSignupPage();
  if (page === "member") initMemberPage();
  if (page === "admin") initAdminPage();
});
