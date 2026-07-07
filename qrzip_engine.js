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
          ["\n\t", 4]
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
          ["\"'&=%?@#", 6],
          ["\n\t", 4]
        ]
      },
      mixed: {
        id: "mixed",
        label: "Fixed MIX",
        entries: [
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
      }
    };

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
      "\n",
      "สวัสดี",
      "ขอบคุณ",
      "วันที่",
      "เวลา",
      "จำนวน",
      "ราคา",
      "ลูกค้า",
      "ผู้ใช้",
      "บริษัท",
      "โทรศัพท์",
      "ที่อยู่",
      "ประเทศไทย",
      "กรุงเทพมหานคร",
      "รายละเอียด",
      "เพิ่มเติม",
      "ตรวจสอบ"
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
      " could "
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
      Object.entries(presetProfiles).map(([key, profile]) => [key, buildWeightedFrequencyMap(profile.entries)])
    );

    const presetCharSets = Object.fromEntries(
      Object.entries(presetFrequencyMaps).map(([key, map]) => [key, new Set(map.keys())])
    );

    const QR_BYTE_CAPACITY_M = [
      14, 26, 42, 62, 84, 106, 122, 152, 180, 213,
      251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
      711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370,
      1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331
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
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    }

    function bytesToBinaryString(bytes) {
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i] & 0xff);
      }
      return binary;
    }

    function binaryStringToBytes(binary) {
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i) & 0xff;
      }
      return bytes;
    }

    function bytesToBase64Url(bytes) {
      return toBase64UrlFromBase64(bytesToBase64(bytes));
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
      const valueOf = new Map();
      for (let i = 0; i < BASE45_CHARSET.length; i++) valueOf.set(BASE45_CHARSET[i], i);
      const out = [];
      for (let i = 0; i < text.length;) {
        // 3 chars -> 2 bytes, 2 chars -> 1 byte
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

    function isAsciiOnly(text) {
      for (const char of text) {
        if (char.charCodeAt(0) > 0x7f) return false;
      }
      return true;
    }

    function estimateTokens(text) {
      if (!text.length) return 0;
      const bytes = utf8Bytes(text);
      let asciiChars = 0;
      for (const char of text) {
        if (char.charCodeAt(0) <= 0x7f) asciiChars++;
      }
      const asciiRatio = asciiChars / text.length;
      const divisor = asciiRatio > 0.85 ? 4 : asciiRatio > 0.45 ? 3.2 : 2.6;
      return Math.max(1, Math.ceil(bytes / divisor));
    }

    function computeEntropy(text) {
      if (!text.length) return 0;
      const freq = new Map();
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
      if (!words.length) return 0;
      const counts = new Map();
      let repeated = 0;
      for (const word of words) {
        const next = (counts.get(word) || 0) + 1;
        counts.set(word, next);
      }
      for (const count of counts.values()) {
        if (count > 1) repeated += count;
      }
      return repeated / words.length;
    }

    function repeatedBigramRatio(text) {
      if (text.length < 2) return 0;
      const counts = new Map();
      for (let i = 0; i < text.length - 1; i++) {
        const pair = text.slice(i, i + 2);
        counts.set(pair, (counts.get(pair) || 0) + 1);
      }
      let repeated = 0;
      for (const count of counts.values()) {
        if (count > 1) repeated += count;
      }
      return repeated / Math.max(1, text.length - 1);
    }

    function longestRun(text) {
      if (!text.length) return 0;
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
        if (code <= 0x7f) asciiChars++;
        if (code >= 0x0e00 && code <= 0x0e7f) thaiChars++;
        if (char >= "0" && char <= "9") digitChars++;
        if (/\s/.test(char)) whitespaceChars++;
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
      if (!charset) return false;
      for (const char of text) {
        if (!charset.has(char)) return false;
      }
      return true;
    }

    function buildScanability(bytes, encodingMode, qrText) {
      // ใช้ "effective bytes" เพื่อประมาณความแน่น (base45 จะได้ประโยชน์จาก alphanumeric mode)
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
          label: "เกิน 1 QR",
          recommendation: "ควรใช้ Member QR",
          freeReady: false
        };
      }

      const capacity = getQrCapacity(version);
      const utilization = capacity ? effectiveBytes / capacity : 1;

      // สร้างคะแนนจาก "version" + "ความแน่นจริง" (utilization)
      // หลักคิด: ใกล้เต็ม 1 ใบจะสแกนยากขึ้นเร็วมาก แม้ยังไม่เกินความจุ
      let score = 100;
      score -= Math.max(0, version - 1) * 2.2;
      if (utilization > 0.55) score -= (utilization - 0.55) * 38;
      if (utilization > 0.70) score -= (utilization - 0.70) * 70;
      if (utilization > 0.82) score -= (utilization - 0.82) * 140;
      score = Math.max(8, Math.min(98, Math.round(score)));

      let label = "โล่ง";
      let recommendation = "เหมาะกับ Free 1 QR";
      let freeReady = utilization <= 0.82 && score >= 60;

      if (utilization > 0.55) label = "ดี";
      if (utilization > 0.70) label = "พอใช้";
      if (utilization > 0.82) label = "เริ่มแน่น";
      if (utilization > 0.90) label = "แน่นมาก";

      if (utilization > 0.82 || score < 60) {
        recommendation = "ควรพิจารณา Member QR";
        freeReady = false;
      }
      if (utilization > 0.90 || score < 45) {
        recommendation = "แนะนำ Member QR";
        freeReady = false;
      }

      return { version, capacity, utilization, effectiveBytes, score, label, recommendation, freeReady };
    }

    function lz78Compress(text) {
      const dictionary = new Map();
      const tokens = [];
      let current = "";
      let nextIndex = 1;
      for (const char of text) {
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
        const prefix = current.slice(0, -1);
        const lastChar = current.slice(-1);
        tokens.push([prefix ? dictionary.get(prefix) : 0, lastChar]);
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
            while (
              matchLength < maxLength &&
              position + matchLength < input.length &&
              input[scan + matchLength] === input[position + matchLength]
            ) {
              matchLength++;
            }
            if (matchLength > bestLength && matchLength >= 3) {
              bestLength = matchLength;
              bestOffset = position - scan;
              if (matchLength === maxLength) break;
            }
          }

          if (bestLength >= 3) {
            const pair = ((bestOffset - 1) << 4) | (bestLength - 3);
            output.push((pair >> 8) & 0xff);
            output.push(pair & 0xff);
            position += bestLength;
          } else {
            flags |= (1 << bit);
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
        if (!best || record.compressedBytes < best.compressedBytes) best = record;
      }
      if (!best) throw new Error("dict_profiles_empty");
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
      if (typeof pako === "undefined") {
        throw new Error("pako_not_loaded");
      }
      const input = base64ToBytes(payload.data);
      const restored = pako.inflateRaw(input);
      const profileId = payload.profile ?? 1;
      const utf8 = dictDecodeBytes(profileId, restored);
      return decoder.decode(utf8);
    }

    function deflateInlineCompress(text) {
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
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
      if (typeof pako === "undefined") throw new Error("pako_not_loaded");
      const blob = base64ToBytes(payload.blob || "");
      const parsed = parseInlineDictBlob(blob);
      const restored = pako.inflateRaw(parsed.deflateBytes);
      const utf8 = inlineDictDecodeBytes(parsed.entriesBytes, restored);
      return decoder.decode(utf8);
    }

    function arithmeticCompress(text) {
      if (!text.length) return { method: 'arithmetic', data: '', symCount: 0, table: [] };

      // Build frequency table on codepoints
      const freq = new Map();
      for (const ch of text) {
        const cp = ch.codePointAt(0);
        freq.set(cp, (freq.get(cp) || 0) + 1);
      }

      // Sort by codepoint for deterministic decode
      const table = [...freq.entries()].sort((a, b) => a[0] - b[0]);
      const total = text.length;

      // Build cumulative ranges [0,1) using BigInt arithmetic for precision
      // Scale: use denominator = total (integer arithmetic with BigInt)
      // Range: [low, high) represented as BigInt numerators over `total`
      const ranges = [];
      let cum = 0n;
      const bigTotal = BigInt(total);
      for (const [cp, cnt] of table) {
        const lo = cum;
        const hi = cum + BigInt(cnt);
        ranges.push({ cp, lo, hi });
        cum = hi;
      }
      const cpToRange = new Map(ranges.map(r => [r.cp, r]));

      // Encode using integer arithmetic with 64-bit scale
      // We'll use a fixed-precision 32-bit integer coder for browser compatibility
      const BITS = 30;
      const FULL = 1 << BITS;           // 2^30
      const HALF = FULL >>> 1;          // 2^29
      const QTR  = FULL >>> 2;          // 2^28

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
        // narrow interval
        high = low + Math.floor(range * Number(r.hi) / total);
        low  = low + Math.floor(range * Number(r.lo) / total);

        // renormalise
        for (;;) {
          if (high <= HALF) {
            emitBit(0);
            low  <<= 1;
            high <<= 1;
          } else if (low >= HALF) {
            emitBit(1);
            low  = (low  - HALF) << 1;
            high = (high - HALF) << 1;
          } else if (low >= QTR && high <= 3 * QTR) {
            pending++;
            low  = (low  - QTR) << 1;
            high = (high - QTR) << 1;
          } else {
            break;
          }
        }
      }

      // Flush
      pending++;
      if (low < QTR) {
        emitBit(0);
      } else {
        emitBit(1);
      }

      // Pack bits → bytes
      const byteArr = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) {
          b = (b << 1) | (bits[i + j] ?? 0);
        }
        byteArr.push(b);
      }

      return {
        method: 'arithmetic',
        data: bytesToBase64(Uint8Array.from(byteArr)),
        bitLength: bits.length,
        symCount: total,
        table   // [[cp, cnt], ...]
      };
    }

    function arithmeticDecompress(payload) {
      const { data, bitLength, symCount, table } = payload;
      if (!symCount || !data) return '';

      const total = symCount;
      const tableArr = table; // [[cp, cnt],...]

      // Rebuild cumulative ranges
      const ranges = [];
      let cum = 0n;
      const bigTotal = BigInt(total);
      for (const [cp, cnt] of tableArr) {
        const lo = cum;
        const hi = cum + BigInt(cnt);
        ranges.push({ cp, lo, hi, cnt: Number(cnt) });
        cum = hi;
      }

      // Read bits
      const rawBytes = base64ToBytes(data);
      const bits = [];
      for (const byte of rawBytes) {
        for (let i = 7; i >= 0; i--) {
          bits.push((byte >> i) & 1);
        }
      }

      const BITS = 30;
      const FULL = 1 << BITS;
      const HALF = FULL >>> 1;
      const QTR  = FULL >>> 2;

      let low = 0, high = FULL;
      let val = 0;
      let bitPos = 0;

      function readBit() {
        if (bitPos < bits.length) return bits[bitPos++];
        return 0;
      }

      // Init val with first BITS bits
      for (let i = 0; i < BITS; i++) {
        val = (val << 1) | readBit();
      }

      const out = [];
      for (let s = 0; s < symCount; s++) {
        // Find symbol: cumFreq * (val - low) / (high - low) in [0, total)
        const range = high - low;
        // scale = floor(((val - low + 1) * total - 1) / range)
        const scaled = Math.floor(((val - low + 1) * total - 1) / range);
        // Binary search in ranges
        let lo2 = 0, hi2 = ranges.length - 1, idx = 0;
        while (lo2 <= hi2) {
          const mid = (lo2 + hi2) >> 1;
          if (Number(ranges[mid].lo) <= scaled) {
            idx = mid;
            lo2 = mid + 1;
          } else {
            hi2 = mid - 1;
          }
        }
        const r = ranges[idx];
        out.push(String.fromCodePoint(r.cp));

        // Update interval
        high = low + Math.floor(range * Number(r.hi) / total);
        low  = low + Math.floor(range * Number(r.lo) / total);

        // Renormalise
        for (;;) {
          if (high <= HALF) {
            low  <<= 1;
            high <<= 1;
            val  <<= 1;
            val  |= readBit();
          } else if (low >= HALF) {
            low  = (low  - HALF) << 1;
            high = (high - HALF) << 1;
            val  = (val  - HALF) << 1;
            val  |= readBit();
          } else if (low >= QTR && high <= 3 * QTR) {
            low  = (low  - QTR) << 1;
            high = (high - QTR) << 1;
            val  = (val  - QTR) << 1;
            val  |= readBit();
          } else {
            break;
          }
        }
      }
      return out.join('');
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
      arithmetic: { compress: arithmeticCompress, decompress: arithmeticDecompress, label: "Arithmetic Coding" }
    };

    function selectAutoCandidates(stats, text) {
      const candidates = new Set(["raw"]);
      const reasons = [];

      reasons.push("เริ่มจาก raw เป็น baseline เสมอ");

      if (stats.utf8Bytes <= 120) {
        reasons.push("ข้อความค่อนข้างสั้น จึงเผื่อ raw ไว้เพราะ overhead อาจแพงกว่าประโยชน์");
      }

      if (stats.digitRatio >= 0.55 && supportsPresetProfile(text, "num")) {
        candidates.add("fixed_num");
        reasons.push("ตัวเลขเยอะ จึงลอง Fixed NUM");
      }

      if (stats.asciiRatio >= 0.82 && supportsPresetProfile(text, "en")) {
        candidates.add("fixed_en");
        reasons.push("ASCII สูง จึงลอง Fixed EN");
      }

      if (stats.thaiRatio >= 0.18 && supportsPresetProfile(text, "mixed")) {
        candidates.add("fixed_mixed");
        reasons.push("มีอักขระไทยพอสมควร จึงลอง Fixed MIX");
      }

      if (stats.repeatedWordRatio >= 0.25 || stats.repeatedBigramRatio >= 0.45) {
        candidates.add("lz_compact");
        reasons.push("ข้อความมี pattern ซ้ำสูง จึงลอง LZ Compact");
        candidates.add("lz78");
        reasons.push("ข้อความมี pattern ซ้ำสูง จึงลอง LZ78");
      }

      if (stats.utf8Bytes >= 140 || stats.repeatedBigramRatio >= 0.22 || stats.entropy <= 5.2) {
        candidates.add("deflate");
        reasons.push("ข้อความยาวพอหรือมีแพตเทิร์นพอสมควร จึงลอง Deflate Raw");
      }

      if (
        stats.repeatedWordRatio >= 0.18
        || stats.repeatedBigramRatio >= 0.35
        || stats.utf8Bytes >= 320
        || (stats.asciiRatio >= 0.8 && stats.utf8Bytes >= 220)
        || (stats.thaiRatio >= 0.22 && stats.utf8Bytes >= 220)
      ) {
        candidates.add("deflate_dict");
        reasons.push("ข้อความยาว/มี pattern พอสมควร จึงลอง Deflate + Dict (Auto profiles)");
      }

      if (stats.utf8Bytes >= 700 && stats.repeatedBigramRatio >= 0.55) {
        candidates.add("deflate_inline");
        reasons.push("ข้อความยาวและ bigram ซ้ำสูง จึงลอง Deflate + InlineDict (BPE) เพื่อ squeeze เพิ่ม");
      }

      if (stats.longestRun >= 4) {
        candidates.add("rle");
        reasons.push("มีตัวซ้ำติดกันยาว จึงลอง RLE");
      }

      if (stats.entropy <= 4.7 && stats.uniqueChars <= 90) {
        candidates.add("huffman");
        reasons.push("entropy ต่ำและจำนวนตัวอักษรไม่ซ้ำไม่สูงมาก จึงลอง Huffman แบบ dynamic");
      }

      // Arithmetic Coding: ดีกว่า Huffman เสมอ ลองเมื่อมี Thai หรือ entropy สูง
      if (stats.thaiRatio >= 0.18 || (stats.uniqueChars >= 30 && stats.utf8Bytes >= 100)) {
        candidates.add("arithmetic");
        reasons.push("ลอง Arithmetic Coding เพื่อเข้าใกล้ entropy limit (fractional bits)");
      }

      return {
        mode: "auto-v2",
        candidates: [...candidates],
        reasons
      };
    }
    function parseDensityThreshold(value) {
      const raw = Number(value);
      if (!Number.isFinite(raw)) return 0.82;
      return Math.min(0.95, Math.max(0.6, raw));
    }

    function rankResults(results, objective, densityThreshold) {
      const list = [...results];
      const bytesFirst = (a, b) => {
        const diff = Math.abs(a.finalPayloadBytes - b.finalPayloadBytes);
        if (diff <= 48 && a.scanability.score !== b.scanability.score) {
          return b.scanability.score - a.scanability.score;
        }
        return a.finalPayloadBytes - b.finalPayloadBytes
          || b.scanability.score - a.scanability.score
          || a.serializedBytes - b.serializedBytes;
      };

      const scanFirst = (a, b) => {
        return (b.scanability.score - a.scanability.score)
          || (a.finalPayloadBytes - b.finalPayloadBytes)
          || (a.serializedBytes - b.serializedBytes);
      };

      if (objective === "scan") {
        list.sort(scanFirst);
        return { ranked: list, used: "scan", threshold: densityThreshold, passedCount: list.length };
      }

      if (objective === "density") {
        const passed = list.filter((item) => {
          if (!item.scanability?.version) return false;
          if (!Number.isFinite(item.scanability.utilization)) return false;
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
        // ถ้าไม่มีตัวไหนผ่าน threshold เลย ให้ fallback ไปสแกนง่ายสุด
        list.sort(scanFirst);
        return { ranked: list, used: "scan_fallback", threshold: densityThreshold, passedCount: 0 };
      }

      list.sort(bytesFirst);
      return { ranked: list, used: "bytes", threshold: densityThreshold, passedCount: list.length };
    }

    function evaluateMethod(method, text) {
      const engine = compressors[method];
      try {
        const encodingMode = (typeof window !== "undefined" && window.qrEncodingSelect) ? window.qrEncodingSelect.value : "text45";
        const payload = engine.compress(text);
        const serialized = serializePayload(payload);
        const decoded = engine.decompress(payload);
        const originalBytes = utf8Bytes(text);
        const serializedBytes = utf8Bytes(serialized);
        const originalTokens = estimateTokens(text);
        const serializedTokens = estimateTokens(serialized);
        const savedBytes = originalBytes - serializedBytes;
        const savedTokens = originalTokens - serializedTokens;
        const ratio = originalBytes > 0 ? (serializedBytes / originalBytes) * 100 : 100;
        const tokenRatio = originalTokens > 0 ? (serializedTokens / originalTokens) * 100 : 100;
        const carrier = method === "raw"
          ? buildQrCarrierForRaw(text, encodingMode)
          : buildQrCarrierForCompressed({ method, payload, serialized }, encodingMode);
        const finalPayload = carrier.displayText;
        const finalQrText = carrier.qrText;
        const finalPayloadBytes = carrier.bytesLen;
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
      topStats.innerHTML = "";
      const payloadStat = (best.scanability?.effectiveBytes && best.scanability.effectiveBytes !== best.finalPayloadBytes)
        ? `${best.finalPayloadBytes.toLocaleString()} bytes (alnum≈ ${best.scanability.effectiveBytes.toLocaleString()} bytes)`
        : formatBytes(best.finalPayloadBytes);
      const items = [
        ["จำนวนตัวอักษร", stats.chars.toLocaleString()],
        ["ขนาด UTF-8 เดิม", formatBytes(stats.utf8Bytes)],
        ["โทเคนเดิมโดยประมาณ", stats.estimatedTokens.toLocaleString()],
        ["โทเคนหลังบีบอัด", best.serializedTokens.toLocaleString()],
        ["ลดลงกี่โทเคน", best.savedTokens.toLocaleString()],
        ["payload เข้า QR", payloadStat],
        ["QR version โดยประมาณ", best.scanability.version ? `v${best.scanability.version}` : "> v40"],
        ["ความแน่นของ QR", best.scanability.capacity ? `${Math.round(best.scanability.utilization * 100)}% ของความจุ (≈ ${best.scanability.capacity.toLocaleString()} bytes)` : "เกิน 1 QR"],
        ["scanability score", `${best.scanability.score}/100 (${best.scanability.label})`],
        ["ตัวอักษรไม่ซ้ำ", stats.uniqueChars.toLocaleString()],
        ["ASCII ratio", formatPercent(stats.asciiRatio * 100)],
        ["Thai ratio", formatPercent(stats.thaiRatio * 100)],
        ["Entropy โดยประมาณ", stats.entropy.toFixed(3)],
        ["คำที่ซ้ำ", formatPercent(stats.repeatedWordRatio * 100)],
        ["bigram ซ้ำ", formatPercent(stats.repeatedBigramRatio * 100)],
        ["run ยาวสุด", stats.longestRun.toLocaleString()],
        ["ตัวที่ชนะ", best.label]
      ];
      items.forEach(([label, value]) => {
        const card = document.createElement("div");
        card.className = "stat";
        card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
        topStats.appendChild(card);
      });
    }

    function renderSummary(stats, best, mode, results, selectorInfo, rankedInfo) {
      const repeatedScore = ((stats.repeatedWordRatio + stats.repeatedBigramRatio) / 2) * 100;
      const selectionNote = mode === "auto"
        ? `Auto Selector v2 เลือก shortlist จากสถิติ แล้วตัดสินให้ <code>${best.label}</code> ชนะจากผลลัพธ์ที่จัดอันดับแล้ว`
        : `คุณเลือกใช้ <code>${best.label}</code> โดยตรง`;
      const compressionNote = best.savedBytes >= 0
        ? `ลดขนาดได้ประมาณ <strong>${best.savedBytes.toLocaleString()} bytes</strong> หรือเหลือ <strong>${formatPercent(best.ratio)}</strong> ของเดิม`
        : `ผลลัพธ์ใหญ่ขึ้นประมาณ <strong>${Math.abs(best.savedBytes).toLocaleString()} bytes</strong> ซึ่งเกิดขึ้นได้ใน lossless compression เมื่อข้อความสั้นหรือไม่มี pattern ซ้ำมากพอ`;
      const tokenNote = best.savedTokens >= 0
        ? `โทเคนโดยประมาณลดลง <strong>${best.savedTokens.toLocaleString()}</strong> token หรือเหลือ <strong>${formatPercent(best.tokenRatio)}</strong> ของเดิม`
        : `โทเคนโดยประมาณเพิ่มขึ้น <strong>${Math.abs(best.savedTokens).toLocaleString()}</strong> token ซึ่งมักเกิดจาก metadata และ JSON serialization ของเดโมนี้`;
      const verifyNote = best.ok
        ? `<span style="color: var(--good)">คลายกลับตรงกับต้นฉบับ 100%</span>`
        : `<span style="color: var(--bad)">คลายกลับไม่ตรงกับต้นฉบับ</span>`;
      const selectorNote = selectorInfo?.reasons?.length
        ? `เหตุผลที่ลอง: ${selectorInfo.reasons.join(" | ")}`
        : "";
      const utilizationText = best.scanability.capacity
        ? `แน่นประมาณ <strong>${Math.round(best.scanability.utilization * 100)}%</strong> ของความจุ (≈ ${best.scanability.capacity.toLocaleString()} bytes)`
        : "เกิน 1 QR";
      const scanabilityNote = `คะแนน scanability ประมาณ <strong>${best.scanability.score}/100</strong> (${best.scanability.label}) | QR version โดยประมาณ <strong>${best.scanability.version ? `v${best.scanability.version}` : "&gt; v40"}</strong> | ${utilizationText}`;
      const usageDecisionNote = best.scanability.freeReady
        ? `คำแนะนำการใช้งาน: อยู่ในช่วงที่เหมาะกับ <strong>1 QR</strong>`
        : `คำแนะนำการใช้งาน: <strong>${best.scanability.recommendation}</strong>`;

      const objectiveLabel = (() => {
        const used = rankedInfo?.used || "bytes";
        if (used === "scan") return "สแกนง่ายสุด (scanability-first)";
        if (used === "density") return `คุมความหนาแน่น (threshold=${(rankedInfo?.threshold ?? 0.82).toFixed(2)})`;
        if (used === "scan_fallback") return `คุมความหนาแน่นแล้วไม่ผ่าน → fallback สแกนง่ายสุด (threshold=${(rankedInfo?.threshold ?? 0.82).toFixed(2)})`;
        return "สั้นสุด (bytes-first)";
      })();
      const objectiveNote = mode === "auto"
        ? `เกณฑ์ตัดสิน: <strong>${objectiveLabel}</strong>`
        : "";
      const dictProfileNote = best.method === "deflate_dict" && best.payload?.profileName
        ? `โปรไฟล์ dict ที่เลือก: <strong>${best.payload.profileName}</strong> (id=${best.payload.profile})`
        : "";

      autoSummary.innerHTML = `
        ${selectionNote}.<br>
        ${objectiveNote ? `${objectiveNote}.<br>` : ""}
        ${dictProfileNote ? `${dictProfileNote}.<br>` : ""}
        ข้อความนี้มีการซ้ำระดับประมาณ <strong>${repeatedScore.toFixed(2)}%</strong>, entropy ประมาณ <strong>${stats.entropy.toFixed(3)}</strong> bits/char และ ${compressionNote}.<br>
        payload สำหรับ QR ของตัวที่ชนะมีขนาดประมาณ <strong>${best.finalPayloadBytes.toLocaleString()} bytes</strong>${best.scanability?.effectiveBytes && best.scanability.effectiveBytes !== best.finalPayloadBytes ? ` (alnum≈ ${best.scanability.effectiveBytes.toLocaleString()} bytes)` : ""}.<br>
        ${scanabilityNote}.<br>
        ${usageDecisionNote}.<br>
        สำหรับการประเมินโทเคน: เดิมประมาณ <strong>${stats.estimatedTokens.toLocaleString()}</strong> token, หลังบีบอัดประมาณ <strong>${best.serializedTokens.toLocaleString()}</strong> token, ${tokenNote}.<br>
        ${selectorNote ? `${selectorNote}.<br>` : ""}
        สถานะตรวจสอบ: ${verifyNote}
      `;
    }

    function badgeClass(result) {
      if (!result.ok) return "bad";
      if (result.savedBytes >= 0) return "good";
      return "warn";
    }

    function badgeText(result) {
      if (!result.ok) return "Decode error";
      if (result.savedBytes >= 0) return "Lossless OK";
      return "ใหญ่ขึ้นแต่ถูกต้อง";
    }

    function renderResults(results, bestMethod) {
      resultList.innerHTML = "";
      results.forEach((result) => {
        const card = document.createElement("div");
        card.className = `result-card ${result.method === bestMethod ? "best" : ""}`;
        const deltaText = result.savedBytes >= 0
          ? `ประหยัด ${result.savedBytes.toLocaleString()} bytes`
          : `เพิ่ม ${Math.abs(result.savedBytes).toLocaleString()} bytes`;
        const tokenDeltaText = result.savedTokens >= 0
          ? `ลด ${result.savedTokens.toLocaleString()} token`
          : `เพิ่ม ${Math.abs(result.savedTokens).toLocaleString()} token`;
        card.innerHTML = `
          <div class="row">
            <strong>${result.label}</strong>
            <div class="row">
              ${result.method === bestMethod ? '<span class="badge good">Best</span>' : ""}
              <span class="badge ${badgeClass(result)}">${badgeText(result)}</span>
            </div>
          </div>
          <div class="small" style="margin-top: 8px;">
            เดิม ${formatBytes(result.originalBytes)} | หลัง serialize ${formatBytes(result.serializedBytes)} | ${deltaText} | ratio ${formatPercent(result.ratio)}
          </div>
          <div class="small" style="margin-top: 6px;">
            token เดิมประมาณ ${result.originalTokens.toLocaleString()} | หลัง serialize ${result.serializedTokens.toLocaleString()} | ${tokenDeltaText} | token ratio ${formatPercent(result.tokenRatio)}
          </div>
          <div class="small" style="margin-top: 6px;">
            final QR payload ${formatBytes(result.finalPayloadBytes)}${result.scanability?.effectiveBytes && result.scanability.effectiveBytes !== result.finalPayloadBytes ? ` (alnum≈ ${formatBytes(result.scanability.effectiveBytes)})` : ""}
          </div>
          <div class="small" style="margin-top: 6px;">
            scanability ${result.scanability.score}/100 (${result.scanability.label}) | ${result.scanability.version ? `ประมาณ v${result.scanability.version}` : "เกิน 1 QR"}${result.scanability.capacity ? ` | แน่น ${Math.round(result.scanability.utilization * 100)}%` : ""}
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
      return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    }

    // Compact payload format (no JSON wrapper):
    // - Raw ASCII text:  QZ1|T|<text>
    // - Raw non-ASCII:   QZ1|B|<base64url(utf8 text)>
    // - Fixed Huffman:   QZ1|F|<profile>|<bitLength>|<base64url(bitstream bytes)>
    // - Deflate Raw:     QZ1|D|<base64url(deflate bytes)>
    // - Deflate+Dict1:   QZ1|K|1|<base64url(deflate bytes)>
    // - LZ Compact:      QZ1|L|<base64url(binary token stream)>
    // - Arithmetic:      QZ1|A|<symCount>|<base64url(table_json_deflate)>|<base64url(bitstream)>
    // Fallback (legacy): QZ1|J|<base64url(json)>
    //
    // QR Byte mode (ลด overhead จาก base64/url-safe):
    // - Raw UTF-8:       "QZ1T" + <utf8 bytes>
    // - Deflate Raw:     "QZ1D" + <deflate bytes>
    // - Deflate+Dict1:   "QZ1K" + <profileId:1> + <deflate bytes>
    // - LZ Compact:      "QZ1L" + <lz token bytes>
    // - Fixed Huffman:   "QZ1F" + <profileId:1> + <bitLength:uint16> + <bitstream bytes>
    // - Arithmetic:      "QZ1A" + <symCount:uint16> + <tableLen:uint16> + <tableDeflate> + <bitstream>
    //
    // QR Text alnum (Base45) - เพื่อให้ QR ใช้ Alphanumeric mode ได้ (capacity สูงกว่า byte-mode):
    // - Deflate Raw:     "QZ1D:" + <base45(deflate bytes)>
    // - Deflate+Dict:    "QZ1K<profileId>:" + <base45(deflate bytes)>
    // - InlineDict(BPE): "QZ1U:" + <base45(blob bytes)>

    function buildRawQrPayload(text) {
      if (isAsciiOnly(text)) {
        return `QZ1|T|${text}`;
      }
      return `QZ1|B|${toBase64Url(text)}`;
    }

    function buildFixedQrPayload(payload) {
      // payload: { method: 'fixed_en', profile: 'en', data: '<base64>', bitLength: number }
      const profile = (payload.profile || "").toUpperCase();
      const bitLength = payload.bitLength ?? 0;
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
      const profileId = payload.profile ?? 1;
      const dataB64Url = toBase64UrlFromBase64(payload.data || "");
      return `QZ1|K|${profileId}|${dataB64Url}`;
    }

    function buildDeflateQrPayload45(payload) {
      const bytes = base64ToBytes(payload.data || "");
      return `QZ1D:${base45Encode(bytes)}`;
    }

    function buildDeflateDictQrPayload45(payload) {
      const profileId = payload.profile ?? 1;
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
      const header = new Uint8Array([0x51, 0x5a, 0x31, methodChar.charCodeAt(0)]);
      const out = new Uint8Array(header.length + dataBytes.length);
      out.set(header, 0);
      out.set(dataBytes, header.length);
      return out;
    }

    function fixedProfileToId(profile) {
      const p = (profile || "").toLowerCase();
      if (p === "num") return 1;
      if (p === "en") return 2;
      if (p === "mixed") return 3;
      return 0;
    }

    function buildFixedBinaryFrame(payload) {
      const profileId = fixedProfileToId(payload.profile);
      const bitLength = payload.bitLength ?? 0;
      const dataBytes = base64ToBytes(payload.data || "");
      const header = new Uint8Array([
        0x51, 0x5a, 0x31, 0x46, // QZ1F
        profileId & 0xff,
        (bitLength >> 8) & 0xff,
        bitLength & 0xff
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
      const displayText = buildCompressedQrPayload(result, encodingMode);
      if (encodingMode !== "byte") {
        // text / text45: ให้ qrText เป็น string ตามที่สร้างไว้
        return { qrText: displayText, bytesLen: utf8Bytes(displayText), displayText };
      }

      if (result?.method === "deflate" && result?.payload?.data) {
        const bytes = base64ToBytes(result.payload.data);
        const frame = buildBinaryFrameSimple("D", bytes);
        return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
      }

      if (result?.method === "deflate_dict" && result?.payload?.data) {
        const profileId = result.payload.profile ?? 1;
        const bytes = base64ToBytes(result.payload.data);
        const header = new Uint8Array([0x51, 0x5a, 0x31, 0x4b, profileId & 0xff]); // QZ1K + profileId
        const out = new Uint8Array(header.length + bytes.length);
        out.set(header, 0);
        out.set(bytes, header.length);
        return { qrText: bytesToBinaryString(out), bytesLen: out.length, displayText };
      }

      if (result?.method === "deflate_inline" && result?.payload?.blob) {
        const blobBytes = base64ToBytes(result.payload.blob);
        const header = new Uint8Array([0x51, 0x5a, 0x31, 0x55]); // QZ1U
        const out = new Uint8Array(header.length + blobBytes.length);
        out.set(header, 0);
        out.set(blobBytes, header.length);
        return { qrText: bytesToBinaryString(out), bytesLen: out.length, displayText };
      }

      if (result?.method === "lz_compact" && result?.payload?.data) {
        const bytes = base64ToBytes(result.payload.data);
        const frame = buildBinaryFrameSimple("L", bytes);
        return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
      }

      if (result?.method?.startsWith("fixed_") && result?.payload?.profile && result?.payload?.data) {
        const frame = buildFixedBinaryFrame(result.payload);
        return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
      }

      if (result?.method === "arithmetic" && result?.payload?.data) {
        const frame = buildArithmeticBinaryFrame(result.payload);
        return { qrText: bytesToBinaryString(frame), bytesLen: frame.length, displayText };
      }

      // วิธีอื่น ๆ ยังใช้ text mode ไปก่อน (เพราะเป็น legacy/JSON)
      return { qrText: displayText, bytesLen: utf8Bytes(displayText), displayText };
    }

    // ─── Arithmetic QR payload builders ───
    function buildArithmeticTextPayload(payload) {
      // table: [[cp,cnt],...] → JSON → deflate → base64url
      // format: QZ1|A|<symCount>|<base64url(tableDeflate)>|<base64url(bitstream)>
      const tableJson = JSON.stringify(payload.table);
      const tableBytes = encoder.encode(tableJson);
      const tableDeflate = typeof pako !== 'undefined'
        ? pako.deflateRaw(tableBytes, { level: 9 })
        : tableBytes;
      const tableB64 = bytesToBase64Url(tableDeflate);
      const dataB64 = toBase64UrlFromBase64(payload.data || '');
      return `QZ1|A|${payload.symCount}|${tableB64}|${dataB64}`;
    }

    function buildArithmeticBinaryFrame(payload) {
      // QZ1A + uint16(symCount) + uint16(tableLen) + tableDeflate + bitstream
      const tableJson = JSON.stringify(payload.table);
      const tableBytes = encoder.encode(tableJson);
      const tableDeflate = typeof pako !== 'undefined'
        ? pako.deflateRaw(tableBytes, { level: 9 })
        : tableBytes;
      const dataBytes = base64ToBytes(payload.data || '');
      const symCount = payload.symCount || 0;
      const tableLen = tableDeflate.length;
      const header = new Uint8Array([
        0x51, 0x5a, 0x31, 0x41, // QZ1A
        (symCount >> 8) & 0xff, symCount & 0xff,
        (tableLen >> 8) & 0xff, tableLen & 0xff
      ]);
      const out = new Uint8Array(header.length + tableDeflate.length + dataBytes.length);
      out.set(header, 0);
      out.set(tableDeflate, header.length);
      out.set(dataBytes, header.length + tableDeflate.length);
      return out;
    }

    function buildCompressedQrPayload(result, encodingMode) {
      // result: { method, payload, serialized }
      const mode = encodingMode || "text";
      if (result?.method?.startsWith("fixed_") && result?.payload?.profile) {
        return buildFixedQrPayload(result.payload);
      }
      if (result?.method === "deflate" && result?.payload?.data) {
        return mode === "text45" ? buildDeflateQrPayload45(result.payload) : buildDeflateQrPayload(result.payload);
      }
      if (result?.method === "deflate_dict" && result?.payload?.data) {
        return mode === "text45" ? buildDeflateDictQrPayload45(result.payload) : buildDeflateDictQrPayload(result.payload);
      }
      if (result?.method === "deflate_inline" && result?.payload?.blob) {
        return mode === "text45" ? buildDeflateInlineQrPayload45(result.payload) : buildDeflateInlineQrPayload(result.payload);
      }
      if (result?.method === "lz_compact" && result?.payload?.data) {
        return buildLzCompactQrPayload(result.payload);
      }
      if (result?.method === "arithmetic" && result?.payload?.data) {
        return buildArithmeticTextPayload(result.payload);
      }
      // For other algorithms in this demo, keep a compact legacy form.
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
      for (let i = 0; i < text.length; i++) {
        let count = 1;
        while (i + 1 < text.length && text[i] === text[i + 1]) {
          count++;
          i++;
        }
        runs.push([count, text[i]]);
      }
      return { method: "rle", runs };
    }

    function rleDecompress(payload) {
      return payload.runs.map(([count, char]) => char.repeat(count)).join("");
    }

    function buildHuffmanTree(freqMap) {
      const nodes = [...freqMap.entries()].map(([char, freq]) => ({ char, freq, left: null, right: null }));
      if (!nodes.length) return null;
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
      if (!node) return map;
      if (node.char !== null) {
        map[node.char] = prefix || "0";
        return map;
      }
      buildCodeMap(node.left, prefix + "0", map);
      buildCodeMap(node.right, prefix + "1", map);
      return map;
    }

    function bitsToBase64(bits) {
      if (!bits.length) return { base64: "", bitLength: 0 };
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

    function base64ToBits(base64, bitLength) {
      if (!base64) return "";
      const binary = atob(base64);
      let bits = "";
      for (let i = 0; i < binary.length; i++) {
        bits += binary.charCodeAt(i).toString(2).padStart(8, "0");
      }
      return bits.slice(0, bitLength);
    }

    function huffmanCompress(text) {
      const freqMap = new Map();
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
      if (!tree) return "";
      let output = "";
      if (tree.char !== null) {
        const char = tree.char;
        let total = 0;
        for (const count of freqMap.values()) total += count;
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
      if (!tree) return "";
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
        if (bytes <= QR_BYTE_CAPACITY_M[i]) return i + 1;
      }
      return null;
    }

    function getQrCapacity(version) {
      if (!version) return 0;
      if (version < 1) return 0;
      if (version > QR_BYTE_CAPACITY_M.length) return 0;
      return QR_BYTE_CAPACITY_M[version - 1] || 0;
    }

    function alnumEffectiveBytes(charCount) {
      // QR alphanumeric: 2 chars = 11 bits, 1 char = 6 bits
      const pairs = Math.floor(charCount / 2);
      const rem = charCount % 2;
      const bits = pairs * 11 + (rem ? 6 : 0);
      return Math.ceil(bits / 8);
    }

    function getDictBytes(profileId) {
      return DICT_PROFILE_BYTES.get(profileId) || null;
    }

    function dictEncodeBytes(profileId, utf8Bytes) {
      // Escape scheme:
      // - 0x00 0x00 => literal 0x00
      // - 0x00 id   => dictionary token id (1..DICT.length)
      const dictBytes = getDictBytes(profileId);
      if (!dictBytes) throw new Error("unknown_dict_profile");
      const out = [];
      let i = 0;
      while (i < utf8Bytes.length) {
        let bestId = 0;
        let bestLen = 0;
        // greedy longest-match
        for (let id = 1; id <= dictBytes.length; id++) {
          const dict = dictBytes[id - 1];
          const len = dict.length;
          if (len < 3) continue; // กัน overhead ถ้าสั้นเกิน
          if (i + len > utf8Bytes.length) continue;
          let ok = true;
          for (let k = 0; k < len; k++) {
            if (utf8Bytes[i + k] !== dict[k]) { ok = false; break; }
          }
          if (ok && len > bestLen) {
            bestLen = len;
            bestId = id;
          }
        }

        if (bestId && bestLen) {
          out.push(0x00, bestId & 0xff);
          i += bestLen;
          continue;
        }

        const b = utf8Bytes[i];
        if (b === 0x00) out.push(0x00, 0x00);
        else out.push(b);
        i += 1;
      }
      return Uint8Array.from(out);
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

    function concatBytes(a, b) {
      const out = new Uint8Array(a.length + b.length);
      out.set(a, 0);
      out.set(b, a.length);
      return out;
    }

    function bpeLearnByteDict(inputBytes, maxEntries = 48) {
      // ทำ BPE merge แบบง่ายเพื่อสร้าง "token bytes" ที่ซ้ำบ่อย
      const maxMerges = 220;
      const minPairCount = 8;
      const seq = Array.from(inputBytes).map((b) => b & 0xff);
      if (seq.length < 32) return [];

      const vocab = new Map();
      for (let i = 0; i < 256; i++) vocab.set(i, new Uint8Array([i]));
      let nextId = 256;

      let symbols = seq;
      const candidates = [];

      for (let round = 0; round < maxMerges; round++) {
        const pairCount = new Map();
        for (let i = 0; i + 1 < symbols.length; i++) {
          const a = symbols[i];
          const b = symbols[i + 1];
          const key = `${a},${b}`;
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
        if (!bestKey || bestCount < minPairCount) break;

        const [aStr, bStr] = bestKey.split(",");
        const a = Number(aStr);
        const b = Number(bStr);
        const aBytes = vocab.get(a);
        const bBytes = vocab.get(b);
        if (!aBytes || !bBytes) break;
        const merged = concatBytes(aBytes, bBytes);
        const newId = nextId++;
        vocab.set(newId, merged);

        // replace all occurrences
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

      candidates.sort((x, y) => (y.score - x.score) || (y.bytes.length - x.bytes.length));
      const picked = [];
      for (const c of candidates) {
        if (picked.length >= maxEntries) break;
        // กัน token ที่เป็น substring ของ token ที่เลือกไปแล้ว
        let overlapped = false;
        for (const p of picked) {
          if (p.length >= c.bytes.length) {
            // check if c is substring of p
            for (let i = 0; i + c.bytes.length <= p.length; i++) {
              let ok = true;
              for (let k = 0; k < c.bytes.length; k++) {
                if (p[i + k] !== c.bytes[k]) { ok = false; break; }
              }
              if (ok) { overlapped = true; break; }
            }
          }
          if (overlapped) break;
        }
        if (overlapped) continue;
        picked.push(c.bytes);
      }

      // ให้ greedy match เจออันยาวก่อน
      picked.sort((a, b) => b.length - a.length);
      return picked;
    }

    function inlineDictEncodeBytes(dictBytes, utf8Bytes) {
      const out = [];
      let i = 0;
      while (i < utf8Bytes.length) {
        let bestId = 0;
        let bestLen = 0;
        for (let id = 1; id <= dictBytes.length; id++) {
          const d = dictBytes[id - 1];
          const len = d.length;
          if (len < 3) continue;
          if (i + len > utf8Bytes.length) continue;
          let ok = true;
          for (let k = 0; k < len; k++) {
            if (utf8Bytes[i + k] !== d[k]) { ok = false; break; }
          }
          if (ok && len > bestLen) { bestLen = len; bestId = id; }
        }
        if (bestId) {
          out.push(0x00, bestId & 0xff);
          i += bestLen;
          continue;
        }
        const b = utf8Bytes[i];
        if (b === 0x00) out.push(0x00, 0x00);
        else out.push(b);
        i += 1;
      }
      return Uint8Array.from(out);
    }

    function inlineDictDecodeBytes(dictBytes, tokenBytes) {
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

    function buildInlineDictBlob(dictBytes, dataDeflateBytes) {
      // format:
      // [v=2][N][len][entryBytes...]... [deflateBytes...]
      const entriesBytes = dictBytes.slice(0, 48);
      const n = Math.min(48, entriesBytes.length);
      let headerLen = 2;
      for (let i = 0; i < n; i++) headerLen += 1 + Math.min(255, entriesBytes[i].length);
      const out = new Uint8Array(headerLen + dataDeflateBytes.length);
      out[0] = 2;
      out[1] = n & 0xff;
      let pos = 2;
      for (let i = 0; i < n; i++) {
        const b = entriesBytes[i];
        const len = Math.min(255, b.length);
        out[pos++] = len & 0xff;
        out.set(b.slice(0, len), pos);
        pos += len;
      }
      out.set(dataDeflateBytes, pos);
      return out;
    }

    function parseInlineDictBlob(blobBytes) {
      if (!blobBytes || blobBytes.length < 3) throw new Error("invalid_inline_dict");
      const v = blobBytes[0];
      if (v !== 1 && v !== 2) throw new Error("unknown_inline_dict_version");
      const n = blobBytes[1];
      let pos = 2;
      const entriesBytes = [];
      for (let i = 0; i < n; i++) {
        if (pos >= blobBytes.length) throw new Error("invalid_inline_dict");
        const len = blobBytes[pos++];
        if (pos + len > blobBytes.length) throw new Error("invalid_inline_dict");
        entriesBytes.push(blobBytes.slice(pos, pos + len));
        pos += len;
      }
      const deflateBytes = blobBytes.slice(pos);
      return { version: v, entriesBytes, deflateBytes };
    }

    // Explicitly attach decoding functions to window so module scripts (like portal.js) can access them reliably
    if (typeof window !== "undefined") {
      window.dictDecodeBytes = dictDecodeBytes;
      window.parseInlineDictBlob = parseInlineDictBlob;
      window.inlineDictDecodeBytes = inlineDictDecodeBytes;
    }