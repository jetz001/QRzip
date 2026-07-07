const fs = require('fs');
const acorn = require('acorn');

const codeHtml = fs.readFileSync('d:/DEV/QRZIP/text_compression_demo.html', 'utf8');

// Find the script block
const scriptStartIdx = codeHtml.indexOf('<script>', codeHtml.indexOf('chart.js'));
const scriptContentStart = codeHtml.indexOf('>', scriptStartIdx) + 1;
const scriptEndIdx = codeHtml.lastIndexOf('</script>');

const scriptCode = codeHtml.substring(scriptContentStart, scriptEndIdx);

const astEngine = acorn.parse(fs.readFileSync('d:/DEV/QRZIP/qrzip_engine.js', 'utf8'), { ecmaVersion: 2020 });
const engineVarsSet = new Set();
astEngine.body.forEach(n => {
    if(n.type === 'VariableDeclaration') {
        n.declarations.forEach(d => {
            if(d.id.name) engineVarsSet.add(d.id.name);
        });
    }
    if(n.type === 'FunctionDeclaration') {
        engineVarsSet.add(n.id.name);
    }
});

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

rangesToRemove.sort((a, b) => b[0] - a[0]);

let cleanedScript = scriptCode;
for (let [start, end] of rangesToRemove) {
    cleanedScript = cleanedScript.substring(0, start) + cleanedScript.substring(end);
}

const finalHtml = codeHtml.substring(0, scriptContentStart) + '\n' + cleanedScript + '\n' + codeHtml.substring(scriptEndIdx);
fs.writeFileSync('d:/DEV/QRZIP/text_compression_demo.html', finalHtml);
console.log('Removed all duplicates based on qrzip_engine.js!');
