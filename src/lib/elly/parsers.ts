/**
 * Parses raw HTML or text data from ELLY into structured JSON.
 * Uses flexible Regex to adapt to changes in the DOM or data shape.
 */

export interface VoterRecord {
  name: string;
  address: string;
  status: string;
  flags: string[];
}

export function parseVoterHtml(html: string): VoterRecord[] {
  const records: VoterRecord[] = [];
  
  // Regex to extract data from the simulated HTML structure.
  // This allows us to parse without strict DOM parsing if the structure is somewhat predictable.
  const recordRegex = /<div class="voter-record">([\s\S]*?)<\/div>/g;
  const nameRegex = /<span class="name">(.*?)<\/span>/;
  const addressRegex = /<span class="address">(.*?)<\/span>/;
  const statusRegex = /<span class="status">(.*?)<\/span>/;
  const flagRegex = /<span class="flag">(.*?)<\/span>/g;

  let match;
  while ((match = recordRegex.exec(html)) !== null) {
    const recordHtml = match[1];
    
    const nameMatch = nameRegex.exec(recordHtml);
    const addressMatch = addressRegex.exec(recordHtml);
    const statusMatch = statusRegex.exec(recordHtml);
    
    const flags: string[] = [];
    let flagMatch;
    while ((flagMatch = flagRegex.exec(recordHtml)) !== null) {
      flags.push(flagMatch[1].trim());
    }

    if (nameMatch) {
      records.push({
        name: nameMatch[1].trim(),
        address: addressMatch ? addressMatch[1].trim() : "Unknown",
        status: statusMatch ? statusMatch[1].trim() : "Unknown",
        flags,
      });
    }
  }

  return records;
}
