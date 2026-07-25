import React from 'react';
import { Sparkles, Shield, Database, LayoutTemplate, Activity } from 'lucide-react';

export default function WhitepaperPrint() {
  return (
    <div className="bg-white text-slate-900 font-serif min-h-screen">
      {/* Cover Page */}
      <div className="print:break-after-page h-screen flex flex-col justify-center items-start max-w-4xl mx-auto p-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-amber-600 mb-8">
            <Sparkles className="w-8 h-8" />
            <span className="font-sans font-bold tracking-widest uppercase">Marigold Insights</span>
          </div>
          <h1 className="text-6xl font-black leading-tight text-slate-950">
            The Death of the Data Silo: <br />
            <span className="text-slate-500 font-medium">How Edge Computing & Zero-Trust Architecture are Disrupting Enterprise Analytics</span>
          </h1>
          <p className="text-2xl text-slate-700 mt-6 font-sans font-light max-w-2xl">
            A Case Study on Civic Data, Cloud Vulnerabilities, and the Future of Decentralized Intelligence.
          </p>
          <div className="mt-24 pt-8 border-t-4 border-amber-500 max-w-xs">
            <p className="font-sans font-bold text-slate-900">MIT / HBR Format Case Study</p>
            <p className="font-sans text-slate-500 text-sm">Fall 2026 Edition</p>
          </div>
        </div>
      </div>

      {/* Page 1: The Problem */}
      <div className="print:break-after-page min-h-screen max-w-4xl mx-auto p-12 space-y-8">
        <h2 className="text-3xl font-bold font-sans uppercase tracking-wider text-amber-600 border-b-2 border-slate-200 pb-2 mb-8">1. The Genesis: Carol and the Two-Million Row Wall</h2>
        
        <p className="text-lg leading-relaxed text-justify">
          In early 2024, Carol, a retired high school principal turned grassroots election volunteer, submitted a public records request to the State of Roosevelt for their official voter roll. Thirty days later, she received a flash drive containing a single 2.5-gigabyte CSV file representing 2.1 million registered voters. 
        </p>
        
        <p className="text-lg leading-relaxed text-justify">
          Carol did what any citizen would do: she double-clicked the file. Microsoft Excel launched, the loading wheel spun for forty-five minutes, and then her laptop hard-crashed, forcing a manual reboot.
        </p>

        <p className="text-lg leading-relaxed text-justify">
          This singular, frustrating moment highlighted a catastrophic gap in modern software: everyday consumers possess no tools capable of interacting with large-scale civic data. While multi-billion dollar enterprises lease massive cloud databases and employ armies of data scientists using complex Business Intelligence (BI) tools, the average citizen is locked out of their own public data by the sheer limitations of consumer software. Spreadsheets cap out at roughly one million rows, and web browsers freeze the moment the Document Object Model (DOM) is overloaded.
        </p>

        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 my-8">
          <h3 className="font-sans font-bold text-xl mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-amber-500" /> The Chunking Solution</h3>
          <p className="text-base font-sans text-slate-700 leading-relaxed">
            Marigold Insights was initially born purely to solve Carol’s crash. The architecture began as a web-based "data chunking" software. By leveraging modern HTML5 Web Workers, Marigold intercepted massive CSV files and processed them incrementally in the background thread, piping the data directly into the browser's temporary memory (RAM/IndexedDB). This prevented the main UI thread from freezing. Carol could finally view a two-million row dataset without her computer bursting into flames.
          </p>
        </div>

        <p className="text-lg leading-relaxed text-justify">
          But chunking the data was only the first step. Once the data was stable inside the browser, the true magnitude of the opportunity—and the immense danger of the alternative—became terrifyingly clear.
        </p>
      </div>

      {/* Page 2: The Catalyst */}
      <div className="print:break-after-page min-h-screen max-w-4xl mx-auto p-12 space-y-8">
        <h2 className="text-3xl font-bold font-sans uppercase tracking-wider text-amber-600 border-b-2 border-slate-200 pb-2 mb-8">2. The Catalyst: The Fallacy of Cloud Security</h2>
        
        <p className="text-lg leading-relaxed text-justify">
          When amateur civic organizations realize Excel cannot handle voter rolls, their next step is almost always disastrous. They turn to cheap, cloud-based startup tools, blindly uploading millions of sensitive citizen records—often including full names, birth dates, and partial social security numbers—to centralized, third-party internet servers.
        </p>

        <p className="text-lg leading-relaxed text-justify font-bold bg-amber-50 p-4 border-l-4 border-amber-500">
          In July 2026, declassified U.S. Intelligence Community Assessments (ICAs) confirmed the nightmare scenario: foreign adversaries, including the PRC, had systematically acquired over 220 million United States voter records.
        </p>

        <p className="text-lg leading-relaxed text-justify">
          These monumental breaches were not achieved through zero-day exploits against the Pentagon. They were achieved by compromising the soft underbelly of the American data ecosystem: poorly secured civic databases, vulnerable cloud storage buckets, and third-party political data vendors. 
        </p>

        <p className="text-lg leading-relaxed text-justify">
          The enterprise tech sector is addicted to hoarding data. Platforms like Snowflake and AWS rely on "data gravity"—convincing organizations to upload their data to central lakes, and then charging them rent to compute it. But in a high-stakes environment like election integrity or healthcare, centralized cloud storage is an unacceptable liability. If a startup promises to analyze your voter data by storing it in their cloud, they are not offering a solution; they are creating a target.
        </p>

        <div className="grid grid-cols-2 gap-6 my-8">
          <div className="p-6 border border-slate-200 rounded-lg text-center bg-white shadow-sm">
            <h4 className="font-sans font-bold text-slate-400 uppercase tracking-widest text-xs mb-2">Legacy BI Model</h4>
            <div className="flex justify-center mb-4"><Database className="w-10 h-10 text-red-500 opacity-50" /></div>
            <p className="font-sans text-sm font-semibold">Centralized Cloud Lake</p>
            <p className="font-sans text-xs text-slate-500 mt-2">High latency, massive attack surface, recurring compute costs, legal liability.</p>
          </div>
          <div className="p-6 border border-amber-200 rounded-lg text-center bg-amber-50 shadow-sm">
            <h4 className="font-sans font-bold text-amber-600 uppercase tracking-widest text-xs mb-2">Marigold Edge Model</h4>
            <div className="flex justify-center mb-4"><Shield className="w-10 h-10 text-amber-500" /></div>
            <p className="font-sans text-sm font-semibold text-slate-900">Zero-Trust Local WASM</p>
            <p className="font-sans text-xs text-slate-700 mt-2">Zero latency, air-gapped security, zero compute costs, absolute legal compliance.</p>
          </div>
        </div>
      </div>

      {/* Page 3: The Architecture */}
      <div className="print:break-after-page min-h-screen max-w-4xl mx-auto p-12 space-y-8">
        <h2 className="text-3xl font-bold font-sans uppercase tracking-wider text-amber-600 border-b-2 border-slate-200 pb-2 mb-8">3. The Architecture: Limitless AI & Edge Compute</h2>
        
        <p className="text-lg leading-relaxed text-justify">
          Faced with the unacceptable risks of cloud processing, Marigold committed to a radical architectural pivot: privacy-by-design. We refused to own the user's data.
        </p>

        <p className="text-lg leading-relaxed text-justify">
          Instead of building a fortified cloud, Marigold brings the cloud to the laptop. By leveraging WebAssembly (WASM) and local IndexedDB, Marigold transforms the user's browser into a high-speed, air-gapped supercomputer. The processing context and cost-savings are orders of magnitude higher than anything operating inside the Fortune 50 today, because we eliminated the network bottleneck entirely.
        </p>

        <h3 className="text-2xl font-bold font-sans mt-8 mb-4">Solving the AI Context Window</h3>
        
        <p className="text-lg leading-relaxed text-justify">
          This edge-compute posture serendipitously solved the greatest barrier in modern enterprise AI: the context window. Language models are phenomenal at reasoning, but they cannot process a two-million row spreadsheet. You cannot paste a database into ChatGPT. 
        </p>

        <p className="text-lg leading-relaxed text-justify">
          Marigold bypasses this physical limit using Zero-Knowledge Support. When Carol asks Marigold, <span className="italic text-slate-600">"Show me addresses with 50+ voters but no apartment numbers,"</span> the AI never sees the voter roll. Instead, Marigold's AI acts purely as an orchestration engine. It translates Carol's natural English into a highly optimized query, passes that query down to Carol's local browser, and the browser crunches the massive dataset in RAM. The browser then hands the AI an anonymized statistical summary. 
        </p>

        <p className="text-lg leading-relaxed text-justify">
          The AI receives limitless context without ever touching raw Personally Identifiable Information (PII). It allows everyday people to use AI to explore, tell, and share stories with massive datasets, completely insulated from the risk of data exfiltration.
        </p>
      </div>

      {/* Page 4: Headwinds & Conclusion */}
      <div className="print:break-after-page min-h-screen max-w-4xl mx-auto p-12 space-y-8">
        <h2 className="text-3xl font-bold font-sans uppercase tracking-wider text-amber-600 border-b-2 border-slate-200 pb-2 mb-8">4. Market Headwinds & The Future</h2>
        
        <p className="text-lg leading-relaxed text-justify">
          If Marigold's architecture is vastly superior to traditional BI tools, what friction does it face in the market?
        </p>

        <div className="space-y-6 my-8 pl-6 border-l-2 border-slate-300">
          <div>
            <h4 className="font-sans font-bold text-slate-900">Institutional Inertia</h4>
            <p className="text-base text-slate-600">Enterprise organizations are deeply entrenched in their multi-year contracts with AWS, Oracle, and Snowflake. Dislodging a CTO from the belief that "the cloud is safer" requires significant education regarding edge-compute capabilities.</p>
          </div>
          <div>
            <h4 className="font-sans font-bold text-slate-900">The "Too Simple to Work" Fallacy</h4>
            <p className="text-base text-slate-600">Because Marigold boasts a consumer-ready UX that is roughly as complex as booking a rental on AirBnB, technical buyers initially struggle to believe it processes data at a faster clip than their $100k/year BI dashboard.</p>
          </div>
        </div>

        <p className="text-lg leading-relaxed text-justify">
          However, these headwinds are rapidly evaporating in the face of legal necessity. Organizations are desperate to mobilize teams and analyze data, but the legal liabilities of holding PII in the cloud are becoming catastrophic. 
        </p>

        <h3 className="text-2xl font-bold font-sans mt-8 mb-4">The Verdict</h3>

        <p className="text-lg leading-relaxed text-justify">
          Marigold Insights is not just a tool for visualizing spreadsheets. It is a moonshot for civic data. We have taken the grueling, paranoid security requirements necessary to protect national election integrity and masked them entirely behind a beautiful, joyful user experience. 
        </p>

        <p className="text-lg leading-relaxed text-justify">
          By refusing to hoard data, leveraging WASM for local edge-computation, and orchestrating it all with a stateless, zero-knowledge AI engine, Marigold has built a billion-dollar moat. We have created a future where anyone, regardless of technical training, can interact with massive data sets safely, privately, and beautifully.
        </p>
        
        <div className="mt-16 flex justify-center opacity-50">
          <Activity className="w-12 h-12 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
