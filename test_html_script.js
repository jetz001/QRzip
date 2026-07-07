



    const inputText = document.getElementById("inputText");
    const modeSelect = document.getElementById("modeSelect");
    const qrEncodingSelect = document.getElementById("qrEncodingSelect");
    const autoObjectiveSelect = document.getElementById("autoObjectiveSelect");
    const densityThresholdInput = document.getElementById("densityThresholdInput");
    const runBtn = document.getElementById("runBtn");
    const clearBtn = document.getElementById("clearBtn");
    const autoSummary = document.getElementById("autoSummary");
    const topStats = document.getElementById("topStats");
    const resultList = document.getElementById("resultList");
    const decodedView = document.getElementById("decodedView");
    const generateQrBtn = document.getElementById("generateQrBtn");
    const downloadCompressedQrBtn = document.getElementById("downloadCompressedQrBtn");
    const downloadRawQrBtn = document.getElementById("downloadRawQrBtn");
    const generateMemberQrBtn = document.getElementById("generateMemberQrBtn");
    const qrStatus = document.getElementById("qrStatus");
    const rawQrMeta = document.getElementById("rawQrMeta");
    const compressedQrMeta = document.getElementById("compressedQrMeta");
    const rawQrBox = document.getElementById("rawQrBox");
    const compressedQrBox = document.getElementById("compressedQrBox");
    const memberQrMeta = document.getElementById("memberQrMeta");
    const memberQrBox = document.getElementById("memberQrBox");
    const refInput = document.getElementById("refInput");
    const resolveRefBtn = document.getElementById("resolveRefBtn");
    const refResultView = document.getElementById("refResultView");
    const qrPayloadView = document.getElementById("qrPayloadView");
    const qrDecodeFlowView = document.getElementById("qrDecodeFlowView");

    
    
    let lastBestResult = null;
    let lastResults = [];
    let lastSelectorInfo = null;

    

    

    

    

    

    const samples = {
      thai: `ระบบนี้ออกแบบมาเพื่อทดลองบีบอัดข้อความแบบ lossless โดยจะวิเคราะห์ลักษณะของข้อความก่อน เช่น ความถี่ของตัวอักษร คำที่ซ้ำ และรูปแบบช่วงข้อความที่ปรากฏซ้ำกัน จากนั้นจึงเลือกวิธีบีบอัดที่เหมาะสมที่สุดสำหรับข้อความนั้น ๆ`,
      english: `This demo analyzes plain text and tries multiple lossless compression methods before selecting the smallest serialized output. It is useful for presenting how adaptive compression can choose a different strategy depending on repetition, symbol distribution, and overall entropy.`,
      repeated: `ERROR ERROR ERROR ERROR ERROR | USER_LOGIN_OK USER_LOGIN_OK USER_LOGIN_OK | กรุงเทพ กรุงเทพ กรุงเทพ กรุงเทพ กรุงเทพ | 123123123123123123123123`,
      code: `function compress(text) {\n  const tokens = [];\n  const seen = new Map();\n  for (const ch of text) {\n    if (!seen.has(ch)) seen.set(ch, 0);\n    seen.set(ch, seen.get(ch) + 1);\n  }\n  return tokens;\n}\nfunction decode(tokens) {\n  return tokens.join("");\n}`
    };

    document.querySelectorAll("[data-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        inputText.value = samples[button.dataset.sample];
        runCompression();
      });
    });

    clearBtn.addEventListener("click", () => {
      inputText.value = "";
      modeSelect.value = "auto";
      qrEncodingSelect.value = "byte";
      autoObjectiveSelect.value = "bytes";
      densityThresholdInput.value = "0.82";
      autoSummary.textContent = "ยังไม่มีข้อมูล";
      topStats.innerHTML = "";
      resultList.innerHTML = "";
      decodedView.textContent = "ยังไม่มีข้อมูล";
      qrStatus.textContent = "ยังไม่ได้สร้าง QR";
      rawQrMeta.textContent = "ยังไม่มีข้อมูล";
      compressedQrMeta.textContent = "ยังไม่มีข้อมูล";
      rawQrBox.textContent = "ยังไม่มี QR";
      compressedQrBox.textContent = "ยังไม่มี QR";
      qrPayloadView.textContent = "ยังไม่มีข้อมูล";
      qrDecodeFlowView.textContent = "ยังไม่มีข้อมูล";
      lastBestResult = null;
      lastResults = [];
    });

    runBtn.addEventListener("click", runCompression);
    qrEncodingSelect.addEventListener("change", runCompression);
    autoObjectiveSelect.addEventListener("change", runCompression);
    densityThresholdInput.addEventListener("change", runCompression);
    generateQrBtn.addEventListener("click", generateQrCode);
    downloadCompressedQrBtn.addEventListener("click", () => downloadQrCode(compressedQrBox, "qrzip-compressed.png"));
    downloadRawQrBtn.addEventListener("click", () => downloadQrCode(rawQrBox, "qrzip-raw.png"));
    generateMemberQrBtn.addEventListener("click", generateMemberQrCode);
    resolveRefBtn.addEventListener("click", resolveMemberRef);

    

    function formatPercent(value) {
      return `${value.toFixed(2)}%`;
    }

    function formatBytes(value) {
      return `${value.toLocaleString()} bytes`;
    }

    function previewTextBlock(text, limit = 420) {
      const value = String(text ?? "");
      if (value.length <= limit) return value;
      return `${value.slice(0, limit)}\n... truncated ...`;
    }

    function summarizeEnginePayload(result) {
      if (!result?.payload) return "ยังไม่มีข้อมูล";
      if (result.method === "deflate") {
        return JSON.stringify({
          data: previewTextBlock(result.payload.data || "", 220),
          originalBytes: result.payload.originalBytes ?? result.originalBytes
        }, null, 2);
      }
      if (result.method === "deflate_dict") {
        return JSON.stringify({
          profile: result.payload.profile,
          profileName: result.payload.profileName,
          data: previewTextBlock(result.payload.data || "", 220),
          originalBytes: result.payload.originalBytes ?? result.originalBytes,
          tokenBytes: result.payload.tokenBytes
        }, null, 2);
      }
      if (result.method === "deflate_inline") {
        return JSON.stringify({
          entryCount: result.payload.entryCount,
          dictBytes: result.payload.dictBytes,
          tokenBytes: result.payload.tokenBytes,
          blob: previewTextBlock(result.payload.blob || "", 180),
          originalBytes: result.payload.originalBytes ?? result.originalBytes
        }, null, 2);
      }
      if (result.method === "lz_compact") {
        return JSON.stringify({
          data: previewTextBlock(result.payload.data || "", 220)
        }, null, 2);
      }
      if (result.method?.startsWith("fixed_")) {
        return JSON.stringify({
          profile: result.payload.profile,
          bitLength: result.payload.bitLength,
          data: previewTextBlock(result.payload.data || "", 220)
        }, null, 2);
      }
      if (result.method === "arithmetic") {
        return JSON.stringify({
          profile: "arithmetic",
          symCount: result.payload.symCount,
          tableEntries: (result.payload.table || []).length,
          bitLength: result.payload.bitLength,
          data: previewTextBlock(result.payload.data || "", 220)
        }, null, 2);
      }
      if (result.method === "raw") {
        return previewTextBlock(result.payload.text || "", 280);
      }
      return previewTextBlock(result.serialized || "", 420);
    }

    function buildPayloadExplanationBlock(title, lines) {
      return [title, ...lines, ""].join("\n");
    }

    

    

    

    

    

    

    

    // Base45 (เพื่อให้ payload เข้ากลุ่ม QR Alphanumeric mode ได้)
    // Charset ตรงตามมาตรฐาน Base45: 0-9A-Z space $%*+-./:
    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    // Dict profiles: static dictionary (implicit preset)
    // เป้าหมาย: ย่อ "data bytes" ให้สั้นลงจริง โดยไม่ต้องส่ง dict ไปกับ QR (decoder รู้ชุดเดียวกัน)
    

    

    

    

    

    

    

    // InlineDict (BPE) - สร้าง dict จาก "bytes" ของข้อความนี้ (byte-level BPE)
    // เป้าหมาย: ช่วยเคสข้อความยาว/ไทย-อังกฤษผสม ที่มี pattern ซ้ำระดับ bigram สูง
    

    

    

    

    

    

    

    

    // ─────────────────────────────────────────────────────────────
    // Arithmetic Coding (adaptive order-0 on Unicode codepoints)
    // ─────────────────────────────────────────────────────────────
    // ออกแบบให้: encode fractional bits ต่อ symbol → เข้าใกล้ entropy limit มากกว่า Huffman
    // Format: { method:'arithmetic', data:'<base64>', symCount:N, table:[[cp,cnt],...] }
    // QR payload text mode: QZ1|A|<symCount>|<base64url(table_deflate)>|<base64url(bitstream)>
    // QR payload byte mode: QZ1A + uint16(symCount) + uint16(tableLen) + tableDeflate + bitstream

    

    

    

    

    

    

    function runCompression() {
      const text = inputText.value;
      const mode = modeSelect.value;
      if (!text.length) {
        autoSummary.textContent = "กรุณาป้อนข้อความก่อน";
        topStats.innerHTML = "";
        resultList.innerHTML = "";
        decodedView.textContent = "ยังไม่มีข้อมูล";
        return;
      }

      const objective = autoObjectiveSelect?.value || "scan";
      if (densityThresholdInput) {
        densityThresholdInput.disabled = objective !== "density";
        densityThresholdInput.style.opacity = objective === "density" ? "1" : "0.55";
      }

      const stats = analyzeText(text);
      const selectorInfo = mode === "auto"
        ? selectAutoCandidates(stats, text)
        : { mode: "manual", candidates: [mode], reasons: [`เลือก <code>${compressors[mode]?.label || mode}</code> แบบ manual`] };
      const methods = selectorInfo.candidates;
      const results = methods
        .map((method) => evaluateMethod(method, text))
        .filter(Boolean);
      if (!results.length) {
        autoSummary.textContent = "ข้อความนี้ไม่รองรับกับโปรไฟล์ที่เลือก";
        topStats.innerHTML = "";
        resultList.innerHTML = "";
        decodedView.textContent = "ยังไม่มีข้อมูล";
        qrStatus.textContent = "ยังไม่มีผลบีบอัดให้สร้าง QR";
        return;
      }
      const densityThreshold = parseDensityThreshold(densityThresholdInput?.value);
      const rankedInfo = rankResults(results, objective, densityThreshold);
      const rankedResults = rankedInfo.ranked;

      lastResults = rankedResults;
      lastSelectorInfo = selectorInfo;
      const best = rankedResults[0];
      lastBestResult = best;
      window.__qrzip_lastBest = best;
      window.__qrzip_lastResults = rankedResults;
      renderTopStats(stats, best);
      renderSummary(stats, best, mode, rankedResults, selectorInfo, rankedInfo);
      renderResults(rankedResults, best.method);
      decodedView.textContent = best.decoded;
      qrStatus.textContent = "พร้อมสร้าง QR เปรียบเทียบระหว่างข้อความตรง ๆ และผลบีบอัด";
      rawQrMeta.textContent = "กดปุ่มสร้าง QR เทียบกัน";
      compressedQrMeta.textContent = "กดปุ่มสร้าง QR เทียบกัน";
      rawQrBox.textContent = "ยังไม่มี QR";
      compressedQrBox.textContent = "ยังไม่มี QR";
      qrPayloadView.textContent = "กดปุ่มสร้าง QR เทียบกันเพื่อดู payload";
      qrDecodeFlowView.textContent = "กดปุ่มสร้าง QR เทียบกันเพื่อดูว่า decoder ควรรับข้อมูลตัวไหน";
      memberQrMeta.textContent = "กดปุ่มสร้าง QR สมาชิก (สั้นสุด)";
      memberQrBox.textContent = "ยังไม่มี QR";
      refResultView.textContent = "ยังไม่มีข้อมูล";
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

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    // ─── Arithmetic QR payload builders ───
    

    

    

    function getComparisonCompressedResult() {
      const nonRawResults = lastResults.filter((result) => result.method !== "raw");
      if (nonRawResults.length) {
        return [...nonRawResults].sort((a, b) => a.finalPayloadBytes - b.finalPayloadBytes)[0];
      }
      return lastBestResult;
    }

    // (buildRawQrPayload moved above as compact format)

    function renderQrTextInto(container, payload, size = 220) {
      container.innerHTML = "";
      new QRCode(container, {
        text: payload,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    function renderQrByteInto(container, binaryPayload, size = 220) {
      // ใช้ qrcode-generator (arase) เพื่อบังคับ Byte mode จริง (รับ string ที่เป็น bytes 0..255)
      // หมายเหตุ: ถ้า scanner อ่านกลับมาเป็น text ธรรมดา อาจเพี้ยนได้ในโลกจริง
      // แต่ใน Lab นี้ใช้เพื่อพิสูจน์ว่า "byte-mode ลด overhead" และคำนวณ payload bytes ได้ตรงกับ QR จริง
      if (typeof qrcode === "undefined") {
        throw new Error("qrcode_generator_not_loaded");
      }
      const ecc = "M";
      const qr = qrcode(0, ecc);
      // qrcode-generator expects binary string in Byte mode.
      // Ensure each char code is 0..255.
      qr.addData(binaryPayload, "Byte");
      qr.make();
      const count = qr.getModuleCount();
      const margin = 4; // modules
      // ทำให้ "ขนาดกรอบภาพเท่ากัน" เสมอ เพื่อเทียบง่าย
      // วาด 1px ต่อ 1 module แล้วให้ CSS scale ไปเป็น size x size (คม + ไม่มีขอบขาวใหญ่ๆ ต่างกันตาม version)
      const canvasModules = count + margin * 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasModules;
      canvas.height = canvasModules;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.style.imageRendering = "pixelated";
      canvas.style.display = "block";
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
      container.innerHTML = "";
      container.appendChild(canvas);
    }

    function renderQrInto(container, payload) {
      const encodingMode = qrEncodingSelect?.value || "byte";
      if (encodingMode === "byte") {
        return renderQrByteInto(container, payload, 220);
      }
      if (encodingMode === "text45") {
        // ใช้ qrcode-generator เพื่อบังคับ Alphanumeric mode จริง
        if (typeof qrcode === "undefined") throw new Error("qrcode_generator_not_loaded");
        const ecc = "M";
        const qr = qrcode(0, ecc);
        qr.addData(payload, "Alphanumeric");
        qr.make();
        const count = qr.getModuleCount();
        const margin = 4;
        const canvasModules = count + margin * 2;
        const canvas = document.createElement("canvas");
        canvas.width = canvasModules;
        canvas.height = canvasModules;
        canvas.style.width = "220px";
        canvas.style.height = "220px";
        canvas.style.imageRendering = "pixelated";
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasModules, canvasModules);
        ctx.fillStyle = "#000000";
        for (let row = 0; row < count; row++) {
          for (let col = 0; col < count; col++) {
            if (qr.isDark(row, col)) ctx.fillRect(col + margin, row + margin, 1, 1);
          }
        }
        container.innerHTML = "";
        container.appendChild(canvas);
        return;
      }
      return renderQrTextInto(container, payload, 220);
    }

    function simpleHash(text) {
      let hash = 2166136261;
      for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(36).slice(0, 6);
    }

    function buildChunkPayloads(payload, chunkSize = 700) {
      const chunkId = simpleHash(payload);
      const total = Math.ceil(payload.length / chunkSize);
      const chunks = [];
      for (let index = 0; index < total; index++) {
        const part = payload.slice(index * chunkSize, (index + 1) * chunkSize);
        chunks.push(`QZM|${chunkId}|${index + 1}/${total}|${part}`);
      }
      return chunks;
    }

    function renderQrChunks(container, payload, chunkSize = 700) {
      const chunks = buildChunkPayloads(payload, chunkSize);
      container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "qr-multi";
      const encodingMode = qrEncodingSelect?.value || "byte";

      chunks.forEach((chunkPayload, index) => {
        const chunk = document.createElement("div");
        chunk.className = "qr-chunk";
        const label = document.createElement("div");
        label.textContent = `chunk ${index + 1}/${chunks.length}`;
        const qrHolder = document.createElement("div");
        chunk.appendChild(label);
        chunk.appendChild(qrHolder);
        wrapper.appendChild(chunk);
        if (encodingMode === "byte") {
          renderQrByteInto(qrHolder, chunkPayload, 160);
        } else if (encodingMode === "text45") {
          // alphanumeric mode (base45 payload)
          if (typeof qrcode === "undefined") throw new Error("qrcode_generator_not_loaded");
          const ecc = "M";
          const qr = qrcode(0, ecc);
          qr.addData(chunkPayload, "Alphanumeric");
          qr.make();
          const count = qr.getModuleCount();
          const margin = 4;
          const canvasModules = count + margin * 2;
          const canvas = document.createElement("canvas");
          canvas.width = canvasModules;
          canvas.height = canvasModules;
          canvas.style.width = "160px";
          canvas.style.height = "160px";
          canvas.style.imageRendering = "pixelated";
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasModules, canvasModules);
          ctx.fillStyle = "#000000";
          for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
              if (qr.isDark(row, col)) ctx.fillRect(col + margin, row + margin, 1, 1);
            }
          }
          qrHolder.innerHTML = "";
          qrHolder.appendChild(canvas);
        } else {
          renderQrTextInto(qrHolder, chunkPayload, 160);
        }
      });

      container.appendChild(wrapper);
      return chunks;
    }

    function tryRenderQr(container, payload) {
      container.innerHTML = "";
      try {
        renderQrInto(container, payload);
        return { ok: true, mode: "single", chunkCount: 1 };
      } catch (error) {
        try {
          const chunks = renderQrChunks(container, payload);
          return { ok: true, mode: "chunked", chunkCount: chunks.length, chunks };
        } catch (chunkError) {
          container.textContent = "ข้อมูลยาวเกินความจุ QR";
          return { ok: false, message: chunkError.message || error.message };
        }
      }
    }

    function generateQrCode() {
      if (!lastBestResult) {
        qrStatus.textContent = "ยังไม่มีผลบีบอัดให้สร้าง QR";
        rawQrBox.textContent = "ยังไม่มี QR";
        compressedQrBox.textContent = "ยังไม่มี QR";
        qrPayloadView.textContent = "ยังไม่มีข้อมูล";
        qrDecodeFlowView.textContent = "ยังไม่มีข้อมูล";
        return;
      }

      if (typeof QRCode === "undefined") {
        qrStatus.textContent = "โหลดไลบรารี QR ไม่สำเร็จ";
        rawQrBox.textContent = "สร้าง QR ไม่ได้";
        compressedQrBox.textContent = "สร้าง QR ไม่ได้";
        qrDecodeFlowView.textContent = "โหลดไลบรารี QR ไม่สำเร็จ";
        return;
      }

      const comparisonResult = getComparisonCompressedResult();
      const encodingMode = qrEncodingSelect?.value || "byte";
      const rawCarrier = buildQrCarrierForRaw(inputText.value, encodingMode);
      const compressedPayloadText = comparisonResult.finalPayload || buildCompressedQrPayload(comparisonResult);
      const compressedQrText = comparisonResult.finalQrText || compressedPayloadText;
      const rawPayload = rawCarrier.qrText;
      const compressedPayload = compressedQrText;
      const rawBytes = rawCarrier.bytesLen;
      const compressedBytes = comparisonResult.finalPayloadBytes || utf8Bytes(compressedPayload);
      const savedBytes = rawBytes - compressedBytes;

      const rawRender = tryRenderQr(rawQrBox, rawPayload);
      const compressedRender = tryRenderQr(compressedQrBox, compressedPayload);

      rawQrMeta.textContent = rawRender.ok
        ? `payload ${rawBytes.toLocaleString()} bytes | raw${encodingMode === "byte" ? " | byte-mode" : ""}${rawRender.mode === "chunked" ? ` | ${rawRender.chunkCount} QR` : ""}`
        : `payload ${rawBytes.toLocaleString()} bytes | เกินความจุ QR`;
      compressedQrMeta.textContent = compressedRender.ok
        ? `payload ${compressedBytes.toLocaleString()} bytes | ${comparisonResult.label}${encodingMode === "byte" ? " | byte-mode" : ""}${compressedRender.mode === "chunked" ? ` | ${compressedRender.chunkCount} QR` : ""}`
        : `payload ${compressedBytes.toLocaleString()} bytes | เกินความจุ QR`;
      if (encodingMode === "byte") {
        const rawBytesB64Url = bytesToBase64Url(binaryStringToBytes(rawPayload));
        const compressedBytesB64Url = bytesToBase64Url(binaryStringToBytes(compressedPayload));
        qrPayloadView.textContent = [
          "[สรุปชั้นข้อมูล / byte-mode]",
          "",
          "[engine payload / raw]",
          previewTextBlock(inputText.value, 240),
          "",
          "[final QR payload / raw / แบบที่คนอ่านง่าย]",
          rawCarrier.displayText,
          "",
          `[decoder input / raw / bytes ที่ถูกใส่ใน QR จริง (${rawBytes.toLocaleString()} bytes)]`,
          rawBytesB64Url,
          "",
          `[engine payload / compressed / ${comparisonResult.label}]`,
          summarizeEnginePayload(comparisonResult),
          "",
          "[final QR payload / compressed / แบบที่ระบบห่อก่อนเข้า QR]",
          compressedPayloadText,
          "",
          `[decoder input / compressed / bytes ที่ถูกใส่ใน QR จริง (${compressedBytes.toLocaleString()} bytes)]`,
          compressedBytesB64Url
        ].join("\n");
        qrDecodeFlowView.textContent = [
          "[decoder flow / byte-mode]",
          "1) scanner อ่าน QR ออกมาเป็นสตริงไบต์",
          "2) decoder แปลงสตริงไบต์กลับเป็น bytes",
          "3) อ่าน header เช่น QZ1D / QZ1L / QZ1F / QZ1T",
          "4) ถ้าเป็น QZ1D ให้เอา bytes หลัง header ไป inflateRaw()",
          "5) ได้ข้อความต้นฉบับกลับมา",
          "",
          `[หมายเหตุ] สิ่งที่ decoder ต้องรับจริงคือ decoder input ด้านบน ไม่ใช่ engine payload JSON`
        ].join("\n");
      } else {
        qrPayloadView.textContent = [
          "[สรุปชั้นข้อมูล / text-mode]",
          "",
          "[engine payload / raw]",
          previewTextBlock(inputText.value, 240),
          "",
          "[final QR payload / raw / ตัวนี้ถูกใส่ใน QR ตรง ๆ]",
          rawPayload,
          "",
          `[engine payload / compressed / ${comparisonResult.label}]`,
          summarizeEnginePayload(comparisonResult),
          "",
          "[final QR payload / compressed / decoder รับตัวนี้ตรง ๆ]",
          compressedPayload
        ].join("\n");
        qrDecodeFlowView.textContent = [
          "[decoder flow / text-mode]",
          "1) scanner อ่าน QR ออกมาเป็นข้อความ เช่น QZ1|D|...",
          "2) decoder ดู prefix ว่าเป็น QZ1|T| / QZ1|B| / QZ1|D| / QZ1|L| / QZ1|F|",
          "3) ถ้าเป็น QZ1|D| ให้เอาส่วนหลัง prefix ไป base64url decode",
          "4) จากนั้น inflateRaw() เพื่อคืนข้อความต้นฉบับ",
          "",
          "[หมายเหตุ] decoder ไม่ควรรับ object ภายในอย่าง { data, originalBytes } โดยตรง"
        ].join("\n");
      }
      const compareText = savedBytes >= 0
        ? `แบบบีบอัดเล็กกว่า ${savedBytes.toLocaleString()} bytes`
        : `แบบบีบอัดใหญ่กว่า ${Math.abs(savedBytes).toLocaleString()} bytes`;
      if (rawRender.ok && compressedRender.ok) {
        const chunkNote = rawRender.mode === "chunked" || compressedRender.mode === "chunked"
          ? ` | raw ${rawRender.chunkCount} QR, compressed ${compressedRender.chunkCount} QR`
          : "";
        qrStatus.textContent = `สร้าง QR เปรียบเทียบแล้ว | ${compareText}${chunkNote}`;
      } else if (!rawRender.ok && compressedRender.ok) {
        qrStatus.textContent = `QR แบบไม่ย่อเกินความจุ แต่แบบบีบอัดยังสร้างได้ | ${compareText}`;
      } else if (rawRender.ok && !compressedRender.ok) {
        qrStatus.textContent = `QR แบบบีบอัดเกินความจุ แต่แบบไม่ย่อยังสร้างได้ | ${compareText}`;
      } else {
        qrStatus.textContent = "ทั้งสองแบบเกินความจุ QR สำหรับข้อความนี้";
      }
    }

    async function storeToBackend(text, payload) {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, payload })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "store_failed");
      return data.id;
    }

    async function generateMemberQrCode() {
      if (!lastBestResult) {
        memberQrMeta.textContent = "ยังไม่มีผลวิเคราะห์";
        memberQrBox.textContent = "ยังไม่มี QR";
        return;
      }

      memberQrMeta.textContent = "กำลังบันทึกข้อมูลไปหลังบ้าน...";
      refResultView.textContent = "ยังไม่มีข้อมูล";

      try {
        const bestPayload = lastBestResult.finalPayload || "";
        const id = await storeToBackend(inputText.value, bestPayload);
        const ref = `QZR|${id}`;
        const bytes = utf8Bytes(ref);
        const render = tryRenderQr(memberQrBox, ref);
        memberQrMeta.textContent = `payload ${bytes.toLocaleString()} bytes | ref ${id}${render.mode === "chunked" ? ` | ${render.chunkCount} QR` : ""}`;
        refInput.value = ref;
        qrStatus.textContent = `สร้าง QR สมาชิกแล้ว | ref สั้นมาก (${bytes.toLocaleString()} bytes)`;
      } catch (error) {
        memberQrMeta.textContent = "สร้าง QR สมาชิกไม่ได้ (ต้องรัน qrzip_server.py)";
        memberQrBox.textContent = "ยังไม่มี QR";
      }
    }

    function parseRefId(input) {
      const value = (input || "").trim();
      if (!value) return "";
      if (value.startsWith("QZR|")) return value.slice(4).trim();
      return value;
    }

    async function resolveMemberRef() {
      const rid = parseRefId(refInput.value);
      if (!rid) {
        refResultView.textContent = "กรุณาวาง QZR|<id> หรือ <id>";
        return;
      }
      refResultView.textContent = "กำลังดึงข้อมูล...";
      try {
        const response = await fetch(`/api/get/${encodeURIComponent(rid)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "get_failed");
        refResultView.textContent = data.text || "";
      } catch (error) {
        refResultView.textContent = "ดึงข้อมูลไม่ได้ (ต้องรัน qrzip_server.py และใช้ลิงก์ผ่านเซิร์ฟเวอร์)";
      }
    }

    function downloadQrCode(container, filename) {
      const canvas = container.querySelector("canvas");
      const image = container.querySelector("img");

      if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = filename;
        link.click();
        return;
      }

      if (image?.src) {
        const link = document.createElement("a");
        link.href = image.src;
        link.download = filename;
        link.click();
        return;
      }

      qrStatus.textContent = "ยังไม่มี QR ให้ดาวน์โหลด";
    }

    inputText.value = samples.repeated;
    runCompression();
  
    // ─── TAB SWITCHING LOGIC ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });

    window.__charts = window.__charts || {};

    function renderCharts(results) {
      const validResults = results.filter(r => r && r.ok);
      const labels = validResults.map(r => r.label);
      const colors = validResults.map(r => r.method === window.__qrzip_lastBest.method ? '#22c55e' : '#38bdf8');
      
      const destroyChart = (id) => {
        if (window.__charts[id]) {
          window.__charts[id].destroy();
        }
      };

      const createChart = (id, label, data, yTitle, reverse=false) => {
        destroyChart(id);
        const ctx = document.getElementById(id).getContext('2d');
        window.__charts[id] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: label,
              data: data,
              backgroundColor: colors,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { 
                beginAtZero: true, 
                title: { display: true, text: yTitle, color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
              },
              x: {
                ticks: { color: '#e5e7eb' },
                grid: { display: false }
              }
            }
          }
        });
      };

      createChart('chartBytes', 'Payload (bytes)', validResults.map(r => r.finalPayloadBytes), 'Bytes');
      createChart('chartScan', 'Scanability Score', validResults.map(r => r.scanability.score), 'Score');
      createChart('chartRatio', 'Compression Ratio (%)', validResults.map(r => r.ratio), '%');
    }

    function renderAnalysisTable(results, stats) {
      const tbody = document.getElementById('analysisTableBody');
      tbody.innerHTML = '';
      results.forEach((r, idx) => {
        const isBest = r.method === window.__qrzip_lastBest.method;
        const tr = document.createElement('tr');
        if (isBest) tr.className = 'winner';
        
        let rankBadge = '';
        if (idx === 0) rankBadge = '<span class="rank-badge gold">1</span>';
        else if (idx === 1) rankBadge = '<span class="rank-badge silver">2</span>';
        else if (idx === 2) rankBadge = '<span class="rank-badge bronze">3</span>';
        else rankBadge = `<span class="rank-badge">${idx+1}</span>`;

        const maxBytes = Math.max(...results.map(x => x.finalPayloadBytes));
        const barWidth = Math.max(5, (r.finalPayloadBytes / maxBytes) * 100);
        let barColor = 'good';
        if (barWidth > 80) barColor = 'bad';
        else if (barWidth > 50) barColor = 'warn';

        const barHtml = `<div class="bar-inline">
          <div style="width:50px">${r.finalPayloadBytes}</div>
          <div class="bar-bg"><div class="bar-fill ${barColor}" style="width:${barWidth}%"></div></div>
        </div>`;

        const deltaBytes = r.savedBytes >= 0 ? `<span style="color:var(--good)">-${r.savedBytes}</span>` : `<span style="color:var(--bad)">+${Math.abs(r.savedBytes)}</span>`;
        const deltaTokens = r.savedTokens >= 0 ? `<span style="color:var(--good)">-${r.savedTokens}</span>` : `<span style="color:var(--bad)">+${Math.abs(r.savedTokens)}</span>`;
        const statBadge = r.ok ? '<span class="badge good">OK</span>' : '<span class="badge bad">Err</span>';

        tr.innerHTML = `
          <td>${rankBadge}</td>
          <td style="font-weight:${isBest?'bold':'normal'}">${r.label}</td>
          <td>${barHtml}</td>
          <td>${deltaBytes}</td>
          <td>${r.ratio.toFixed(2)}%</td>
          <td>${r.scanability.score}</td>
          <td>${r.scanability.version ? 'v'+r.scanability.version : '>40'}</td>
          <td>${r.scanability.capacity ? Math.round(r.scanability.utilization*100)+'%' : '-'}</td>
          <td>${deltaTokens}</td>
          <td>${statBadge}</td>
        `;
        tbody.appendChild(tr);
      });

      const textStats = [
        ["จำนวนตัวอักษร", stats.chars.toLocaleString()],
        ["ขนาด UTF-8 เดิม", formatBytes(stats.utf8Bytes)],
        ["โทเคนเดิม", stats.estimatedTokens.toLocaleString()],
        ["ตัวอักษรไม่ซ้ำ", stats.uniqueChars.toLocaleString()],
        ["ASCII ratio", formatPercent(stats.asciiRatio * 100)],
        ["Thai ratio", formatPercent(stats.thaiRatio * 100)],
        ["Entropy", stats.entropy.toFixed(3)],
        ["คำที่ซ้ำ", formatPercent(stats.repeatedWordRatio * 100)],
        ["bigram ซ้ำ", formatPercent(stats.repeatedBigramRatio * 100)],
        ["run ยาวสุด", stats.longestRun.toLocaleString()]
      ];
      
      const grid = document.getElementById('textStatsGrid');
      grid.innerHTML = '';
      textStats.forEach(([label, value]) => {
        grid.innerHTML += `<div class="stat-card">
          <div class="label">${label}</div>
          <div class="value">${value}</div>
        </div>`;
      });
    }

    const originalRenderResults = renderResults;
    const originalRenderTopStats = renderTopStats;
    const originalRenderSummary = renderSummary;

    // Override the render flow to update tabs and states
    renderResults = function(results, bestMethod) {
      originalRenderResults(results, bestMethod);
      if(window.__qrzip_lastBest && window.__qrzip_lastResults) {
        renderAnalysisTable(window.__qrzip_lastResults, analyzeText(inputText.value));
        renderCharts(window.__qrzip_lastResults);
      }
      
      document.getElementById('bestTitle').innerText = window.__qrzip_lastBest.label;
      const bBadge = document.getElementById('bestBadge');
      if(window.__qrzip_lastBest.savedBytes < 0) {
        bBadge.className = 'badge warn';
        bBadge.innerText = 'ใหญ่ขึ้นแต่ถูกต้อง';
      } else {
        bBadge.className = 'badge good';
        bBadge.innerText = 'Lossless OK';
      }
      document.getElementById('bestQrBadge').innerText = `QR Version: ${window.__qrzip_lastBest.scanability.version ? 'v'+window.__qrzip_lastBest.scanability.version : '>v40'}`;
      
      // Hide empty states
      document.getElementById('bestEmptyState').style.display = 'none';
      document.getElementById('bestResultContent').style.display = 'block';
      
      document.getElementById('analysisEmptyState').style.display = 'none';
      document.getElementById('analysisContent').style.display = 'block';
      
      document.getElementById('chartEmptyState').style.display = 'none';
      document.getElementById('chartContent').style.display = 'block';
      
      // Auto-switch to best tab
      document.querySelector('.tab-btn[data-tab="best"]').click();
    };
    
    // intercept clearBtn to reset states
    const oldClear = clearBtn.onclick || function(){};
    clearBtn.addEventListener('click', () => {
      document.getElementById('bestEmptyState').style.display = 'block';
      document.getElementById('bestResultContent').style.display = 'none';
      document.getElementById('analysisEmptyState').style.display = 'block';
      document.getElementById('analysisContent').style.display = 'none';
      document.getElementById('chartEmptyState').style.display = 'block';
      document.getElementById('chartContent').style.display = 'none';
      
      document.getElementById('bestTitle').innerText = '—';
      document.getElementById('bestQrBadge').innerText = '—';
    });



