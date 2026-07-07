import React from 'react';
import type { Metadata } from 'next';
import { DeployContent } from './DeployContent';

export const metadata: Metadata = {
  title: "Bring Marigold to Your Jurisdiction | Marigold Insights",
  description: "Request a turnkey B2B election security deployment or propose custom GIS/NCOA database integrations for your state agency or volunteer network.",
  keywords: ["voter list deployment", "election security pricing", "county clerk micro-purchases", "FEMA SAA contracting", "local-compute government tech"],
};

export default function DeployPage() {
  return <DeployContent />;
}
