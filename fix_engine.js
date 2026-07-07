const fs = require('fs');
const code = fs.readFileSync('d:/DEV/QRZIP/qrzip_engine.js', 'utf8');

const runCompressionIdx = code.indexOf('function runCompression() {');
if (runCompressionIdx === -1) {
    console.log("Already fixed");
    process.exit(0);
}

const engineCode = code.substring(0, runCompressionIdx);

// Extract evaluateMethod
const evalStart = code.indexOf('function evaluateMethod');
let evalEnd = code.indexOf('function parseDensityThreshold', evalStart);
if (evalEnd === -1) evalEnd = code.length;
const evaluateMethodStr = code.substring(evalStart, evalEnd);

// Extract parseDensityThreshold
const parseStart = code.indexOf('function parseDensityThreshold');
let parseEnd = code.indexOf('function renderTopStats', parseStart);
const parseStr = parseStart !== -1 ? code.substring(parseStart, parseEnd) : '';

// Extract buildCompressedQrPayload
const buildStart = code.indexOf('function buildCompressedQrPayload');
let buildEnd = code.indexOf('function getComparisonCompressedResult', buildStart);
const buildStr = buildStart !== -1 ? code.substring(buildStart, buildEnd) : '';

const finalCode = engineCode + '\\n\\n' + evaluateMethodStr + '\\n\\n' + parseStr + '\\n\\n' + buildStr;

fs.writeFileSync('d:/DEV/QRZIP/qrzip_engine.js', finalCode);
console.log('Fixed qrzip_engine.js');
