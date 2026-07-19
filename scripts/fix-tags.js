const fs = require('fs');
const files = [
  'src/app/developers/page.tsx',
  'src/app/sandbox/SandboxContent.tsx',
  'src/components/ChatInterface.tsx',
  'src/app/analysis/page.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf-8');
  // Fix <button> ... </Button> to <button> ... </button>
  c = c.replace(/<button([^>]*)>([\s\S]*?)<\/Button>/g, '<button$1>$2</button>');
  
  // Wait, what if there's nested tags? The regex might match greedily or lazily.
  // Using lazy matching `[\s\S]*?` is generally okay for non-nested buttons. Buttons don't usually nest.
  
  fs.writeFileSync(f, c);
});
