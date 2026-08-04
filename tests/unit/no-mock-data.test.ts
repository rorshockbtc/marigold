import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

function runMockCheck() {
  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    console.error("Could not find src directory");
    process.exit(1);
  }
  const files = walkDir(srcDir);
  
  const mockPatterns = [
    /dataPoints:\s*\[\s*\{\s*label:\s*['"]Region A/,
    /const\s+seeded\s*:\s*DataStory\[\]\s*=\s*\[/,
    /isSavedLocally:\s*false,\s*dataPoints:\s*\[/,
    /createStoryFromQuery.*?label:\s*['"]Region A/s,
    /globalRelayStore\s*:\s*Record/,
    /localStorage\.setItem\(["']marigold_user_role["']/
  ];

  const filesWithMocks: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of mockPatterns) {
      if (pattern.test(content)) {
        filesWithMocks.push(file);
        break; 
      }
    }
  }

  if (filesWithMocks.length > 0) {
    console.error(`The following files contain hardcoded mock data patterns which violates the strict data realism policy:\n${filesWithMocks.join('\n')}`);
    process.exit(1);
  }
  
  console.log("Anti-mock check passed! No hardcoded data detected.");
  process.exit(0);
}

runMockCheck();
