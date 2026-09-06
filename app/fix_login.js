const fs = require('fs');
const p = '/Users/chandanmallik/projects/ngk2/app/src/screens/LoginScreen.js';
let code = fs.readFileSync(p, 'utf8');

// 1. Remove the inner KeyboardAvoidingView
code = code.replace(
  /<KeyboardAvoidingView\s*style=\{styles\.formSection\}\s*behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}\s*>/,
  '<View style={styles.formSection}>'
);
code = code.replace(
  /<\/KeyboardAvoidingView>(\s*)<\/View>\s*$/m,
  '</View>$1</View>' // Replace the closing tag corresponding to the inner KAV
);

// Actually, regex replace for the closing tag might be tricky if there are multiple. 
// Let's replace the last </KeyboardAvoidingView> with </View> since there should only be one in the original file.
const lastIndexKAV = code.lastIndexOf('</KeyboardAvoidingView>');
if (lastIndexKAV !== -1) {
  code = code.substring(0, lastIndexKAV) + '</View>' + code.substring(lastIndexKAV + 23);
}

// 2. Wrap root View in KeyboardAvoidingView
code = code.replace(
  /return\s*\(\s*<View style=\{styles\.root\}>/,
  `return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>`
);

// 3. Add closing KeyboardAvoidingView before the final );
code = code.replace(
  /<\/View>\s*\);\s*};/,
  `    </View>
    </KeyboardAvoidingView>
  );
};`
);

fs.writeFileSync(p, code, 'utf8');
console.log('LoginScreen.js fixed');
