"use client";

import { useState, useCallback } from "react";
import { getActiveDatabaseName, isDemoGroupActive } from "@/lib/db/dbName";
import { normalizeRowWithMapping, interpretColumnMappings } from "@/lib/csv/universalMapper";

export function useDataQuery() {
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryProgress, setQueryProgress] = useState<number>(0);

  const query = useCallback(
    async (searchTerm: string = "", filters: any[] = [], limit: number = 100): Promise<{ totalMatches: number; rows: any[] }> => {
      setIsQuerying(true);

      const isDemo = isDemoGroupActive();
      const dbName = getActiveDatabaseName();
      const storeName = isDemo ? "VoterRolls" : "records";

      return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName);

        req.onerror = () => {
          setIsQuerying(false);
          reject(req.error);
        };

        req.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            setIsQuerying(false);
            db.close();
            return resolve({ totalMatches: 0, rows: [] });
          }

          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);

          const countReq = store.count();
          countReq.onsuccess = () => {
            const totalMatches = countReq.result || 0;

            const rows: any[] = [];
            const cursorReq = store.openCursor();
            let count = 0;

            let activeMapping: any = null;
            try {
              const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
              if (savedMap) activeMapping = JSON.parse(savedMap);
            } catch (err) {}

            cursorReq.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor && count < limit) {
                const val = cursor.value;
                const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
                
                if (!activeMapping) {
                  activeMapping = interpretColumnMappings(Object.keys(raw));
                }

                const std = normalizeRowWithMapping(raw, activeMapping);
                
                if (!searchTerm || JSON.stringify(std).toLowerCase().includes(searchTerm.toLowerCase())) {
                  rows.push(std);
                  count++;
                }
                cursor.continue();
              } else {
                setIsQuerying(false);
                db.close();
                resolve({ totalMatches, rows });
              }
            };

            cursorReq.onerror = () => {
              setIsQuerying(false);
              db.close();
              reject(cursorReq.error);
            };
          };
        };
      });
    },
    []
  );

  const runAllPlaybooksSweep = useCallback(
    async (countyFilter: string = "", threshold: number = 8): Promise<Record<string, Array<Record<string, any>>>> => {
      setIsQuerying(true);
      setQueryProgress(5);

      const isDemo = isDemoGroupActive();
      const dbName = getActiveDatabaseName();
      const storeName = isDemo ? "VoterRolls" : "records";

      return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName);

        req.onerror = () => {
          setIsQuerying(false);
          reject(req.error);
        };

        req.onsuccess = async (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            setIsQuerying(false);
            db.close();
            return resolve({});
          }

          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);

          const addressCounts = new Map<string, { count: number; sample: any; residents: any[] }>();
          const dateCounts = new Map<string, { count: number; sample: any; residents: any[] }>();
          const dupMap = new Map<string, { count: number; sample: any; addrs: Set<string> }>();
          const ncoaList: Array<Record<string, any>> = [];
          const phantomList: Array<Record<string, any>> = [];
          const typoList: Array<Record<string, any>> = [];

          const benfordsLawCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
          let benfordsTotal = 0;
          let activeMapping: any = null;

          try {
            const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
            if (savedMap) activeMapping = JSON.parse(savedMap);
          } catch (err) {}

          // ULTRA FAST C++ BATCH DESERIALIZATION VIA store.getAll()
          setQueryProgress(20);
          const getAllReq = store.getAll();

          getAllReq.onsuccess = () => {
            setQueryProgress(50);
            const allRecords: any[] = getAllReq.result || [];
            const totalCount = allRecords.length;

            if (totalCount === 0) {
              setIsQuerying(false);
              db.close();
              setQueryProgress(100);
              return resolve({});
            }

            if (allRecords.length > 0 && !activeMapping) {
              const sampleVal = allRecords[0];
              const sampleRaw = sampleVal.data !== undefined && typeof sampleVal.data === 'object' && sampleVal.data !== null ? sampleVal.data : sampleVal;
              activeMapping = interpretColumnMappings(Object.keys(sampleRaw));
            }

            const filterCounty = (countyFilter || '').toLowerCase();

            // FAST SINGLE-PASS SYNCHRONOUS ARRAY LOOP (No async IPC overhead!)
            for (let i = 0; i < totalCount; i++) {
              if (i % 200000 === 0) {
                setQueryProgress(50 + Math.floor((i / totalCount) * 45));
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

                  const fname = std.first_name || '';
                  const lname = std.last_name || '';
                  if ((fname.length === 1 || lname.length === 1) && (fname.length > 0 || lname.length > 0)) {
                    typoList.push({
                      id: std.voter_id, name: std.name || `${fname} ${lname}`, first_name: std.first_name, middle_name: std.middle_name, last_name: std.last_name, suffix: std.suffix, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'MEDIUM', details: 'Clerical 1-character name typo.', raw: std.raw
                    });
                  }
                }
              }
            }

            // Aggregate all 7 playbook results
            const resultMap: Record<string, Array<Record<string, any>>> = {};

            // 1. Density
            const densityResults: Array<Record<string, any>> = [];
            for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
              if (count >= threshold) {
                densityResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: count > 20 ? 'CRITICAL' : 'HIGH', details: `${count} voters registered at this address.`, raw: sample.raw, residentCluster: residents });
              }
            }
            resultMap['density'] = densityResults.sort((a, b) => b.occupant_count - a.occupant_count);

            // 2. Out-of-state mailing
            resultMap['out-of-state-mailing'] = ncoaList;

            // 3. PO Box
            const poBoxResults: Array<Record<string, any>> = [];
            for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
              const upper = addr.toUpperCase();
              if (upper.includes('PO BOX') || upper.includes('P O BOX') || upper.includes('P.O. BOX') || upper.includes('UPS STORE') || upper.includes('PMB') || upper.includes('FEDEX')) {
                poBoxResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: 'CRITICAL', details: 'Commercial P.O. Box or shipping drop listed as residential domicile.', raw: sample.raw, residentCluster: residents });
              }
            }
            resultMap['po-box'] = poBoxResults;

            // 4. Duplicates
            const dupResults: Array<Record<string, any>> = [];
            for (const [key, { count, sample, addrs }] of dupMap.entries()) {
              if (count > 1 && addrs.size > 1) {
                dupResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Intra-county duplicate name/zip across ${addrs.size} addresses.`, raw: sample.raw });
              }
            }
            resultMap['duplicates'] = dupResults;

            // 5. Spikes
            const spikeResults: Array<Record<string, any>> = [];
            for (const [regDate, { count, sample, residents }] of dateCounts.entries()) {
              if (count >= 50) {
                spikeResults.push({ id: sample.voter_id, name: sample.name, first_name: sample.first_name, middle_name: sample.middle_name, last_name: sample.last_name, suffix: sample.suffix, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Single-day registration surge: ${count} voters registered on ${regDate}.`, raw: sample.raw });
              }
            }
            resultMap['spikes'] = spikeResults;

            // 6. Phantom precincts
            resultMap['phantom-precincts'] = phantomList;

            // 7. Benford's Law
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
              details: `Digit distribution: 1:${Math.round((benfordsLawCounts['1']/benfordsTotal)*100)}%, 2:${Math.round((benfordsLawCounts['2']/benfordsTotal)*100)}%, 3:${Math.round((benfordsLawCounts['3']/benfordsTotal)*100)}% (Expected Benford 1st digit: ~30.1%)`,
              raw: benfordsLawCounts
            }];

            setQueryProgress(100);
            setIsQuerying(false);
            db.close();
            resolve(resultMap);
          };

          getAllReq.onerror = () => {
            setIsQuerying(false);
            db.close();
            reject(getAllReq.error);
          };
        };
      });
    },
    []
  );

  const runLocalAudit = useCallback(
    async (ruleType: string, countyFilter: string = "", threshold: number = 8): Promise<Array<Record<string, any>>> => {
      const allSweep = await runAllPlaybooksSweep(countyFilter, threshold);
      return allSweep[ruleType] || [];
    },
    [runAllPlaybooksSweep]
  );

  return {
    isQuerying,
    queryProgress,
    query,
    runLocalAudit,
    runAllPlaybooksSweep,
  };
}
