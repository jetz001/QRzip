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

// Base45 decode (รองรับ QR Text alnum: QZ1D:<base45> และ QZ1K<profile>:<base45>)
const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function base45ToBytes(text) {
  const valueOf = new Map();
  for (let i = 0; i < BASE45_CHARSET.length; i++) valueOf.set(BASE45_CHARSET[i], i);
  const out = [];
  for (let i = 0; i < text.length;) {
    if (i + 2 < text.length) {
      const c1 = valueOf.get(text[i]);
      const c2 = valueOf.get(text[i + 1]);
      const c3 = valueOf.get(text[i + 2]);
      if (c1 === undefined || c2 === undefined || c3 === undefined) throw new Error("invalid_base45");
      const x = c1 + c2 * 45 + c3 * 2025;
      out.push((x >> 8) & 0xff, x & 0xff);
      i += 3;
    } else {
      if (i + 1 >= text.length) throw new Error("invalid_base45");
      const c1 = valueOf.get(text[i]);
      const c2 = valueOf.get(text[i + 1]);
      if (c1 === undefined || c2 === undefined) throw new Error("invalid_base45");
      const x = c1 + c2 * 45;
      out.push(x & 0xff);
      i += 2;
    }
  }
  return Uint8Array.from(out);
}

function binaryStringToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function fixedIdToProfile(profileId) {
  if (profileId === 1) return "num";
  if (profileId === 2) return "en";
  if (profileId === 3) return "mixed";
  return "";
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



function buildWeightedFrequencyMap(entries) {
  const map = new Map();
  entries.forEach(([chars, weight]) => {
    for (const char of chars) {
      map.set(char, (map.get(char) || 0) + weight);
    }
  });
  return map;
}

const presetProfiles = {
  num: [
    ["0123456789", 90],
    [" -+.,:/|", 18],
    ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4],
    ["abcdefghijklmnopqrstuvwxyz", 2],
    ["\n\t", 4]
  ],
  en: [
    [" etaoinshrdlu", 90],
    ["cmfwypvbgkqjxz", 24],
    ["ETAOINSHRDLU", 28],
    ["CMFWYPVBGKQJXZ", 8],
    ["0123456789", 18],
    [".,:/_-|", 16],
    ["[](){}", 4],
    ["\"'&=%?@#", 6],
    ["\n\t", 4]
  ],
  mixed: [
    [" านรเไกมทสยลวคดบปพผฝฟหอฮ", 80],
    ["ะัาำิีึืุูเแโใไ่้๊๋็์ๆฯ", 30],
    ["ขฃคฅฆงจฉชซฌญฎฏฐฑฒณตถทธน", 26],
    ["ศษสฬฤฦ", 18],
    ["abcdefghijklmnopqrstuvwxyz", 12],
    ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8],
    ["0123456789", 16],
    [" .,:/_-|", 14],
    ["\n\t", 4]
  ]
};

const presetFrequencyMaps = Object.fromEntries(
  Object.entries(presetProfiles).map(([key, entries]) => [key, buildWeightedFrequencyMap(entries)])
);

function buildHuffmanTree(freqMap) {
  const nodes = [];
  for (const [char, freq] of freqMap.entries()) {
    nodes.push({ char, freq, left: null, right: null });
  }
  if (!nodes.length) return null;
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq || String(a.char ?? "").localeCompare(String(b.char ?? "")));
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({
      char: null,
      freq: left.freq + right.freq,
      left,
      right
    });
  }
  return nodes[0];
}

function bitsFromBytes(bytes, bitLength) {
  let bits = "";
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }
  return bits.slice(0, bitLength);
}

function decodeFixedPayload(profileId, bitLength, dataB64Url) {
  const tree = buildHuffmanTree(presetFrequencyMaps[profileId.toLowerCase()]);
  if (!tree) throw new Error("unknown_profile");
  const bits = bitsFromBytes(base64UrlToBytes(dataB64Url), Number(bitLength || 0));
  let out = "";
  let node = tree;
  for (const bit of bits) {
    node = bit === "0" ? node.left : node.right;
    if (node && node.char !== null) {
      out += node.char;
      node = tree;
    }
  }
  return out;
}

