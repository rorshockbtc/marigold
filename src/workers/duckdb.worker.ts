import * as duckdb from '@duckdb/duckdb-wasm';
import * as Comlink from 'comlink';

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

export class DuckDBEngine {
  private fileHandles: Map<string, FileSystemFileHandle> = new Map();

  async init() {
    if (db) return;
    try {
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      conn = await db.connect();
      console.log('🦆 DuckDB-Wasm Initialized via Comlink Worker');
    } catch (e) {
      console.error('Failed to init DuckDB:', e);
      throw e;
    }
  }

  async mountFileHandle(fileName: string, handle: FileSystemFileHandle) {
    if (!db) await this.init();
    this.fileHandles.set(fileName, handle);
    await db!.registerFileHandle(fileName, handle, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    console.log(`🦆 Mounted OPFS file: ${fileName}`);
  }

  async query(queryStr: string): Promise<any[]> {
    if (!conn) await this.init();
    const result = await conn!.query(queryStr);
    return result.toArray().map(row => Object.fromEntries(row));
  }

  async getRowCount(fileName: string): Promise<number> {
    const res = await this.query(`SELECT count(*) as cnt FROM read_csv_auto('${fileName}')`);
    return Number(res[0]?.cnt || 0);
  }

  async fetchRows(fileName: string, limit: number, offset: number, searchTerm?: string, columns?: string[]): Promise<{rows: any[], totalMatches: number}> {
    if (!searchTerm) {
      const rows = await this.query(`SELECT * FROM read_csv_auto('${fileName}') LIMIT ${limit} OFFSET ${offset}`);
      const count = await this.getRowCount(fileName);
      return { rows, totalMatches: count };
    } else {
      // Build LIKE query for search
      let whereClause = "";
      if (columns && columns.length > 0) {
        whereClause = "WHERE " + columns.map(c => `CAST("${c}" AS VARCHAR) ILIKE '%${searchTerm.replace(/'/g, "''")}%'`).join(" OR ");
      }
      
      const countRes = await this.query(`SELECT count(*) as cnt FROM read_csv_auto('${fileName}') ${whereClause}`);
      const totalMatches = Number(countRes[0]?.cnt || 0);
      
      const rows = await this.query(`SELECT * FROM read_csv_auto('${fileName}') ${whereClause} LIMIT ${limit} OFFSET ${offset}`);
      return { rows, totalMatches };
    }
  }

  async analyzeData(fileName: string): Promise<any> {
    const totalRows = await this.getRowCount(fileName);
    if (totalRows === 0) return { totalRows: 0, columns: [], sampleData: [] };

    // Get 100 sample rows
    const sampleData = await this.query(`SELECT * FROM read_csv_auto('${fileName}') LIMIT 100`);
    
    // In a real scenario we'd do aggregation in DuckDB, but for speed right now we can do a simplified analysis
    // Or we could run DuckDB queries to get NULL counts and distinct values per column
    
    // Fast path: Just get columns from a single row to mimic IndexedDB signature
    const cols = Object.keys(sampleData[0] || {});
    
    const columnStats = [];
    for (const col of cols) {
        // Query top 5 values using DuckDB natively!
        const top5 = await this.query(`SELECT CAST("${col}" AS VARCHAR) as val, count(*) as cnt FROM read_csv_auto('${fileName}') WHERE "${col}" IS NOT NULL GROUP BY val ORDER BY cnt DESC LIMIT 5`);
        const nullRes = await this.query(`SELECT count(*) as cnt FROM read_csv_auto('${fileName}') WHERE "${col}" IS NULL`);
        const nullCount = Number(nullRes[0]?.cnt || 0);

        columnStats.push({
            name: col,
            type: 'string',
            uniqueValues: top5.length, // approximation
            nullCount: nullCount,
            topValues: top5.map(t => ({ value: String(t.val), count: Number(t.cnt) }))
        });
    }

    return {
        totalRows,
        columns: columnStats,
        sampleData
    };
  }
}

Comlink.expose(new DuckDBEngine());
