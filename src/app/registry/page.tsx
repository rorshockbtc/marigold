"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function StateRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const states = [
    // Northeast / Mid-Atlantic
    { state: "Connecticut", region: "Northeast", status: "Standard Column Layout", format: "CSV / TXT", cost: "$300 Statewide", notes: "Standard centralized voter list. Fully compatible with browser in-memory parsing.", link: "https://portal.ct.gov/sots" },
    { state: "Delaware", region: "Northeast", status: "Public Schema Ready", format: "TXT", cost: "Free / Public Request", notes: "Clean flat file export. Excellent fit for local memory filtering.", link: "https://elections.delaware.gov/" },
    { state: "Maine", region: "Northeast", status: "Public Schema Ready", format: "CSV", cost: "Free / Public Request", notes: "Requires standard data use agreement. Easily chunked by browser processing.", link: "https://www.maine.gov/sos/cec/elec/" },
    { state: "Maryland", region: "Northeast", status: "Standard Column Layout", format: "CSV", cost: "$125 Statewide", notes: "High data hygiene standards. Compatible with NCOA cross-verification.", link: "https://elections.maryland.gov/" },
    { state: "Massachusetts", region: "Northeast", status: "Standard Column Layout", format: "TXT / CSV", cost: "Free Online Portal", notes: "Comprehensive municipal VRIS export. Zero cloud upload required.", link: "https://www.sec.state.ma.us/ele/" },
    { state: "New Hampshire", region: "Northeast", status: "Custom Mapping Needed", format: "CSV", cost: "$25 Flat Fee", notes: "Town-by-town or statewide snapshot available upon public request.", link: "https://www.sos.nh.gov/elections" },
    { state: "New Jersey", region: "Northeast", status: "Public Schema Ready", format: "CSV / CD", cost: "$100 Statewide", notes: "Standardized statewide SVRS format. High-speed local traversal ready.", link: "https://nj.gov/state/elections/" },
    { state: "New York", region: "Northeast", status: "Standard Column Layout", format: "CSV / TXT", cost: "Free Download", notes: "Massive statewide database (~13M rows). Recommended for chunked client memory indexing.", link: "https://elections.ny.gov/" },
    { state: "Pennsylvania", region: "Northeast", status: "Standard Column Layout", format: "TXT (SURE System)", cost: "$20 Statewide", notes: "Full SURE extract available. High priority for FY26 FEMA HSGP grant alignment.", link: "https://www.dos.pa.gov/VotingElections/" },
    { state: "Rhode Island", region: "Northeast", status: "Public Schema Ready", format: "CSV", cost: "Free / Public Request", notes: "Compact state dataset parses rapidly in client computer RAM.", link: "https://vote.sos.ri.gov/" },
    { state: "Vermont", region: "Northeast", status: "Custom Mapping Needed", format: "CSV", cost: "Free Download", notes: "Public statewide snapshot available directly from SOS portal.", link: "https://sos.vermont.gov/elections/" },
    { state: "District of Columbia", region: "Northeast", status: "Standard Column Layout", format: "CSV", cost: "Free Request", notes: "Single municipal jurisdiction. Instant client-side verification.", link: "https://dcboe.org/" },

    // Southeast / Gulf
    { state: "Alabama", region: "Southeast", status: "Public Schema Ready", format: "CSV / Excel", cost: "Varies by County / $1 per precinct", notes: "Clean standard structure. Ideal for local micro-purchase county rollout.", link: "https://www.sos.alabama.gov/alabama-votes" },
    { state: "Arkansas", region: "Southeast", status: "Custom Mapping Needed", format: "CSV", cost: "$500 Statewide", notes: "Standard column layout. Easily ingested via browser file reader.", link: "https://www.sos.arkansas.gov/elections" },
    { state: "Florida", region: "Southeast", status: "Standard Column Layout", format: "TXT / TSV", cost: "Free Public Request", notes: "Public records exemption filtering required. Monthly snapshots available.", link: "https://dos.fl.gov/elections/data-statistics/" },
    { state: "Georgia", region: "Southeast", status: "Standard Column Layout", format: "CSV (Standardized)", cost: "$250 Statewide CD", notes: "Requires column header aliasing for precinct IDs. High priority for FEMA HSGP pilot.", link: "https://sos.ga.gov/page/order-voter-registration-lists-and-files" },
    { state: "Kentucky", region: "Southeast", status: "Public Schema Ready", format: "TXT", cost: "$150 Statewide", notes: "Regular weekly refreshes. High mobility cross-check compatible.", link: "https://elect.ky.gov/" },
    { state: "Louisiana", region: "Southeast", status: "Custom Mapping Needed", format: "CSV", cost: "$5,000 Statewide", notes: "Strict data privacy affidavits required prior to purchase.", link: "https://www.sos.la.gov/ElectionsAndVoting/" },
    { state: "Mississippi", region: "Southeast", status: "Standard Column Layout", format: "CSV / TXT (Pipe-delimited)", cost: "Free / Public Request", notes: "Supports 82 counties. NCOA and National Change of Address schemas fully mapped.", link: "https://www.sos.ms.gov/elections-voting/" },
    { state: "North Carolina", region: "Southeast", status: "Standard Column Layout", format: "TXT / CSV (Public Snapshot)", cost: "Free Download", notes: "Massive weekly exports (~5M rows). Recommended for client-side processing.", link: "https://www.ncsbe.gov/results-data/voter-registration-data" },
    { state: "South Carolina", region: "Southeast", status: "Custom Mapping Needed", format: "TXT", cost: "$2,500 Statewide", notes: "Higher acquisition cost; recommend county-by-county micro-purchases.", link: "https://scvotes.gov/" },
    { state: "Tennessee", region: "Southeast", status: "Public Schema Ready", format: "CSV", cost: "Free online request", notes: "Standard CSV layout. Easily processed via client memory.", link: "https://sos.tn.gov/elections" },
    { state: "Virginia", region: "Southeast", status: "Standard Column Layout", format: "CSV", cost: "Free / Non-Profit Request", notes: "ELECT centralized database. High-speed duplicate matching supported.", link: "https://www.elections.virginia.gov/" },
    { state: "West Virginia", region: "Southeast", status: "Custom Mapping Needed", format: "CSV", cost: "$500 Statewide", notes: "Standard SVRS extract. Easily mapped in Data Prep module.", link: "https://sos.wv.gov/elections/" },

    // Midwest
    { state: "Illinois", region: "Midwest", status: "Standard Column Layout", format: "CSV / TXT", cost: "Free State Board Request", notes: "Large statewide roll (~8M rows). Zero cloud storage ensures complete privacy.", link: "https://www.elections.il.gov/" },
    { state: "Indiana", region: "Midwest", status: "Public Schema Ready", format: "CSV", cost: "$5,000 Statewide", notes: "Recommend county-level micro-purchase deployments beneath RFP threshold.", link: "https://www.in.gov/sos/elections/" },
    { state: "Iowa", region: "Midwest", status: "Public Schema Ready", format: "CSV", cost: "Free Download", notes: "Clean header schema. Instant verification checklist generation.", link: "https://sos.iowa.gov/elections/" },
    { state: "Kansas", region: "Midwest", status: "Custom Mapping Needed", format: "CSV", cost: "$200 Statewide", notes: "Centralized ELVIS system export. High compatibility.", link: "https://sos.ks.gov/elections/" },
    { state: "Michigan", region: "Midwest", status: "Standard Column Layout", format: "CSV", cost: "Free Download (FOIA)", notes: "Comprehensive statewide Qualified Voter File (QVF) public snapshot.", link: "https://www.michigan.gov/sos/elections" },
    { state: "Minnesota", region: "Midwest", status: "Standard Column Layout", format: "CSV", cost: "$46 Statewide", notes: "Multi-family occupancy cartridge pre-configured for high-density network checks.", link: "https://www.sos.state.mn.us/elections-voting/" },
    { state: "Missouri", region: "Midwest", status: "Public Schema Ready", format: "CSV", cost: "Free Online Request", notes: "MCVR export format. High priority for discretionary pilot tier.", link: "https://www.sos.mo.gov/elections/" },
    { state: "Nebraska", region: "Midwest", status: "Custom Mapping Needed", format: "CSV", cost: "Free Download", notes: "Standardized statewide file available via public request.", link: "https://sos.nebraska.gov/elections/" },
    { state: "North Dakota", region: "Midwest", status: "Custom Mapping Needed", format: "TXT", cost: "Free Portal Access", notes: "Unique North Dakota central voter index format. Mapping in progress.", link: "https://vip.sos.nd.gov/" },
    { state: "Ohio", region: "Midwest", status: "Standard Column Layout", format: "CSV", cost: "Free Download", notes: "County-by-county or statewide split files available directly from SOS portal.", link: "https://www.ohiosos.gov/elections/voters/" },
    { state: "South Dakota", region: "Midwest", status: "Custom Mapping Needed", format: "CSV", cost: "$2,500 Statewide", notes: "Clean CSV format. Ideal for local laptop compute execution.", link: "https://sdsos.gov/elections-voting/" },
    { state: "Wisconsin", region: "Midwest", status: "Standard Column Layout", format: "CSV / BadgerBook", cost: "$12,500 Statewide / $25 per county", notes: "Recommend acquiring specific county targets via $1,500 micro-purchases.", link: "https://elections.wi.gov/data-reports" },

    // Southwest
    { state: "Arizona", region: "Southwest", status: "Standard Column Layout", format: "TXT / CSV", cost: "Varies by County", notes: "County-level decentralized lists. Perfect fit for county clerk 1-on-1 setup.", link: "https://azsos.gov/elections" },
    { state: "Nevada", region: "Southwest", status: "Standard Column Layout", format: "CSV", cost: "Free / Public Portal", notes: "Regular weekly refreshes. High mobility state requires frequent NCOA checks.", link: "https://www.nvsos.gov/sos/elections" },
    { state: "New Mexico", region: "Southwest", status: "Public Schema Ready", format: "CSV", cost: "Free Public Request", notes: "SERVIS database snapshot. Easily mapped to Marigold standard schema.", link: "https://www.sos.nm.gov/voting-and-elections/" },
    { state: "Oklahoma", region: "Southwest", status: "Standard Column Layout", format: "CSV / ZIP", cost: "Free Online Request", notes: "Clean header structure. Ready for local-compute cartridge testing.", link: "https://oklahoma.gov/elections/" },
    { state: "Texas", region: "Southwest", status: "Standard Column Layout", format: "Fixed-Width / CSV", cost: "Varies by County / Statewide Request", notes: "Requires residency affidavit. High priority for discretionary pilot deployments.", link: "https://www.sos.state.tx.us/elections/" },

    // Mountain & Northwest
    { state: "Colorado", region: "Mountain", status: "Standard Column Layout", format: "CSV", cost: "Free Download", notes: "SCORE statewide voter registration database. Excellent schema cleanliness.", link: "https://www.sos.state.co.us/pubs/elections/" },
    { state: "Idaho", region: "Mountain", status: "Custom Mapping Needed", format: "CSV", cost: "Free Request", notes: "Standard CSV layout. Fast local execution in web worker.", link: "https://sos.idaho.gov/elections-division/" },
    { state: "Montana", region: "Mountain", status: "Custom Mapping Needed", format: "CSV", cost: "Free Download", notes: "ElectMT public voter extract. Fully compatible.", link: "https://sosmt.gov/elections/" },
    { state: "Utah", region: "Mountain", status: "Public Schema Ready", format: "CSV", cost: "$1,050 Statewide", notes: "VISTA central database. Fast client memory traversal.", link: "https://vote.utah.gov/" },
    { state: "Wyoming", region: "Mountain", status: "Standard Column Layout", format: "CSV", cost: "Free Public Request", notes: "Home state of Colon Hyphen Bracket LLC. WyoReg schema fully mapped.", link: "https://sos.wyo.gov/Elections/" },

    // West / Pacific
    { state: "Alaska", region: "West", status: "Custom Mapping Needed", format: "CSV", cost: "$20 Flat Fee", notes: "Statewide public list. Compact file size parses instantly.", link: "https://www.elections.alaska.gov/" },
    { state: "California", region: "West", status: "Standard Column Layout", format: "TSV / CSV (VoteCal)", cost: "Free / Qualified Request", notes: "Massive VoteCal database (~22M rows). Client-side memory indexing recommended.", link: "https://www.sos.ca.gov/elections" },
    { state: "Hawaii", region: "West", status: "Custom Mapping Needed", format: "CSV", cost: "$150 Statewide", notes: "Office of Elections standard export. Easily mapped.", link: "https://elections.hawaii.gov/" },
    { state: "Oregon", region: "West", status: "Standard Column Layout", format: "TXT / CSV", cost: "$500 Statewide", notes: "OCVR centralized database. Excellent adherence to standardized data definitions.", link: "https://sos.oregon.gov/voting/" },
    { state: "Washington", region: "West", status: "Standard Column Layout", format: "TXT / CSV (VRDB)", cost: "Free Download", notes: "Public VRDB snapshot refreshed weekly. Zero cloud exposure required.", link: "https://www.sos.wa.gov/elections" }
  ];

  const filteredStates = states.filter(s => {
    const matchesSearch = s.state.toLowerCase().includes(searchTerm.toLowerCase()) || s.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "All" || s.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const getStatusBadge = (status: string) => {
    if (status === "Standard Column Layout") {
      return <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs px-2.5 py-1 rounded">Standard Column Layout</span>;
    }
    if (status === "Public Schema Ready") {
      return <span className="bg-sky-50 text-sky-800 border border-sky-300 font-bold text-xs px-2.5 py-1 rounded">Public Schema Ready</span>;
    }
    return <span className="bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs px-2.5 py-1 rounded">Custom Mapping Needed</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 font-sans">
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-primary text-white font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider mb-2 shadow-sm">
            50-State Nationwide Readiness
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-primary">National State Data Registry</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-3xl leading-relaxed">
            Official acquisition parameters, file formats, and column structure compatibility across all 50 states and jurisdictions. Completely non-partisan and platform-neutral. Note: Marigold does not ingest or store state data; readiness indicates column header compatibility with our local processing engine.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-xl border border-border shadow-sm">
          <input 
            type="text" 
            placeholder="Search state or note..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-border rounded text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-accent"
          />
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-100 border border-border rounded px-3 py-1.5 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="All">All Regions (51 Listed)</option>
            <option value="Northeast">Northeast / Mid-Atlantic</option>
            <option value="Southeast">Southeast / Gulf</option>
            <option value="Midwest">Midwest / Plains</option>
            <option value="Southwest">Southwest (AZ, NM, NV, OK, TX)</option>
            <option value="Mountain">Mountain & Northwest (CO, ID, MT, UT, WY)</option>
            <option value="West">West / Pacific (AK, CA, HI, OR, WA)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <span className="font-serif font-bold text-base text-primary">Jurisdiction Index ({filteredStates.length} Listed)</span>
          <span className="text-xs bg-slate-200 text-slate-800 px-3 py-1 rounded font-bold uppercase tracking-wider">Local-Compute Compatible</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-100/60 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <th className="p-4">State</th>
                <th className="p-4">Column Compatibility</th>
                <th className="p-4">File Format</th>
                <th className="p-4">Acquisition Cost</th>
                <th className="p-4">Technical Notes</th>
                <th className="p-4 text-right">Official Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-normal">
              {filteredStates.map((s) => (
                <tr key={s.state} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-serif font-bold text-primary flex items-center gap-2">
                    <span>{s.state}</span>
                    <span className="text-[10px] font-mono font-normal bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{s.region}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{getStatusBadge(s.status)}</td>
                  <td className="p-4 font-mono text-xs text-slate-700 font-medium">{s.format}</td>
                  <td className="p-4 font-bold text-slate-800">{s.cost}</td>
                  <td className="p-4 text-slate-600 text-xs max-w-xs leading-relaxed">{s.notes}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <a 
                      href={s.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-accent hover:text-amber-700 font-bold underline text-xs"
                    >
                      Access Data →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
        <div className="space-y-2 max-w-2xl">
          <h3 className="font-serif font-bold text-2xl flex items-center gap-2">Universal Schema Mapping</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Because Marigold Insights operates strictly in client-side memory, supporting any state across the political spectrum requires zero backend restructuring or database ingestion. Simply download your jurisdiction&apos;s official spreadsheet and use our <strong className="text-white font-bold underline">Data Prep</strong> mapping tool to generate your county&apos;s custom header schema in minutes.
          </p>
        </div>
        <Link href="/data-prep" className="bg-accent hover:bg-amber-600 text-white font-bold text-sm px-6 py-3.5 rounded-lg shadow whitespace-nowrap transition-all">
          Map New State Schema →
        </Link>
      </div>
    </div>
  );
}
