const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempPdfPath = path.join(__dirname, '..', 'public', 'marigold_whitepaper.pdf');
const printUrl = 'http://localhost:3001/whitepaper/print';

// Common paths for Chrome/Chromium on Mac
const chromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
];

let chromePath = chromePaths.find(p => fs.existsSync(p));

if (!chromePath) {
  console.error('Could not find Google Chrome installation. Please ensure Chrome is installed.');
  process.exit(1);
}

const cmd = `"${chromePath}" --headless --disable-gpu --no-sandbox --print-to-pdf="${tempPdfPath}" "${printUrl}"`;

console.log('Generating MBA-quality Marigold Whitepaper PDF...');
console.log('Running cmd:', cmd);
const start = Date.now();

exec(cmd, (error, stdout, stderr) => {
  console.log('PDF Compilation completed in', (Date.now() - start), 'ms');
  if (error) {
    console.error('Error generating PDF:', error);
  } else {
    console.log('Success! Whitepaper generated at:', tempPdfPath);
    console.log('File size:', fs.statSync(tempPdfPath).size, 'bytes');
  }
  process.exit(0);
});
