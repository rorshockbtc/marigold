"use client";

import { useState } from "react";

export default function MockSearch() {
  const [step, setStep] = useState(1);
  const [selectedCounty, setSelectedCounty] = useState("");

  return (
    <div className="p-8 text-black bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mock Voter Drill-Down Explore</h1>
      <p className="mb-8">This page requires multiple clicks to find the data.</p>
      
      {step === 1 && (
        <div className="border p-4 bg-gray-50">
          <h2 className="text-xl mb-4">Step 1: Select Region</h2>
          <button id="btn-region-central" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>
            Central Mississippi
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="border p-4 bg-gray-50 mt-4">
          <h2 className="text-xl mb-4">Step 2: Select County</h2>
          <button id="btn-county-hinds" className="bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={() => { setSelectedCounty("Hinds"); setStep(3); }}>
            Hinds County
          </button>
          <button id="btn-county-madison" className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => { setSelectedCounty("Madison"); setStep(3); }}>
            Madison County
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl mb-2">Final Data for {selectedCounty}</h2>
          <div className="voter-results">
            <div className="voter-record p-2 border-b">
              <span className="name font-bold block">Mock Result: DOE, JOHN A</span>
              <span className="address block">123 MAPLE ST, JACKSON, MS</span>
              <span className="status text-red-600 block">NCOA Flag: TRUE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
