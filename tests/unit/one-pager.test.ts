import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Marigold Overview & Shareable One-Pager', () => {
  it('ensures Marigold-OnePager.pdf exists in public directory and is valid', () => {
    const pdfPath = path.resolve(__dirname, '../../public/Marigold-OnePager.pdf');
    expect(fs.existsSync(pdfPath)).toBe(true);
    const stat = fs.statSync(pdfPath);
    expect(stat.size).toBeGreaterThan(50000); // ~120KB PDF

    const content = fs.readFileSync(pdfPath);
    // PDF header magic bytes
    expect(content.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    // Ensure it is 1 page
    const pageMatches = content.toString('latin1').match(/\/Type\s*\/Page\b/g);
    expect(pageMatches?.length).toBe(1);
  });

  it('ensures overview page and redirects exist', () => {
    const overviewPage = path.resolve(__dirname, '../../src/app/overview/page.tsx');
    const onepagerRedirect = path.resolve(__dirname, '../../src/app/onepager/page.tsx');
    const overviewClient = path.resolve(__dirname, '../../src/app/overview/OverviewClient.tsx');
    
    expect(fs.existsSync(overviewPage)).toBe(true);
    expect(fs.existsSync(onepagerRedirect)).toBe(true);
    expect(fs.existsSync(overviewClient)).toBe(true);
  });
});
