const fs = require('fs');
const files = [
  'modalsScreen.js',
  'ProfileScreen.js',
  'MyEnquiriesScreen.js',
  'PartsFinderScreen.js',
  'vehiclesListScreen.js',
  'MyGarageScreen.js',
  'DealerLocatorScreen.js'
];

for (const f of files) {
  const p = '/Users/chandanmallik/projects/ngk2/app/src/screens/' + f;
  if (!fs.existsSync(p)) continue;
  
  let code = fs.readFileSync(p, 'utf8');
  // Find the last return statement before the export default
  const exportIndex = code.lastIndexOf('export default');
  if (exportIndex === -1) continue;
  
  const beforeExport = code.substring(0, exportIndex);
  const returns = [...beforeExport.matchAll(/return\s*\(/g)];
  if (returns.length > 0) {
     const lastReturn = returns[returns.length - 1];
     const snippet = beforeExport.substring(lastReturn.index, lastReturn.index + 200);
     console.log(`\n--- ${f} ---`);
     console.log(snippet);
  }
}
