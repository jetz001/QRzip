const encoder = new TextEncoder();
const decoder = new TextDecoder();
const presetProfiles = {
  num: {
    id: "num",
    label: "Fixed NUM",
    entries: [
      ["0123456789", 90],
      [" -+.,:/|", 18],
      ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4],
      ["abcdefghijklmnopqrstuvwxyz", 2],
      ["\n	", 4]
    ]
  },
  en: {
    id: "en",
    label: "Fixed EN",
    entries: [
      [" etaoinshrdlu", 90],
      ["cmfwypvbgkqjxz", 24],
      ["ETAOINSHRDLU", 28],
      ["CMFWYPVBGKQJXZ", 8],
      ["0123456789", 18],
      [".,:/_-|", 16],
      ["[](){}", 4],
      [`"'&=%?@#`, 6],
      ["\n	", 4]
    ]
  },
  mixed: {
    id: "mixed",
    label: "Fixed MIX",
    entries: [
      [" \u0E32\u0E19\u0E23\u0E40\u0E44\u0E01\u0E21\u0E17\u0E2A\u0E22\u0E25\u0E27\u0E04\u0E14\u0E1A\u0E1B\u0E1E\u0E1C\u0E1D\u0E1F\u0E2B\u0E2D\u0E2E", 80],
      ["\u0E30\u0E31\u0E32\u0E33\u0E34\u0E35\u0E36\u0E37\u0E38\u0E39\u0E40\u0E41\u0E42\u0E43\u0E44\u0E48\u0E49\u0E4A\u0E4B\u0E47\u0E4C\u0E46\u0E2F", 30],
      ["\u0E02\u0E03\u0E04\u0E05\u0E06\u0E07\u0E08\u0E09\u0E0A\u0E0B\u0E0C\u0E0D\u0E0E\u0E0F\u0E10\u0E11\u0E12\u0E13\u0E15\u0E16\u0E17\u0E18\u0E19", 26],
      ["\u0E28\u0E29\u0E2A\u0E2C\u0E24\u0E26", 18],
      ["abcdefghijklmnopqrstuvwxyz", 12],
      ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8],
      ["0123456789", 16],
      [" .,:/_-|", 14],
      ["\n	", 4]
    ]
  }
};
const DICT_PROFILES = [
  {
    id: 1,
    name: "log",
    entries: [
      "ERROR",
      "USER_LOGIN_OK",
      "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E",
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
      '"',
      ": ",
      ", ",
      "\n"
    ]
  },
  {
    id: 2,
    name: "thai_ui",
    entries: [
      "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E19\u0E35\u0E49",
      "\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C",
      "\u0E1A\u0E35\u0E1A\u0E2D\u0E31\u0E14",
      "\u0E2A\u0E41\u0E01\u0E19\u0E07\u0E48\u0E32\u0E22",
      "\u0E2A\u0E41\u0E01\u0E19\u0E22\u0E32\u0E01",
      "\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E19\u0E32\u0E41\u0E19\u0E48\u0E19",
      "\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19",
      "\u0E40\u0E25\u0E37\u0E2D\u0E01",
      "\u0E0A\u0E19\u0E30",
      "\u0E40\u0E14\u0E34\u0E21",
      "\u0E2B\u0E25\u0E31\u0E07",
      "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13",
      "\u0E04\u0E30\u0E41\u0E19\u0E19",
      "\u0E41\u0E19\u0E48\u0E19",
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
      "\u0E01\u0E32\u0E23",
      "\u0E04\u0E27\u0E32\u0E21",
      "\u0E17\u0E35\u0E48",
      "\u0E41\u0E25\u0E30",
      "\u0E02\u0E2D\u0E07",
      "\u0E40\u0E1B\u0E47\u0E19",
      "\u0E43\u0E19",
      "\u0E44\u0E21\u0E48",
      "\u0E44\u0E14\u0E49",
      "\u0E43\u0E2B\u0E49",
      "\u0E40\u0E1E\u0E37\u0E48\u0E2D",
      "\u0E08\u0E32\u0E01",
      "\u0E01\u0E31\u0E1A",
      "\u0E08\u0E30",
      "\u0E21\u0E35",
      "\u0E2B\u0E23\u0E37\u0E2D",
      "\u0E0B\u0E36\u0E48\u0E07",
      "\u0E42\u0E14\u0E22",
      "\u0E41\u0E25\u0E49\u0E27",
      "\u0E27\u0E48\u0E32",
      "\u0E01\u0E31\u0E19",
      "\u0E17\u0E33",
      "\u0E15\u0E49\u0E2D\u0E07",
      "\u0E04\u0E27\u0E23",
      "\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16",
      "\u0E21\u0E32\u0E01",
      "\u0E19\u0E49\u0E2D\u0E22",
      "\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14",
      "\u0E2D\u0E22\u0E48\u0E32\u0E07",
      "\u0E40\u0E21\u0E37\u0E48\u0E2D",
      "\u0E16\u0E49\u0E32",
      "\u0E41\u0E15\u0E48",
      "\u0E40\u0E1E\u0E23\u0E32\u0E30",
      "\u0E14\u0E31\u0E07\u0E19\u0E31\u0E49\u0E19",
      "\u0E23\u0E27\u0E21\u0E16\u0E36\u0E07",
      "\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A",
      "\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07",
      "\u0E20\u0E32\u0E22\u0E43\u0E19",
      "\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01",
      "\u0E23\u0E30\u0E1A\u0E1A",
      "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25",
      "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21",
      "\u0E2A\u0E41\u0E01\u0E19",
      "\u0E1A\u0E35\u0E1A\u0E2D\u0E31\u0E14",
      "\u0E02\u0E19\u0E32\u0E14",
      "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13",
      " ",
      "  ",
      ". ",
      ", ",
      ": ",
      " | ",
      "\n",
      "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
      "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13",
      "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48",
      "\u0E40\u0E27\u0E25\u0E32",
      "\u0E08\u0E33\u0E19\u0E27\u0E19",
      "\u0E23\u0E32\u0E04\u0E32",
      "\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32",
      "\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49",
      "\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17",
      "\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C",
      "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48",
      "\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28\u0E44\u0E17\u0E22",
      "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
      "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14",
      "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21",
      "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A"
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
      '"id":',
      '"name":',
      '"status":',
      '"message":',
      ", ",
      ": ",
      "\n",
      " from ",
      " your ",
      " have ",
      " they ",
      " will ",
      " what ",
      " about ",
      " which ",
      " there ",
      " their ",
      " would ",
      " could ",
      " it ",
      " on ",
      " as ",
      " at ",
      " by ",
      " or ",
      " an ",
      " so ",
      " if ",
      " some "
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
      '{"',
      '"}',
      '":[',
      '"]',
      '":"',
      '","',
      '", "',
      '"id":',
      '"name":',
      '"type":',
      '"status":',
      '"message":',
      '"data":',
      '"payload":',
      '"result":',
      '"error":',
      '"items":',
      '"createdAt":',
      '"updatedAt":',
      '"userId":',
      '"token":',
      '"accessToken":',
      '"refreshToken":',
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
function buildWeightedFrequencyMap(entries) {
  const map = /* @__PURE__ */ new Map();
  entries.forEach(([chars, weight]) => {
    for (const char of chars) {
      map.set(char, (map.get(char) || 0) + weight);
    }
  });
  return map;
}
const presetFrequencyMaps = Object.fromEntries(
  Object.entries(presetProfiles).map(([key, profile]) => [key, buildWeightedFrequencyMap(profile.entries)])
);
const presetCharSets = Object.fromEntries(
  Object.entries(presetFrequencyMaps).map(([key, map]) => [key, new Set(map.keys())])
);
const QR_BYTE_CAPACITY_M = [
  14,
  26,
  42,
  62,
  84,
  106,
  122,
  152,
  180,
  213,
  251,
  287,
  331,
  362,
  412,
  450,
  504,
  560,
  624,
  666,
  711,
  779,
  857,
  911,
  997,
  1059,
  1125,
  1190,
  1264,
  1370,
  1452,
  1538,
  1628,
  1722,
  1809,
  1911,
  1989,
  2099,
  2213,
  2331
];
function utf8Bytes(text) {
  return encoder.encode(text).length;
}
function toBase64Url(text) {
  const bytes = encoder.encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function bytesToBase64(bytes) {
  const chunks = [];
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
  }
  return btoa(chunks.join(""));
}
function bytesToBinaryString(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] & 255);
  }
  return binary;
}
function binaryStringToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) & 255;
  }
  return bytes;
}
function bytesToBase64Url(bytes) {
  return toBase64UrlFromBase64(bytesToBase64(bytes));
}
function base64ToBytes(base64) {
  if (!base64)
    return new Uint8Array();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function toBase64UrlFromBase64(base64) {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
function base45Encode(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) {
      const x = (bytes[i] << 8) + bytes[i + 1];
      const e = x % 45;
      const d = Math.floor(x / 45) % 45;
      const c = Math.floor(x / 2025);
      out += BASE45_CHARSET[e] + BASE45_CHARSET[d] + BASE45_CHARSET[c];
    } else {
      const x = bytes[i];
      const e = x % 45;
      const d = Math.floor(x / 45);
      out += BASE45_CHARSET[e] + BASE45_CHARSET[d];
    }
  }
  return out;
}
function base45Decode(text) {
  const valueOf = /* @__PURE__ */ new Map();
  for (let i = 0; i < BASE45_CHARSET.length; i++)
    valueOf.set(BASE45_CHARSET[i], i);
  const out = [];
  for (let i = 0; i < text.length; ) {
    if (i + 2 < text.length) {
      const c1 = valueOf.get(text[i]);
      const c2 = valueOf.get(text[i + 1]);
      const c3 = valueOf.get(text[i + 2]);
      if (c1 === void 0 || c2 === void 0 || c3 === void 0)
        throw new Error("invalid_base45");
      const x = c1 + c2 * 45 + c3 * 2025;
      out.push(x >> 8 & 255, x & 255);
      i += 3;
    } else {
      if (i + 1 >= text.length)
        throw new Error("invalid_base45");
      const c1 = valueOf.get(text[i]);
      const c2 = valueOf.get(text[i + 1]);
      if (c1 === void 0 || c2 === void 0)
        throw new Error("invalid_base45");
      const x = c1 + c2 * 45;
      out.push(x & 255);
      i += 2;
    }
  }
  return Uint8Array.from(out);
}
function isAsciiOnly(text) {
  for (const char of text) {
    if (char.charCodeAt(0) > 127)
      return false;
  }
  return true;
}
function estimateTokens(text) {
  if (!text.length)
    return 0;
  const bytes = utf8Bytes(text);
  let asciiChars = 0;
  for (const char of text) {
    if (char.charCodeAt(0) <= 127)
      asciiChars++;
  }
  const asciiRatio = asciiChars / text.length;
  const divisor = asciiRatio > 0.85 ? 4 : asciiRatio > 0.45 ? 3.2 : 2.6;
  return Math.max(1, Math.ceil(bytes / divisor));
}
function computeEntropy(text) {
  if (!text.length)
    return 0;
  const freq = /* @__PURE__ */ new Map();
  for (const char of text) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
function repeatedWordRatio(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length)
    return 0;
  const counts = /* @__PURE__ */ new Map();
  let repeated = 0;
  for (const word of words) {
    const next = (counts.get(word) || 0) + 1;
    counts.set(word, next);
  }
  for (const count of counts.values()) {
    if (count > 1)
      repeated += count;
  }
  return repeated / words.length;
}
function repeatedBigramRatio(text) {
  if (text.length < 2)
    return 0;
  const counts = /* @__PURE__ */ new Map();
  for (let i = 0; i < text.length - 1; i++) {
    const pair = text.slice(i, i + 2);
    counts.set(pair, (counts.get(pair) || 0) + 1);
  }
  let repeated = 0;
  for (const count of counts.values()) {
    if (count > 1)
      repeated += count;
  }
  return repeated / Math.max(1, text.length - 1);
}
function longestRun(text) {
  if (!text.length)
    return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === text[i - 1]) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}
