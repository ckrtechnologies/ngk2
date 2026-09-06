const fs = require('fs');
const code = fs.readFileSync('/Users/chandanmallik/projects/ngk2/app/src/screens/modalsScreen.js', 'utf8');
const lines = code.split('\n');
const exportIdx = lines.findIndex(l => l.includes('export default ModalsScreen'));
for (let i = exportIdx - 1; i >= 0; i--) {
  if (lines[i].includes('return (')) {
     console.log(lines.slice(i, i + 5).join('\n'));
     break;
  }
}
