const fs = require('fs');
const acorn = require('acorn');

const codeHtml = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');

// Find the script block
const scriptStartIdx = codeHtml.indexOf('<script>', codeHtml.indexOf('chart.js'));
const scriptContentStart = codeHtml.indexOf('>', scriptStartIdx) + 1;
const scriptEndIdx = codeHtml.lastIndexOf('</script>');

const scriptCode = codeHtml.substring(scriptContentStart, scriptEndIdx);

const engineVars = [
  "encoder", "decoder", "presetProfiles", "buildWeightedFrequencyMap",
  "presetFrequencyMaps", "presetCharSets", "QR_BYTE_CAPACITY_M", "QR_ALNUM_CAPACITY_M",
  "utf8Bytes", "encodeUtf8", "decodeUtf8", "serializePayload",
  "rawCompress", "rawDecompress", "rleCompress", "rleDecompress",
  "buildHuffmanTree", "buildCodeMap", "bitsToBase64", "base64ToBits",
  "huffmanCompress", "huffmanDecompress", "fixedHuffmanCompress", "fixedHuffmanDecompress",
  "estimateQrVersion", "getQrCapacity", "alnumEffectiveBytes", "getDictBytes",
  "dictEncodeBytes", "dictDecodeBytes", "concatBytes", "bpeLearnByteDict",
  "inlineDictEncodeBytes", "inlineDictDecodeBytes", "buildInlineDictBlob", "parseInlineDictBlob",
  "compressors", "deflateCompress", "deflateDecompress", "deflateDictCompress",
  "deflateDictDecompress", "deflateInlineCompress", "deflateInlineDecompress",
  "lzCompactCompress", "lzCompactDecompress", "lz78Compress", "lz78Decompress",
  "arithmeticCompress", "arithmeticDecompress", "analyzeText", "selectAutoCandidates",
  "evaluateMethod", "parseDensityThreshold", "rankResults", "buildCompressedQrPayload"
];
const engineVarsSet = new Set(engineVars);

const ast = acorn.parse(scriptCode, { ecmaVersion: 2020 });
let rangesToRemove = [];

for (let node of ast.body) {
    if (node.type === 'VariableDeclaration') {
        const name = node.declarations[0].id.name;
        if (engineVarsSet.has(name)) {
            rangesToRemove.push([node.start, node.end]);
        }
    } else if (node.type === 'FunctionDeclaration') {
        const name = node.id.name;
        if (engineVarsSet.has(name)) {
            rangesToRemove.push([node.start, node.end]);
        }
    }
}

// Sort ranges backwards so we can remove them without shifting indices
rangesToRemove.sort((a, b) => b[0] - a[0]);

let cleanedScript = scriptCode;
for (let [start, end] of rangesToRemove) {
    cleanedScript = cleanedScript.substring(0, start) + cleanedScript.substring(end);
}

const finalHtml = codeHtml.substring(0, scriptContentStart) + '\n' + cleanedScript + '\n' + codeHtml.substring(scriptEndIdx);
fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', finalHtml);
console.log('Successfully cleaned text_compression_demo.html using AST!');
