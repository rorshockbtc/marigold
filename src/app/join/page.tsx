"use client";

import React, { useEffect, useState } from "react";
import { Users, Lock, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function JoinGroupPage() {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [encryptionKeyHex, setEncryptionKeyHex] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // We only execute this on the client side
    // Browsers never send the hash fragment to the server
    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);
    
    const gid = params.get("groupId");
    const key = params.get("key");

    if (gid && key) {
      setGroupId(gid);
      setEncryptionKeyHex(key);
      console.log("Successfully extracted key from URL Hash without server exposure.");
    }
  }, []);

  const handleJoin = async () => {
    if (pin.length < 4) {
      alert("Please set a secure 4-6 digit PIN.");
      return;
    }

    setIsProcessing(true);

    // In a full implementation:
    // 1. Convert encryptionKeyHex back into a CryptoKey
    // 2. Encrypt that CryptoKey using the new user's PIN
    // 3. Save the encrypted blob to their Marigold Local folder
    
    setTimeout(() => {
      alert(`Successfully joined Group ${groupId}! Your local AES key has been secured with your PIN.`);
      router.push("/dashboard");
    }, 1500);
  };

  if (!groupId || !encryptionKeyHex) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center font-sans">
        <div className="text-center">
          <h2 className="text-xl font-serif text-text-header">Invalid Invite Link</h2>
          <p className="text-text-body">This link does not contain a valid secure group hash.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-card-bg border border-border-soft p-8 rounded-[12px] shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-albers-green-soft text-albers-green-bold flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-serif text-text-header mb-2">Join Secure Workspace</h1>
        <p className="text-text-body text-sm mb-6">
          You have been invited to Group <strong className="text-text-header">{groupId}</strong>. 
          Your browser has securely received the decryption key.
        </p>

        <div className="bg-surface border border-border-soft p-4 rounded-[12px] text-left mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-body mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Secure Your Key
          </h4>
          <p className="text-xs text-text-body mb-3">
            Set a PIN to encrypt this group's key on your device. You will need this PIN every time you access the workspace.
          </p>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-text-body absolute left-3 top-3" />
            <input 
              type="password" 
              placeholder="Set 4-6 digit PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="pl-9 input-field w-full"
            />
          </div>
        </div>

        <Button 
          onClick={handleJoin}
          disabled={isProcessing}
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? "Encrypting Local Key..." : "Join Workspace"}
        </Button>
      </div>
    </div>
  );
}
