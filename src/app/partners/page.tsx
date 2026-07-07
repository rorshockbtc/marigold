import React from 'react';
import type { Metadata } from 'next';
import { PartnersContent } from './PartnersContent';

export const metadata: Metadata = {
  title: "Beta Partnership Program | Marigold Insights",
  description: "Join our B2B GovTech pilot. We partner with state election officials, good-governance organizations, and academic researchers to deploy secure, local-compute verification.",
  keywords: ["GovTech partnership", "election administration pilot", "civic tech funding", "voter integrity grants", "non-partisan data research"],
};

export default function PartnersPage() {
  return <PartnersContent />;
}