// ─── Arithmetic Coding decoder ───
function arithmeticDecode(symCount, tableArr, dataBytes) {
  if (!symCount || !dataBytes.length) return '';
  const total = symCount;

  // Rebuild cumulative ranges
  const ranges = [];
  let cum = 0n;
  for (const [cp, cnt] of tableArr) {
    const lo = cum;
    const hi = cum + BigInt(cnt);
    ranges.push({ cp, lo, hi });
    cum = hi;
  }

  // Read bits MSB-first
  const bits = [];
  for (const byte of dataBytes) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }

  const BITS = 30;
  const FULL = 1 << BITS;
  const HALF = FULL >>> 1;
  const QTR  = FULL >>> 2;

  let low = 0, high = FULL, val = 0, bitPos = 0;
  const readBit = () => bitPos < bits.length ? bits[bitPos++] : 0;

  for (let i = 0; i < BITS; i++) val = (val << 1) | readBit();

  const out = [];
  for (let s = 0; s < symCount; s++) {
    const range = high - low;
    const scaled = Math.floor(((val - low + 1) * total - 1) / range);
    let lo2 = 0, hi2 = ranges.length - 1, idx = 0;
    while (lo2 <= hi2) {
      const mid = (lo2 + hi2) >> 1;
      if (Number(ranges[mid].lo) <= scaled) { idx = mid; lo2 = mid + 1; }
      else hi2 = mid - 1;
    }
    const r = ranges[idx];
    out.push(String.fromCodePoint(r.cp));
    high = low + Math.floor(range * Number(r.hi) / total);
    low  = low + Math.floor(range * Number(r.lo) / total);
    for (;;) {
      if (high <= HALF) {
        low <<= 1; high <<= 1; val = (val << 1) | readBit();
      } else if (low >= HALF) {
        low = (low - HALF) << 1; high = (high - HALF) << 1; val = ((val - HALF) << 1) | readBit();
      } else if (low >= QTR && high <= 3 * QTR) {
        low = (low - QTR) << 1; high = (high - QTR) << 1; val = ((val - QTR) << 1) | readBit();
      } else break;
    }
  }
  return out.join('');
}

function decodeFixedFromBytes(profileKey, bitLength, dataBytes) {
  const tree = buildHuffmanTree(presetFrequencyMaps[profileKey?.toLowerCase()]);
  if (!tree) throw new Error("unknown_profile");
  const bits = bitsFromBytes(dataBytes, Number(bitLength || 0));
  let out = "";
  let node = tree;
  for (const bit of bits) {
    node = bit === "0" ? node.left : node.right;
    if (node && node.char !== null) {
      out += node.char;
      node = tree;
    }
  }
  return out;
}

function decodeLzCompactPayload(dataB64Url) {
  const input = base64UrlToBytes(dataB64Url);
  const output = [];
  let position = 0;
  while (position < input.length) {
    const flags = input[position++];
    for (let bit = 0; bit < 8 && position < input.length; bit++) {
      const isLiteral = ((flags >> bit) & 1) === 1;
      if (isLiteral) {
        output.push(input[position++]);
      } else {
        if (position + 1 >= input.length) break;
        const pair = (input[position] << 8) | input[position + 1];
        position += 2;
        const offset = (pair >> 4) + 1;
        const length = (pair & 0x0f) + 3;
        const start = output.length - offset;
        for (let i = 0; i < length; i++) {
          output.push(output[start + i]);
        }
      }
    }
  }
  return decoder.decode(Uint8Array.from(output));
}

function decodeLzCompactFromBytes(input) {
  const output = [];
  let position = 0;
  while (position < input.length) {
    const flags = input[position++];
    for (let bit = 0; bit < 8 && position < input.length; bit++) {
      const isLiteral = ((flags >> bit) & 1) === 1;
      if (isLiteral) {
        output.push(input[position++]);
      } else {
        if (position + 1 >= input.length) break;
        const pair = (input[position] << 8) | input[position + 1];
        position += 2;
        const offset = (pair >> 4) + 1;
        const length = (pair & 0x0f) + 3;
        const start = output.length - offset;
        for (let i = 0; i < length; i++) {
          output.push(output[start + i]);
        }
      }
    }
  }
  return decoder.decode(Uint8Array.from(output));
}


