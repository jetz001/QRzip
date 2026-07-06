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

// Dict profiles must match Lab preset (implicit, no per-QR metadata)
const DICT_PROFILES = [
  {
    id: 1,
    name: "log",
    entries: [
      "ERROR",
      "USER_LOGIN_OK",
      "กรุงเทพ",
      " | ",
      " |",
      "| ",
      "HTTP",
      "GET ",
      "POST ",
      "SELECT ",
      "INSERT ",
      "UPDATE ",
      "DELETE ",
      "\"",
      ": ",
      ", ",
      "\n"
    ]
  },
  {
    id: 2,
    name: "thai_ui",
    entries: [
      "ข้อความนี้",
      "ผลลัพธ์",
      "บีบอัด",
      "สแกนง่าย",
      "สแกนยาก",
      "ความหนาแน่น",
      "เกณฑ์ตัดสิน",
      "เลือก",
      "ชนะ",
      "เดิม",
      "หลัง",
      "ประมาณ",
      "คะแนน",
      "แน่น",
      "QR version",
      "scanability",
      "payload",
      "bytes",
      "token",
      "Member QR",
      "Auto Selector",
      " | ",
      ": ",
      ", ",
      "\n"
    ]
  },
  {
    id: 3,
    name: "thai_common",
    entries: [
      "การ",
      "ความ",
      "ที่",
      "และ",
      "ของ",
      "เป็น",
      "ใน",
      "ไม่",
      "ได้",
      "ให้",
      "เพื่อ",
      "จาก",
      "กับ",
      "จะ",
      "มี",
      "หรือ",
      "ซึ่ง",
      "โดย",
      "แล้ว",
      "ว่า",
      "กัน",
      "ทำ",
      "ต้อง",
      "ควร",
      "สามารถ",
      "มาก",
      "น้อย",
      "ที่สุด",
      "อย่าง",
      "เมื่อ",
      "ถ้า",
      "แต่",
      "เพราะ",
      "ดังนั้น",
      "รวมถึง",
      "สำหรับ",
      "ระหว่าง",
      "ภายใน",
      "ภายนอก",
      "ระบบ",
      "ข้อมูล",
      "ข้อความ",
      "สแกน",
      "บีบอัด",
      "ขนาด",
      "ประมาณ",
      " ",
      "  ",
      ". ",
      ", ",
      ": ",
      " | ",
      "\n"
    ]
  },
  {
    id: 4,
    name: "eng_common",
    entries: [
      " the ",
      " and ",
      " to ",
      " of ",
      " in ",
      " for ",
      " with ",
      " is ",
      " are ",
      " was ",
      " were ",
      " this ",
      " that ",
      " you ",
      " we ",
      " I ",
      " not ",
      " can ",
      " should ",
      " payload ",
      " bytes ",
      " token ",
      " scanability ",
      " version ",
      " error",
      " ERROR",
      " OK",
      " HTTP",
      " GET ",
      " POST ",
      " PUT ",
      " DELETE ",
      " https://",
      " http://",
      "Content-Type: ",
      "application/json",
      "Authorization: Bearer ",
      "\"id\":",
      "\"name\":",
      "\"status\":",
      "\"message\":",
      ", ",
      ": ",
      "\n"
    ]
  },
  {
    id: 5,
    name: "eng_prose",
    entries: [
      " the ",
      " and ",
      "ing ",
      "ion ",
      "tion",
      "ment",
      "ness",
      "ly ",
      "ed ",
      "er ",
      "al ",
      "re ",
      "This ",
      "This demo ",
      "compression ",
      "compressed ",
      "decompressed ",
      "lossless ",
      "payload ",
      "result ",
      "results ",
      "before ",
      "after ",
      "selecting ",
      "methods ",
      "multiple ",
      "plain text ",
      "text ",
      "bytes ",
      "version ",
      "scanability ",
      "should ",
      "could ",
      "would ",
      "because ",
      "therefore ",
      "between ",
      "within ",
      "without ",
      "more ",
      "less ",
      " than ",
      " from ",
      " with ",
      ". ",
      ", ",
      ": ",
      "\n"
    ]
  },
  {
    id: 6,
    name: "json_http",
    entries: [
      "{\"",
      "\"}",
      "\":[",
      "\"]",
      "\":\"",
      "\",\"",
      "\", \"",
      "\"id\":",
      "\"name\":",
      "\"type\":",
      "\"status\":",
      "\"message\":",
      "\"data\":",
      "\"payload\":",
      "\"result\":",
      "\"error\":",
      "\"items\":",
      "\"createdAt\":",
      "\"updatedAt\":",
      "\"userId\":",
      "\"token\":",
      "\"accessToken\":",
      "\"refreshToken\":",
      "application/json",
      "Content-Type: ",
      "Authorization: Bearer ",
      "Accept: ",
      "User-Agent: ",
      "https://",
      "http://",
      "/api/",
      "GET ",
      "POST ",
      "PUT ",
      "PATCH ",
      "DELETE ",
      "HTTP/1.1",
      "HTTP/2",
      "\r\n",
      "\n",
      ", ",
      ": "
    ]
  }
];

const DICT_PROFILE_BYTES = new Map(
  DICT_PROFILES.map((p) => [p.id, p.entries.map((s) => encoder.encode(s))])
);

function getDictBytes(profileId) {
  return DICT_PROFILE_BYTES.get(profileId) || null;
}

