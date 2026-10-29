import React from 'react';
import type { Metadata } from 'next';
import OverviewClient from './OverviewClient';

export const metadata: Metadata = {
  title: "Marigold Overview — Big Data Answers. Nothing Leaves Your Computer.",
  description: "One-page guide to Marigold: privacy-first civic and enterprise data analysis running 100% locally in your browser. Download the one-page PDF, explore features, or share.",
  openGraph: {
    title: "Marigold — Big data answers. Nothing leaves your computer.",
    description: "Analyze millions of rows right in your browser. Zero cloud uploads, tamper-evident proofs, and seamless Pipes integration.",
    url: "https://marigoldinsights.org/overview",
    siteName: "Marigold Insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marigold — Big data answers. Nothing leaves your computer.",
    description: "Analyze millions of rows right in your browser with zero cloud uploads.",
  },
};

export default function OverviewPage() {
  return <OverviewClient />;
}
