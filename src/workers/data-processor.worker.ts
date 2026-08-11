import * as Comlink from 'comlink';
import Papa from 'papaparse';
import { interpretColumnMappings, normalizeRowWithMapping } from '@/lib/csv/universalMapper';
import { profileDatasetRows } from '@/lib/csv/DataProfiler';

export class DataProcessorWorker {
  
  async ingestCSVFile(
    file: File, 
    dbName: string, 
    onProgress: (progress: number, rowsParsed: number, message: string) => void
  ) {
    if (!file) throw new Error("No file provided");

    let rowsParsed = 0;
    const totalBytes = file.size;
    let columns: string[] = [];
    let hasError = false;

    // 1. Initialize IndexedDB
    const db = await this.openDatabase(dbName);
    await this.clearDatabase(db);
    onProgress(0, 0, "Initializing IndexedDB Air-Gap...");

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunkSize: 1024 * 1024 * 5, // 5MB chunks
        transformHeader: (h: string) => h.replace(/^\uFEFF/, '').trim(),
        chunk: async (results: Papa.ParseResult<Record<string, unknown>>, parser: Papa.Parser) => {
          if (hasError) return;
          parser.pause(); // Backpressure

          try {
            const chunkData = results.data;
            if (columns.length === 0 && chunkData.length > 0) {
              columns = Object.keys(chunkData[0] as object);
              
              // Run AI profiling on first chunk
              try {
                const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
                const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
                const profile = profileDatasetRows((chunkData as any[]).slice(0, 50));
                fetch('/api/ai-mapper', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ profile }) 
                })
                .then(r => r.json())
                .then(data => {
                  if (data.mapping && !data.error) {
                    localStorage.setItem(`marigold_file_mapping_${slug}`, JSON.stringify(data.mapping));
                  }
                }).catch(() => {});
              } catch (e) {}
            }

            const startIndex = rowsParsed;
            // Write 10,000-row arrays for max DB throughput
            await this.storeChunkBatched(db, chunkData, startIndex, 10000);
            
            rowsParsed += chunkData.length;
            const bytesProcessed = results.meta.cursor || 0;
            const percentComplete = Math.min(99, Math.round((bytesProcessed / totalBytes) * 100));

