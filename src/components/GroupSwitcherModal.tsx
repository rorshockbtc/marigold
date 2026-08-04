"use client";

import React, { useState } from 'react';
import { X, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface GroupSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchGroup: (groupName: string) => void;
  currentGroup: string;
}

export function GroupSwitcherModal({ isOpen, onClose, onSwitchGroup, currentGroup }: GroupSwitcherModalProps) {
  const [customName, setCustomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onSwitchGroup(customName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Users className="w-5 h-5" />
            <h3 className="text-xl font-serif text-slate-900">Switch Organization</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Organization or Group Name *"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Hinds County Audit Team"
            required
          />

          <p className="text-xs text-slate-500 leading-relaxed">
            Active Group: <strong className="text-slate-800">{currentGroup}</strong>. Entering a new organization name will update your local workspace context.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-2">
              <span>Switch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
