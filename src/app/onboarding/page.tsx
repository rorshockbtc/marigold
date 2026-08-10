"use client";
import React, { useState } from "react";
import { Folder, ArrowRight, Lock, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateWorkspaceKey, encryptKeyWithPIN } from "@/lib/crypto/LocalKeyManager";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { storeDirectoryHandle } from "@/lib/fs/LocalFSManager";
import { LocalFSHydrator } from "@/lib/fs/LocalFSHydrator";

export default function OnboardingPage() {
  const router = useRouter();
  const { setupWorkspacePin } = useAuth();
  
  // Guided Interview State
  const [step, setStep] = useState<"interview" | "technical">("interview");
  const [comfortLevel, setComfortLevel] = useState<"new" | "pro" | "returning" | null>(null);

  // Technical State
  const [pin, setPin] = useState("");
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [workspaceKey, setWorkspaceKey] = useState<CryptoKey | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFolder = async () => {
    try {
      if (typeof window !== "undefined" && 'showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        setDirectoryHandle(handle);
        
        const activeGroup = localStorage.getItem("marigold_active_group") || "default";
        await storeDirectoryHandle(activeGroup.toLowerCase(), handle);
        await storeDirectoryHandle("default", handle);
        
        // Auto-initialize standard subfolders & root README.md
        const { initStructuredWorkspace } = await import("@/lib/fs/LocalFSManager");
        await initStructuredWorkspace(handle);
        
      } else {
        setErrorStatus("File System Access API is not supported in this browser. Please use Chrome, Edge, or Opera.");
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error accessing directory:", err);
        setErrorStatus("Directory access denied. Please grant permission.");
      }
    }
  };

  const handleGenerateKey = async () => {
    if (pin.length < 4) {
      setErrorStatus("Please enter a PIN of at least 4 digits.");
      return;
    }
    
    setIsProcessing(true);
    setErrorStatus("⚡ Unlocking workspace & loading saved datasets...");

    try {
      await setupWorkspacePin(pin);
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
      }
      
      // Auto-hydrate saved datasets from Uploaded_Data if handle exists
      if (directoryHandle) {
        LocalFSHydrator.hydrateFromLocalFolder(directoryHandle).catch(() => {});
      }

      setErrorStatus("✅ Workspace unlocked! Opening Data Engine...");
      setTimeout(() => {
        router.push("/explore?autoRun=true");
      }, 600);
    } catch (err) {
      console.error("Error unlocking workspace:", err);
      // Fallback: unlock anyway for returning users
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
      }
      router.push("/explore?autoRun=true");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "interview") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] font-sans">
        <div className="w-full max-w-2xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-text-header mb-4">
              Welcome to Marigold
            </h1>
            <p className="text-lg text-text-body font-sans max-w-lg mx-auto">
              Before we set up your secure workspace, how familiar are you with data analysis?
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              type="button"
              onClick={() => setComfortLevel("new")}
              className={`p-8 rounded-[24px] border-2 text-left transition-all h-full ${comfortLevel === 'new' ? 'border-primary bg-white shadow-md transform -translate-y-1' : 'border-border-soft bg-surface hover:border-primary/50 hover:bg-white'}`}
            >
              <div>
                <h3 className="text-2xl font-serif text-text-header mb-3">I'm a Beginner</h3>
                <p className="text-sm text-text-body leading-relaxed">
                  I want Marigold to guide me step-by-step. Let's start with the Demo Sandbox to learn how it works.
                </p>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => setComfortLevel("pro")}
              className={`p-8 rounded-[24px] border-2 text-left transition-all h-full ${comfortLevel === 'pro' ? 'border-primary bg-white shadow-md transform -translate-y-1' : 'border-border-soft bg-surface hover:border-primary/50 hover:bg-white'}`}
            >
              <div>
                <h3 className="text-2xl font-serif text-text-header mb-3">I'm an Expert</h3>
                <p className="text-sm text-text-body leading-relaxed">
                  I know my way around a voter file. Skip the tutorials, I'm ready to upload my own state's CSV.
                </p>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => setComfortLevel("returning")}
              className={`p-8 rounded-[24px] border-2 text-left transition-all h-full ${comfortLevel === 'returning' ? 'border-primary bg-white shadow-md transform -translate-y-1' : 'border-border-soft bg-surface hover:border-primary/50 hover:bg-white'}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-serif text-text-header">I'm Returning</h3>
                </div>
                <p className="text-sm text-text-body leading-relaxed">
                  I already have a Marigold Local folder on my computer. I just need to re-link it and unlock it to continue where I left off.
                </p>
              </div>
            </button>
          </div>

          <div className="flex justify-end">
            <Button 
              disabled={!comfortLevel}
              onClick={() => setStep("technical")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${comfortLevel ? 'bg-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-surface text-text-body border border-border-soft cursor-not-allowed opacity-50'}`}
            >
              Set Up My Secure Folder
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] my-12 font-sans">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-text-header mb-4">
            {comfortLevel === 'returning' ? "Unlock Workspace" : "100% Private Setup"}
          </h2>
          <p className="text-lg text-text-body font-sans max-w-lg mx-auto">
            {comfortLevel === 'new' 
              ? "We need a dedicated folder on your computer to save your encrypted audit records. Please create or select an empty folder."
              : comfortLevel === 'pro'
              ? "Let's secure your local workspace. Create or select an empty folder on your machine where Marigold can store your data."
              : "Browsers intentionally forget folder permissions for your safety. Please re-select your existing Marigold Local folder and enter your PIN to unlock it."}
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
                <h3 className="text-xl font-serif text-text-header mb-2">{comfortLevel === 'returning' ? 'Re-link Marigold Local Folder' : 'Pick a Folder'}</h3>
                
                <div className="text-text-body font-sans text-sm mb-4 space-y-2 bg-surface p-4 rounded-xl border border-border-soft">
                  <div className="font-bold text-text-header">How to set up your folder:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-text-body leading-relaxed">
                    <li>Open <strong>File Explorer</strong> (Windows) or <strong>Finder</strong> (Mac) on your computer.</li>
                    <li>Go to your <strong>Documents</strong> folder and select your <strong>Marigold_Local</strong> folder.</li>
                    <li>Click the <strong>Select Local Folder</strong> button below and confirm permission.</li>
                  </ol>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <strong>Critical Warning:</strong> Do not rename or move this folder. Your browser binds securely to this exact folder.
                  </div>
                </div>

                <Button 
                  onClick={handleSelectFolder}
                  variant="outline"
                  className={`flex items-center gap-2 border px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                    directoryHandle 
                      ? 'bg-surface text-text-body border-border-soft cursor-default' 
                      : 'bg-white border-border-soft text-text-header hover:bg-surface shadow-sm'
                  }`}
                >
                  <Folder className={`w-5 h-5 ${directoryHandle ? 'text-text-body' : 'text-primary'}`} />
                  {directoryHandle ? `Linked: ${directoryHandle.name}` : 'Select Local Folder'}
                </Button>
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
                <h3 className="text-xl font-serif text-text-header mb-2">{comfortLevel === 'returning' ? 'Unlock with PIN' : 'Set a PIN'}</h3>
                <p className="text-text-body font-sans text-sm mb-4">
                  {comfortLevel === 'returning' 
                    ? "Enter your PIN to decrypt your workspace and load saved datasets."
                    : "This PIN locks your local workspace memory."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Lock className="w-5 h-5 text-text-body absolute left-4 top-3.5" />
                    <input 
                      type="password" 
                      placeholder="Enter 4-6 digit PIN" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={!directoryHandle || isProcessing}
                      className="pl-12 pr-4 py-3 rounded-[12px] border border-border-soft bg-white text-text-header w-56 font-mono tracking-widest outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateKey}
                    disabled={!directoryHandle || isProcessing || pin.length < 4} 
                    variant="outline"
                    className={`flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                      directoryHandle && pin.length >= 4 && !isProcessing
                        ? 'bg-primary text-white border-transparent hover:opacity-90 shadow-sm'
                        : 'bg-surface text-text-body border border-border-soft cursor-not-allowed'
                    }`}
                  >
                    <KeyRound className="w-5 h-5" />
                    {isProcessing ? 'Unlocking...' : (comfortLevel === 'returning' ? 'Unlock Workspace' : 'Set PIN & Continue')}
                  </Button>
                </div>
                {errorStatus && <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-bold mt-3">{errorStatus}</p>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