async function decodeQrzipPayload(payload) {
  if (!payload) throw new Error("empty_payload");
  if (payload.startsWith("QZR|")) {
    const rid = payload.slice(4);
    const data = await apiGet(`/api/get/${encodeURIComponent(rid)}`);
    return { kind: "member_ref", payload, text: data.text || "", meta: `member ref | ${rid}` };
  }

  // QR Text alnum (Base45): หลีกเลี่ยง base64 overhead และให้ QR ใช้ alphanumeric mode ได้
  if (payload.startsWith("QZ1D:")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const bytes = base45ToBytes(payload.slice(5));
    const restored = pako.inflateRaw(bytes);
    return { kind: "free_deflate", payload, text: decoder.decode(restored), meta: "free | deflate raw (base45)" };
  }
  if (payload.startsWith("QZ1K")) {
    const match = payload.match(/^QZ1K(\d+):(.*)$/);
    if (match) {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const profileId = Number(match[1] || 0);
      const b45 = match[2] || "";
      const bytes = base45ToBytes(b45);
      const restored = pako.inflateRaw(bytes);
      const utf8 = dictDecodeBytes(profileId, restored);
      return { kind: "free_deflate_dict", payload, text: decoder.decode(utf8), meta: `free | deflate+dict${profileId} (base45)` };
    }
  }
  if (payload.startsWith("QZ1U:")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const blob = base45ToBytes(payload.slice(5));
    const parsed = parseInlineDictBlob(blob);
    const restored = pako.inflateRaw(parsed.deflateBytes);
    const utf8 = inlineDictDecodeBytes(parsed.entriesBytes, restored);
    return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict (base45)" };
  }

  // รองรับ QR Byte mode: payload เป็น "สตริงไบต์" (charCode 0-255) เช่น "QZ1D<bytes...>"
  if (payload.startsWith("QZ1") && payload.length >= 4 && payload[3] !== "|") {
    const bytes = binaryStringToBytes(payload);
    const method = String.fromCharCode(bytes[3] || 0);
    if (method === "T") {
      return {
        kind: "free_text",
        payload,
        text: decoder.decode(bytes.slice(4)),
        meta: "free | raw utf8 (byte-mode)"
      };
    }
    if (method === "D") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const restored = pako.inflateRaw(bytes.slice(4));
      return {
        kind: "free_deflate",
        payload,
        text: decoder.decode(restored),
        meta: "free | deflate raw (byte-mode)"
      };
    }
    if (method === "K") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      if (bytes.length < 5) throw new Error("invalid_dict_frame");
      const profileId = bytes[4];
      const restored = pako.inflateRaw(bytes.slice(5));
      const utf8 = dictDecodeBytes(profileId, restored);
      return {
        kind: "free_deflate_dict",
        payload,
        text: decoder.decode(utf8),
        meta: `free | deflate+dict${profileId} (byte-mode)`
      };
    }
    if (method === "L") {
      return {
        kind: "free_lz_compact",
        payload,
        text: decodeLzCompactFromBytes(bytes.slice(4)),
        meta: "free | lz compact (byte-mode)"
      };
    }
    if (method === "F") {
      if (bytes.length < 7) throw new Error("invalid_fixed_frame");
      const profileKey = fixedIdToProfile(bytes[4]);
      const bitLength = (bytes[5] << 8) | bytes[6];
      const dataBytes = bytes.slice(7);
      return {
        kind: "free_fixed",
        payload,
        text: decodeFixedFromBytes(profileKey, bitLength, dataBytes),
        meta: `free | fixed ${profileKey || "unknown"} (byte-mode)`
      };
    }
    if (method === "U") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const blob = bytes.slice(4);
      const parsed = parseInlineDictBlob(blob);
      const restored = pako.inflateRaw(parsed.deflateBytes);
      const utf8 = inlineDictDecodeBytes(parsed.entriesBytes, restored);
      return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict (byte-mode)" };
    }
    if (method === "A") {
      // QZ1A + uint16(symCount) + uint16(tableLen) + tableDeflate + bitstream
      if (bytes.length < 8) throw new Error("invalid_arithmetic_frame");
      const symCount = (bytes[4] << 8) | bytes[5];
      const tableLen = (bytes[6] << 8) | bytes[7];
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const tableDeflate = bytes.slice(8, 8 + tableLen);
      const bitstreamBytes = bytes.slice(8 + tableLen);
      const tableJson = decoder.decode(pako.inflateRaw(tableDeflate));
      const tableArr = JSON.parse(tableJson);
      return {
        kind: "free_arithmetic",
        payload,
        text: arithmeticDecode(symCount, tableArr, bitstreamBytes),
        meta: "free | arithmetic coding (byte-mode)"
      };
    }
  }

  if (payload.startsWith("QZ1|T|")) {
    return { kind: "free_text", payload, text: payload.split("|", 3)[2], meta: "free | raw ascii" };
  }
  if (payload.startsWith("QZ1|B|")) {
    return { kind: "free_text", payload, text: decoder.decode(base64UrlToBytes(payload.split("|", 3)[2])), meta: "free | utf8 base64url" };
  }
  if (payload.startsWith("QZ1|D|")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const bytes = base64UrlToBytes(payload.split("|", 3)[2]);
    const restored = pako.inflateRaw(bytes);
    return { kind: "free_deflate", payload, text: decoder.decode(restored), meta: "free | deflate raw" };
  }
  if (payload.startsWith("QZ1|K|")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const parts = payload.split("|");
    const profileId = Number(parts[2] || 0);
    const dataB64Url = parts[3] || "";
    const bytes = base64UrlToBytes(dataB64Url);
    const restored = pako.inflateRaw(bytes);
    const utf8 = dictDecodeBytes(profileId, restored);
    return { kind: "free_deflate_dict", payload, text: decoder.decode(utf8), meta: `free | deflate+dict${profileId}` };
  }
  if (payload.startsWith("QZ1|U|")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const blob = base64UrlToBytes(payload.split("|", 3)[2]);
    const parsed = parseInlineDictBlob(blob);
    const restored = pako.inflateRaw(parsed.deflateBytes);
    const utf8 = inlineDictDecodeBytes(parsed.entriesBytes, restored);
    return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict" };
  }
  if (payload.startsWith("QZ1|L|")) {
    return { kind: "free_lz_compact", payload, text: decodeLzCompactPayload(payload.split("|", 3)[2]), meta: "free | lz compact" };
  }
  if (payload.startsWith("QZ1|F|")) {
    const [, , profile, bitLength, data] = payload.split("|");
    return {
      kind: "free_fixed",
      payload,
      text: decodeFixedPayload(profile, bitLength, data),
      meta: `free | fixed ${profile}`
    };
  }
  if (payload.startsWith("QZ1|A|")) {
    // QZ1|A|<symCount>|<base64url(tableDeflate)>|<base64url(bitstream)>
    const parts = payload.split("|");
    const symCount = Number(parts[2] || 0);
    const tableDeflateBytes = base64UrlToBytes(parts[3] || "");
    const bitstreamBytes = base64UrlToBytes(parts[4] || "");
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const tableJson = decoder.decode(pako.inflateRaw(tableDeflateBytes));
    const tableArr = JSON.parse(tableJson);
    return {
      kind: "free_arithmetic",
      payload,
      text: arithmeticDecode(symCount, tableArr, bitstreamBytes),
      meta: "free | arithmetic coding"
    };
  }
  throw new Error("unsupported_payload");
}

