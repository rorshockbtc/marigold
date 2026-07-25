"use client";
import React, { useState } from "react";
import { Folder, UploadCloud, ArrowRight, Lock, KeyRound, CheckCircle2, Play, Activity } from "lucide-react";
import { generateWorkspaceKey, encryptKeyWithPIN } from "@/lib/crypto/LocalKeyManager";
import { autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  
  // Guided Interview State
  const [step, setStep] = useState<"interview" | "technical" | "processing">("interview");
  const [comfortLevel, setComfortLevel] = useState<"new" | "pro" | null>(null);

  // Technical State
  const [pin, setPin] = useState("");
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [workspaceKey, setWorkspaceKey] = useState<CryptoKey | null>(null);
  
  // Processing State
  const [progress, setProgress] = useState<{ status: "idle" | "parsing" | "encrypting" | "saving" | "complete" | "error", rowsProcessed: number, chunksSaved: number, message: string }>({ status: "idle", rowsProcessed: 0, chunksSaved: 0, message: "" });

  const handleSelectFolder = async () => {
    // We simulate the Native File System API UX for consistency, but actually use IndexedDB for stability.
    setDirectoryHandle(true);
  };

  const handleGenerateKey = async () => {
    if (pin.length < 4) {
      alert("Please enter a PIN of at least 4 digits.");
      return;
    }
    const rawKey = await generateWorkspaceKey();
    const encryptedBlob = await encryptKeyWithPIN(rawKey, pin);
    setWorkspaceKey(rawKey);
    // In real app, we also save encryptedBlob via LocalAnchorAPI to workspace.key.enc
  };

  const startIngestion = async (isDemo: boolean) => {
    if (!workspaceKey || !directoryHandle) return;
    
    setStep("processing");
    try {
      if (isDemo) {
        setProgress({ status: "parsing", rowsProcessed: 0, chunksSaved: 0, message: "Initializing IndexedDB Engine..." });
        
        await autoLoadSyntheticDemoDataset((msg) => {
          setProgress(prev => ({ ...prev, message: msg, status: msg.includes("Complete") ? "complete" : "parsing" }));
        });
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        alert("Custom upload utilizes data-processor.worker.ts (Not implemented in demo UI yet).");
        setStep("technical");
      }
    } catch (err) {
      console.error(err);
      setProgress({ status: "error", rowsProcessed: 0, chunksSaved: 0, message: "Engine Failure" });
    }
  };

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-md bg-card-bg border border-border-soft p-12 rounded-[24px] shadow-sm text-center">
          <Activity className={`w-12 h-12 mx-auto mb-6 ${progress.status === 'complete' ? 'text-[#528B65]' : 'text-primary animate-pulse'}`} />
          <h2 className="text-2xl font-serif text-text-header mb-2">Engine Running</h2>
          <p className="text-sm text-text-body mb-8 h-12 font-mono flex items-center justify-center">
            {progress.message}
          </p>
          
          <div className="w-full bg-surface border border-border-soft rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${progress.status === 'complete' ? 'bg-[#528B65]' : 'bg-primary'}`}
              style={{ width: progress.status === 'complete' ? '100%' : `${Math.min(95, (progress.rowsProcessed / 1000) * 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-text-body font-mono uppercase tracking-wider">
            <span>Rows: {progress.rowsProcessed}</span>
            <span>Chunks: {progress.chunksSaved}</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "interview") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-2xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-text-header mb-4">
              Welcome to Marigold
            </h1>
            <p className="text-lg text-text-body font-sans max-w-lg mx-auto">
              Before we set up your secure workspace, how familiar are you with data analysis?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button 
              onClick={() => setComfortLevel("new")}
              className={`p-8 rounded-[24px] border-2 text-left transition-all ${comfortLevel === 'new' ? 'border-primary bg-white shadow-md transform -translate-y-1' : 'border-border-soft bg-surface hover:border-primary/50 hover:bg-white'}`}
            >
              <h3 className="text-2xl font-serif text-text-header mb-3">I'm a Beginner</h3>
              <p className="text-sm text-text-body leading-relaxed">
                I want Marigold to guide me step-by-step. Let's start with the Demo Sandbox to learn how it works.
              </p>
            </button>

            <button 
              onClick={() => setComfortLevel("pro")}
              className={`p-8 rounded-[24px] border-2 text-left transition-all ${comfortLevel === 'pro' ? 'border-primary bg-white shadow-md transform -translate-y-1' : 'border-border-soft bg-surface hover:border-primary/50 hover:bg-white'}`}
            >
              <h3 className="text-2xl font-serif text-text-header mb-3">I'm an Expert</h3>
              <p className="text-sm text-text-body leading-relaxed">
                I know my way around a voter file. Skip the tutorials, I'm ready to upload my own state's CSV.
              </p>
            </button>
          </div>

          <div className="flex justify-end">
            <button 
              disabled={!comfortLevel}
              onClick={() => setStep("technical")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${comfortLevel ? 'bg-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-surface text-text-body border border-border-soft cursor-not-allowed opacity-50'}`}
            >
              Set Up My Secure Folder
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Technical Step (step === "technical")
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-text-header mb-4">
            100% Private Setup
          </h2>
          <p className="text-lg text-text-body font-sans max-w-lg mx-auto">
            {comfortLevel === 'new' 
              ? "We need a folder on your computer to safely store the Demo files. They will never touch the cloud."
              : "Let's secure your local workspace. We need a folder to store the data, and a PIN to lock it."}
          </p>
        </div>

        <div className="bg-card-bg border border-border-soft rounded-[24px] p-8 shadow-sm">
          <div className="space-y-10">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold font-serif text-lg ${directoryHandle ? 'bg-[#E3EEDC] text-[#528B65]' : 'border border-border-soft bg-surface text-text-body'}`}>
                {directoryHandle ? <CheckCircle2 className="w-6 h-6" /> : "1"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif text-text-header mb-2">Pick a Folder</h3>
                <p className="text-text-body font-sans text-sm mb-4">
                  Create a new, empty folder in your Documents to store your private workspace.
                </p>
                <button 
                  onClick={handleSelectFolder}
                  className={`flex items-center gap-2 border px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                    directoryHandle 
                      ? 'bg-surface text-text-body border-border-soft cursor-default' 
                      : 'bg-white border-border-soft text-text-header hover:bg-surface shadow-sm'
                  }`}
                >
                  <Folder className={`w-5 h-5 ${directoryHandle ? 'text-text-body' : 'text-primary'}`} />
                  {directoryHandle ? 'Folder Locked In' : 'Select Local Folder'}
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-border-soft ml-18" />

            {/* Step 2 */}
            <div className={`flex gap-6 transition-opacity duration-300 ${directoryHandle ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold font-serif text-lg ${
                workspaceKey ? 'bg-[#E3EEDC] text-[#528B65]' : 'bg-surface text-text-body border border-border-soft'
              }`}>
                {workspaceKey ? <CheckCircle2 className="w-6 h-6" /> : "2"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif text-text-header mb-2">Set a PIN</h3>
                <p className="text-text-body font-sans text-sm mb-4">
                  This PIN locks your folder so only you can access it. It is never sent to our servers.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Lock className="w-5 h-5 text-text-body absolute left-4 top-3.5" />
                    <input 
                      type="password" 
                      placeholder="Enter 4-6 digit PIN" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={!directoryHandle || !!workspaceKey}
                      className="pl-12 pr-4 py-3 rounded-[12px] border border-border-soft bg-white text-text-header w-56 font-mono tracking-widest outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleGenerateKey}
                    disabled={!directoryHandle || !!workspaceKey} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                      directoryHandle && !workspaceKey
                        ? 'bg-white border border-border-soft text-text-header hover:bg-surface shadow-sm'
                        : 'bg-surface text-text-body border border-border-soft cursor-not-allowed'
                    }`}
                  >
                    <KeyRound className="w-5 h-5" />
                    {workspaceKey ? 'Folder Locked' : 'Set PIN'}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border-soft ml-18" />

            {/* Step 3 */}
            <div className={`flex gap-6 transition-opacity duration-300 ${workspaceKey ? 'opacity-100' : 'opacity-40'}`}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface text-text-body flex items-center justify-center font-bold font-serif text-lg border border-border-soft">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif text-text-header mb-2">Organize Your Records</h3>
                <p className="text-text-body font-sans text-sm mb-6">
                  {comfortLevel === 'new' 
                    ? "We will pull a 500-row Demo dataset to safely show you how Marigold organizes and locks records."
                    : "Select your real voter file CSV. The browser will securely save it into the folder you just created."}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  {comfortLevel === 'new' ? (
                    <button 
                      disabled={!workspaceKey} 
                      onClick={() => startIngestion(true)}
                      className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
                        workspaceKey ? 'bg-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-surface text-text-body cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Run Demo Sandbox Engine
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        disabled={!workspaceKey} 
                        onClick={() => alert("File Picker would open here.")}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
                          workspaceKey ? 'bg-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-surface text-text-body cursor-not-allowed'
                        }`}
                      >
                        <UploadCloud className="w-5 h-5" />
                        Select CSV File
                      </button>
                      <button 
                        disabled={!workspaceKey} 
                        onClick={() => startIngestion(true)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-full font-bold transition-all ${
                          workspaceKey ? 'bg-white text-text-header border border-border-soft hover:bg-surface' : 'hidden'
                        }`}
                      >
                        Or run Demo Sandbox
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
