"use client";

import { useState } from "react";

export function DesktopImportGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'excel' | 'numbers' | 'sheets'>('excel');

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-bold text-amber-950 text-sm">What do I do with this downloaded file?</h4>
            <p className="text-xs text-amber-800">Learn how to open and filter your exported voter data on your desktop.</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition-colors"
        >
          {isOpen ? "Hide Guide ↑" : "View Desktop Guide ↓"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-amber-200 space-y-4">
          <div className="flex gap-2 border-b border-amber-200 pb-2">
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeTab === 'excel' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-slate-700 border border-amber-200'}`}
            >
              📊 Microsoft Excel
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeTab === 'numbers' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border border-amber-200'}`}
            >
              🍏 Apple Numbers (Mac)
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeTab === 'sheets' ? 'bg-amber-600 text-white shadow' : 'bg-white text-slate-700 border border-amber-200'}`}
            >
              🌐 Google Sheets
            </button>
          </div>

          {activeTab === 'excel' && (
            <div className="text-xs text-slate-800 space-y-2 bg-white p-4 rounded-xl border border-amber-100 leading-relaxed">
              <h5 className="font-bold text-emerald-800 text-sm">Opening in Microsoft Excel (Windows & Mac)</h5>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Open a blank workbook in Microsoft Excel.</li>
                <li>Go to the <strong>Data</strong> tab at the top of your screen.</li>
                <li>Click <strong>Get Data</strong> (or <em>From Text/CSV</em> / <em>From JSON</em>).</li>
                <li>Select the file you just downloaded from your Downloads folder.</li>
                <li>When the preview window appears, click <strong>Load</strong>. Your data will now appear organized in neat spreadsheet rows and columns!</li>
                <li><em>Tip:</em> Click the filter arrows at the top of any column to sort by City, Zip Code, or Anomaly Count.</li>
              </ol>
            </div>
          )}

          {activeTab === 'numbers' && (
            <div className="text-xs text-slate-800 space-y-2 bg-white p-4 rounded-xl border border-amber-100 leading-relaxed">
              <h5 className="font-bold text-blue-800 text-sm">Opening in Apple Numbers (Mac & iPad)</h5>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Locate your downloaded file in your Mac's <strong>Downloads</strong> folder.</li>
                <li>Right-click (or Control-click) the file and select <strong>Open With → Numbers</strong>.</li>
                <li>Numbers will automatically convert the rows and columns into a clean table.</li>
                <li>To filter or sort, click on any column header letter (like column C for Address) and choose <strong>Show Filter Options</strong> or <strong>Sort Ascending</strong>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="text-xs text-slate-800 space-y-2 bg-white p-4 rounded-xl border border-amber-100 leading-relaxed">
              <h5 className="font-bold text-amber-900 text-sm">Opening in Google Sheets (Free Online)</h5>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Open your web browser and go to <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.google.com</a>.</li>
                <li>Click the large <strong>+ Blank</strong> button to create a new spreadsheet.</li>
                <li>In the top menu, click <strong>File → Import</strong>.</li>
                <li>Go to the <strong>Upload</strong> tab and drag your downloaded file into the box (or click <em>Browse</em>).</li>
                <li>Leave the settings as default and click <strong>Import Data</strong>. You can now explore and filter your records online!</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