function analyzeText(text) {
  const uniqueChars = new Set(text).size;
  const bytes = utf8Bytes(text);
  let asciiChars = 0;
  let thaiChars = 0;
  let digitChars = 0;
  let whitespaceChars = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code <= 127)
      asciiChars++;
    if (code >= 3584 && code <= 3711)
      thaiChars++;
    if (char >= "0" && char <= "9")
      digitChars++;
    if (/\s/.test(char))
      whitespaceChars++;
  }
  return {
    chars: text.length,
    utf8Bytes: bytes,
    estimatedTokens: estimateTokens(text),
    uniqueChars,
    asciiRatio: text.length ? asciiChars / text.length : 0,
    thaiRatio: text.length ? thaiChars / text.length : 0,
    digitRatio: text.length ? digitChars / text.length : 0,
    whitespaceRatio: text.length ? whitespaceChars / text.length : 0,
    entropy: computeEntropy(text),
    repeatedWordRatio: repeatedWordRatio(text),
    repeatedBigramRatio: repeatedBigramRatio(text),
    longestRun: longestRun(text)
  };
}
function supportsPresetProfile(text, profileId) {
  const charset = presetCharSets[profileId];
  if (!charset)
    return false;
  for (const char of text) {
    if (!charset.has(char))
      return false;
  }
  return true;
}
function buildScanability(bytes, encodingMode, qrText) {
  const mode = encodingMode || "byte";
  const effectiveBytes = mode === "text45" ? alnumEffectiveBytes((qrText || "").length) : bytes;
  const version = estimateQrVersion(effectiveBytes);
  if (version === null) {
    return {
      version: null,
      capacity: 0,
      utilization: 1,
      effectiveBytes,
      score: 5,
      label: "\u0E40\u0E01\u0E34\u0E19 1 QR",
      recommendation: "\u0E04\u0E27\u0E23\u0E43\u0E0A\u0E49 Member QR",
      freeReady: false
    };
  }
  const capacity = getQrCapacity(version);
  const utilization = capacity ? effectiveBytes / capacity : 1;
  let score = 100;
  score -= Math.max(0, version - 1) * 2.2;
  if (utilization > 0.55)
    score -= (utilization - 0.55) * 38;
  if (utilization > 0.7)
    score -= (utilization - 0.7) * 70;
  if (utilization > 0.82)
    score -= (utilization - 0.82) * 140;
  score = Math.max(8, Math.min(98, Math.round(score)));
  let label = "\u0E42\u0E25\u0E48\u0E07";
  let recommendation = "\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A Free 1 QR";
  let freeReady = utilization <= 0.82 && score >= 60;
  if (utilization > 0.55)
    label = "\u0E14\u0E35";
  if (utilization > 0.7)
    label = "\u0E1E\u0E2D\u0E43\u0E0A\u0E49";
  if (utilization > 0.82)
    label = "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E41\u0E19\u0E48\u0E19";
  if (utilization > 0.9)
    label = "\u0E41\u0E19\u0E48\u0E19\u0E21\u0E32\u0E01";
  if (utilization > 0.82 || score < 60) {
    recommendation = "\u0E04\u0E27\u0E23\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32 Member QR";
    freeReady = false;
  }
  if (utilization > 0.9 || score < 45) {
    recommendation = "\u0E41\u0E19\u0E30\u0E19\u0E33 Member QR";
    freeReady = false;
  }
  return { version, capacity, utilization, effectiveBytes, score, label, recommendation, freeReady };
}
function lz78Compress(text) {
  const dictionary = /* @__PURE__ */ new Map();
  const tokens = [];
  let current = "";
  let nextIndex = 1;
  const chars = [...text];
  for (const char of chars) {
    const combined = current + char;
    if (dictionary.has(combined)) {
      current = combined;
    } else {
      const prefixIndex = current ? dictionary.get(current) : 0;
      tokens.push([prefixIndex, char]);
      dictionary.set(combined, nextIndex++);
      current = "";
    }
  }
  if (current) {
    const currChars = [...current];
    const lastChar = currChars.pop();
    const prefix = currChars.join("");
    tokens.push([prefix ? dictionary.get(prefix) : 0, lastChar || ""]);
  }
  return { method: "lz78", tokens };
}
function lz78Decompress(payload) {
  const dictionary = [""];
  let output = "";
  for (const [index, char] of payload.tokens) {
    const entry = (dictionary[index] || "") + char;
    output += entry;
    dictionary.push(entry);
  }
  return output;
}
function lzCompactCompress(text) {
  const input = encoder.encode(text);
  const output = [];
  const maxWindow = 4095;
  const maxLength = 18;
  let position = 0;
  while (position < input.length) {
    const flagIndex = output.length;
    output.push(0);
    let flags = 0;
    for (let bit = 0; bit < 8 && position < input.length; bit++) {
      let bestLength = 0;
      let bestOffset = 0;
      const windowStart = Math.max(0, position - maxWindow);
      for (let scan = position - 1; scan >= windowStart; scan--) {
        let matchLength = 0;
        while (matchLength < maxLength && position + matchLength < input.length && input[scan + matchLength] === input[position + matchLength]) {
          matchLength++;
        }
        if (matchLength > bestLength && matchLength >= 3) {
          bestLength = matchLength;
          bestOffset = position - scan;
          if (matchLength === maxLength)
            break;
        }
      }
      if (bestLength >= 3) {
        const pair = bestOffset - 1 << 4 | bestLength - 3;
        output.push(pair >> 8 & 255);
        output.push(pair & 255);
        position += bestLength;
      } else {
        flags |= 1 << bit;
        output.push(input[position]);
        position++;
      }
    }
    output[flagIndex] = flags;
  }
  return {
    method: "lz_compact",
    data: bytesToBase64(Uint8Array.from(output))
  };
}
function lzCompactDecompress(payload) {
  const input = base64ToBytes(payload.data);
  const output = [];
  let position = 0;
  while (position < input.length) {
    const flags = input[position++];
    for (let bit = 0; bit < 8 && position < input.length; bit++) {
      const isLiteral = (flags >> bit & 1) === 1;
      if (isLiteral) {
        output.push(input[position++]);
      } else {
        if (position + 1 >= input.length)
          break;
        const pair = input[position] << 8 | input[position + 1];
        position += 2;
        const offset = (pair >> 4) + 1;
        const length = (pair & 15) + 3;
        const start = output.length - offset;
        for (let i = 0; i < length; i++) {
          output.push(output[start + i]);
        }
      }
    }
  }
  return decoder.decode(Uint8Array.from(output));
}
function deflateCompress(text) {
  if (typeof pako === "undefined") {
    throw new Error("pako_not_loaded");
  }
  const input = encoder.encode(text);
  const compressed = pako.deflateRaw(input, { level: 9 });
  return {
    method: "deflate",
    data: bytesToBase64(compressed),
    originalBytes: input.length
  };
}
function deflateDecompress(payload) {
  if (typeof pako === "undefined") {
    throw new Error("pako_not_loaded");
  }
  const input = base64ToBytes(payload.data);
  const restored = pako.inflateRaw(input);
  return decoder.decode(restored);
}
function deflateDictCompress(text) {
  if (typeof pako === "undefined") {
    throw new Error("pako_not_loaded");
  }
  const input = encoder.encode(text);
  let best = null;
  for (const profile of DICT_PROFILES) {
    const tokenBytes = dictEncodeBytes(profile.id, input);
    const compressed = pako.deflateRaw(tokenBytes, { level: 9 });
    const record = {
      profile: profile.id,
      profileName: profile.name,
      data: bytesToBase64(compressed),
      tokenBytes: tokenBytes.length,
      compressedBytes: compressed.length
    };
    if (!best || record.compressedBytes < best.compressedBytes)
      best = record;
  }
  if (!best)
    throw new Error("dict_profiles_empty");
  return {
    method: "deflate_dict",
    profile: best.profile,
    profileName: best.profileName,
    data: best.data,
    originalBytes: input.length,
    tokenBytes: best.tokenBytes
  };
}
function deflateDictDecompress(payload) {
  var _a;
  if (typeof pako === "undefined") {
    throw new Error("pako_not_loaded");
  }
  const input = base64ToBytes(payload.data);
  const restored = pako.inflateRaw(input);
  const profileId = (_a = payload.profile) != null ? _a : 1;
  const utf8 = dictDecodeBytes(profileId, restored);
  return decoder.decode(utf8);
}
function deflateInlineCompress(text) {
  if (typeof pako === "undefined")
    throw new Error("pako_not_loaded");
  const input = encoder.encode(text);
  const dictBytes = bpeLearnByteDict(input, 48);
  const tokenBytes = inlineDictEncodeBytes(dictBytes, input);
  const compressed = pako.deflateRaw(tokenBytes, { level: 9 });
  const blob = buildInlineDictBlob(dictBytes, compressed);
  return {
    method: "deflate_inline",
    // เก็บ blob เป็น base64 เพื่อให้ buildQrCarrier แปลงไป byte/frame หรือ base45 ได้
    blob: bytesToBase64(blob),
    entryCount: dictBytes.length,
    dictBytes: blob.length - compressed.length,
    tokenBytes: tokenBytes.length,
    originalBytes: input.length
  };
}
function deflateInlineDecompress(payload) {
  if (typeof pako === "undefined")
    throw new Error("pako_not_loaded");
  const blob = base64ToBytes(payload.blob || "");
  const parsed = parseInlineDictBlob(blob);
  const restored = pako.inflateRaw(parsed.deflateBytes);
  const utf8 = inlineDictDecodeBytes(parsed.entriesBytes, restored);
  return decoder.decode(utf8);
}
function arithmeticCompress(text) {
  var _a;
  if (!text.length)
    return { method: "arithmetic", data: "", symCount: 0, table: [] };
  const freq = /* @__PURE__ */ new Map();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    freq.set(cp, (freq.get(cp) || 0) + 1);
  }
  const table = [...freq.entries()].sort((a, b) => a[0] - b[0]);
  const total = [...freq.values()].reduce((a, b) => a + b, 0);
  if (total > 5e5) {
    throw new Error("text_too_long_for_arithmetic");
  }
  const ranges = [];
  let cum = BigInt(0);
  const bigTotal = BigInt(total);
  for (const [cp, cnt] of table) {
    const lo = cum;
    const hi = cum + BigInt(cnt);
    ranges.push({ cp, lo, hi });
    cum = hi;
  }
  const cpToRange = new Map(ranges.map((r) => [r.cp, r]));
  const BITS = 30;
  const FULL = 1 << BITS;
  const HALF = FULL >>> 1;
  const QTR = FULL >>> 2;
  let low = 0, high = FULL;
  const bits = [];
  let pending = 0;
  function emitBit(b) {
    bits.push(b);
    while (pending > 0) {
      bits.push(b ^ 1);
      pending--;
    }
  }
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const r = cpToRange.get(cp);
    const range = high - low;
    high = low + Math.floor(range * Number(r.hi) / total);
    low = low + Math.floor(range * Number(r.lo) / total);
    for (; ; ) {
      if (high <= HALF) {
        emitBit(0);
        low <<= 1;
        high <<= 1;
      } else if (low >= HALF) {
        emitBit(1);
        low = low - HALF << 1;
        high = high - HALF << 1;
      } else if (low >= QTR && high <= 3 * QTR) {
        pending++;
        low = low - QTR << 1;
        high = high - QTR << 1;
      } else {
        break;
      }
    }
  }
  pending++;
  if (low < QTR) {
    emitBit(0);
  } else {
    emitBit(1);
  }
  const byteArr = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = b << 1 | ((_a = bits[i + j]) != null ? _a : 0);
    }
    byteArr.push(b);
  }
  return {
    method: "arithmetic",
    data: bytesToBase64(Uint8Array.from(byteArr)),
    bitLength: bits.length,
    symCount: total,
    table
    // [[cp, cnt], ...]
  };
}
function arithmeticDecompress(payload) {
  const { data, bitLength, symCount, table } = payload;
  if (!symCount || !data)
    return "";
  const total = symCount;
  const tableArr = table;
  const ranges = [];
  let cum = BigInt(0);
  const bigTotal = BigInt(total);
  for (const [cp, cnt] of tableArr) {
    const lo = cum;
    const hi = cum + BigInt(cnt);
    ranges.push({ cp, lo, hi, cnt: Number(cnt) });
    cum = hi;
  }
  const rawBytes = base64ToBytes(data);
  const bits = [];
  for (const byte of rawBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push(byte >> i & 1);
    }
  }
  const BITS = 30;
  const FULL = 1 << BITS;
  const HALF = FULL >>> 1;
  const QTR = FULL >>> 2;
  let low = 0, high = FULL;
  let val = 0;
  let bitPos = 0;
  function readBit() {
    if (bitPos < bits.length)
      return bits[bitPos++];
    return 0;
  }
  for (let i = 0; i < BITS; i++) {
    val = val << 1 | readBit();
  }
  const out = [];
  for (let s = 0; s < symCount; s++) {
    const range = high - low;
    const scaled = Math.floor(((val - low + 1) * total - 1) / range);
    let lo2 = 0, hi2 = ranges.length - 1, idx = 0;
    while (lo2 <= hi2) {
      const mid = lo2 + hi2 >> 1;
      if (Number(ranges[mid].lo) <= scaled) {
        idx = mid;
        lo2 = mid + 1;
      } else {
        hi2 = mid - 1;
      }
    }
    const r = ranges[idx];
    out.push(String.fromCodePoint(r.cp));
    high = low + Math.floor(range * Number(r.hi) / total);
    low = low + Math.floor(range * Number(r.lo) / total);
    for (; ; ) {
      if (high <= HALF) {
        low <<= 1;
        high <<= 1;
        val <<= 1;
        val |= readBit();
      } else if (low >= HALF) {
        low = low - HALF << 1;
        high = high - HALF << 1;
        val = val - HALF << 1;
        val |= readBit();
      } else if (low >= QTR && high <= 3 * QTR) {
        low = low - QTR << 1;
        high = high - QTR << 1;
        val = val - QTR << 1;
        val |= readBit();
      } else {
        break;
      }
    }
  }
  return out.join("");
}
const compressors = {
  raw: { compress: rawCompress, decompress: rawDecompress, label: "Raw" },
  rle: { compress: rleCompress, decompress: rleDecompress, label: "RLE" },
  huffman: { compress: huffmanCompress, decompress: huffmanDecompress, label: "Huffman" },
  fixed_num: {
    compress: (text) => fixedHuffmanCompress(text, "num"),
    decompress: fixedHuffmanDecompress,
    label: "Fixed NUM"
  },
  fixed_en: {
    compress: (text) => fixedHuffmanCompress(text, "en"),
    decompress: fixedHuffmanDecompress,
    label: "Fixed EN"
  },
  fixed_mixed: {
    compress: (text) => fixedHuffmanCompress(text, "mixed"),
    decompress: fixedHuffmanDecompress,
    label: "Fixed MIX"
  },
  deflate: {
    compress: deflateCompress,
    decompress: deflateDecompress,
    label: "Deflate Raw"
  },
  deflate_dict: {
    compress: deflateDictCompress,
    decompress: deflateDictDecompress,
    label: "Deflate + Dict (Auto)"
  },
  deflate_inline: {
    compress: deflateInlineCompress,
    decompress: deflateInlineDecompress,
    label: "Deflate + InlineDict (BPE)"
  },
  lz_compact: {
    compress: lzCompactCompress,
    decompress: lzCompactDecompress,
    label: "LZ Compact"
  },
  lz78: { compress: lz78Compress, decompress: lz78Decompress, label: "LZ78" },
  arithmetic: { compress: arithmeticCompress, decompress: arithmeticDecompress, label: "Arithmetic Coding" },
  tunstall: { compress: tunstallCompress, decompress: tunstallDecompress, label: "Tunstall" }
};
function selectAutoCandidates(stats, text) {
  const candidates = /* @__PURE__ */ new Set(["raw"]);
  const reasons = [];
  reasons.push("\u0E40\u0E23\u0E34\u0E48\u0E21\u0E08\u0E32\u0E01 raw \u0E40\u0E1B\u0E47\u0E19 baseline \u0E40\u0E2A\u0E21\u0E2D");
  if (stats.utf8Bytes <= 120) {
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E04\u0E48\u0E2D\u0E19\u0E02\u0E49\u0E32\u0E07\u0E2A\u0E31\u0E49\u0E19 \u0E08\u0E36\u0E07\u0E40\u0E1C\u0E37\u0E48\u0E2D raw \u0E44\u0E27\u0E49\u0E40\u0E1E\u0E23\u0E32\u0E30 overhead \u0E2D\u0E32\u0E08\u0E41\u0E1E\u0E07\u0E01\u0E27\u0E48\u0E32\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C");
  }
  if (stats.digitRatio >= 0.55 && supportsPresetProfile(text, "num")) {
    candidates.add("fixed_num");
    reasons.push("\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E40\u0E22\u0E2D\u0E30 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Fixed NUM");
  }
  if (stats.asciiRatio >= 0.82 && supportsPresetProfile(text, "en")) {
    candidates.add("fixed_en");
    reasons.push("ASCII \u0E2A\u0E39\u0E07 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Fixed EN");
  }
  if (stats.thaiRatio >= 0.18 && supportsPresetProfile(text, "mixed")) {
    candidates.add("fixed_mixed");
    reasons.push("\u0E21\u0E35\u0E2D\u0E31\u0E01\u0E02\u0E23\u0E30\u0E44\u0E17\u0E22\u0E1E\u0E2D\u0E2A\u0E21\u0E04\u0E27\u0E23 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Fixed MIX");
  }
  if (stats.repeatedWordRatio >= 0.25 || stats.repeatedBigramRatio >= 0.45) {
    candidates.add("lz_compact");
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E21\u0E35 pattern \u0E0B\u0E49\u0E33\u0E2A\u0E39\u0E07 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 LZ Compact");
    candidates.add("lz78");
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E21\u0E35 pattern \u0E0B\u0E49\u0E33\u0E2A\u0E39\u0E07 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 LZ78");
  }
  if (stats.utf8Bytes >= 140 || stats.repeatedBigramRatio >= 0.22 || stats.entropy <= 5.2) {
    candidates.add("deflate");
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27\u0E1E\u0E2D\u0E2B\u0E23\u0E37\u0E2D\u0E21\u0E35\u0E41\u0E1E\u0E15\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E1E\u0E2D\u0E2A\u0E21\u0E04\u0E27\u0E23 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Deflate Raw");
  }
  if (stats.repeatedWordRatio >= 0.18 || stats.repeatedBigramRatio >= 0.35 || stats.utf8Bytes >= 320 || stats.asciiRatio >= 0.8 && stats.utf8Bytes >= 220 || stats.thaiRatio >= 0.22 && stats.utf8Bytes >= 220) {
    candidates.add("deflate_dict");
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27/\u0E21\u0E35 pattern \u0E1E\u0E2D\u0E2A\u0E21\u0E04\u0E27\u0E23 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Deflate + Dict (Auto profiles)");
  }
  if (stats.utf8Bytes >= 700 && stats.repeatedBigramRatio >= 0.55) {
    candidates.add("deflate_inline");
    reasons.push("\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27\u0E41\u0E25\u0E30 bigram \u0E0B\u0E49\u0E33\u0E2A\u0E39\u0E07 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Deflate + InlineDict (BPE) \u0E40\u0E1E\u0E37\u0E48\u0E2D squeeze \u0E40\u0E1E\u0E34\u0E48\u0E21");
  }
  if (stats.longestRun >= 4) {
    candidates.add("rle");
    reasons.push("\u0E21\u0E35\u0E15\u0E31\u0E27\u0E0B\u0E49\u0E33\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19\u0E22\u0E32\u0E27 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 RLE");
  }
  if (stats.entropy <= 4.7 && stats.uniqueChars <= 90) {
    candidates.add("huffman");
    if (stats.asciiRatio > 0.7)
      candidates.add("tunstall");
    reasons.push("entropy \u0E15\u0E48\u0E33\u0E41\u0E25\u0E30\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E44\u0E21\u0E48\u0E0B\u0E49\u0E33\u0E44\u0E21\u0E48\u0E2A\u0E39\u0E07\u0E21\u0E32\u0E01 \u0E08\u0E36\u0E07\u0E25\u0E2D\u0E07 Huffman \u0E41\u0E1A\u0E1A dynamic");
  }
  if (stats.thaiRatio >= 0.18 || stats.uniqueChars >= 30 && stats.utf8Bytes >= 100) {
    candidates.add("arithmetic");
    reasons.push("\u0E25\u0E2D\u0E07 Arithmetic Coding \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E02\u0E49\u0E32\u0E43\u0E01\u0E25\u0E49 entropy limit (fractional bits)");
  }
  return {
    mode: "auto-v2",
    candidates: [...candidates],
    reasons
  };
}
function parseDensityThreshold(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw))
    return 0.82;
  return Math.min(0.95, Math.max(0.6, raw));
}
function rankResults(results, objective, densityThreshold) {
  const list = [...results];
  const bytesFirst = (a, b) => {
    const diff = Math.abs(a.finalPayloadBytes - b.finalPayloadBytes);
    if (diff <= 48 && a.scanability.score !== b.scanability.score) {
      return b.scanability.score - a.scanability.score;
    }
    return a.finalPayloadBytes - b.finalPayloadBytes || b.scanability.score - a.scanability.score || a.serializedBytes - b.serializedBytes;
  };
  const scanFirst = (a, b) => {
    return b.scanability.score - a.scanability.score || a.finalPayloadBytes - b.finalPayloadBytes || a.serializedBytes - b.serializedBytes;
  };
  if (objective === "scan") {
    list.sort(scanFirst);
    return { ranked: list, used: "scan", threshold: densityThreshold, passedCount: list.length };
  }
  if (objective === "density") {
    const passed = list.filter((item) => {
      var _a;
      if (!((_a = item.scanability) == null ? void 0 : _a.version))
        return false;
      if (!Number.isFinite(item.scanability.utilization))
        return false;
      return item.scanability.utilization <= densityThreshold;
    });
    if (passed.length) {
      passed.sort(bytesFirst);
      const failed = list.filter((item) => !passed.includes(item)).sort(scanFirst);
      return {
        ranked: [...passed, ...failed],
        used: "density",
        threshold: densityThreshold,
        passedCount: passed.length
      };
    }
    list.sort(scanFirst);
    return { ranked: list, used: "scan_fallback", threshold: densityThreshold, passedCount: 0 };
  }
  list.sort(bytesFirst);
  return { ranked: list, used: "bytes", threshold: densityThreshold, passedCount: list.length };
}
function evaluateMethod(method, text) {
  const engine = compressors[method];
  try {
    const encodingMode = typeof window !== "undefined" && window.qrEncodingSelect ? window.qrEncodingSelect.value : "text";
    const payload = engine.compress(text);
    const serialized = serializePayload(payload);
    const decoded = engine.decompress(payload);
    const originalBytes = utf8Bytes(text);
    const serializedBytes = utf8Bytes(serialized);
    const originalTokens = estimateTokens(text);
    const carrier = method === "raw" ? buildQrCarrierForRaw(text, encodingMode) : buildQrCarrierForCompressed({ method, payload, serialized }, encodingMode);
    const finalPayload = carrier.displayText;
    const finalQrText = carrier.qrText;
    const finalPayloadBytes = carrier.bytesLen;
    const serializedTokens = estimateTokens(finalPayload);
    const savedBytes = originalBytes - finalPayloadBytes;
    const savedTokens = originalTokens - serializedTokens;
    const ratio = originalBytes > 0 ? finalPayloadBytes / originalBytes * 100 : 100;
    const tokenRatio = originalTokens > 0 ? serializedTokens / originalTokens * 100 : 100;
    const scanability = buildScanability(finalPayloadBytes, encodingMode, finalQrText);
    const ok = decoded === text;
    return {
      method,
      label: engine.label,
      payload,
      serialized,
      decoded,
      ok,
      originalBytes,
      serializedBytes,
      originalTokens,
      serializedTokens,
      savedBytes,
      savedTokens,
      ratio,
      tokenRatio,
      finalPayload,
      finalQrText,
      finalPayloadBytes,
      scanability
    };
  } catch (error) {
    return null;
  }
}
function renderTopStats(stats, best) {
  var _a;
  topStats.innerHTML = "";
  const payloadStat = ((_a = best.scanability) == null ? void 0 : _a.effectiveBytes) && best.scanability.effectiveBytes !== best.finalPayloadBytes ? `${best.finalPayloadBytes.toLocaleString()} bytes (alnum\u2248 ${best.scanability.effectiveBytes.toLocaleString()} bytes)` : formatBytes(best.finalPayloadBytes);
  const items = [
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", stats.chars.toLocaleString()],
    ["\u0E02\u0E19\u0E32\u0E14 UTF-8 \u0E40\u0E14\u0E34\u0E21", formatBytes(stats.utf8Bytes)],
    ["\u0E42\u0E17\u0E40\u0E04\u0E19\u0E40\u0E14\u0E34\u0E21\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13", stats.estimatedTokens.toLocaleString()],
    ["\u0E42\u0E17\u0E40\u0E04\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E1A\u0E35\u0E1A\u0E2D\u0E31\u0E14", best.serializedTokens.toLocaleString()],
    ["\u0E25\u0E14\u0E25\u0E07\u0E01\u0E35\u0E48\u0E42\u0E17\u0E40\u0E04\u0E19", best.savedTokens.toLocaleString()],
    ["payload \u0E40\u0E02\u0E49\u0E32 QR", payloadStat],
    ["QR version \u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13", best.scanability.version ? `v${best.scanability.version}` : "> v40"],
    ["\u0E04\u0E27\u0E32\u0E21\u0E41\u0E19\u0E48\u0E19\u0E02\u0E2D\u0E07 QR", best.scanability.capacity ? `${Math.round(best.scanability.utilization * 100)}% \u0E02\u0E2D\u0E07\u0E04\u0E27\u0E32\u0E21\u0E08\u0E38 (\u2248 ${best.scanability.capacity.toLocaleString()} bytes)` : "\u0E40\u0E01\u0E34\u0E19 1 QR"],
    ["scanability score", `${best.scanability.score}/100 (${best.scanability.label})`],
    ["\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E44\u0E21\u0E48\u0E0B\u0E49\u0E33", stats.uniqueChars.toLocaleString()],
    ["ASCII ratio", formatPercent(stats.asciiRatio * 100)],
    ["Thai ratio", formatPercent(stats.thaiRatio * 100)],
    ["Entropy \u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13", stats.entropy.toFixed(3)],
    ["\u0E04\u0E33\u0E17\u0E35\u0E48\u0E0B\u0E49\u0E33", formatPercent(stats.repeatedWordRatio * 100)],
    ["bigram \u0E0B\u0E49\u0E33", formatPercent(stats.repeatedBigramRatio * 100)],
    ["run \u0E22\u0E32\u0E27\u0E2A\u0E38\u0E14", stats.longestRun.toLocaleString()],
    ["\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E30", best.label]
  ];
  items.forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "stat";
    card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
    topStats.appendChild(card);
  });
}
function renderSummary(stats, best, mode, results, selectorInfo, rankedInfo) {
  var _a, _b, _c;
  const repeatedScore = (stats.repeatedWordRatio + stats.repeatedBigramRatio) / 2 * 100;
  const selectionNote = mode === "auto" ? `Auto Selector v2 \u0E40\u0E25\u0E37\u0E2D\u0E01 shortlist \u0E08\u0E32\u0E01\u0E2A\u0E16\u0E34\u0E15\u0E34 \u0E41\u0E25\u0E49\u0E27\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E2B\u0E49 <code>${best.label}</code> \u0E0A\u0E19\u0E30\u0E08\u0E32\u0E01\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E17\u0E35\u0E48\u0E08\u0E31\u0E14\u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A\u0E41\u0E25\u0E49\u0E27` : `\u0E04\u0E38\u0E13\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E43\u0E0A\u0E49 <code>${best.label}</code> \u0E42\u0E14\u0E22\u0E15\u0E23\u0E07`;
  const compressionNote = best.savedBytes >= 0 ? `\u0E25\u0E14\u0E02\u0E19\u0E32\u0E14\u0E44\u0E14\u0E49\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${best.savedBytes.toLocaleString()} bytes</strong> \u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E2B\u0E25\u0E37\u0E2D <strong>${formatPercent(best.ratio)}</strong> \u0E02\u0E2D\u0E07\u0E40\u0E14\u0E34\u0E21` : `\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E43\u0E2B\u0E0D\u0E48\u0E02\u0E36\u0E49\u0E19\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${Math.abs(best.savedBytes).toLocaleString()} bytes</strong> \u0E0B\u0E36\u0E48\u0E07\u0E40\u0E01\u0E34\u0E14\u0E02\u0E36\u0E49\u0E19\u0E44\u0E14\u0E49\u0E43\u0E19 lossless compression \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E31\u0E49\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E21\u0E35 pattern \u0E0B\u0E49\u0E33\u0E21\u0E32\u0E01\u0E1E\u0E2D`;
  const tokenNote = best.savedTokens >= 0 ? `\u0E42\u0E17\u0E40\u0E04\u0E19\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E25\u0E14\u0E25\u0E07 <strong>${best.savedTokens.toLocaleString()}</strong> token \u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E2B\u0E25\u0E37\u0E2D <strong>${formatPercent(best.tokenRatio)}</strong> \u0E02\u0E2D\u0E07\u0E40\u0E14\u0E34\u0E21` : `\u0E42\u0E17\u0E40\u0E04\u0E19\u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E02\u0E36\u0E49\u0E19 <strong>${Math.abs(best.savedTokens).toLocaleString()}</strong> token \u0E0B\u0E36\u0E48\u0E07\u0E21\u0E31\u0E01\u0E40\u0E01\u0E34\u0E14\u0E08\u0E32\u0E01 metadata \u0E41\u0E25\u0E30 JSON serialization \u0E02\u0E2D\u0E07\u0E40\u0E14\u0E42\u0E21\u0E19\u0E35\u0E49`;
  const verifyNote = best.ok ? `<span style="color: var(--good)">\u0E04\u0E25\u0E32\u0E22\u0E01\u0E25\u0E31\u0E1A\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E15\u0E49\u0E19\u0E09\u0E1A\u0E31\u0E1A 100%</span>` : `<span style="color: var(--bad)">\u0E04\u0E25\u0E32\u0E22\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E15\u0E49\u0E19\u0E09\u0E1A\u0E31\u0E1A</span>`;
  const selectorNote = ((_a = selectorInfo == null ? void 0 : selectorInfo.reasons) == null ? void 0 : _a.length) ? `\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E25\u0E2D\u0E07: ${selectorInfo.reasons.join(" | ")}` : "";
  const utilizationText = best.scanability.capacity ? `\u0E41\u0E19\u0E48\u0E19\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${Math.round(best.scanability.utilization * 100)}%</strong> \u0E02\u0E2D\u0E07\u0E04\u0E27\u0E32\u0E21\u0E08\u0E38 (\u2248 ${best.scanability.capacity.toLocaleString()} bytes)` : "\u0E40\u0E01\u0E34\u0E19 1 QR";
  const scanabilityNote = `\u0E04\u0E30\u0E41\u0E19\u0E19 scanability \u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${best.scanability.score}/100</strong> (${best.scanability.label}) | QR version \u0E42\u0E14\u0E22\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${best.scanability.version ? `v${best.scanability.version}` : "&gt; v40"}</strong> | ${utilizationText}`;
  const usageDecisionNote = best.scanability.freeReady ? `\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19: \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A <strong>1 QR</strong>` : `\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19: <strong>${best.scanability.recommendation}</strong>`;
  const objectiveLabel = (() => {
    var _a2, _b2;
    const used = (rankedInfo == null ? void 0 : rankedInfo.used) || "bytes";
    if (used === "scan")
      return "\u0E2A\u0E41\u0E01\u0E19\u0E07\u0E48\u0E32\u0E22\u0E2A\u0E38\u0E14 (scanability-first)";
    if (used === "density")
      return `\u0E04\u0E38\u0E21\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E19\u0E32\u0E41\u0E19\u0E48\u0E19 (threshold=${((_a2 = rankedInfo == null ? void 0 : rankedInfo.threshold) != null ? _a2 : 0.82).toFixed(2)})`;
    if (used === "scan_fallback")
      return `\u0E04\u0E38\u0E21\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E19\u0E32\u0E41\u0E19\u0E48\u0E19\u0E41\u0E25\u0E49\u0E27\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19 \u2192 fallback \u0E2A\u0E41\u0E01\u0E19\u0E07\u0E48\u0E32\u0E22\u0E2A\u0E38\u0E14 (threshold=${((_b2 = rankedInfo == null ? void 0 : rankedInfo.threshold) != null ? _b2 : 0.82).toFixed(2)})`;
    return "\u0E2A\u0E31\u0E49\u0E19\u0E2A\u0E38\u0E14 (bytes-first)";
  })();
  const objectiveNote = mode === "auto" ? `\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19: <strong>${objectiveLabel}</strong>` : "";
  const dictProfileNote = best.method === "deflate_dict" && ((_b = best.payload) == null ? void 0 : _b.profileName) ? `\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C dict \u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01: <strong>${best.payload.profileName}</strong> (id=${best.payload.profile})` : "";
  autoSummary.innerHTML = `
        ${selectionNote}.<br>
        ${objectiveNote ? `${objectiveNote}.<br>` : ""}
        ${dictProfileNote ? `${dictProfileNote}.<br>` : ""}
        \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E19\u0E35\u0E49\u0E21\u0E35\u0E01\u0E32\u0E23\u0E0B\u0E49\u0E33\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${repeatedScore.toFixed(2)}%</strong>, entropy \u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${stats.entropy.toFixed(3)}</strong> bits/char \u0E41\u0E25\u0E30 ${compressionNote}.<br>
        payload \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A QR \u0E02\u0E2D\u0E07\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E30\u0E21\u0E35\u0E02\u0E19\u0E32\u0E14\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${best.finalPayloadBytes.toLocaleString()} bytes</strong>${((_c = best.scanability) == null ? void 0 : _c.effectiveBytes) && best.scanability.effectiveBytes !== best.finalPayloadBytes ? ` (alnum\u2248 ${best.scanability.effectiveBytes.toLocaleString()} bytes)` : ""}.<br>
        ${scanabilityNote}.<br>
        ${usageDecisionNote}.<br>
        \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E42\u0E17\u0E40\u0E04\u0E19: \u0E40\u0E14\u0E34\u0E21\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${stats.estimatedTokens.toLocaleString()}</strong> token, \u0E2B\u0E25\u0E31\u0E07\u0E1A\u0E35\u0E1A\u0E2D\u0E31\u0E14\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 <strong>${best.serializedTokens.toLocaleString()}</strong> token, ${tokenNote}.<br>
        ${selectorNote ? `${selectorNote}.<br>` : ""}
        \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A: ${verifyNote}
      `;
}
function badgeClass(result) {
  if (!result.ok)
    return "bad";
  if (result.savedBytes >= 0)
    return "good";
  return "warn";
}
function badgeText(result) {
  if (!result.ok)
    return "Decode error";
  if (result.savedBytes >= 0)
    return "Lossless OK";
  return "\u0E43\u0E2B\u0E0D\u0E48\u0E02\u0E36\u0E49\u0E19\u0E41\u0E15\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07";
}
function renderResults(results, bestMethod) {
  resultList.innerHTML = "";
  results.forEach((result) => {
    var _a;
    const card = document.createElement("div");
    card.className = `result-card ${result.method === bestMethod ? "best" : ""}`;
    const deltaText = result.savedBytes >= 0 ? `\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14 ${result.savedBytes.toLocaleString()} bytes` : `\u0E40\u0E1E\u0E34\u0E48\u0E21 ${Math.abs(result.savedBytes).toLocaleString()} bytes`;
    const tokenDeltaText = result.savedTokens >= 0 ? `\u0E25\u0E14 ${result.savedTokens.toLocaleString()} token` : `\u0E40\u0E1E\u0E34\u0E48\u0E21 ${Math.abs(result.savedTokens).toLocaleString()} token`;
    card.innerHTML = `
          <div class="row">
            <strong>${result.label}</strong>
            <div class="row">
              ${result.method === bestMethod ? '<span class="badge good">Best</span>' : ""}
              <span class="badge ${badgeClass(result)}">${badgeText(result)}</span>
            </div>
          </div>
          <div class="small" style="margin-top: 8px;">
            \u0E40\u0E14\u0E34\u0E21 ${formatBytes(result.originalBytes)} | \u0E2B\u0E25\u0E31\u0E07 serialize ${formatBytes(result.serializedBytes)} | ${deltaText} | ratio ${formatPercent(result.ratio)}
          </div>
          <div class="small" style="margin-top: 6px;">
            token \u0E40\u0E14\u0E34\u0E21\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 ${result.originalTokens.toLocaleString()} | \u0E2B\u0E25\u0E31\u0E07 serialize ${result.serializedTokens.toLocaleString()} | ${tokenDeltaText} | token ratio ${formatPercent(result.tokenRatio)}
          </div>
          <div class="small" style="margin-top: 6px;">
            final QR payload ${formatBytes(result.finalPayloadBytes)}${((_a = result.scanability) == null ? void 0 : _a.effectiveBytes) && result.scanability.effectiveBytes !== result.finalPayloadBytes ? ` (alnum\u2248 ${formatBytes(result.scanability.effectiveBytes)})` : ""}
          </div>
          <div class="small" style="margin-top: 6px;">
            scanability ${result.scanability.score}/100 (${result.scanability.label}) | ${result.scanability.version ? `\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 v${result.scanability.version}` : "\u0E40\u0E01\u0E34\u0E19 1 QR"}${result.scanability.capacity ? ` | \u0E41\u0E19\u0E48\u0E19 ${Math.round(result.scanability.utilization * 100)}%` : ""}
          </div>
          <pre>${escapeHtml([
      `[Compressor Output]`,
      summarizeEnginePayload(result),
      ``,
      `[Final QR Payload]`,
      previewTextBlock(result.finalPayload || "", 420)
    ].join("\n"))}</pre>
        `;
    resultList.appendChild(card);
  });
}
function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function buildRawQrPayload(text) {
  if (isAsciiOnly(text)) {
    return `QZ1|T|${text}`;
  }
  return `QZ1|B|${toBase64Url(text)}`;
}
function buildFixedQrPayload(payload) {
  var _a;
  const profile = (payload.profile || "").toUpperCase();
  const bitLength = (_a = payload.bitLength) != null ? _a : 0;
  const dataB64Url = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|F|${profile}|${bitLength}|${dataB64Url}`;
}
function buildLzCompactQrPayload(payload) {
  const dataB64Url = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|L|${dataB64Url}`;
}
function buildDeflateQrPayload(payload) {
  const dataB64Url = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|D|${dataB64Url}`;
}
function buildDeflateDictQrPayload(payload) {
  var _a;
  const profileId = (_a = payload.profile) != null ? _a : 1;
  const dataB64Url = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|K|${profileId}|${dataB64Url}`;
}
function buildDeflateQrPayload45(payload) {
  const bytes = base64ToBytes(payload.data || "");
  return `QZ1D:${base45Encode(bytes)}`;
}
function buildDeflateDictQrPayload45(payload) {
  var _a;
  const profileId = (_a = payload.profile) != null ? _a : 1;
  const bytes = base64ToBytes(payload.data || "");
  return `QZ1K${profileId}:${base45Encode(bytes)}`;
}
function buildDeflateInlineQrPayload(payload) {
  const blobBytes = base64ToBytes(payload.blob || "");
  return `QZ1|U|${bytesToBase64Url(blobBytes)}`;
}
function buildDeflateInlineQrPayload45(payload) {
  const blobBytes = base64ToBytes(payload.blob || "");
  return `QZ1U:${base45Encode(blobBytes)}`;
}
function buildBinaryFrameSimple(methodChar, dataBytes) {
  const header = new Uint8Array([81, 90, 49, methodChar.charCodeAt(0)]);
  const out = new Uint8Array(header.length + dataBytes.length);
  out.set(header, 0);
  out.set(dataBytes, header.length);
  return out;
}
function fixedProfileToId(profile) {
  const p = (profile || "").toLowerCase();
  if (p === "num")
    return 1;
  if (p === "en")
    return 2;
  if (p === "mixed")
    return 3;
  return 0;
}
function buildFixedBinaryFrame(payload) {
  var _a;
  const profileId = fixedProfileToId(payload.profile);
  const bitLength = (_a = payload.bitLength) != null ? _a : 0;
  const dataBytes = base64ToBytes(payload.data || "");
  const header = new Uint8Array([
    81,
    90,
    49,
    70,
    // QZ1F
    profileId & 255,
    bitLength >> 8 & 255,
    bitLength & 255
  ]);
  const out = new Uint8Array(header.length + dataBytes.length);
  out.set(header, 0);
  out.set(dataBytes, header.length);
  return out;
}
function buildQrCarrierForRaw(text, encodingMode) {
  const displayText = buildRawQrPayload(text);
  if (encodingMode !== "byte") {
    return { qrText: displayText, bytesLen: utf8Bytes(displayText), displayText };
  }
  const frame = buildBinaryFrameSimple("T", encoder.encode(text));
  return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
}
function buildQrCarrierForCompressed(result, encodingMode) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const displayText = buildCompressedQrPayload(result, encodingMode);
  if (encodingMode !== "byte") {
    return { qrText: displayText, bytesLen: utf8Bytes(displayText), displayText };
  }
  if ((result == null ? void 0 : result.method) === "deflate" && ((_a = result == null ? void 0 : result.payload) == null ? void 0 : _a.data)) {
    const bytes = base64ToBytes(result.payload.data);
    const frame = buildBinaryFrameSimple("D", bytes);
    return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
  }
  if ((result == null ? void 0 : result.method) === "deflate_dict" && ((_b = result == null ? void 0 : result.payload) == null ? void 0 : _b.data)) {
    const profileId = (_c = result.payload.profile) != null ? _c : 1;
    const bytes = base64ToBytes(result.payload.data);
    const header = new Uint8Array([81, 90, 49, 75, profileId & 255]);
    const out = new Uint8Array(header.length + bytes.length);
    out.set(header, 0);
    out.set(bytes, header.length);
    return { qrText: bytesToBinaryString(out), bytesLen: out.length, displayText };
  }
  if ((result == null ? void 0 : result.method) === "deflate_inline" && ((_d = result == null ? void 0 : result.payload) == null ? void 0 : _d.blob)) {
    const blobBytes = base64ToBytes(result.payload.blob);
    const header = new Uint8Array([81, 90, 49, 85]);
    const out = new Uint8Array(header.length + blobBytes.length);
    out.set(header, 0);
    out.set(blobBytes, header.length);
    return { qrText: bytesToBinaryString(out), bytesLen: out.length, displayText };
  }
  if ((result == null ? void 0 : result.method) === "lz_compact" && ((_e = result == null ? void 0 : result.payload) == null ? void 0 : _e.data)) {
    const bytes = base64ToBytes(result.payload.data);
    const frame = buildBinaryFrameSimple("L", bytes);
    return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
  }
  if (((_f = result == null ? void 0 : result.method) == null ? void 0 : _f.startsWith("fixed_")) && ((_g = result == null ? void 0 : result.payload) == null ? void 0 : _g.profile) && ((_h = result == null ? void 0 : result.payload) == null ? void 0 : _h.data)) {
    const frame = buildFixedBinaryFrame(result.payload);
    return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
  }
  if ((result == null ? void 0 : result.method) === "arithmetic" && ((_i = result == null ? void 0 : result.payload) == null ? void 0 : _i.data)) {
    const frame = buildArithmeticBinaryFrame(result.payload);
    return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
  }
  if ((result == null ? void 0 : result.method) === "tunstall" && ((_j = result == null ? void 0 : result.payload) == null ? void 0 : _j.data)) {
    const frame = buildTunstallBinaryFrame(result.payload);
    return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
  }
  return { qrText: displayText, bytesLen: utf8Bytes(displayText), displayText };
}
function buildArithmeticTextPayload(payload) {
  const tableJson = JSON.stringify(payload.table);
  const tableBytes = encoder.encode(tableJson);
  const tableDeflate = typeof pako !== "undefined" ? pako.deflateRaw(tableBytes, { level: 9 }) : tableBytes;
  const tableB64 = bytesToBase64Url(tableDeflate);
  const dataB64 = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|A|${payload.symCount}|${tableB64}|${dataB64}`;
}
function buildArithmeticBinaryFrame(payload) {
  const tableJson = JSON.stringify(payload.table);
  const tableBytes = encoder.encode(tableJson);
  const tableDeflate = typeof pako !== "undefined" ? pako.deflateRaw(tableBytes, { level: 9 }) : tableBytes;
  const dataBytes = base64ToBytes(payload.data || "");
  const symCount = payload.symCount || 0;
  const tableLen = tableDeflate.length;
  const header = new Uint8Array([
    81,
    90,
    49,
    65,
    // QZ1A
    symCount >> 8 & 255,
    symCount & 255,
    tableLen >> 8 & 255,
    tableLen & 255
  ]);
  const out = new Uint8Array(header.length + tableDeflate.length + dataBytes.length);
  out.set(header, 0);
  out.set(tableDeflate, header.length);
  out.set(dataBytes, header.length + tableDeflate.length);
  return out;
}
function buildCompressedQrPayload(result, encodingMode) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const mode = encodingMode || "text";
  if (((_a = result == null ? void 0 : result.method) == null ? void 0 : _a.startsWith("fixed_")) && ((_b = result == null ? void 0 : result.payload) == null ? void 0 : _b.profile)) {
    return buildFixedQrPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "deflate" && ((_c = result == null ? void 0 : result.payload) == null ? void 0 : _c.data)) {
    return mode === "text45" ? buildDeflateQrPayload45(result.payload) : buildDeflateQrPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "deflate_dict" && ((_d = result == null ? void 0 : result.payload) == null ? void 0 : _d.data)) {
    return mode === "text45" ? buildDeflateDictQrPayload45(result.payload) : buildDeflateDictQrPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "deflate_inline" && ((_e = result == null ? void 0 : result.payload) == null ? void 0 : _e.blob)) {
    return mode === "text45" ? buildDeflateInlineQrPayload45(result.payload) : buildDeflateInlineQrPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "lz_compact" && ((_f = result == null ? void 0 : result.payload) == null ? void 0 : _f.data)) {
    return buildLzCompactQrPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "arithmetic" && ((_g = result == null ? void 0 : result.payload) == null ? void 0 : _g.data)) {
    return buildArithmeticTextPayload(result.payload);
  }
  if ((result == null ? void 0 : result.method) === "tunstall" && ((_h = result == null ? void 0 : result.payload) == null ? void 0 : _h.data)) {
    return buildTunstallTextPayload(result.payload);
  }
  return `QZ1|J|${toBase64Url(result.serialized || "")}`;
}
function serializePayload(payload) {
  return JSON.stringify(payload);
}
function rawCompress(text) {
  return { method: "raw", text };
}
function rawDecompress(payload) {
  return payload.text;
}
function rleCompress(text) {
  const runs = [];
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    let count = 1;
    while (i + 1 < chars.length && chars[i] === chars[i + 1]) {
      count++;
      i++;
    }
    runs.push([count, chars[i]]);
  }
  return { method: "rle", runs };
}
function rleDecompress(payload) {
  return payload.runs.map(([count, char]) => char.repeat(count)).join("");
}
function buildHuffmanTree(freqMap) {
  const nodes = [...freqMap.entries()].map(([char, freq]) => ({ char, freq, left: null, right: null }));
  if (!nodes.length)
    return null;
  if (nodes.length === 1) {
    return { char: null, freq: nodes[0].freq, left: nodes[0], right: null };
  }
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
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
function buildCodeMap(node, prefix = "", map = {}) {
  if (!node)
    return map;
  if (node.char !== null) {
    map[node.char] = prefix || "0";
    return map;
  }
  buildCodeMap(node.left, prefix + "0", map);
  buildCodeMap(node.right, prefix + "1", map);
  return map;
}
function bitsToBase64(bits) {
  if (!bits.length)
    return { base64: "", bitLength: 0 };
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const chunk = bits.slice(i, i + 8).padEnd(8, "0");
    bytes.push(parseInt(chunk, 2));
  }
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return { base64: btoa(binary), bitLength: bits.length };
}
function buildTunstallCodebook(freqMap, numCodes) {
  const total = [...freqMap.values()].reduce((a, b) => a + b, 0);
  if (total === 0 || freqMap.size === 0)
    return { codebook: [], codeBits: 0 };
  let leaves = [];
  for (const [ch, cnt] of freqMap.entries()) {
    leaves.push({ str: ch, prob: cnt / total });
  }
  while (leaves.length < numCodes) {
    let best = -1, bestProb = -1;
    for (let i = 0; i < leaves.length; i++) {
      if (leaves[i].prob > bestProb) {
        bestProb = leaves[i].prob;
        best = i;
      }
    }
    if (best < 0)
      break;
    const parent = leaves.splice(best, 1)[0];
    if (leaves.length + freqMap.size > numCodes) {
      leaves.push(parent);
      break;
    }
    for (const [ch, cnt] of freqMap.entries()) {
      leaves.push({ str: parent.str + ch, prob: parent.prob * (cnt / total) });
    }
  }
  leaves = leaves.slice(0, numCodes);
  return { codebook: leaves.map((l) => l.str), codeBits: Math.ceil(Math.log2(numCodes)) };
}
function tunstallCompress(text) {
  if (!text.length)
    return { method: "tunstall", data: "", codeCount: 0, codeBits: 0, symCount: 0, table: [] };
  const freqMap = /* @__PURE__ */ new Map();
  for (const ch of text)
    freqMap.set(ch, (freqMap.get(ch) || 0) + 1);
  const alphabetSize = freqMap.size;
  if (alphabetSize === 1) {
    const ch = [...freqMap.keys()][0];
    const len = text.length;
    const binary2 = String.fromCharCode(len & 255, len >> 8 & 255);
    return { method: "tunstall", data: btoa(binary2), codeCount: 1, codeBits: 1, symCount: 1, table: [ch.repeat(len)] };
  }
  let numCodes = 1;
  while (numCodes < Math.min(256, alphabetSize * 4))
    numCodes <<= 1;
  numCodes = Math.max(numCodes, alphabetSize);
  if (numCodes > 256)
    numCodes = 256;
  const { codebook, codeBits } = buildTunstallCodebook(freqMap, numCodes);
  const codes = [];
  let i = 0;
  while (i < text.length) {
    let matched = -1, matchLen = 0;
    for (let cIdx = 0; cIdx < codebook.length; cIdx++) {
      const s = codebook[cIdx];
      if (s.length > matchLen && text.startsWith(s, i)) {
        matched = cIdx;
        matchLen = s.length;
      }
    }
    if (matched >= 0) {
      codes.push(matched);
      i += matchLen;
    } else {
      let idx = codebook.findIndex((s) => s.length === 1 && s === text[i]);
      if (idx < 0)
        idx = 0;
      codes.push(idx);
      i++;
    }
  }
  let bits = "";
  for (const code of codes) {
    bits += code.toString(2).padStart(codeBits, "0");
  }
  while (bits.length % 8 !== 0)
    bits += "0";
  const bytes = [];
  for (let b = 0; b < bits.length; b += 8)
    bytes.push(parseInt(bits.slice(b, b + 8), 2));
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return {
    method: "tunstall",
    data: btoa(binary),
    codeCount: codebook.length,
    codeBits,
    symCount: codes.length,
    bitCount: codes.length * codeBits,
    table: codebook
  };
}
function tunstallDecompress(payload) {
  if (!payload.data || !payload.table || payload.codeBits == null)
    return "";
  const codebook = payload.table;
  const codeBits = payload.codeBits;
  const symCount = payload.symCount || 0;
  if (codeBits === 0)
    return "";
  const binary = atob(payload.data);
  let bits = "";
  for (let i = 0; i < binary.length; i++) {
    bits += binary.charCodeAt(i).toString(2).padStart(8, "0");
  }
  let out = "";
  let decoded = 0;
  for (let i = 0; i + codeBits <= bits.length && decoded < symCount; i += codeBits) {
    const code = parseInt(bits.slice(i, i + codeBits), 2);
    out += codebook[code] || "";
    decoded++;
  }
  return out;
}
function buildTunstallTextPayload(payload) {
  const tableJson = JSON.stringify(payload.table);
  const tableBytes = encoder.encode(tableJson);
  const tableDeflate = typeof pako !== "undefined" ? pako.deflateRaw(tableBytes, { level: 9 }) : tableBytes;
  const tableB64 = bytesToBase64Url(tableDeflate);
  const dataB64 = toBase64UrlFromBase64(payload.data || "");
  return `QZ1|G|${payload.codeBits}|${payload.symCount}|${tableB64}|${dataB64}`;
}
function buildTunstallBinaryFrame(payload) {
  const tableJson = JSON.stringify(payload.table);
  const tableBytes = encoder.encode(tableJson);
  const tableDeflate = typeof pako !== "undefined" ? pako.deflateRaw(tableBytes, { level: 9 }) : tableBytes;
  const dataBytes = base64ToBytes(payload.data || "");
  const symCount = payload.symCount || 0;
  const codeBits = payload.codeBits || 0;
  const tableLen = tableDeflate.length;
  const header = new Uint8Array([
    81,
    90,
    49,
    71,
    // QZ1G
    codeBits & 255,
    symCount >> 16 & 255,
    symCount >> 8 & 255,
    symCount & 255,
    tableLen >> 8 & 255,
    tableLen & 255
  ]);
  const out = new Uint8Array(header.length + tableDeflate.length + dataBytes.length);
  out.set(header, 0);
  out.set(tableDeflate, header.length);
  out.set(dataBytes, header.length + tableDeflate.length);
  return out;
}
function base64ToBits(base64, bitLength) {
  if (!base64)
    return "";
  const binary = atob(base64);
  let bits = "";
  for (let i = 0; i < binary.length; i++) {
    bits += binary.charCodeAt(i).toString(2).padStart(8, "0");
  }
  return bits.slice(0, bitLength);
}
function huffmanCompress(text) {
  const freqMap = /* @__PURE__ */ new Map();
  for (const char of text) {
    freqMap.set(char, (freqMap.get(char) || 0) + 1);
  }
  const tree = buildHuffmanTree(freqMap);
  const codeMap = buildCodeMap(tree);
  let bits = "";
  for (const char of text) {
    bits += codeMap[char];
  }
  const packed = bitsToBase64(bits);
  return {
    method: "huffman",
    freq: [...freqMap.entries()],
    data: packed.base64,
    bitLength: packed.bitLength
  };
}
function huffmanDecompress(payload) {
  const freqMap = new Map(payload.freq);
  const tree = buildHuffmanTree(freqMap);
  const bits = base64ToBits(payload.data, payload.bitLength);
  if (!tree)
    return "";
  let output = "";
  if (tree.char !== null) {
    const char = tree.char;
    let total = 0;
    for (const count of freqMap.values())
      total += count;
    return char.repeat(total);
  }
  let node = tree;
  for (const bit of bits) {
    node = bit === "0" ? node.left : node.right;
    if (node && node.char !== null) {
      output += node.char;
      node = tree;
    }
  }
  return output;
}
function fixedHuffmanCompress(text, profileId) {
  if (!supportsPresetProfile(text, profileId)) {
    throw new Error(`Text contains unsupported characters for ${profileId}`);
  }
  const tree = buildHuffmanTree(presetFrequencyMaps[profileId]);
  const codeMap = buildCodeMap(tree);
  let bits = "";
  for (const char of text) {
    bits += codeMap[char];
  }
  const packed = bitsToBase64(bits);
  return {
    method: `fixed_${profileId}`,
    profile: profileId,
    data: packed.base64,
    bitLength: packed.bitLength
  };
}
function fixedHuffmanDecompress(payload) {
  const tree = buildHuffmanTree(presetFrequencyMaps[payload.profile]);
  const bits = base64ToBits(payload.data, payload.bitLength);
  if (!tree)
    return "";
  let output = "";
  let node = tree;
  for (const bit of bits) {
    node = bit === "0" ? node.left : node.right;
    if (node && node.char !== null) {
      output += node.char;
      node = tree;
    }
  }
  return output;
}
function estimateQrVersion(bytes) {
  for (let i = 0; i < QR_BYTE_CAPACITY_M.length; i++) {
    if (bytes <= QR_BYTE_CAPACITY_M[i])
      return i + 1;
  }
  return null;
}
function getQrCapacity(version) {
  if (!version)
    return 0;
  if (version < 1)
    return 0;
  if (version > QR_BYTE_CAPACITY_M.length)
    return 0;
  return QR_BYTE_CAPACITY_M[version - 1] || 0;
}
function alnumEffectiveBytes(charCount) {
  const pairs = Math.floor(charCount / 2);
  const rem = charCount % 2;
  const bits = pairs * 11 + (rem ? 6 : 0);
  return Math.ceil(bits / 8);
}
function getDictBytes(profileId) {
  return DICT_PROFILE_BYTES.get(profileId) || null;
}
function dictEncodeBytes(profileId, utf8Bytes2) {
  const dictBytes = getDictBytes(profileId);
  if (!dictBytes)
    throw new Error("unknown_dict_profile");
  const out = [];
  let i = 0;
  while (i < utf8Bytes2.length) {
    let bestId = 0;
    let bestLen = 0;
    for (let id = 1; id <= dictBytes.length; id++) {
      const dict = dictBytes[id - 1];
      const len = dict.length;
      if (len < 3)
        continue;
      if (i + len > utf8Bytes2.length)
        continue;
      let ok = true;
      for (let k = 0; k < len; k++) {
        if (utf8Bytes2[i + k] !== dict[k]) {
          ok = false;
          break;
        }
      }
      if (ok && len > bestLen) {
        bestLen = len;
        bestId = id;
      }
    }
    if (bestId && bestLen) {
      out.push(0, bestId & 255);
      i += bestLen;
      continue;
    }
    const b = utf8Bytes2[i];
    if (b === 0)
      out.push(0, 0);
    else
      out.push(b);
    i += 1;
  }
  return Uint8Array.from(out);
}
function dictDecodeBytes(profileId, tokenBytes) {
  const dictBytes = getDictBytes(profileId);
  if (!dictBytes)
    throw new Error("unknown_dict_profile");
  const out = [];
  for (let i = 0; i < tokenBytes.length; i++) {
    const b = tokenBytes[i];
    if (b !== 0) {
      out.push(b);
      continue;
    }
    if (i + 1 >= tokenBytes.length)
      break;
    const code = tokenBytes[++i];
    if (code === 0) {
      out.push(0);
      continue;
    }
    const dict = dictBytes[code - 1];
    if (dict) {
      for (const db of dict)
        out.push(db);
    }
  }
  return Uint8Array.from(out);
}
function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
function bpeLearnByteDict(inputBytes, maxEntries = 48) {
  const maxMerges = 220;
  const minPairCount = 8;
  const seq = Array.from(inputBytes).map((b) => b & 255);
  if (seq.length < 32)
    return [];
  const vocab = /* @__PURE__ */ new Map();
  for (let i = 0; i < 256; i++)
    vocab.set(i, new Uint8Array([i]));
  let nextId = 256;
  let symbols = seq;
  const candidates = [];
  for (let round = 0; round < maxMerges; round++) {
    const pairCount = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 + 1 < symbols.length; i2++) {
      const a2 = symbols[i2];
      const b2 = symbols[i2 + 1];
      const key = `${a2},${b2}`;
      pairCount.set(key, (pairCount.get(key) || 0) + 1);
    }
    let bestKey = null;
    let bestCount = 0;
    for (const [key, count] of pairCount.entries()) {
      if (count > bestCount) {
        bestCount = count;
        bestKey = key;
      }
    }
    if (!bestKey || bestCount < minPairCount)
      break;
    const [aStr, bStr] = bestKey.split(",");
    const a = Number(aStr);
    const b = Number(bStr);
    const aBytes = vocab.get(a);
    const bBytes = vocab.get(b);
    if (!aBytes || !bBytes)
      break;
    const merged = concatBytes(aBytes, bBytes);
    const newId = nextId++;
    vocab.set(newId, merged);
    const replaced = [];
    let i = 0;
    while (i < symbols.length) {
      if (i + 1 < symbols.length && symbols[i] === a && symbols[i + 1] === b) {
        replaced.push(newId);
        i += 2;
      } else {
        replaced.push(symbols[i]);
        i += 1;
      }
    }
    symbols = replaced;
    if (merged.length >= 3 && bestCount >= 3) {
      const score = (merged.length - 2) * (bestCount - 1);
      candidates.push({ bytes: merged, count: bestCount, score });
    }
  }
  candidates.sort((x, y) => y.score - x.score || y.bytes.length - x.bytes.length);
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= maxEntries)
      break;
    let overlapped = false;
    for (const p of picked) {
      if (p.length >= c.bytes.length) {
        for (let i = 0; i + c.bytes.length <= p.length; i++) {
          let ok = true;
          for (let k = 0; k < c.bytes.length; k++) {
            if (p[i + k] !== c.bytes[k]) {
              ok = false;
              break;
            }
          }
          if (ok) {
            overlapped = true;
            break;
          }
        }
      }
      if (overlapped)
        break;
    }
    if (overlapped)
      continue;
    picked.push(c.bytes);
  }
  picked.sort((a, b) => b.length - a.length);
  return picked;
}
function inlineDictEncodeBytes(dictBytes, utf8Bytes2) {
  const out = [];
  let i = 0;
  while (i < utf8Bytes2.length) {
    let bestId = 0;
    let bestLen = 0;
    for (let id = 1; id <= dictBytes.length; id++) {
      const d = dictBytes[id - 1];
      const len = d.length;
      if (len < 3)
        continue;
      if (i + len > utf8Bytes2.length)
        continue;
      let ok = true;
      for (let k = 0; k < len; k++) {
        if (utf8Bytes2[i + k] !== d[k]) {
          ok = false;
          break;
        }
      }
      if (ok && len > bestLen) {
        bestLen = len;
        bestId = id;
      }
    }
    if (bestId) {
      out.push(0, bestId & 255);
      i += bestLen;
      continue;
    }
    const b = utf8Bytes2[i];
    if (b === 0)
      out.push(0, 0);
    else
      out.push(b);
    i += 1;
  }
  return Uint8Array.from(out);
}
function inlineDictDecodeBytes(dictBytes, tokenBytes) {
  const out = [];
  for (let i = 0; i < tokenBytes.length; i++) {
    const b = tokenBytes[i];
    if (b !== 0) {
      out.push(b);
      continue;
    }
    if (i + 1 >= tokenBytes.length)
      break;
    const code = tokenBytes[++i];
    if (code === 0) {
      out.push(0);
      continue;
    }
    const d = dictBytes[code - 1];
    if (d)
      for (const db of d)
        out.push(db);
  }
  return Uint8Array.from(out);
}
function buildInlineDictBlob(dictBytes, dataDeflateBytes) {
  const entriesBytes = dictBytes.slice(0, 48);
  const n = Math.min(48, entriesBytes.length);
  let headerLen = 2;
  for (let i = 0; i < n; i++)
    headerLen += 1 + Math.min(255, entriesBytes[i].length);
  const out = new Uint8Array(headerLen + dataDeflateBytes.length);
  out[0] = 2;
  out[1] = n & 255;
  let pos = 2;
  for (let i = 0; i < n; i++) {
    const b = entriesBytes[i];
    const len = Math.min(255, b.length);
    out[pos++] = len & 255;
    out.set(b.slice(0, len), pos);
    pos += len;
  }
  out.set(dataDeflateBytes, pos);
  return out;
}
function parseInlineDictBlob(blobBytes) {
  if (!blobBytes || blobBytes.length < 3)
    throw new Error("invalid_inline_dict");
  const v = blobBytes[0];
  if (v !== 1 && v !== 2)
    throw new Error("unknown_inline_dict_version");
  const n = blobBytes[1];
  let pos = 2;
  const entriesBytes = [];
  for (let i = 0; i < n; i++) {
    if (pos >= blobBytes.length)
      throw new Error("invalid_inline_dict");
    const len = blobBytes[pos++];
    if (pos + len > blobBytes.length)
      throw new Error("invalid_inline_dict");
    entriesBytes.push(blobBytes.slice(pos, pos + len));
    pos += len;
  }
  const deflateBytes = blobBytes.slice(pos);
  return { version: v, entriesBytes, deflateBytes };
}
if (typeof window !== "undefined") {
  window.dictDecodeBytes = dictDecodeBytes;
  window.parseInlineDictBlob = parseInlineDictBlob;
  window.inlineDictDecodeBytes = inlineDictDecodeBytes;
}