            onProgress(percentComplete, rowsParsed, `Streaming chunk...`);
            parser.resume();
          } catch (err: any) {
            hasError = true;
            reject(new Error(err.message || "Failed to store chunk"));
            parser.abort();
          }
        },
        complete: () => {
          if (!hasError) {
            onProgress(100, rowsParsed, "Ingestion Complete");
            const mapping = interpretColumnMappings(columns);
            resolve({
              totalRows: rowsParsed,
              columns,
              columnMapping: mapping
            });
          }
        },
        error: (error) => {
          hasError = true;
          reject(new Error(error.message));
        }
      });
    });
  }

  async calculateZScores(values: number[]) {
    if (values.length === 0) return { mean: 0, stdDev: 0 };
    let sum = 0;
    for (let i = 0; i < values.length; i++) sum += values[i];
    const mean = sum / values.length;
    
    let varianceSum = 0;
    for (let i = 0; i < values.length; i++) {
      varianceSum += Math.pow(values[i] - mean, 2);
    }
    const variance = varianceSum / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  async runComprehensiveAudit(
    dbName: string,
    countyFilter: string,
    threshold: number,
    activeMapping: any,
    onProgress: (percent: number) => void
  ): Promise<{ resultMap: Record<string, Array<Record<string, any>>>, totalCount: number }> {
    const db = await this.openDatabase(dbName);

    const totalCount: number = await new Promise((resolve) => {
      const tx = db.transaction(['rows'], 'readonly');
      const countReq = tx.objectStore('rows').count();
      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    });

    if (totalCount === 0) {
      db.close();
      return { resultMap: {}, totalCount: 0 };
    }

    const addressCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
    const dateCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
    const phantomList: Array<Record<string, any>> = [];
    const ncoaList: Array<Record<string, any>> = [];
    const dupMap: Map<string, { count: number; sample: Record<string, any>; addrs: Set<string> }> = new Map();
    const typoList: Array<Record<string, any>> = [];
    const benfordsLawCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
    let benfordsTotal = 0;
    const filterCounty = (countyFilter || '').toLowerCase();

    const processRecord = (val: any) => {
      const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
      if (!activeMapping) {
        activeMapping = interpretColumnMappings(Object.keys(raw));
      }
      const std = normalizeRowWithMapping(raw, activeMapping);
      const rCounty = std.county || 'Statewide';
      const statusStr = String(std.status || '').trim().toUpperCase();
      const isInactive = statusStr === 'I' || statusStr === 'INACTIVE' || statusStr === 'C' || statusStr === 'CANCELLED' || statusStr === 'PURGED' || statusStr === 'DECEASED';

      if (filterCounty && !rCounty.toLowerCase().includes(filterCounty)) return;
      if (isInactive) return;

      const addr = std.address;
      if (addr) {
        const existing = addressCounts.get(addr);
        if (existing) {
          existing.count++;
          existing.residents.push({ name: std.name, id: std.voter_id, date: std.date_registered, city: std.city, state: std.state, zip: std.zip });
        } else {
          addressCounts.set(addr, {
            count: 1,
            sample: { voter_id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
            residents: [{ name: std.name, id: std.voter_id, date: std.date_registered }]
          });
        }

        const match = addr.match(/^[^\d]*([1-9])/);
        if (match) {
          benfordsLawCounts[match[1]]++;
          benfordsTotal++;
        }
      }

      if (std.date_registered) {
        const dExisting = dateCounts.get(std.date_registered);
        if (dExisting) {
          dExisting.count++;
        } else {
          dateCounts.set(std.date_registered, {
            count: 1,
            sample: { voter_id: std.voter_id, name: `Surge Cohort (${std.date_registered})`, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: `Registered on ${std.date_registered}`, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
            residents: [{ name: std.name, id: std.voter_id }]
          });
        }
      }

      if (!std.precinct_code || std.precinct_code === '0' || std.precinct_code.toUpperCase() === 'UNASSIGNED') {
        phantomList.push({
          id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: 'Missing mandatory precinct assignment.', raw: std.raw
        });
      }

      const homeState = (std.state || 'MS').trim().toUpperCase();
      const mailState = String(std.raw?.mail_state || std.raw?.MAIL_ST || std.raw?.mailing_state || std.raw?.MAIL_STATE || '').trim().toUpperCase();
      const ncoaFlagStr = String(std.ncoa_flag || '').trim().toUpperCase();
      const isExplicitNcoa = ncoaFlagStr === 'Y' || ncoaFlagStr === 'YES' || ncoaFlagStr === 'TRUE';
      const isOutStateMail = mailState.length === 2 && mailState !== homeState && mailState !== 'MS' && mailState !== 'NO' && mailState !== 'NA';
      if (isExplicitNcoa || isOutStateMail) {
        ncoaList.push({
          id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'CRITICAL', details: `Flagged for NCOA/Out of State move. Mailing state is ${mailState}.`, raw: std.raw
        });
      }

      const dupFirst = std.first_name || (std.name ? std.name.trim().split(/\s+/)[0] : '');
      const dupLast = std.last_name || (std.name ? std.name.trim().split(/\s+/).pop() : '');
      if (dupFirst && dupLast && std.zip) {
        const dupKey = `${dupFirst.toLowerCase()}|${dupLast.toLowerCase()}|${std.zip}`;
        const dExisting = dupMap.get(dupKey);
        if (dExisting) {
          dExisting.count++;
          if (std.address) dExisting.addrs.add(std.address);
        } else {
          dupMap.set(dupKey, {
            count: 1,
            sample: { voter_id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
            addrs: new Set(std.address ? [std.address] : [])
          });
        }
      }

      const fname = std.first_name || '';
      const lname = std.last_name || '';
      if ((fname.length === 1 || lname.length === 1) && (fname.length > 0 || lname.length > 0)) {
        typoList.push({
          id: std.voter_id, name: std.name || `${fname} ${lname}`, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'MEDIUM', details: 'Potential physical address truncation or malformed record.', raw: std.raw
        });
      }
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['rows'], 'readonly');
      const store = tx.objectStore('rows');
      const req = store.openCursor();
      let processed = 0;

      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          processRecord(cursor.value);
          processed++;
          
          if (processed % 50_000 === 0 && totalCount > 0) {
            onProgress(Math.min(95, Math.floor((processed / totalCount) * 100)));
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      req.onerror = () => reject(req.error);
    });

    db.close();

    const resultMap: Record<string, Array<Record<string, any>>> = {};

    const densityResults: Array<Record<string, any>> = [];
    for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
      if (count >= threshold) {
        densityResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: count > 20 ? 'CRITICAL' : 'HIGH', details: `${count} voters registered at this address.`, raw: sample.raw, residentCluster: residents });
      }
    }
    resultMap['density'] = densityResults.sort((a, b) => b.occupant_count - a.occupant_count);
    resultMap['out-of-state-mailing'] = ncoaList;

    const poBoxResults: Array<Record<string, any>> = [];
    for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
      const upper = addr.toUpperCase();
      if (upper.includes('PO BOX') || upper.includes('P O BOX') || upper.includes('P.O. BOX') || upper.includes('UPS STORE') || upper.includes('PMB') || upper.includes('FEDEX')) {
        poBoxResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'CRITICAL', details: 'Commercial P.O. Box or shipping drop listed as residential domicile.', raw: sample.raw, residentCluster: residents });
      }
    }
    resultMap['po-box'] = poBoxResults;

    const dupResults: Array<Record<string, any>> = [];
    for (const [key, { count, sample, addrs }] of dupMap.entries()) {
      if (count > 1 && addrs.size > 1) {
        dupResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Intra-county duplicate name/zip across ${addrs.size} addresses.`, raw: sample.raw });
      }
    }
    resultMap['duplicates'] = dupResults;

    const spikeResults: Array<Record<string, any>> = [];
    for (const [regDate, { count, sample, residents }] of dateCounts.entries()) {
      if (count >= 50) {
        spikeResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Single-day registration surge: ${count} voters registered on ${regDate}.`, raw: sample.raw });
      }
    }
    resultMap['spikes'] = spikeResults;
    resultMap['phantom-precincts'] = phantomList;

    const benfordResults: Array<Record<string, any>> = [];
    for (let i = 1; i <= 9; i++) {
      const digit = i.toString();
      const actualCount = benfordsLawCounts[digit];
      const actualPercentage = benfordsTotal > 0 ? (actualCount / benfordsTotal) * 100 : 0;
      benfordResults.push({ id: `BENFORD-${digit}`, name: `Leading Digit ${digit}`, address: `Actual: ${actualPercentage.toFixed(1)}%`, city: '', state: '', zip: '', county: '', occupant_count: actualCount, risk_level: 'LOW', details: `Digit ${digit} count: ${actualCount}` });
    }
    resultMap['benfords-law'] = benfordResults;

    onProgress(100);
    return { resultMap, totalCount };
  }

  // IndexedDB Helpers
  private openDatabase(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);

      request.onblocked = () => {
        console.warn(`Worker IndexedDB open for ${dbName} blocked by open tabs`);
      };

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();

        if (!db.objectStoreNames.contains('rows')) {
          const currentVersion = db.version;
          db.close();
          const upgradeReq = indexedDB.open(dbName, currentVersion + 1);
          upgradeReq.onblocked = () => {
            console.warn(`Worker IndexedDB upgrade for ${dbName} blocked`);
          };
          upgradeReq.onupgradeneeded = (e) => {
            const upDb = (e.target as IDBOpenDBRequest).result;
            if (!upDb.objectStoreNames.contains('rows')) {
              upDb.createObjectStore('rows', { autoIncrement: true });
            }
          };
          upgradeReq.onsuccess = () => {
            const upgradedDb = upgradeReq.result;
            upgradedDb.onversionchange = () => upgradedDb.close();
            resolve(upgradedDb);
          };
          upgradeReq.onerror = () => reject(upgradeReq.error);
          return;
        }
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('rows')) {
          db.createObjectStore('rows', { autoIncrement: true });
        }
      };
    });
  }

  private async storeChunkBatched(db: IDBDatabase, data: unknown[], startIndex: number, batchSize: number): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await this.storeBatch(db, batch, startIndex + i);
    }
  }

  private storeBatch(db: IDBDatabase, data: unknown[], startIndex: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rows'], 'readwrite');
      const store = transaction.objectStore('rows');
      const len = data.length;
      for (let i = 0; i < len; i++) {
        store.put({ index: startIndex + i, data: data[i] });
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Transaction aborted"));
    });
  }

  private clearDatabase(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rows'], 'readwrite');
      const store = transaction.objectStore('rows');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

Comlink.expose(new DataProcessorWorker());
