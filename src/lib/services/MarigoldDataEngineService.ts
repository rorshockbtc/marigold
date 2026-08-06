import { getActiveDatabaseName, isDemoGroupActive, openActiveDatabase } from "@/lib/db/dbName";
import { normalizeRowWithMapping, interpretColumnMappings } from "@/lib/csv/universalMapper";
import { getDirectoryHandle, writeStructuredFile, readStructuredFile } from "@/lib/fs/LocalFSManager";

export interface AuditSweepResults {
  groupId: string;
  timestamp: string;
  totalScanned: number;
  anomalyRecords: Record<string, Array<Record<string, any>>>;
  severityCounts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    INFO: number;
  };
}

export class MarigoldDataEngineService {
  private static memoryCache: Map<string, AuditSweepResults> = new Map();

  /**
   * Resolves valid IndexedDB store name dynamically ('rows', 'records', 'VoterRolls')
   */
  public static getValidStoreName(db: IDBDatabase): string {
    if (db.objectStoreNames.contains("rows")) return "rows";
    if (db.objectStoreNames.contains("records")) return "records";
    if (db.objectStoreNames.contains("VoterRolls")) return "VoterRolls";
    if (db.objectStoreNames.length > 0) return db.objectStoreNames[0];
    return "rows";
  }

  /**
   * Reads persistent audit topology from Marigold_Local disk handle FIRST, falling back to IndexedDB
   */
  public static async getPersistentAuditMap(groupId: string): Promise<AuditSweepResults | null> {
    const slug = groupId.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Tier 1: Check Memory Singleton Cache (0ms)
    if (this.memoryCache.has(slug)) {
      return this.memoryCache.get(slug)!;
    }

    // Tier 2: Check Marigold_Local Disk Handle
    try {
      const rootHandle = await getDirectoryHandle(slug);
      if (rootHandle) {
        const diskContent = await readStructuredFile(rootHandle, "Data_Stories", `AUDIT_MAP_${slug}.json`);
        if (diskContent) {
          const parsed: AuditSweepResults = JSON.parse(diskContent);
          this.memoryCache.set(slug, parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read audit map from Marigold_Local disk handle:", e);
    }

    // Tier 3: Check IndexedDB AuditCacheStore (< 5ms)
    try {
      const dbName = getActiveDatabaseName(groupId);
      const db = await openActiveDatabase(dbName);
      if (db.objectStoreNames.contains("AuditCacheStore")) {
        const tx = db.transaction(["AuditCacheStore"], "readonly");
        const store = tx.objectStore("AuditCacheStore");
        const req = store.get(slug);
        const result = await new Promise<AuditSweepResults | null>((resolve) => {
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
        db.close();
        if (result) {
          this.memoryCache.set(slug, result);
          return result;
        }
      } else {
        db.close();
      }
    } catch (e) {
      console.warn("Could not read audit map from IndexedDB AuditCacheStore:", e);
    }

    return null;
  }

  /**
   * Saves audit topology permanently to Marigold_Local disk handle AND IndexedDB AuditCacheStore
   */
  public static async savePersistentAuditMap(groupId: string, sweepData: AuditSweepResults): Promise<void> {
    const slug = groupId.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Tier 1: Update Memory Singleton Cache
    this.memoryCache.set(slug, sweepData);

    // Tier 2: Save to IndexedDB AuditCacheStore (No 5MB limit!)
    try {
      const dbName = getActiveDatabaseName(groupId);
      const db = await openActiveDatabase(dbName);
      if (!db.objectStoreNames.contains("AuditCacheStore")) {
        const currentVersion = db.version;
        db.close();
        const upgradeReq = indexedDB.open(dbName, currentVersion + 1);
        upgradeReq.onupgradeneeded = (evt) => {
          const upDb = (evt.target as IDBOpenDBRequest).result;
          if (!upDb.objectStoreNames.contains("AuditCacheStore")) {
            upDb.createObjectStore("AuditCacheStore");
          }
        };
        const upDb = await new Promise<IDBDatabase>((resolve) => {
          upgradeReq.onsuccess = () => resolve(upgradeReq.result);
        });
        const tx = upDb.transaction(["AuditCacheStore"], "readwrite");
        tx.objectStore("AuditCacheStore").put(sweepData, slug);
        tx.oncomplete = () => upDb.close();
      } else {
        const tx = db.transaction(["AuditCacheStore"], "readwrite");
        tx.objectStore("AuditCacheStore").put(sweepData, slug);
        tx.oncomplete = () => db.close();
      }
    } catch (e) {
      console.warn("Could not write audit map to IndexedDB AuditCacheStore:", e);
    }

    // Tier 3: Save to Marigold_Local/Data_Stories/AUDIT_MAP_[slug].json on disk
    try {
      const rootHandle = await getDirectoryHandle(slug);
      if (rootHandle) {
        await writeStructuredFile(
          rootHandle,
          "Data_Stories",
          `AUDIT_MAP_${slug}.json`,
          JSON.stringify(sweepData, null, 2)
        );
      }
    } catch (e) {
      console.warn("Could not write audit map to Marigold_Local disk handle:", e);
    }
  }

  /**
   * High-Speed Native store.getAll() Batch Sweep Engine (< 2 seconds)
   */
  public static async executeNative360Sweep(
    groupId: string,
    countyFilter: string = "",
    threshold: number = 8,
    onProgress?: (pct: number) => void
  ): Promise<AuditSweepResults> {
    if (onProgress) onProgress(10);
    const dbName = getActiveDatabaseName(groupId);
    const db = await openActiveDatabase(dbName);
    const storeName = this.getValidStoreName(db);

    const tx = db.transaction([storeName], "readonly");
    const store = tx.objectStore(storeName);

    if (onProgress) onProgress(30);
    const getAllReq = store.getAll();

    const allRecords: any[] = await new Promise((resolve, reject) => {
      getAllReq.onsuccess = () => resolve(getAllReq.result || []);
      getAllReq.onerror = () => reject(getAllReq.error);
    });

    db.close();
    if (onProgress) onProgress(60);

    const addressCounts = new Map<string, { count: number; sample: any; residents: any[] }>();
    const dateCounts = new Map<string, { count: number; sample: any; residents: any[] }>();
    const dupMap = new Map<string, { count: number; sample: any; addrs: Set<string> }>();
    const ncoaList: Array<Record<string, any>> = [];
    const phantomList: Array<Record<string, any>> = [];

    const benfordsLawCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
    let benfordsTotal = 0;

    let activeMapping: any = null;
    try {
      const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
      if (savedMap) activeMapping = JSON.parse(savedMap);
    } catch (err) {}

    if (allRecords.length > 0 && !activeMapping) {
      const sampleVal = allRecords[0];
      const sampleRaw = sampleVal.data !== undefined && typeof sampleVal.data === 'object' && sampleVal.data !== null ? sampleVal.data : sampleVal;
      activeMapping = interpretColumnMappings(Object.keys(sampleRaw));
    }

    const filterCounty = (countyFilter || '').toLowerCase();
    const totalCount = allRecords.length;

    for (let i = 0; i < totalCount; i++) {
      if (i % 200000 === 0 && onProgress) {
        onProgress(60 + Math.floor((i / Math.max(1, totalCount)) * 35));
      }

      const val = allRecords[i];
      const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
      const std = normalizeRowWithMapping(raw, activeMapping);
      const rCounty = std.county || 'Statewide';
      const statusStr = String(std.status || '').trim().toUpperCase();
      const isInactive = statusStr === 'I' || statusStr === 'INACTIVE' || statusStr === 'C' || statusStr === 'CANCELLED' || statusStr === 'PURGED' || statusStr === 'DECEASED';

      if (!filterCounty || rCounty.toLowerCase().includes(filterCounty)) {
        if (!isInactive) {
          const addr = std.address;
          if (addr) {
            const existing = addressCounts.get(addr);
            if (existing) {
              existing.count++;
              if (existing.residents) {
                existing.residents.push({ name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, id: std.voter_id, date: std.date_registered, city: std.city, state: std.state, zip: std.zip });
              }
            } else {
              addressCounts.set(addr, {
                count: 1,
                sample: { voter_id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
                residents: [{ name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, id: std.voter_id, date: std.date_registered }]
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
                sample: { voter_id: std.voter_id, name: `Surge Cohort (${std.date_registered})`, address: `Registered on ${std.date_registered}`, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
                residents: [{ name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, id: std.voter_id }]
              });
            }
          }

          if (!std.precinct_code || std.precinct_code === '0' || std.precinct_code.toUpperCase() === 'UNASSIGNED') {
            phantomList.push({
              id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: 'Missing mandatory precinct assignment.', raw: std.raw
            });
          }

          const homeState = (std.state || 'MS').trim().toUpperCase();
          const mailState = String(std.raw?.mail_state || std.raw?.MAIL_ST || std.raw?.mailing_state || std.raw?.MAIL_STATE || '').trim().toUpperCase();
          const ncoaFlagStr = String(std.ncoa_flag || '').trim().toUpperCase();
          const isExplicitNcoa = ncoaFlagStr === 'Y' || ncoaFlagStr === 'YES' || ncoaFlagStr === 'TRUE';
          const isOutStateMail = mailState.length === 2 && mailState !== homeState && mailState !== 'MS' && mailState !== 'NO' && mailState !== 'NA';
          if (isExplicitNcoa || isOutStateMail) {
            ncoaList.push({
              id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: `Out-of-state relocation/mailing detected: ${mailState || 'NCOA Flagged'}`, raw: std.raw
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
                sample: { voter_id: std.voter_id, name: std.name, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
                addrs: new Set(std.address ? [std.address] : [])
              });
            }
          }
        }
      }
    }

    const resultMap: Record<string, Array<Record<string, any>>> = {};

    const densityResults: Array<Record<string, any>> = [];
    for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
      if (count >= threshold) {
        densityResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: count > 20 ? 'CRITICAL' : 'HIGH', details: `${count} voters registered at this address.`, raw: sample.raw, residentCluster: residents });
      }
    }
    resultMap['density'] = densityResults.sort((a, b) => b.occupant_count - a.occupant_count);
    resultMap['out-of-state-mailing'] = ncoaList;

    const poBoxResults: Array<Record<string, any>> = [];
    for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
      const upper = addr.toUpperCase();
      if (upper.includes('PO BOX') || upper.includes('P O BOX') || upper.includes('P.O. BOX') || upper.includes('UPS STORE') || upper.includes('PMB') || upper.includes('FEDEX')) {
        poBoxResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'CRITICAL', details: 'Commercial P.O. Box or shipping drop listed as residential domicile.', raw: sample.raw, residentCluster: residents });
      }
    }
    resultMap['po-box'] = poBoxResults;

    const dupResults: Array<Record<string, any>> = [];
    for (const [key, { count, sample, addrs }] of dupMap.entries()) {
      if (count > 1 && addrs.size > 1) {
        dupResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Intra-county duplicate name/zip across ${addrs.size} addresses.`, raw: sample.raw });
      }
    }
    resultMap['duplicates'] = dupResults;

    const spikeResults: Array<Record<string, any>> = [];
    for (const [regDate, { count, sample, residents }] of dateCounts.entries()) {
      if (count >= 50) {
        spikeResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Single-day registration surge: ${count} voters registered on ${regDate}.`, raw: sample.raw });
      }
    }
    resultMap['spikes'] = spikeResults;
    resultMap['phantom-precincts'] = phantomList;

