import type { Metadata } from "next";
import { Lora, Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AppNavigationWrapper from "@/components/AppNavigationWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-sans",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marigold Insights | Citizen Volunteer Network",
  description: "Air-gapped, zero-cloud civic data auditing platform. Perform non-partisan voter roll verification, NCOA anomaly checks, and FEMA HSGP compliance audits directly in your browser's local memory.",
  keywords: ["civic data", "voter roll audit", "local compute", "non-partisan", "FEMA compliance", "NCOA check", "citizen volunteer"],
  openGraph: {
    title: "Marigold Insights | Citizen Volunteer Network",
    description: "Air-gapped, zero-cloud civic data auditing platform. 100% local browser execution for secure, non-partisan voter and address verification.",
    url: "https://marigold-insights.org",
    siteName: "Marigold Insights",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marigold Insights | Citizen Volunteer Network",
    description: "Air-gapped, zero-cloud civic data auditing platform. 100% local browser execution for secure, non-partisan verification.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${roboto.variable} ${lora.variable} font-sans antialiased min-h-screen flex flex-col`}>
          <AuthProvider>
            <AppNavigationWrapper>
              {children}
            </AppNavigationWrapper>
          </AuthProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
