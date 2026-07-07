import React from 'react';
import type { Metadata } from 'next';
import { PerspectivesContent } from './PerspectivesContent';

export const metadata: Metadata = {
  title: "Ideological Inquiry Lenses & Voter Rolls | Marigold Insights",
  description: "Explore different worldviews on voter roll analysis. Non-partisan explanations of Benford's Law, Z-Scores, and rights-based enfranchisement metrics.",
  keywords: ["ideological lenses", "election integrity faq", "voter roll worldviews", "Z-Scores explained", "non-partisan election data"],
};

export default function PerspectivesPage() {
  return <PerspectivesContent />;
}
