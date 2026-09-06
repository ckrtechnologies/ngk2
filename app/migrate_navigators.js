const fs = require('fs');

const files = [
  'app/src/domains/auth/navigation/AuthNavigator.js',
  'app/src/domains/owner/navigation/OwnerNavigator.js',
  'app/src/domains/reseller/navigation/ResellerNavigator.js',
  'app/src/domains/distributor/navigation/DistributorNavigator.js'
];

for (const file of files) {
  const p = '/Users/chandanmallik/projects/ngk2/' + file;
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    code = code.replace(
      /import\s*{\s*createStackNavigator\s*}\s*from\s*['"]@react-navigation\/stack['"];/,
      "import { createNativeStackNavigator } from '@react-navigation/native-stack';"
    );
    code = code.replace(
      /const\s+Stack\s*=\s*createStackNavigator\(\);/,
      "const Stack = createNativeStackNavigator();"
    );
    fs.writeFileSync(p, code, 'utf8');
    console.log(`Migrated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
}
