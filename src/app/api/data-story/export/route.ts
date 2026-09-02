import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function redactPII(text: string): string {
  if (!text) return text;
  // Extremely aggressive PII Redaction
  return text
    // Redact emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    // Redact phone numbers (basic US format)
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    // Redact SSNs
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    // Redact capitalized words that look like proper names (excluding start of sentences by simplistic heuristic)
    .replace(/(?<!^|\.\s)[A-Z][a-z]+/g, '[REDACTED_PROPER_NOUN]');
}

export async function POST(req: Request) {
  try {
    const { blocks, sanitize } = await req.json();

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json({ error: "Invalid blocks array" }, { status: 400 });
    }

    let markdownContent = `# Marigold Dossier\n\nGenerated on ${new Date().toLocaleDateString()}\n${sanitize ? '**[ SANITIZED FOR PUBLIC RELEASE ]**\n' : ''}\n---\n\n`;

    let figureCounter = 1;
    for (const block of blocks) {
      if (block.status === 'rejected') continue;

      const blockTitle = sanitize ? redactPII(block.content.title || '') : block.content.title;
      const blockNarrative = sanitize ? redactPII(block.content.narrative || '') : block.content.narrative;

      if (blockTitle) {
        markdownContent += `## ${blockTitle}\n\n`;
      }

      if (blockNarrative) {
        markdownContent += `${blockNarrative}\n\n`;
      }

      if (block.type === 'chart') {
        const chartType = block.content.chartConfig?.chartType || 'Visualization';
        markdownContent += `> **[Insert Figure ${figureCounter}: ${chartType.toUpperCase()}]**\n\n`;
        figureCounter++;
      }
    }

    const exportDir = path.join(process.cwd(), 'Marigold_Local', 'Data_Stories');
    
    // Ensure directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = Date.now();
    const mdFilename = `dossier_${timestamp}${sanitize ? '_sanitized' : ''}.md`;
    const jsonFilename = `dossier_${timestamp}${sanitize ? '_sanitized' : ''}.json`;

    // Save Markdown
    fs.writeFileSync(path.join(exportDir, mdFilename), markdownContent, 'utf-8');
    
    // Save JSON (for raw data backup)
    fs.writeFileSync(path.join(exportDir, jsonFilename), JSON.stringify(blocks, null, 2), 'utf-8');

    return NextResponse.json({ success: true, path: path.join(exportDir, mdFilename) });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export dossier" }, { status: 500 });
  }
}