function dictDecodeBytes(profileId, tokenBytes) {
  const dictBytes = getDictBytes(profileId);
  if (!dictBytes) throw new Error("unknown_dict_profile");
  const out = [];
  for (let i = 0; i < tokenBytes.length; i++) {
    const b = tokenBytes[i];
    if (b !== 0x00) {
      out.push(b);
      continue;
    }
    if (i + 1 >= tokenBytes.length) break;
    const code = tokenBytes[++i];
    if (code === 0x00) {
      out.push(0x00);
      continue;
    }
    const dict = dictBytes[code - 1];
    if (dict) {
      for (const db of dict) out.push(db);
    }
  }
  return Uint8Array.from(out);
}

// InlineDict (BPE) decoder helpers (ต้องตรงกับ Lab)
function parseInlineDictBlob(blobBytes) {
  if (!blobBytes || blobBytes.length < 3) throw new Error("invalid_inline_dict");
  const v = blobBytes[0];
  if (v !== 1) throw new Error("unknown_inline_dict_version");
  const n = blobBytes[1];
  let pos = 2;
  const entries = [];
  for (let i = 0; i < n; i++) {
    if (pos >= blobBytes.length) throw new Error("invalid_inline_dict");
    const len = blobBytes[pos++];
    if (pos + len > blobBytes.length) throw new Error("invalid_inline_dict");
    entries.push(decoder.decode(blobBytes.slice(pos, pos + len)));
    pos += len;
  }
  const deflateBytes = blobBytes.slice(pos);
  return { entries, deflateBytes };
}

function inlineDictDecodeBytes(dictEntries, tokenBytes) {
  const dictBytes = dictEntries.map((s) => encoder.encode(s));
  const out = [];
  for (let i = 0; i < tokenBytes.length; i++) {
    const b = tokenBytes[i];
    if (b !== 0x00) {
      out.push(b);
      continue;
    }
    if (i + 1 >= tokenBytes.length) break;
    const code = tokenBytes[++i];
    if (code === 0x00) {
      out.push(0x00);
      continue;
    }
    const d = dictBytes[code - 1];
    if (d) for (const db of d) out.push(db);
  }
  return Uint8Array.from(out);
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
    const utf8 = inlineDictDecodeBytes(parsed.entries, restored);
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
      const utf8 = inlineDictDecodeBytes(parsed.entries, restored);
      return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict (byte-mode)" };
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
    const utf8 = inlineDictDecodeBytes(parsed.entries, restored);
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

function renderQr(container, payload, size = 220) {
  container.innerHTML = "";
  if (typeof QRCode === "undefined") {
    container.textContent = "ยังโหลด QR library ไม่สำเร็จ";
    return false;
  }
  try {
    new QRCode(container, {
      text: payload,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
    return true;
  } catch {
    container.textContent = "QR ใหญ่เกินไป";
    return false;
  }
}

async function apiGet(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "api_error");
  }
  return data;
}

async function apiPost(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      setText("#scanPayload", payload);
      setText("#scanRecovered", decoded.text);
      setText("#scanFreeHint", payload.startsWith("QZ1|") ? "ใช่, อันนี้เป็น QR แบบฟรี (self-contained)" : "อันนี้เป็น QR แบบสมาชิก/ref");
    } catch (error) {
      setText("#scanStatus", "สแกนไม่สำเร็จ");
      setText("#scanPayload", "");
      setText("#scanRecovered", "");
      setText("#scanFreeHint", "");
    }
  }

  $("#freeCreateBtn")?.addEventListener("click", () => {
    const text = $("#homeText").value;
    if (!text.trim()) {
      setText("#freeStatus", "กรุณาใส่ข้อความก่อน");
      return;
    }
    const payload = buildFreePayload(text);
    const ok = renderQr($("#freeQr"), payload);
    if (ok) {
      setText("#freeStatus", `สร้าง Free QR 1 ใบแล้ว | payload ${utf8Bytes(payload).toLocaleString()} bytes`);
      setText("#freePayload", payload);
    } else {
      setText("#freeStatus", "ข้อความยาวเกินสำหรับ Free 1 QR | แนะนำให้ใช้โหมดสมาชิกเพื่อสร้าง QR สั้นสุด");
      setText("#freePayload", payload);
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
  const current = loadMember();
  setText("#signupState", current ? `มีสมาชิกในเครื่องนี้แล้ว: ${current.name}` : "ยังไม่มีข้อมูลสมาชิกในเครื่องนี้");

  $("#signupBtn")?.addEventListener("click", async () => {
    const name = $("#signupName").value.trim();
    const email = $("#signupEmail").value.trim();
    const plan = $("#signupPlan").value;
    if (!name || !email) {
      setText("#signupStatus", "กรุณากรอกชื่อและอีเมล");
      return;
    }
    setText("#signupStatus", "กำลังสมัครสมาชิก...");
    try {
      const data = await apiPost("/api/member/signup", { name, email, plan });
      saveMember(data.member);
      setText("#signupStatus", `สมัครสำเร็จ | member id: ${data.member.id}`);
      setText("#signupResult", JSON.stringify(data.member, null, 2));
    } catch {
      setText("#signupStatus", "สมัครไม่สำเร็จ");
    }
  });
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
    setText("#adminStatus", "โหลดข้อมูลแอดมินไม่สำเร็จ");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "signup") initSignupPage();
  if (page === "member") initMemberPage();
  if (page === "admin") initAdminPage();
});
