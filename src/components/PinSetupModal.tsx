import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

interface PinSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function PinSetupModal({ isOpen, onSuccess }: PinSetupModalProps) {
  const { setupWorkspacePin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    const success = await setupWorkspacePin(pin);
    if (success) {
      onSuccess();
    } else {
      setError("Failed to setup workspace PIN.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-black text-slate-900 text-xl">Secure Your Local Vault</h3>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            Set a 4-digit PIN to securely encrypt your datasets directly in this browser.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                <strong>Zero-Cloud Protection:</strong> We never upload your data. This PIN derives a mathematically secure AES-GCM key to lock your local browser memory. Don&apos;t forget it!
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 text-center">
                Create a 4-Digit Security PIN
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
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Lock Vault & Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
