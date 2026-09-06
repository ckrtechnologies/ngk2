const fs = require('fs');
const files = [
  'ProfileScreen.js',
  'MyEnquiriesScreen.js',
  'PartsFinderScreen.js',
  'vehiclesListScreen.js',
  'modalsScreen.js',
  'MyGarageScreen.js',
  'DealerLocatorScreen.js'
];

for (const f of files) {
  const p = '/Users/chandanmallik/projects/ngk2/app/src/screens/' + f;
  if (!fs.existsSync(p)) continue;
  
  let code = fs.readFileSync(p, 'utf8');
  
  // Find lines starting with exactly "  return ("
  const lines = code.split('\n');
  const mainReturns = lines.filter(l => l.startsWith('  return ('));
  console.log(`\n--- ${f} ---`);
  if (mainReturns.length > 0) {
    const idx = lines.indexOf(mainReturns[mainReturns.length - 1]);
    console.log(lines.slice(idx, idx + 5).join('\n'));
  }
}
