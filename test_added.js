

// Added missing functions
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