async function extractQrFromImage(file) {
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image_load_failed"));
    img.src = imageDataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (typeof jsQR === "undefined") throw new Error("jsqr_not_loaded");
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  if (!result?.data) throw new Error("qr_not_found");
  return { payload: result.data, preview: imageDataUrl };
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
  if (node) node.textContent = value;
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
      const decoded = await decodeQrzipPayload(payload);
      setText("#scanStatus", `สแกนสำเร็จ | ${decoded.meta}`);
      $("#scanPayloadInput").value = payload;
      setText("#scanDecoded", decoded.text);
      setText("#scanFreeHint", payload.startsWith("QZ1|") ? "ใช่, อันนี้เป็น QR แบบฟรี (self-contained)" : "อันนี้เป็น QR แบบสมาชิก/ref");
      $("#result-scan")?.classList.remove("hidden");
    } catch (error) {
      console.error(error);
      setText("#scanStatus", "สแกนไม่สำเร็จ: " + error.message);
      $("#scanPayloadInput").value = "";
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

  let cameraStream = null;
  let cameraInterval = null;

  $("#cameraScanBtn")?.addEventListener("click", async () => {
    try {
      const video = $("#cameraVideo");
      const container = $("#cameraContainer");
      if (!video || !container) return;
      
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = cameraStream;
      video.play();
      container.style.display = "block";
      setText("#scanStatus", "กำลังมองหา QR Code จากกล้อง...");
      $("#result-scan")?.classList.remove("hidden");
      
      cameraInterval = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          if (typeof jsQR !== "undefined") {
            const result = jsQR(imageData.data, imageData.width, imageData.height);
            if (result && result.data) {
              stopCamera();
              $("#scanPreview").src = canvas.toDataURL("image/jpeg");
              $("#scanPreview").style.display = "block";
              try {
                const decoded = await decodeQrzipPayload(result.data);
                setText("#scanStatus", `สแกนสำเร็จ | ${decoded.meta}`);
                setText("#scanPayload", result.data);
                setText("#scanDecoded", decoded.text);
                setText("#scanFreeHint", result.data.startsWith("QZ1|") ? "ใช่, อันนี้เป็น QR แบบฟรี (self-contained)" : "อันนี้เป็น QR แบบสมาชิก/ref");
              } catch(e) {
                setText("#scanStatus", "สแกนไม่สำเร็จ: " + e.message);
              }
            }
          }
        }
      }, 500);
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้: " + err.message);
    }
  });

  $("#cameraStopBtn")?.addEventListener("click", () => {
    stopCamera();
  });

  function stopCamera() {
    if (cameraInterval) { clearInterval(cameraInterval); cameraInterval = null; }
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    const container = $("#cameraContainer");
    if (container) container.style.display = "none";
    setText("#scanStatus", "");
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
