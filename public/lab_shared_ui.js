function injectSharedUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.insertAdjacentHTML('beforeend', `
    <!-- Input Panel -->
    <div class="input-panel">
      <h2>📝 ป้อนข้อความ</h2>
      <textarea id="inputText" placeholder="วางข้อความที่ต้องการบีบอัด เช่น log, paragraph, รายงาน, โค้ด หรือข้อความซ้ำๆ..."></textarea>
      <div class="controls">
        <select id="modeSelect">
          <option value="auto">Auto Select</option>
          <option value="raw">Raw</option>
          <option value="rle">RLE</option>
          <option value="huffman">Huffman</option>
          <option value="fixed_num">Fixed NUM</option>
          <option value="fixed_en">Fixed EN</option>
          <option value="fixed_mixed">Fixed MIX</option>
          <option value="deflate">Deflate Raw</option>
          <option value="deflate_dict">Deflate + Dict (Auto)</option>
          <option value="deflate_inline">Deflate + InlineDict (BPE)</option>
          <option value="lz_compact">LZ Compact</option>
          <option value="lz78">LZ78</option>
          <option value="arithmetic">Arithmetic Coding ✨</option>
        </select>
        <select id="qrEncodingSelect" title="โหมดการเข้ารหัสข้อมูลลง QR">
          <option value="byte">QR Byte mode (ลด overhead)</option>
          <option value="text">QR Text mode (คัดลอกได้)</option>
          <option value="text45">QR Text alnum (Base45)</option>
        </select>
        <select id="autoObjectiveSelect" title="เกณฑ์เลือกผลลัพธ์ (โหมด Auto)">
          <option value="bytes">สั้นสุด (bytes-first)</option>
          <option value="scan" selected>สแกนง่ายสุด (scanability-first)</option>
          <option value="density">คุมความหนาแน่น (threshold)</option>
        </select>
        <input id="densityThresholdInput" type="number" min="0.6" max="0.95" step="0.01" value="0.82" title="threshold ความหนาแน่น" />
        <button class="primary" id="runBtn">⚡ วิเคราะห์และบีบอัด</button>
        <button id="clearBtn">ล้าง</button>
        <div id="customControlsSlot"></div>
      </div>
      <div class="sample-buttons">
        <button data-sample="thai">ตัวอย่างข้อความไทย</button>
        <button data-sample="english">ตัวอย่างข้อความอังกฤษ</button>
        <button data-sample="repeated">ตัวอย่างซ้ำเยอะ</button>
        <button data-sample="code">ตัวอย่างโค้ด</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrap">
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="best">
          <span class="tab-icon">🏆</span> ผลดีสุด
        </button>
        <button class="tab-btn" data-tab="analysis">
          <span class="tab-icon">📊</span> วิเคราะห์ตาราง
        </button>
        <button class="tab-btn" data-tab="chart">
          <span class="tab-icon">📈</span> กราฟเปรียบเทียบ
        </button>
        <button class="tab-btn" data-tab="qr">
          <span class="tab-icon">📷</span> QR Code
        </button>
      </div>

      <!-- TAB 1: Best Result -->
      <div class="tab-content active" id="tab-best">
        <div id="bestEmptyState" class="empty-state">
          <div class="icon">🗜️</div>
          <p>กด <strong>วิเคราะห์และบีบอัด</strong> เพื่อดูผลลัพธ์</p>
        </div>
        <div id="bestResultContent" style="display:none">
          <div class="best-header">
            <div class="best-title" id="bestTitle">—</div>
            <span class="badge good" id="bestBadge">Lossless OK</span>
            <span class="badge info" id="bestQrBadge">—</span>
          </div>
          <div id="autoSummary" class="summary"></div>
          <div class="stats-grid" id="topStats"></div>
          <div style="margin-top:20px">
            <div class="small" style="margin-bottom:8px;color:var(--text);font-weight:600;">ข้อความที่คลายกลับ (lossless check)</div>
            <pre id="decodedView">ยังไม่มีข้อมูล</pre>
          </div>
        </div>
      </div>

      <!-- TAB 2: Analysis Table -->
      <div class="tab-content" id="tab-analysis">
        <div id="analysisEmptyState" class="empty-state">
          <div class="icon">📊</div>
          <p>ยังไม่มีข้อมูล — กดวิเคราะห์ก่อนครับ</p>
        </div>
        <div id="analysisContent" style="display:none">
          <div class="table-wrap">
            <table id="analysisTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Algorithm</th>
                  <th>Payload (bytes)</th>
                  <th>ลดได้</th>
                  <th>Ratio</th>
                  <th>Scanability</th>
                  <th>QR ver</th>
                  <th>แน่น%</th>
                  <th>Token ลด</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody id="analysisTableBody"></tbody>
            </table>
          </div>
          <div style="margin-top:20px">
            <div class="small" style="margin-bottom:8px;color:var(--text);font-weight:600;">สถิติข้อความ</div>
            <div class="stats-grid" id="textStatsGrid"></div>
          </div>
          <div style="margin-top:20px">
             <div class="small" style="margin-bottom:8px;color:var(--text);font-weight:600;">รายละเอียดแต่ละอัลกอริทึม</div>
             <div id="resultList" class="result-list"></div>
          </div>
        </div>
      </div>

      <!-- TAB 3: Chart -->
      <div class="tab-content" id="tab-chart">
        <div id="chartEmptyState" class="empty-state">
          <div class="icon">📈</div>
          <p>ยังไม่มีข้อมูล — กดวิเคราะห์ก่อนครับ</p>
        </div>
        <div id="chartContent" style="display:none">
          <div class="chart-section">
            <h3>📦 ขนาด Payload สำหรับ QR (bytes) — ยิ่งน้อยยิ่งดี</h3>
            <div class="chart-container">
              <canvas id="chartBytes"></canvas>
            </div>
          </div>
          <div class="chart-section">
            <h3>👁️ Scanability Score — ยิ่งมากยิ่งดี (สแกนง่าย)</h3>
            <div class="chart-container">
              <canvas id="chartScan"></canvas>
            </div>
          </div>
          <div class="chart-section">
            <h3>🗜️ Compression Ratio (% ของเดิม) — ยิ่งน้อยยิ่งดี</h3>
            <div class="chart-container">
              <canvas id="chartRatio"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: QR Code -->
      <div class="tab-content" id="tab-qr">
        <div class="qr-actions" id="qrActionsSlot">
          <button class="primary" id="generateQrBtn">📷 สร้าง QR เทียบกัน</button>
          <button id="downloadCompressedQrBtn">⬇ ดาวน์โหลดแบบบีบอัด</button>
          <button id="downloadRawQrBtn">⬇ ดาวน์โหลดแบบไม่ย่อ</button>
        </div>
        <div id="qrStatus" class="small" style="margin-bottom:14px">ยังไม่ได้สร้าง QR</div>
        <div class="qr-compare" id="qrCompareSlot">
          <div class="qr-card" id="rawQrCard">
            <h3>QR แบบไม่ย่อ</h3>
            <div id="rawQrMeta" class="small">ยังไม่มีข้อมูล</div>
            <div id="rawQrBox" class="qr-box">ยังไม่มี QR</div>
          </div>
          <div class="qr-card" id="compressedQrCard">
            <h3>QR แบบบีบอัด</h3>
            <div id="compressedQrMeta" class="small">ยังไม่มีข้อมูล</div>
            <div id="compressedQrBox" class="qr-box">ยังไม่มี QR</div>
          </div>
        </div>
        <div id="qrExtraSlot"></div>
        <div class="payload-meta">
          <div class="small" style="color:var(--text);font-weight:600;margin-top:8px">Payload Detail</div>
          <pre id="qrPayloadView">ยังไม่มีข้อมูล</pre>
          <pre id="qrDecodeFlowView">ยังไม่มีข้อมูล</pre>
        </div>
      </div>
    </div><!-- end tabs-wrap -->
  `);
}
