const fs = require('fs');

const html = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');
const lines = html.split('\n');

const extractNames = new Set([
  "encoder", "decoder",
  "presetProfiles", "buildWeightedFrequencyMap", "presetFrequencyMaps", "presetCharSets", "QR_BYTE_CAPACITY_M",
  "utf8Bytes", "toBase64Url", "bytesToBase64", "bytesToBinaryString", "binaryStringToBytes",
  "bytesToBase64Url", "base64ToBytes", "toBase64UrlFromBase64", "BASE45_CHARSET", "base45Encode", "base45Decode",
  "isAsciiOnly", "estimateTokens", "computeEntropy", "repeatedWordRatio", "repeatedBigramRatio",
  "longestRun", "analyzeText", "supportsPresetProfile", "getLzCompactDict", "lzCompactCompress",
  "lzCompactDecompress", "lz78Compress", "lz78Decompress", "arithmeticCompress", "arithmeticDecompress",
  "bpeStaticRules", "deflateInlineCompress", "deflateInlineDecompress", "getDeflateDictForProfile",
  "deflateDictCompress", "deflateDictDecompress", "deflateCompress", "deflateDecompress",
  "fixedProfileCompress", "fixedProfileDecompress", "compressors", "getQrCapacityM", "buildScanability",
  "buildFixedQrPayload", "buildDeflateQrPayload", "buildDeflateDictQrPayload", "buildDeflateInlineQrPayload",
  "buildLzCompactQrPayload", "buildArithmeticTextPayload", "buildBinaryFrameSimple", "buildRawQrPayload",
  "buildQrCarrierForRaw", "buildQrCarrierForCompressed", "selectAutoCandidates", "evaluateMethod",
  "parseDensityThreshold", "rankResults"
]);

let engineCode = [];
let remainingLines = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  let matchName = null;
  const trimmed = line.trim();
  
  if (trimmed.startsWith("function ")) {
    matchName = trimmed.split(/\s+/)[1].split("(")[0];
  } else if (trimmed.startsWith("const ")) {
    matchName = trimmed.split(/\s+/)[1].split("=")[0];
  }
  
  if (line.includes("const encoder = new TextEncoder();")) matchName = "encoder";
  if (line.includes("const decoder = new TextDecoder();")) matchName = "decoder";
  
  if (matchName && extractNames.has(matchName)) {
    let block = [];
    let braces = 0;
    let brackets = 0;
    let parens = 0;
    let started = false;
    let j = i;
    
    while (j < lines.length) {
      const bLine = lines[j];
      block.push(bLine);
      
      braces += (bLine.match(/\{/g) || []).length;
      braces -= (bLine.match(/\}/g) || []).length;
      brackets += (bLine.match(/\[/g) || []).length;
      brackets -= (bLine.match(/\]/g) || []).length;
      parens += (bLine.match(/\(/g) || []).length;
      parens -= (bLine.match(/\)/g) || []).length;
      
      if (bLine.includes("{") || bLine.includes("[") || bLine.includes("(")) started = true;
      
      if (started && braces === 0 && brackets === 0 && parens === 0) {
        break; 
      }
      
      if (!started && bLine.includes(";") && !bLine.includes("function") && !bLine.includes("const compressors =")) {
        if (!bLine.includes("const presetProfiles =") && !bLine.includes("const presetFrequencyMaps =") && !bLine.includes("const presetCharSets =") && !bLine.includes("const QR_BYTE_CAPACITY_M =") && !bLine.includes("const bpeStaticRules =") && !bLine.includes("const BASE45_CHARSET =") && !bLine.includes("const compressors =")) {
          break;
        }
      }
      
      if (j > i && braces === 0 && brackets === 0 && parens === 0 && bLine.includes(";")) {
          break;
      }
      j++;
    }
    
    if (!started) {
        while(j < lines.length && !lines[j].includes(';')) {
            j++;
            if (j < lines.length) block.push(lines[j]);
        }
    }

    engineCode.push(block.join('\n'));
    i = j; 
  } else {
    if (line.includes("<script>")) {
       remainingLines.push(line);
       remainingLines.push('  <script src="qrzip_engine.js"></script>');
    } else {
       remainingLines.push(line);
    }
  }
  i++;
}

let outputHtml = remainingLines.join('\n');
outputHtml = outputHtml.replace(
  '<script>\r\n',
  '<script src="qrzip_engine.js"></script>\r\n<script>\r\n'
).replace(
  '<script>\n',
  '<script src="qrzip_engine.js"></script>\n<script>\n'
);

let engineStr = engineCode.join('\n\n');
engineStr = engineStr.replace(
  /const encodingMode = qrEncodingSelect\?\.value \|\| "byte";/g,
  'const encodingMode = (typeof qrEncodingSelect !== "undefined" && qrEncodingSelect) ? qrEncodingSelect.value : "byte";'
);

fs.writeFileSync('d:/DEV/QRZIP/qrzip_engine.js', engineStr);
fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', outputHtml);
console.log('Successfully wrote qrzip_engine.js and updated text_compression_demo.html');
