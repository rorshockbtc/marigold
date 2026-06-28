import type { Metadata } from "next";
import { Lora, Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AppNavigationWrapper from "@/components/AppNavigationWrapper";

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
  title: "Marigold Insights | Non-Partisan Civic Data Traversal",
  description: "Local-compute data auditing optimized for election integrity and FEMA HSGP compliance.",
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
        </body>
      </html>
    </ClerkProvider>
  );
}
