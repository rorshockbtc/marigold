"use client";

import { useState } from "react";

export function DesktopImportGuide() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="mt-5 pt-5 border-t border-amber-200/80 space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Guide */}
            <div className="text-xs text-slate-800 space-y-2.5 bg-white p-5 rounded-xl border-2 border-emerald-600/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-2 mb-2.5">
                  <span className="text-lg">📊</span>
                  <h5 className="font-extrabold text-emerald-900 text-sm">Microsoft Excel (Windows & Mac)</h5>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-1 font-medium leading-relaxed text-slate-700">
                  <li>Open a blank workbook in Microsoft Excel.</li>
                  <li>Go to the <strong className="text-slate-900 font-bold">Data</strong> tab at the top of your screen.</li>
                  <li>Click <strong className="text-slate-900 font-bold">Get Data</strong> (or <em>From Text/CSV</em> / <em>From JSON</em>).</li>
                  <li>Select your downloaded file from your computer&apos;s Downloads folder.</li>
                  <li>When the preview window appears, click <strong className="text-slate-900 font-bold">Load</strong>. Your data is now in clean rows and columns!</li>
                </ol>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg text-[11px] text-emerald-900 font-semibold mt-3">
                💡 Tip: Click the filter arrows at the top of any column to sort by City, Zip Code, or Anomaly Count.
              </div>
            </div>

            {/* Apple Numbers Guide */}
            <div className="text-xs text-slate-800 space-y-2.5 bg-white p-5 rounded-xl border-2 border-blue-600/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2 mb-2.5">
                  <span className="text-lg">🍏</span>
                  <h5 className="font-extrabold text-blue-900 text-sm">Apple Numbers (Mac & iPad)</h5>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-1 font-medium leading-relaxed text-slate-700">
                  <li>Locate your downloaded file in your Mac&apos;s <strong className="text-slate-900 font-bold">Downloads</strong> folder.</li>
                  <li>Right-click (or Control-click) the file and select <strong className="text-slate-900 font-bold">Open With → Numbers</strong>.</li>
                  <li>Numbers will automatically convert the rows and columns into a clean table.</li>
                  <li>To filter or sort, click on any column header letter (like column C for Address) and choose <strong className="text-slate-900 font-bold">Show Filter Options</strong> or <strong className="text-slate-900 font-bold">Sort Ascending</strong>.</li>
                </ol>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-lg text-[11px] text-blue-900 font-semibold mt-3">
                💡 Tip: Numbers handles large CSV files smoothly by breaking them into manageable table sheets.
              </div>
            </div>

            {/* Google Sheets Guide */}
            <div className="text-xs text-slate-800 space-y-2.5 bg-white p-5 rounded-xl border-2 border-amber-600/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-amber-100 pb-2 mb-2.5">
                  <span className="text-lg">🌐</span>
                  <h5 className="font-extrabold text-amber-950 text-sm">Google Sheets (Free Online)</h5>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-1 font-medium leading-relaxed text-slate-700">
                  <li>Open your web browser and go to <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">sheets.google.com</a>.</li>
                  <li>Click the large <strong className="text-slate-900 font-bold">+ Blank</strong> button to create a new spreadsheet.</li>
                  <li>In the top menu, click <strong className="text-slate-900 font-bold">File → Import</strong>.</li>
                  <li>Go to the <strong className="text-slate-900 font-bold">Browse / Import</strong> tab inside Google Sheets and select your downloaded file.</li>
                  <li>Leave settings as default and click <strong className="text-slate-900 font-bold">Import Data</strong>.</li>
                </ol>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg text-[11px] text-amber-900 font-semibold mt-3">
                💡 Tip: Great for sharing filtered anomaly lists with local volunteer team members online.
              </div>
            </div>

            {/* Multi-Part Shards & Zip Guide */}
            <div className="text-xs text-slate-800 space-y-2.5 bg-white p-5 rounded-xl border-2 border-purple-600/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-purple-100 pb-2 mb-2.5">
                  <span className="text-lg">📦</span>
                  <h5 className="font-extrabold text-purple-950 text-sm">Multi-Part Shards & Zip Archiving</h5>
                </div>
                <p className="text-slate-700 font-medium mb-2">
                  When working with massive split datasets (e.g. <code>part-01.csv</code>, <code>part-02.csv</code>):
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-1 font-medium text-slate-700 leading-relaxed">
                  <li>
                    <strong className="text-slate-900 font-bold">Dedicated Folder:</strong> Save all downloaded shard files into one dedicated folder on your desktop (e.g. <code>Marigold_Shards/</code>).
                  </li>
                  <li>
                    <strong className="text-slate-900 font-bold">Keep File Names:</strong> Do not rename part files (`voter_file_part_1.csv`). Marigold stitches them in exact sequence order.
                  </li>
                  <li>
                    <strong className="text-slate-900 font-bold">Zip Archiving:</strong> Right-click the folder and select <strong className="text-slate-900 font-bold">Compress to ZIP</strong> to archive or transfer safely between computers.
                  </li>
                </ol>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-lg text-[11px] text-purple-950 font-semibold mt-3">
                💡 Tip: You can drag and drop multiple shard files simultaneously on Data Prep to combine them into RAM.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
