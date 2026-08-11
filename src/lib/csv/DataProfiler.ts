export interface ColumnProfile {
  column: string;
  type: string;
  format: string;
}

function determineFormatAndType(value: string): { type: string, format: string } {
  if (!value) return { type: "Unknown", format: "Empty" };
  
  // Date detection
  if (value.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/)) {
    return { type: "Date", format: "MM/DD/YYYY" };
  }
  if (value.match(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/)) {
    return { type: "Date", format: "YYYY-MM-DD" };
  }

  // Number detection
  if (value.match(/^\d+$/)) {
    if (value.length === 5) return { type: "ZipCode/Number", format: "5-digit String" };
    if (value.length === 9) return { type: "ID/Number", format: "9-digit String" };
    return { type: "Integer", format: "Numeric String" };
  }

  // State detection
  if (value.match(/^[A-Z]{2}$/)) {
    return { type: "State/Code", format: "2-letter Uppercase" };
  }

  // Address detection
  if (value.match(/^\d+\s+[A-Za-z\s]+/)) {
    return { type: "Address", format: "Alphanumeric String with leading numbers" };
  }

  // Single Character (Status, NCOA, etc)
  if (value.length === 1) {
    return { type: "Character", format: "Single Character" };
  }
  
  return { type: "String", format: "Capitalized/General String" };
}

export function profileDatasetRows(rows: any[]): ColumnProfile[] {
  if (rows.length === 0) return [];
  
  const columns = Object.keys(rows[0]);
  const profiles: ColumnProfile[] = [];

  for (const col of columns) {
    // Find first non-empty value for this column
    let sampleValue = "";
    for (const row of rows) {
      if (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== "") {
        sampleValue = String(row[col]).trim();
        break;
      }
    }
    
    profiles.push({
      column: col,
      ...determineFormatAndType(sampleValue)
    });
  }

  return profiles;
}
