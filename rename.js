const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.expo'];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        processDirectory(fullPath);
      }
    } else {
      if (file === 'pnpm-lock.yaml') continue; // Don't modify lockfile manually
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.ico') || file.endsWith('.webp')) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content
        .replace(/sarangi/g, 'sarangi')
        .replace(/SARANGI/g, 'SARANGI')
        .replace(/Sarangi/g, 'Sarangi');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting global rename...');
processDirectory(__dirname);
console.log('Done replacing contents!');
