const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let importsAdded = false;

  // 1. Replace Hex codes with Tailwind semantic variables (Astryx/Albers standards)
  content = content.replace(/bg-\[\#1E1E1E\]/g, 'bg-primary');
  content = content.replace(/bg-\[\#232733\]/g, 'bg-primary');
  content = content.replace(/text-\[\#2D3142\]/g, 'text-foreground');
  content = content.replace(/border-\[\#E5E0D8\]/g, 'border-border');
  content = content.replace(/bg-\[\#D96B27\]/g, 'bg-accent');
  content = content.replace(/bg-\[\#F0ECE3\]/g, 'bg-muted');

  // 2. Simple Button replacements (for single-line buttons)
  // Converting basic buttons to the new <Button> component
  const buttonRegex = /<button([^>]*)className="([^"]*btn-primary[^"]*)"([^>]*)>/g;
  if (buttonRegex.test(content)) {
    content = content.replace(buttonRegex, '<Button$1variant="primary"$3>');
    importsAdded = true;
  }

  const secondaryBtnRegex = /<button([^>]*)className="([^"]*bg-slate-200[^"]*)"([^>]*)>/g;
  if (secondaryBtnRegex.test(content)) {
    content = content.replace(secondaryBtnRegex, '<Button$1variant="secondary"$3>');
    importsAdded = true;
  }

  const dangerBtnRegex = /<button([^>]*)className="([^"]*bg-red-50[^"]*)"([^>]*)>/g;
  if (dangerBtnRegex.test(content)) {
    content = content.replace(dangerBtnRegex, '<Button$1variant="danger"$3>');
    importsAdded = true;
  }

  // Convert closing tags
  if (importsAdded) {
    content = content.replace(/<\/button>/g, '</Button>');
    
    // Add import if not present
    if (!content.includes('import { Button }')) {
      const importStatement = `import { Button } from "@/components/ui/Button";\n`;
      // Find last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, nextLine) + importStatement + content.slice(nextLine);
      } else {
        content = importStatement + content;
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Normalized: ${filePath.replace(srcDir, '')}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

console.log("Commencing Project Sovereign E2E UI Normalization...");
walkDir(srcDir);
console.log("Normalization Complete.");
