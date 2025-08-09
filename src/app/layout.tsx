import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IGCSE French Quiz",
  description:
    "A quiz application to test your knowledge of French vocabulary.",
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
        {/* Theme setup to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try {
              const storageKey = 'theme';
              const root = document.documentElement;
              const stored = localStorage.getItem(storageKey);
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const shouldDark = stored === 'dark' || (stored === 'auto' || !stored) && prefersDark;
              root.classList.toggle('dark', shouldDark);
            } catch (_) {} })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
