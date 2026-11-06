import React from "react";
import type { Metadata } from "next";
import SupportMarigoldPage from "@/app/partnership/page";

export const metadata: Metadata = {
  title: "Support Marigold | Non-Partisan Civic Data Infrastructure",
  description:
    "Support Marigold Insights: share Zero-PII county reports with local election officials, volunteer for state schema testing, launch a county pilot, or fund open-access civic audits.",
  keywords: [
    "Support Marigold",
    "GovTech partnership",
    "election administration pilot",
    "civic tech funding",
    "non-partisan data research",
  ],
};

export default function PartnersPage() {
  return <SupportMarigoldPage />;
}
