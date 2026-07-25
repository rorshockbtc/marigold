import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Folder, KeyRound, Play, X, ArrowRight, FolderKey } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface LocalFolderGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocalFolderGuideModal({ isOpen, onClose }: LocalFolderGuideModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleReLink = () => {
    onClose();
    router.push('/onboarding');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border-soft">
          <h2 className="text-2xl font-serif text-text-header">Returning User Guide</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-text-header transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-text-header">1. Re-link Marigold Local Folder</h3>
              <p className="text-text-body text-sm leading-relaxed">
                Browsers intentionally forget folder permissions for your safety when you close the app. To resume your work, you'll need to select your existing <strong>Marigold Local</strong> folder from your Documents to grant the browser access again.
              </p>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-text-header">2. Unlock with PIN</h3>
              <p className="text-text-body text-sm leading-relaxed">
                Enter the 4-6 digit PIN you previously created to decrypt your workspace. Your PIN is never sent to our servers and remains completely local to your machine.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E3EEDC] text-[#528B65] flex items-center justify-center mb-6">
                <Play className="w-6 h-6 ml-1" />
              </div>
              <h3 className="text-xl font-serif text-text-header">3. Resume Analysis</h3>
              <p className="text-text-body text-sm leading-relaxed">
                Once unlocked, your local engine is ready. You can head straight back to the Dashboard and continue your analysis without re-uploading your data.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-12">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all ${step === i ? 'w-6 bg-primary' : 'w-2 bg-border-soft cursor-pointer hover:bg-border'}`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button variant="primary" onClick={() => setStep(step + 1)}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleReLink}>
                  <FolderKey className="w-4 h-4 ml-1 mr-2" /> Let's Go
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
