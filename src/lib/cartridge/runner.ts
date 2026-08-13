import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { MarigoldCartridge } from '../types/cartridge';

export interface CartridgeRunOptions {
  /** The local duckdb connection */
  conn: AsyncDuckDBConnection;
  /** UI State parameters provided by the user (e.g. threshold: 8) */
  userParameters: Record<string, any>;
}

export interface CartridgeResult {
  operationId: string;
  data: any[];
}

/**
 * CartridgeRunner
 * 
 * Safely deserializes a chb.marigold.cartridge.v1 JSON object, 
 * binds parameters using DuckDB Prepared Statements to prevent SQL injection,
 * and executes the queries against the local client-side data.
 */
export async function executeCartridge(
  cartridge: MarigoldCartridge, 
  options: CartridgeRunOptions
): Promise<CartridgeResult[]> {
  
  if (cartridge.schema !== 'chb.marigold.cartridge.v1') {
    throw new Error(`Unsupported cartridge schema: ${cartridge.schema}`);
  }

  const results: CartridgeResult[] = [];

  for (const operation of cartridge.operations) {
    if (operation.type !== 'duckdb-query') {
      console.warn(`Unsupported operation type: ${operation.type}`);
      continue;
    }

    // Prepare the statement to prevent SQL injection
    const stmt = await options.conn.prepare(operation.query);
    
    try {
      // Map the operation's required parameters to the actual values provided by the user/UI.
      // DuckDB-Wasm prepared statements bind using the order of arguments passed to stmt.query()
      const bindValues = operation.parameters.map(paramName => {
        const val = options.userParameters[paramName];
        if (val === undefined) {
          // Fallback to default if defined in the schema
          const def = cartridge.inputs.parameters[paramName]?.default;
          if (def !== undefined) return def;
          throw new Error(`Missing required parameter: ${paramName}`);
        }
        return val;
      });

      // Execute the parameterized query
      const arrowResult = await stmt.query(...bindValues);
      
      // Convert Apache Arrow table to standard JS array of objects
      const data = arrowResult.toArray().map(row => row.toJSON());
      
      results.push({
        operationId: operation.id,
        data
      });
      
    } finally {
      // Always close the prepared statement to prevent memory leaks in WASM
      await stmt.close();
    }
  }

  return results;
}
