const fs = require('fs');
const code = fs.readFileSync('d:/DEV/QRZIP/qrzip_engine.js', 'utf8');

const runCompressionIdx = code.indexOf('function runCompression() {');
const engineCode = code.substring(0, runCompressionIdx).trim();

function extractBlock(startStr) {
    const start = code.indexOf(startStr);
    if (start === -1) return '';
    let braces = 0;
    let started = false;
    let end = start;
    for (let i = start; i < code.length; i++) {
        if (code[i] === '{') { braces++; started = true; }
        else if (code[i] === '}') { braces--; }
        if (started && braces === 0) {
            end = i + 1;
            break;
        }
    }
    return code.substring(start, end);
}

const evalCode = extractBlock('function evaluateMethod(method, text)');
const parseCode = extractBlock('function parseDensityThreshold');
const buildCode = extractBlock('function buildCompressedQrPayload');
const rankCode = extractBlock('function rankResults');

// Let's also check if rankResults is already in engineCode.
// Yes, rankResults is before runCompression!

let finalCode = engineCode + '\\n\\n' + evalCode + '\\n\\n' + parseCode + '\\n\\n' + buildCode;

fs.writeFileSync('d:/DEV/QRZIP/qrzip_engine.js', finalCode);
console.log('Fixed qrzip_engine.js');
