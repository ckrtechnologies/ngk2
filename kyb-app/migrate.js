const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_SRC = '/Users/chandanmallik/projects/ngk2/app/src';
const OLD_SCREENS_DIR = path.join(APP_SRC, 'screens');

// Mapping of file basenames to new directories relative to APP_SRC
const screenMappings = {
  'LoginScreen.js': 'domains/auth/screens',
  'register.js': 'domains/auth/screens',
  'RoleSelectionScreen.js': 'domains/auth/screens',
  'ForgotPasswordScreen.js': 'domains/auth/screens',
  'SplashScreen.js': 'domains/auth/screens',

  'OwnerHomeScreen.js': 'domains/owner/screens',
  'MyGarageScreen.js': 'domains/owner/screens',
  'MyFavoritesScreen.js': 'domains/owner/screens',
  'HomeScreen.js': 'domains/owner/screens',

  'SuccessScreen.js': 'domains/shared/screens', // shared success state
  'TechnicalEnquiryScreen.js': 'domains/shared/screens',
  'PartsFinderScreen.js': 'domains/shared/screens',
  'VerifiedPartsScreen.js': 'domains/shared/screens',
  'MyEnquiriesScreen.js': 'domains/shared/screens',
  'DealerLocatorScreen.js': 'domains/shared/screens',
  'Notification.js': 'domains/shared/screens',
  'NotificationsScreen.js': 'domains/shared/screens',
  'ProfileScreen.js': 'domains/shared/screens',
  'CustomDrawer.js': 'domains/shared/screens',
  'modalsScreen.js': 'domains/shared/screens',
  'vehiclesListScreen.js': 'domains/shared/screens',
};

// Folders inside screens that need moving
const folderMappings = {
  'Reseller': 'domains/reseller/screens',
  'Distributor': 'domains/distributor/screens',
};

// Create target dirs
for (const val of Object.values(screenMappings)) {
  const dir = path.join(APP_SRC, val);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
for (const val of Object.values(folderMappings)) {
  const dir = path.join(APP_SRC, val);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Move files physically and record oldPath -> newPath mapping
const fileMoveMap = {}; // relative to APP_SRC e.g. "screens/LoginScreen.js" -> "domains/auth/screens/LoginScreen.js"

for (const [file, targetFolder] of Object.entries(screenMappings)) {
  const oldPath = path.join(OLD_SCREENS_DIR, file);
  if (fs.existsSync(oldPath)) {
    const newRelPath = path.join(targetFolder, file);
    const newPath = path.join(APP_SRC, newRelPath);
    fs.renameSync(oldPath, newPath);
    fileMoveMap['screens/' + file] = newRelPath;
  }
}

// Move specific nested files (like Reseller/ResellerHome.js)
for (const [folder, targetFolder] of Object.entries(folderMappings)) {
  const oldFolderPath = path.join(OLD_SCREENS_DIR, folder);
  if (fs.existsSync(oldFolderPath)) {
    const files = fs.readdirSync(oldFolderPath);
    for (const f of files) {
      const oldPath = path.join(oldFolderPath, f);
      const newRelPath = path.join(targetFolder, f);
      const newPath = path.join(APP_SRC, newRelPath);
      fs.renameSync(oldPath, newPath);
      fileMoveMap['screens/' + folder + '/' + f] = newRelPath;
    }
  }
}

console.log('Files moved. Updating imports...');

// 2. We need a function to resolve old relative imports and rewrite them to the new paths.
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const currentDir = path.dirname(filePath); // absolute
  const currentRelToSrc = path.relative(APP_SRC, currentDir);

  // Regex to find import statements or require()
  const importRegex = /(from\s+['"])([^'"]+)(['"])|(require\(['"])([^'"]+)(['"]\))/g;
  
  content = content.replace(importRegex, (match, p1, p2, p3, p4, p5, p6) => {
    const isRequire = !!p4;
    const prefix = isRequire ? p4 : p1;
    const suffix = isRequire ? p6 : p3;
    const importPath = isRequire ? p5 : p2;

    if (!importPath.startsWith('.')) return match; // Not a relative import

    // Resolve the imported path relative to the old position if this file itself moved?
    // Wait: if the FILE moved, all its internal relative imports pointing to outside (e.g. `../components`) might break!
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
