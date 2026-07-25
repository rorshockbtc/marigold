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

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  isReady: boolean;
  query: (sql: string) => Promise<any[]>;
  registerFileHandle: (fileName: string, file: File) => Promise<void>;
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
    // Convert Apache Arrow Table to standard JS Array of Objects
    return result.toArray().map(row => row.toJSON());
  };

  const registerFileHandle = async (fileName: string, file: File) => {
    if (!db) throw new Error("DuckDB not ready");
    await db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    console.log(`Registered local file zero-copy: ${fileName}`);
  };

  return (
    <DuckDBContext.Provider value={{ db, conn, isReady, query, registerFileHandle }}>
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
