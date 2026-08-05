import { describe, it, expect } from 'vitest';
import { queryDuckDBSQL, registerFileInDuckDB } from '@/lib/db/duckdbManager';

describe('DuckDB WASM Integration Suite', () => {
  it('should execute C++ WebAssembly SQL queries correctly', async () => {
    // Basic DuckDB WASM SQL math check
    const rows = await queryDuckDBSQL('SELECT 42 as answer, "DuckDB WASM" as engine');
    expect(rows).toBeDefined();
    expect(rows.length).toBe(1);
    expect(rows[0].answer).toBe(42);
    expect(rows[0].engine).toBe('DuckDB WASM');
  });

  it('should query CSV file buffer registered in WASM memory', async () => {
    const csvContent = "voter_id,name,address,city,state,zip\nMS101,John Doe,123 Main St,Jackson,MS,39201\nMS102,Jane Smith,456 Oak Rd,Jackson,MS,39201";
    const encoder = new TextEncoder();
    await registerFileInDuckDB("test_voters.csv", encoder.encode(csvContent));

    const rows = await queryDuckDBSQL("SELECT * FROM 'test_voters.csv' WHERE state = 'MS'");
    expect(rows.length).toBe(2);
    expect(rows[0].name).toBe('John Doe');
  });
});
