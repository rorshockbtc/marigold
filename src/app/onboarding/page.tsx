"use client";
import React, { useState, useEffect } from "react";
import { Folder, ArrowRight, Lock, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateWorkspaceKey, encryptKeyWithPIN } from "@/lib/crypto/LocalKeyManager";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { storeDirectoryHandle } from "@/lib/fs/LocalFSManager";

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

  const handleSelectFolder = async () => {
    try {
      if (typeof window !== "undefined" && 'showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        setDirectoryHandle(handle);
        
        // Store handle in IndexedDB for the active group
        const activeGroup = localStorage.getItem("marigold_active_group") || "default";
        await storeDirectoryHandle(activeGroup.toLowerCase(), handle);
        
      } else {
        alert("Your browser does not support the File System Access API. Please use a recent version of Chrome, Edge, or Opera.");
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error accessing directory:", err);
        alert("Failed to access directory. Please ensure you grant permission.");
      }
    }
  };

  const handleGenerateKey = async () => {
    if (pin.length < 4) {
      alert("Please enter a PIN of at least 4 digits.");
      return;
    }
    
    if (comfortLevel === 'returning') {
      await setupWorkspacePin(pin);
      setWorkspaceKey({} as CryptoKey);
      router.push("/data-prep");
      return;
    }

    try {
      const rawKey = await generateWorkspaceKey();
      const encryptedBlob = await encryptKeyWithPIN(rawKey, pin);
      setWorkspaceKey(rawKey);
      
      await setupWorkspacePin(pin);
      
      router.push("/data-prep");
    } catch (err) {
      console.error("Error generating/encrypting key:", err);
      alert("Failed to secure workspace.");
    }
  };

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

  // Technical Step (step === "technical")
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] my-12">
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
                
                <p className="text-text-body font-sans text-sm mb-4">
                  {comfortLevel === 'returning' 
                    ? "Select your existing 'Marigold Local' folder from your Documents to grant the browser access again."
                    : "Create a new folder named 'Marigold Local' in your Documents to store your private workspace."}
                </p>
                
                <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Critical Warning:</strong> Do not rename or move this folder, or the files inside it. Your browser binds securely to this exact file path. Moving it will break your workspace and require a full re-link.
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
                    ? "Enter the PIN you previously created to decrypt your workspace. It is never sent to our servers."
                    : "This PIN locks your folder so only you can access it. It is never sent to our servers. We will proceed to Data Prep immediately after."}
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
                  <Button 
                    onClick={handleGenerateKey}
                    disabled={!directoryHandle || !!workspaceKey} 
                    variant="outline"
                    className={`flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold transition-all ${
                      directoryHandle && !workspaceKey
                        ? 'bg-primary text-white border-transparent hover:opacity-90 shadow-sm'
                        : 'bg-surface text-text-body border border-border-soft cursor-not-allowed'
                    }`}
                  >
                    <KeyRound className="w-5 h-5" />
                    {workspaceKey ? (comfortLevel === 'returning' ? 'Folder Unlocked' : 'Folder Locked') : (comfortLevel === 'returning' ? 'Unlock Workspace' : 'Set PIN & Continue')}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
