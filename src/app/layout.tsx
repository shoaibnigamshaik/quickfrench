import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import React from "react";
import { ThemeInitializer } from "@/components/ui/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickFrench",
  description: "French Vocabulary Quiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitializer />
        <div className="min-h-[100dvh] bg-[var(--background)]">
          <main className="w-full mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
            {children}
          </main>
        </div>
      </body>
      <GoogleAnalytics gaId="G-8R5KN1G08L" />
    </html>
  );
}
