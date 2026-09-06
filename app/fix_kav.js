const fs = require('fs');
const files = [
  'TechnicalEnquiryScreen.js',
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
  
  // Skip if already has KeyboardAvoidingView
  if (code.includes('<KeyboardAvoidingView')) {
    console.log(`Skipped ${f} (already has KeyboardAvoidingView)`);
    continue;
  }
  
  // 1. Add import
  if (code.includes('react-native')) {
     if (!code.includes('KeyboardAvoidingView')) {
        code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]react-native['"];/, (match, imports) => {
            return `import { ${imports.trim()}, KeyboardAvoidingView, Platform } from 'react-native';`;
        });
     }
  }

  // 2. Wrap root
  // We need to find the main return statement of the component.
  // Assuming the components return `<SafeAreaView` at the root.
  const regex = /return\s*\(\s*(<SafeAreaView[^>]*>)([\s\S]*?)(<\/SafeAreaView>)\s*\);/m;
  const match = code.match(regex);
  if (match) {
    const replacement = `return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      ${match[1]}${match[2]}${match[3]}
    </KeyboardAvoidingView>
  );`;
    code = code.replace(regex, replacement);
    fs.writeFileSync(p, code, 'utf8');
    console.log(`Fixed ${f}`);
  } else {
    console.log(`Failed to match SafeAreaView return in ${f}`);
  }
}
