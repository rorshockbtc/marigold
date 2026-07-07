import React from 'react';
import type { Metadata } from 'next';
import { ComplianceContent } from './ComplianceContent';

export const metadata: Metadata = {
  title: "FEMA HSGP & Zero-PII Compliance | Marigold Insights",
  description: "Authoritative government compliance documentation for FEMA HSGP 3% election security grants, zero-cloud data residency rules, and micro-purchase procurement.",
  keywords: ["FEMA HSGP compliance", "election security grants", "Zero-PII compliance", "data residency policy", "government tech procurement"],
};

export default function CompliancePage() {
  return <ComplianceContent />;
}
