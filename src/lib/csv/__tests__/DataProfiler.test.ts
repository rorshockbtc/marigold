import { describe, it, expect } from 'vitest';
import { profileDatasetRows } from '../DataProfiler';

describe('DataProfiler', () => {
  it('should abstract a dataset and remove all PII', () => {
    const rawData = [
      { 
        "Voter ID Number": "123456789", 
        "Full Name": "John Doe", 
        "DA20": "10/24/2020",
        "Res_Address": "123 Main St",
        "ZIP": "39201",
        "NCOA": "Y"
      }
    ];

    const profile = profileDatasetRows(rawData);
    
    // Ensure no PII made it through
    const jsonStr = JSON.stringify(profile);
    expect(jsonStr).not.toContain("John Doe");
    expect(jsonStr).not.toContain("123 Main St");
    expect(jsonStr).not.toContain("123456789");

    // Ensure structural profile is correct
    expect(profile).toContainEqual({
      column: "Voter ID Number",
      type: "ID/Number",
      format: "9-digit String"
    });

    expect(profile).toContainEqual({
      column: "DA20",
      type: "Date",
      format: "MM/DD/YYYY"
    });

    expect(profile).toContainEqual({
      column: "Full Name",
      type: "String",
      format: "Capitalized/General String"
    });

    expect(profile).toContainEqual({
      column: "Res_Address",
      type: "Address",
      format: "Alphanumeric String with leading numbers"
    });

    expect(profile).toContainEqual({
      column: "ZIP",
      type: "ZipCode/Number",
      format: "5-digit String"
    });
    
    expect(profile).toContainEqual({
      column: "NCOA",
      type: "Character",
      format: "Single Character"
    });
  });
});
