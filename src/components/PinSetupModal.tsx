import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Lock, ShieldCheck, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { EmergencyKeyManager } from '@/lib/security/EmergencyKeyManager';
import { getDirectoryHandle } from '@/lib/fs/LocalFSManager';

interface PinSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function PinSetupModal({ isOpen, onSuccess }: PinSetupModalProps) {
  const { setupWorkspacePin, hasPinSet } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Recovery Key State
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [isForgotPinMode, setIsForgotPinMode] = useState(false);
  const [inputRecoveryKey, setInputRecoveryKey] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasPinSet && !recoveryKey) {
      const generated = EmergencyKeyManager.generateRecoveryKey();
      setRecoveryKey(generated);
    }
  }, [hasPinSet, recoveryKey]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }

    const success = await setupWorkspacePin(pin);
    if (success) {
      // Try writing recovery key to local folder if handle exists
      if (recoveryKey) {
        const grp = localStorage.getItem("marigold_active_group") || "default";
        getDirectoryHandle(grp.toLowerCase()).then((dirHandle) => {
          if (dirHandle) {
            EmergencyKeyManager.saveRecoveryKeyToLocalDisk(dirHandle, recoveryKey);
          }
        });
      }
      onSuccess();
    } else {
      setError("Failed to verify workspace PIN.");
    }
  };

  const handleVerifyRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (EmergencyKeyManager.verifyRecoveryKey(inputRecoveryKey)) {
      setRecoverySuccess(true);
      setError('');
      setTimeout(() => {
        setIsForgotPinMode(false);
        setRecoverySuccess(false);
      }, 1000);
    } else {
      setError("Invalid Emergency Recovery Key. Please check the key saved in .marigold/RECOVERY_KEY_DO_NOT_DELETE.txt");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-black text-slate-900 text-xl">
            {isForgotPinMode 
              ? "Reset Security PIN" 
              : hasPinSet ? "Enter Security PIN" : "Secure Your Local Vault"}
          </h3>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            {isForgotPinMode
              ? "Enter your 24-character Emergency Key saved in .marigold/RECOVERY_KEY_DO_NOT_DELETE.txt"
              : hasPinSet 
                ? "Enter your 4-digit PIN to unlock your encrypted local workspace." 
                : "Create a 4-digit PIN to securely encrypt your datasets directly in this browser."}
          </p>
        </div>

        {/* Forgot PIN Recovery Form */}
        {isForgotPinMode ? (
          <form onSubmit={handleVerifyRecovery} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 text-center">
                  Enter Emergency Recovery Key
                </label>
                <input
                  type="text"
                  value={inputRecoveryKey}
                  onChange={(e) => {
                    setInputRecoveryKey(e.target.value);
                    setError('');
                  }}
                  placeholder="MRGLD-XXXX-XXXX-XXXX-XXXX"
                  className="w-full text-center bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-mono font-black text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm uppercase placeholder:text-slate-300"
                  autoFocus
                />
                {error && <p className="text-xs text-red-600 font-bold mt-2 text-center">{error}</p>}
                {recoverySuccess && (
                  <p className="text-xs text-emerald-600 font-bold mt-2 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Recovery Key Verified! You can pick a new PIN now.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsForgotPinMode(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Back to PIN Entry
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl shadow-md transition-all text-xs"
              >
                Verify &amp; Reset PIN
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              {!hasPinSet && recoveryKey && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Your Emergency Recovery Key</span>
                  </div>
                  <div className="text-xs font-mono font-black text-emerald-950 bg-white px-3 py-2 rounded-lg border border-emerald-300 tracking-wider">
                    {recoveryKey}
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    Saved to <code>.marigold/RECOVERY_KEY_DO_NOT_DELETE.txt</code> inside your folder. Keep it safe to recover your data if you ever forget your PIN!
                  </p>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                  <strong>Zero-Cloud Protection:</strong> We never upload your data. This PIN derives a mathematically secure AES-GCM key to lock your local browser memory.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 text-center">
                  {hasPinSet ? "Enter Your 4-Digit Security PIN" : "Create a 4-Digit Security PIN"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-3xl font-black tracking-[1em] text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm placeholder:text-slate-300"
                  autoFocus
                />
                {error && <p className="text-xs text-red-600 font-bold mt-2 text-center">{error}</p>}
              </div>

              {hasPinSet && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPinMode(true)}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-700 underline"
                  >
                    Forgot PIN? Reset with Emergency Key
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={pin.length < 4}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{hasPinSet ? "Unlock Workspace" : "Lock Vault & Continue"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
