import React from 'react';
import type { Metadata } from 'next';
import { StoreContent } from './StoreContent';

export const metadata: Metadata = {
  title: "National Voter Audit Checklist Store | Marigold Insights",
  description: "Download standardized, crowdsourced voter roll audit checklists. Run Z-Score, PO Box, and NCOA checks locally in your browser memory.",
  keywords: ["voter audit checklists", "election playbooks download", "municipal data filters", "non-partisan audit templates", "local-compute data registry"],
};

export default function CartridgeStorePage() {
  return <StoreContent />;
}
