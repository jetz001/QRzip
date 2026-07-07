const fs = require('fs');

let html = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');

// 1. Add qrzip_engine.js
const targetStr = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';
const replacementStr = targetStr + '\n  <script src="qrzip_engine.js"></script>';
html = html.replace(targetStr, replacementStr);

// 2. Set default to scanability-first
html = html.replace('<option value="scan">สแกนง่ายสุด', '<option value="scan" selected>สแกนง่ายสุด');
html = html.replace('const objective = autoObjectiveSelect?.value || "bytes";', 'const objective = autoObjectiveSelect?.value || "scan";');

fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', html);
console.log('Final fix applied successfully!');
