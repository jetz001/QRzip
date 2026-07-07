const decoder = new TextDecoder();

function base64ToBytes(base64) {
  if (!base64) return new Uint8Array();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function base64UrlToBytes(base64url) {
  const padding = "=".repeat((4 - (base64url.length % 4 || 4)) % 4);
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/") + padding;
  return base64ToBytes(base64);
}

const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
export function base45ToBytes(text) {
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

export function binaryStringToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function fixedIdToProfile(profileId) {
  if (profileId === 1) return "num";
  if (profileId === 2) return "en";
  if (profileId === 3) return "mixed";
  return "";
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

export function decodeFixedPayload(profileId, bitLength, dataB64Url) {
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

export function decodeFixedFromBytes(profileKey, bitLength, dataBytes) {
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

// ─── Arithmetic Coding decoder ───
export function arithmeticDecode(symCount, tableArr, dataBytes) {
  if (!symCount || !dataBytes.length) return '';
  const total = symCount;
  const ranges = [];
  let cum = 0n;
  for (const [cp, cnt] of tableArr) {
    const lo = cum;
    const hi = cum + BigInt(cnt);
    ranges.push({ cp, lo, hi });
    cum = hi;
  }
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

export function decodeLzCompactPayload(dataB64Url) {
  const input = base64UrlToBytes(dataB64Url);
  return decodeLzCompactFromBytes(input);
}

export function decodeLzCompactFromBytes(input) {
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

// ─── Compressed Parameterized Pattern Matching (P-Matching) Stub ───
// Experimental Module for Lab Research
export function compressedPMatching(compressedBytes, pattern) {
  // This simulates the logic of partial decompression and p-border structures.
  // Instead of fully decompressing, it operates over the compressed stream.
  console.log("[LAB] Running Compressed P-Matching with pattern:", pattern);
  
  // Minimal Implementation (Fall-back to full decode + match for now)
  // In a full implementation, you would walk the LZ dictionary references
  // and construct p-borders on the fly.
  
  return { 
    found: false, 
    message: "Experimental: P-Matching requires full compressed stream parsing." 
  };
}


export async function decodeQrzipPayload(payload, apiGet = null) {
  if (!payload) throw new Error("empty_payload");
  if (payload.startsWith("QZR|")) {
    const rid = payload.slice(4);
    if (!apiGet) throw new Error("apiGet required for reference payloads");
    const data = await apiGet(`/api/get/${encodeURIComponent(rid)}`);
    return { kind: "member_ref", payload, text: data.text || "", meta: `member ref | ${rid}` };
  }

  // Ensure dictDecodeBytes and other engine globals are available
  const globalDictDecodeBytes = window.dictDecodeBytes;
  const globalParseInlineDictBlob = window.parseInlineDictBlob;
  const globalInlineDictDecodeBytes = window.inlineDictDecodeBytes;

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
      if (!globalDictDecodeBytes) throw new Error("engine_not_loaded");
      const profileId = Number(match[1] || 0);
      const b45 = match[2] || "";
      const bytes = base45ToBytes(b45);
      const restored = pako.inflateRaw(bytes);
      const utf8 = globalDictDecodeBytes(profileId, restored);
      return { kind: "free_deflate_dict", payload, text: decoder.decode(utf8), meta: `free | deflate+dict${profileId} (base45)` };
    }
  }
  if (payload.startsWith("QZ1U:")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    if (!globalParseInlineDictBlob) throw new Error("engine_not_loaded");
    const blob = base45ToBytes(payload.slice(5));
    const parsed = globalParseInlineDictBlob(blob);
    const restored = pako.inflateRaw(parsed.deflateBytes);
    const utf8 = globalInlineDictDecodeBytes(parsed.entriesBytes, restored);
    return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict (base45)" };
  }

  if (payload.startsWith("QZ1") && payload.length >= 4 && payload[3] !== "|") {
    const bytes = binaryStringToBytes(payload);
    const method = String.fromCharCode(bytes[3] || 0);
    if (method === "T") {
      return { kind: "free_text", payload, text: decoder.decode(bytes.slice(4)), meta: "free | raw utf8 (byte-mode)" };
    }
    if (method === "D") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const restored = pako.inflateRaw(bytes.slice(4));
      return { kind: "free_deflate", payload, text: decoder.decode(restored), meta: "free | deflate raw (byte-mode)" };
    }
    if (method === "K") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      if (!globalDictDecodeBytes) throw new Error("engine_not_loaded");
      if (bytes.length < 5) throw new Error("invalid_dict_frame");
      const profileId = bytes[4];
      const restored = pako.inflateRaw(bytes.slice(5));
      const utf8 = globalDictDecodeBytes(profileId, restored);
      return { kind: "free_deflate_dict", payload, text: decoder.decode(utf8), meta: `free | deflate+dict${profileId} (byte-mode)` };
    }
    if (method === "L") {
      return { kind: "free_lz_compact", payload, text: decodeLzCompactFromBytes(bytes.slice(4)), meta: "free | lz compact (byte-mode)" };
    }
    if (method === "F") {
      if (bytes.length < 7) throw new Error("invalid_fixed_frame");
      const profileKey = fixedIdToProfile(bytes[4]);
      const bitLength = (bytes[5] << 8) | bytes[6];
      const dataBytes = bytes.slice(7);
      return { kind: "free_fixed", payload, text: decodeFixedFromBytes(profileKey, bitLength, dataBytes), meta: `free | fixed ${profileKey || "unknown"} (byte-mode)` };
    }
    if (method === "U") {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      if (!globalParseInlineDictBlob) throw new Error("engine_not_loaded");
      const blob = bytes.slice(4);
      const parsed = globalParseInlineDictBlob(blob);
      const restored = pako.inflateRaw(parsed.deflateBytes);
      const utf8 = globalInlineDictDecodeBytes(parsed.entriesBytes, restored);
      return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict (byte-mode)" };
    }
    if (method === "A") {
      if (bytes.length < 8) throw new Error("invalid_arithmetic_frame");
      const symCount = (bytes[4] << 8) | bytes[5];
      const tableLen = (bytes[6] << 8) | bytes[7];
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const tableDeflate = bytes.slice(8, 8 + tableLen);
      const bitstreamBytes = bytes.slice(8 + tableLen);
      const tableJson = decoder.decode(pako.inflateRaw(tableDeflate));
      const tableArr = JSON.parse(tableJson);
      return { kind: "free_arithmetic", payload, text: arithmeticDecode(symCount, tableArr, bitstreamBytes), meta: "free | arithmetic coding (byte-mode)" };
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
    if (!globalDictDecodeBytes) throw new Error("engine_not_loaded");
    const parts = payload.split("|");
    const profileId = Number(parts[2] || 0);
    const dataB64Url = parts[3] || "";
    const bytes = base64UrlToBytes(dataB64Url);
    const restored = pako.inflateRaw(bytes);
    const utf8 = globalDictDecodeBytes(profileId, restored);
    return { kind: "free_deflate_dict", payload, text: decoder.decode(utf8), meta: `free | deflate+dict${profileId}` };
  }
  if (payload.startsWith("QZ1|U|")) {
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    if (!globalParseInlineDictBlob) throw new Error("engine_not_loaded");
    const blob = base64UrlToBytes(payload.split("|", 3)[2]);
    const parsed = globalParseInlineDictBlob(blob);
    const restored = pako.inflateRaw(parsed.deflateBytes);
    const utf8 = globalInlineDictDecodeBytes(parsed.entriesBytes, restored);
    return { kind: "free_deflate_inline", payload, text: decoder.decode(utf8), meta: "free | deflate+inlineDict" };
  }
  if (payload.startsWith("QZ1|L|")) {
    return { kind: "free_lz_compact", payload, text: decodeLzCompactPayload(payload.split("|", 3)[2]), meta: "free | lz compact" };
  }
  if (payload.startsWith("QZ1|F|")) {
    const [, , profile, bitLength, data] = payload.split("|");
    return { kind: "free_fixed", payload, text: decodeFixedPayload(profile, bitLength, data), meta: `free | fixed ${profile}` };
  }
  if (payload.startsWith("QZ1|A|")) {
    const parts = payload.split("|");
    const symCount = Number(parts[2] || 0);
    const tableDeflateBytes = base64UrlToBytes(parts[3] || "");
    const bitstreamBytes = base64UrlToBytes(parts[4] || "");
    if (typeof pako === "undefined") throw new Error("pako_not_loaded");
    const tableJson = decoder.decode(pako.inflateRaw(tableDeflateBytes));
    const tableArr = JSON.parse(tableJson);
    return { kind: "free_arithmetic", payload, text: arithmeticDecode(symCount, tableArr, bitstreamBytes), meta: "free | arithmetic coding" };
  }
  throw new Error("unsupported_payload");
}
