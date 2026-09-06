const fs = require('fs');
const path = require('path');

const dir = '/Users/chandanmallik/projects/ngk2/app/src/screens';

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('RefreshControl')) {
                let modified = false;
                
                // If RefreshControl is imported from react-native
                const regex = /import\s+{([^}]*RefreshControl[^}]*)}\s+from\s+['"]react-native['"]\s*;/;
                
                // Let's just handle it generally: remove RefreshControl from react-native import
                if (content.match(/RefreshControl\s*,?/g)) {
                   // A simpler approach for the exact formatting we saw:
                   if (content.includes('RefreshControl,')) {
                      content = content.replace(/\s*RefreshControl,?\s*/, '\n');
                      modified = true;
                   } else if (content.includes('RefreshControl')) {
                      content = content.replace(/,\s*RefreshControl\s*/, '\n');
                      modified = true;
                   }
                   
                   if (modified) {
                      // Check if react-native-gesture-handler import exists
                      if (content.includes('react-native-gesture-handler')) {
                          content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-native-gesture-handler['"];/, (match, p1) => {
                              return `import { ${p1.trim()}, RefreshControl } from 'react-native-gesture-handler';`;
                          });
                      } else {
                          // Add it after the react-native import
                          content = content.replace(/(import\s+{[^}]+}\s+from\s+['"]react-native['"];)/, "$1\nimport { RefreshControl } from 'react-native-gesture-handler';");
                      }
                      fs.writeFileSync(fullPath, content, 'utf8');
                      console.log('Fixed', fullPath);
                   }
                }
            }
        }
    }
}

walkDir(dir);
