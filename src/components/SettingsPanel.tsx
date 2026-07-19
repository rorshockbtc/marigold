"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function SettingsPanel() {
  const [msfeEmail, setMsfeEmail] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [textSize, setTextSize] = useState("16");
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setGeminiKey(localStorage.getItem("marigold_gemini_key") || "");
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save Gemini Key
    if (geminiKey) localStorage.setItem("marigold_gemini_key", geminiKey);
    else localStorage.removeItem("marigold_gemini_key");

    alert("Settings saved securely to your browser!");
    document.documentElement.style.fontSize = `${textSize}px`;
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure your credentials and customize the application for your comfort.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-6">
          
          <div>
            <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4">Account Credentials</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">MSFE Email Address</label>
                <input 
                  type="email" 
                  value={msfeEmail}
                  onChange={(e) => setMsfeEmail(e.target.value)}
                  className="input-field" 
                  placeholder="volunteer@msfe.org" 
                />
              </div>
            </div>
          </div>



          <div>
            <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4">API Configuration (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gemini API Key</label>
                <input 
                  type="password" 
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="input-field" 
                  placeholder="AIzaSy..." 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required to use the AI assistant. See the <a href="/setup-guide" className="text-primary underline">setup guide</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold border-b border-border pb-2 mb-4">Accessibility</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Text Size (px)</label>
                <input 
                  type="number" 
                  min="16" 
                  max="24" 
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value)}
                  className="input-field" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Increase this number if you need larger text. Default is 16.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
