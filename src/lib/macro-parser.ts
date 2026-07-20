import * as XLSX from 'xlsx';

export interface MacroTrendRecord {
  month: string;
  county: string;
  [metric: string]: string | number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * A generalized parser designed to extract macro-level trends from messy, 
 * aggregated state reporting spreadsheets (like Florida's Division of Elections).
 * It automatically scans for the true header row and flattens multi-sheet data 
 * into a single time-series array suitable for visualization.
 */
export function parseMacroAggregateExcel(arrayBuffer: ArrayBuffer): MacroTrendRecord[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const results: MacroTrendRecord[] = [];

  workbook.SheetNames.forEach(sheetName => {
    // Only process sheets that look like monthly data or net changes
    // Some Florida sheets are 'NetJanToFeb', but we also want the raw monthly 'January'
    const isMonthly = MONTHS.some(m => sheetName.toLowerCase().includes(m.toLowerCase()));
    if (!isMonthly) return;

    const sheet = workbook.Sheets[sheetName];
    // Read raw data to find headers
    const rawData = XLSX.utils.sheet_to_json<any[][]>(sheet, { header: 1 });
    
    let headerRowIndex = -1;
    let headers: string[] = [];

    // Find the row that actually contains 'County' as the first or second column
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row) continue;
      const firstCol = String(row[0] || '').trim().toLowerCase();
      if (firstCol === 'county') {
        headerRowIndex = i;
        headers = row.map(h => String(h || '').trim());
        break;
      }
    }

    if (headerRowIndex === -1) return; // Could not determine schema for this sheet

    // Parse the actual data rows beneath the header
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[0]) continue;
      
      const county = String(row[0]).trim();
      if (county.toLowerCase() === 'total' || county === '') continue; // Skip footer totals

      const record: MacroTrendRecord = {
        month: sheetName,
        county: county.replace(/[^a-zA-Z\s]/g, '').trim() // Clean random Florida artifacts
      };

      // Map metrics based on the discovered headers
      for (let col = 1; col < headers.length; col++) {
        const headerName = headers[col];
        if (!headerName) continue;
        
        let val = row[col];
        if (val !== undefined && val !== null) {
          // Attempt to cast to number if it's numeric
          const numVal = Number(val);
          record[headerName] = isNaN(numVal) ? String(val) : numVal;
        } else {
          record[headerName] = 0;
        }
      }

      results.push(record);
    }
  });

  return results;
}