    resultMap['benfords-law'] = [{
      id: 'BENFORD-SUMMARY',
      name: "Benford's Law Analysis",
      address: `Scanned ${benfordsTotal.toLocaleString()} physical street addresses`,
      city: 'Statewide',
      state: 'MS',
      zip: '',
      county: countyFilter || 'Statewide',
      occupant_count: benfordsTotal,
      risk_level: 'INFO',
      details: `Digit distribution: 1:${Math.round((benfordsLawCounts['1']/Math.max(1, benfordsTotal))*100)}%, 2:${Math.round((benfordsLawCounts['2']/Math.max(1, benfordsTotal))*100)}%, 3:${Math.round((benfordsLawCounts['3']/Math.max(1, benfordsTotal))*100)}% (Expected Benford 1st digit: ~30.1%)`,
      raw: benfordsLawCounts
    }];

    // Compute severity counts for Live Bar Chart Widget
    let critical = 0, high = 0, medium = 0, info = 0;
    Object.values(resultMap).forEach(arr => {
      arr.forEach(r => {
        const lvl = String(r.risk_level || 'HIGH').toUpperCase();
        if (lvl === 'CRITICAL') critical++;
        else if (lvl === 'HIGH') high++;
        else if (lvl === 'MEDIUM') medium++;
        else info++;
      });
    });

    const sweepResults: AuditSweepResults = {
      groupId,
      timestamp: new Date().toISOString(),
      totalScanned: totalCount,
      anomalyRecords: resultMap,
      severityCounts: {
        CRITICAL: critical,
        HIGH: high,
        MEDIUM: medium,
        INFO: info
      }
    };

    // Save permanently to Marigold_Local disk and IndexedDB AuditCacheStore
    await this.savePersistentAuditMap(groupId, sweepResults);

    if (onProgress) onProgress(100);
    return sweepResults;
  }
}
