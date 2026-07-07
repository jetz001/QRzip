const fs = require('fs');

const originalHtml = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');

// We want to KEEP all the UI functions in text_compression_demo.html.
// What did we remove in refactor.js that we need to restore?
// refactor.js removed: 
// "encoder", "decoder",
// "presetProfiles", "buildWeightedFrequencyMap", "presetFrequencyMaps", "presetCharSets", "QR_BYTE_CAPACITY_M",
// "QR_ALNUM_CAPACITY_M", "utf8Bytes", "compressors", "deflateCompress", "deflateDecompress",
// "deflateDictCompress", "deflateDictDecompress", "deflateInlineCompress", "deflateInlineDecompress",
// "lzCompactCompress", "lzCompactDecompress", "lz78Compress", "lz78Decompress", "arithmeticCompress",
// "arithmeticDecompress", "analyzeText", 
// "buildQrCarrierForRaw", "buildQrCarrierForCompressed", "selectAutoCandidates", "evaluateMethod",
// "parseDensityThreshold", "rankResults"

// Wait! It didn't mention runCompression! Why did it remove it?
// Ah, because in refactor.js I also did:
// `if (bLine.includes(";")) break;` for variables, which probably messed up block detection and skipped everything until the end of the script!
// That's why the entire rest of the file was missing!

// So ALL functions AFTER evaluateMethod were deleted from text_compression_demo.html!

// We can just use original_demo.html, and only remove the engine code block!
// Better yet, just insert `<script src="qrzip_engine.js"></script>` at the start of the script block in original_demo.html,
// and REMOVE the functions that are ALREADY in qrzip_engine.js.
// Since qrzip_engine.js doesn't declare them globally on window, wait! 
// They are global because it's a normal `<script src="..."></script>` tag, not a module!
// So they ARE in the global scope!
// This means if they are in original_demo.html, they will just REDEFINE the global functions, which works perfectly fine!
// Wait! `const encoder = ...` will throw `SyntaxError: Identifier 'encoder' has already been declared` if it's in both!

const engineVars = [
  "const encoder", "const decoder", "const presetProfiles", "function buildWeightedFrequencyMap",
  "const presetFrequencyMaps", "const presetCharSets", "const QR_BYTE_CAPACITY_M", "const QR_ALNUM_CAPACITY_M",
  "function utf8Bytes", "function encodeUtf8", "function decodeUtf8", "function serializePayload",
  "function rawCompress", "function rawDecompress", "function rleCompress", "function rleDecompress",
  "function buildHuffmanTree", "function buildCodeMap", "function bitsToBase64", "function base64ToBits",
  "function huffmanCompress", "function huffmanDecompress", "function fixedHuffmanCompress", "function fixedHuffmanDecompress",
  "function estimateQrVersion", "function getQrCapacity", "function alnumEffectiveBytes", "function getDictBytes",
  "function dictEncodeBytes", "function dictDecodeBytes", "function concatBytes", "function bpeLearnByteDict",
  "function inlineDictEncodeBytes", "function inlineDictDecodeBytes", "function buildInlineDictBlob", "function parseInlineDictBlob",
  "const compressors", "function deflateCompress", "function deflateDecompress", "function deflateDictCompress",
  "function deflateDictDecompress", "function deflateInlineCompress", "function deflateInlineDecompress",
  "function lzCompactCompress", "function lzCompactDecompress", "function lz78Compress", "function lz78Decompress",
  "function arithmeticCompress", "function arithmeticDecompress", "function analyzeText", "function selectAutoCandidates",
  "function evaluateMethod", "function parseDensityThreshold", "function rankResults", "function buildCompressedQrPayload"
];

let lines = originalHtml.split('\\n');
let newLines = [];
let i = 0;
while (i < lines.length) {
    let line = lines[i];
    let skip = false;
    
    // Add the script tag right before <script> at line 576
    if (line.includes('<script>') && lines[i-1] && lines[i-1].includes('chart.js')) {
        newLines.push('<script src="qrzip_engine.js"></script>');
    }
    
    for (let ev of engineVars) {
        if (line.trim().startsWith(ev)) {
            skip = true;
            // skip the block
            let braces = 0;
            let started = false;
            let j = i;
            while(j < lines.length) {
                let bLine = lines[j];
                braces += (bLine.match(/\\{/g) || []).length;
                braces -= (bLine.match(/\\}/g) || []).length;
                if (bLine.includes('{')) started = true;
                
                // For const declarations that might not have blocks, check for ';'
                if (!started && bLine.includes(';')) {
                    i = j;
                    break;
                }
                
                if (started && braces === 0) {
                    i = j;
                    break;
                }
                j++;
            }
            break;
        }
    }
    
    if (!skip) {
        newLines.push(line);
    }
    i++;
}

fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', newLines.join('\\n'));
console.log('Restored text_compression_demo.html cleanly');
