const fs = require('fs');

const portalPath = 'd:/DEV/QRZIP/portal.js';
const enginePath = 'd:/DEV/QRZIP/qrzip_engine.js';

let portalCode = fs.readFileSync(portalPath, 'utf8');
let engineCode = fs.readFileSync(enginePath, 'utf8');

// Extract DICT_PROFILES from portal.js
const startIdx = portalCode.indexOf('const DICT_PROFILES = [');
const endIdx = portalCode.indexOf('const DICT_PROFILE_BYTES = new Map(');
const dictProfilesCode = portalCode.substring(startIdx, endIdx);

// Extract DICT_PROFILE_BYTES from portal.js
const endBytesIdx = portalCode.indexOf('function getDictBytes', endIdx);
const dictProfileBytesCode = portalCode.substring(endIdx, endBytesIdx);

// Delete both from portal.js
portalCode = portalCode.substring(0, startIdx) + portalCode.substring(endBytesIdx);

// Insert into qrzip_engine.js after presetProfiles (line 48)
const insertTarget = '    function buildWeightedFrequencyMap(entries) {';
const insertIdx = engineCode.indexOf(insertTarget);

engineCode = engineCode.substring(0, insertIdx) + 
             dictProfilesCode + '\n    ' + 
             dictProfileBytesCode + '\n\n' + 
             engineCode.substring(insertIdx);

fs.writeFileSync(portalPath, portalCode);
fs.writeFileSync(enginePath, engineCode);

console.log('Moved DICT_PROFILES to qrzip_engine.js');
