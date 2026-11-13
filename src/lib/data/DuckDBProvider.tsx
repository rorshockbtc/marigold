"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

// Using jsdelivr to avoid Next.js Webpack WASM compilation issues
const JSDELIVR_BUNDLES = {
  mvp: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-mvp.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-mvp.worker.js',
  },
  eh: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-eh.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js',
  },
};

export function normalizeDuckDBValue(val: any): any {
  if (typeof val === 'bigint') {
    return val <= BigInt(Number.MAX_SAFE_INTEGER) && val >= BigInt(Number.MIN_SAFE_INTEGER)
      ? Number(val)
      : val.toString();
  }
  if (val === null || val === undefined || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(normalizeDuckDBValue);
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    out[k] = normalizeDuckDBValue(v);
  }
  return out;
}

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  isReady: boolean;
  query: (sql: string) => Promise<any[]>;
  registerFileHandle: (fileName: string, file: File) => Promise<void>;
  mountCsvTextAsDataFile: (fileName: string, csvText: string) => Promise<{ rowCount: number; schema: any[] }>;
}

const DuckDBContext = createContext<DuckDBContextType | undefined>(undefined);

export function DuckDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let activeDb: duckdb.AsyncDuckDB | null = null;
    let activeConn: duckdb.AsyncDuckDBConnection | null = null;

    async function initializeDuckDB() {
      try {
        // Select bundle based on browser features
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        
        // Instantiate Web Worker
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();
        
        activeDb = new duckdb.AsyncDuckDB(logger, worker);
        await activeDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
        
        // Open a connection
        activeConn = await activeDb.connect();
        
        setDb(activeDb);
        setConn(activeConn);
        setIsReady(true);
        console.log("🦆 DuckDB-WASM initialized via Web Worker.");
      } catch (err) {
        console.error("Failed to initialize DuckDB-WASM:", err);
      }
    }

    initializeDuckDB();

    return () => {
      // Cleanup connection on unmount
      if (activeConn) activeConn.close();
      if (activeDb) activeDb.terminate();
    };
  }, []);

  const query = async (sql: string): Promise<any[]> => {
    if (!conn) throw new Error("DuckDB Connection not ready");
    const result = await conn.query(sql);
    // Convert Apache Arrow Table to standard JS Array of Objects (BigInt-safe)
    return result.toArray().map(row => normalizeDuckDBValue(row.toJSON()));
  };

  const registerFileHandle = async (fileName: string, file: File) => {
    if (!db) throw new Error("DuckDB not ready");
    await db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    console.log(`Registered local file zero-copy: ${fileName}`);
  };

  const mountCsvTextAsDataFile = async (
    fileName: string,
    csvText: string
  ): Promise<{ rowCount: number; schema: any[] }> => {
    if (!db || !conn) throw new Error("DuckDB not ready");
    await db.registerFileText(fileName, csvText);
    const safeName = fileName.replace(/'/g, "''");
    await conn.query(`CREATE OR REPLACE TABLE data_file AS SELECT * FROM read_csv_auto('${safeName}');`);
    const schema = await query('DESCRIBE data_file;');
    const cntRows = await query('SELECT COUNT(*) AS cnt FROM data_file;');
    const rowCount = Number(cntRows[0]?.cnt ?? 0);
    return { rowCount, schema };
  };

  return (
    <DuckDBContext.Provider value={{ db, conn, isReady, query, registerFileHandle, mountCsvTextAsDataFile }}>
      {children}
    </DuckDBContext.Provider>
  );
}

export function useDuckDB() {
  const context = useContext(DuckDBContext);
  if (!context) {
    throw new Error('useDuckDB must be used within a DuckDBProvider');
  }
  return context;
}
