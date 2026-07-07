const fs = require('fs');
let html = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');

// Change selected option in HTML
html = html.replace('<option value="scan">สแกนง่ายสุด', '<option value="scan" selected>สแกนง่ายสุด');

// Change default in JS
html = html.replace('const objective = autoObjectiveSelect?.value || "bytes";', 'const objective = autoObjectiveSelect?.value || "scan";');

fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', html);
console.log('Updated default to scanability-first');
