const fs = require('fs');

const htmlFile = 'd:/DEV/QRZIP/text_compression_demo.html';
const jsFile = 'd:/DEV/QRZIP/qrzip_engine.js';

let html = fs.readFileSync(htmlFile, 'utf8');
let js = fs.readFileSync(jsFile, 'utf8');

// Fix the script tags error first
html = html.replace('<script>\\r\\n  <script src="qrzip_engine.js"></script>', '<script>');
html = html.replace('<script>\\n  <script src="qrzip_engine.js"></script>', '<script>');
html = html.replace('<script src="qrzip_engine.js"></script>\\r\\n<script>\\r\\n  <script src="qrzip_engine.js"></script>', '<script src="qrzip_engine.js"></script>\\r\\n<script>');
html = html.replace('<script src="qrzip_engine.js"></script>\\n<script>\\n  <script src="qrzip_engine.js"></script>', '<script src="qrzip_engine.js"></script>\\n<script>');

const missingFuncs = [
  "serializePayload", "rawCompress", "rawDecompress", "rleCompress", "rleDecompress",
  "buildHuffmanTree", "buildCodeMap", "bitsToBase64", "base64ToBits", "huffmanCompress", "huffmanDecompress",
  "fixedHuffmanCompress", "fixedHuffmanDecompress", "estimateQrVersion", "getQrCapacity", "alnumEffectiveBytes",
  "getDictBytes", "dictEncodeBytes", "dictDecodeBytes", "concatBytes", "bpeLearnByteDict",
  "inlineDictEncodeBytes", "inlineDictDecodeBytes", "buildInlineDictBlob", "parseInlineDictBlob"
];

let addedJs = [];
let htmlLines = html.split('\\n');
let newHtmlLines = [];

let i = 0;
while (i < htmlLines.length) {
  const line = htmlLines[i];
  let matchName = null;
  const trimmed = line.trim();
  if (trimmed.startsWith("function ")) {
    matchName = trimmed.split(/\s+/)[1].split("(")[0];
  }
  
  if (matchName && missingFuncs.includes(matchName)) {
    let block = [];
    let braces = 0;
    let started = false;
    let j = i;
    
    while (j < htmlLines.length) {
      const bLine = htmlLines[j];
      block.push(bLine);
      braces += (bLine.match(/\\{/g) || []).length;
      braces -= (bLine.match(/\\}/g) || []).length;
      if (bLine.includes("{")) started = true;
      if (started && braces === 0) break;
      j++;
    }
    
    addedJs.push(block.join('\\n'));
    i = j;
  } else {
    newHtmlLines.push(line);
  }
  i++;
}

js = js + '\\n\\n// Added missing functions\\n' + addedJs.join('\\n\\n');

fs.writeFileSync(jsFile, js);
fs.writeFileSync(htmlFile, newHtmlLines.join('\\n'));
console.log('Fixed syntax and extracted missing functions');
