import React from 'react';
import type { Metadata } from 'next';
import { SandboxContent } from './SandboxContent';

export const metadata: Metadata = {
  title: "Public Demonstration Sandbox | Marigold Insights",
  description: "Experience our zero-PII local memory audit engine in a sandbox environment. Run simulated checks on high-density addresses and outlier Z-scores.",
  keywords: ["voter roll sandbox", "data verification simulator", "local-compute demo", "non-partisan data audits", "in-browser database checks"],
};

export default function SandboxPage() {
  return <SandboxContent />;
}
