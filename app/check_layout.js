const fs = require('fs');
const files = [
  'TechnicalEnquiryScreen.js',
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
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    const returnIndex = lines.findIndex(l => l.includes('return ('));
    if (returnIndex !== -1) {
      console.log(f, '=>', lines[returnIndex + 1].trim());
    } else {
      console.log(f, '=> NO RETURN FOUND');
    }
  }
}
