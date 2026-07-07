const fs = require('fs');
const lines = fs.readFileSync('d:/DEV/QRZIP/qrzip_engine.js', 'utf8').split('\\n');
// Truncate at line 1341 (index 1340)
const fixedLines = lines.slice(0, 1341);
fs.writeFileSync('d:/DEV/QRZIP/qrzip_engine.js', fixedLines.join('\\n'));
console.log('Truncated qrzip_engine.js to 1341 lines.');
