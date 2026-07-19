const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-slate-900/g, 'bg-slate-50 border border-slate-200');
  content = content.replace(/bg-slate-950/g, 'bg-slate-100');
  content = content.replace(/bg-black\/50/g, 'bg-white shadow-inner');
  content = content.replace(/bg-black/g, 'bg-slate-200');
  content = content.replace(/border-slate-800\/60/g, 'border-slate-300');
  content = content.replace(/border-slate-800/g, 'border-slate-200');
  
  // Syntax Highlighting Text (usually inside dark blocks)
  content = content.replace(/text-slate-300/g, 'text-slate-700');
  
  // Hex Backgrounds
  content = content.replace(/bg-\[\#0F1423\]/g, 'bg-slate-50');
  content = content.replace(/bg-\[\#1E1E1E\]/g, 'bg-white');

  // Let's replace text-slate-50 and text-white only when they appear in the same class string as bg-slate-50 or bg-slate-100 (which were formally dark)
  // But wait, they are already replaced above.
  // Instead, let's use a regex to find className="..." and replace text-white with text-slate-900 if it doesn't contain a known colored background like bg-emerald-600.
  
  const classRegex = /className="([^"]*)"/g;
  content = content.replace(classRegex, (match, classes) => {
    if (classes.includes('bg-emerald') || classes.includes('bg-blue') || classes.includes('bg-rose') || classes.includes('bg-amber')) {
      return match; // Leave colored buttons alone
    }
    // Otherwise, invert white text to dark text
    let newClasses = classes.replace(/\btext-white\b/g, 'text-slate-900');
    newClasses = newClasses.replace(/\btext-slate-50\b/g, 'text-slate-900');
    newClasses = newClasses.replace(/\btext-slate-400\b/g, 'text-slate-600');
    newClasses = newClasses.replace(/\btext-emerald-400\b/g, 'text-emerald-700');
    newClasses = newClasses.replace(/\btext-emerald-300\b/g, 'text-emerald-800');
    return `className="${newClasses}"`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});
console.log(`Updated ${changedCount} files.`);
