const fs = require('fs');

function processFile(f) {
  const p = '/Users/chandanmallik/projects/ngk2/app/src/screens/' + f;
  if (!fs.existsSync(p)) return;
  
  let code = fs.readFileSync(p, 'utf8');

  // Add KeyboardAvoidingView if not imported
  if (code.includes('react-native') && !code.includes('KeyboardAvoidingView,')) {
    code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]react-native['"];/, (match, imports) => {
        return `import { ${imports.trim()}, KeyboardAvoidingView, Platform } from 'react-native';`;
    });
  }

  // Handle SafeAreaView wrap
  if (code.match(/return\s*\(\s*<SafeAreaView/)) {
     code = code.replace(
       /return\s*\(\s*(<SafeAreaView[^>]*>)([\s\S]*?)(<\/SafeAreaView>)\s*\);/,
       `return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      $1$2$3
    </KeyboardAvoidingView>
  );`
     );
     fs.writeFileSync(p, code, 'utf8');
     console.log('Fixed', f);
  } else if (f === 'modalsScreen.js') {
     code = code.replace(
       /return\s*\(\s*(<View style=\{styles.container\}>)([\s\S]*?)(<\/View>)\s*\);/,
       `return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      $1$2$3
    </KeyboardAvoidingView>
  );`
     );
     fs.writeFileSync(p, code, 'utf8');
     console.log('Fixed modalsScreen.js');
  }
}

const files = [
  'ProfileScreen.js',
  'MyEnquiriesScreen.js',
  'PartsFinderScreen.js',
  'vehiclesListScreen.js',
  'MyGarageScreen.js',
  'DealerLocatorScreen.js',
  'modalsScreen.js'
];

for (const f of files) {
  processFile(f);
}
