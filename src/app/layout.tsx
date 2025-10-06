import type { Metadata } from "next";
import RootLayoutClient from './RootLayoutClient';
import "./globals.css";
import Script from 'next/script';

export const metadata: Metadata = {
  title: "Options Analyzer",
  description: "Analyze options for stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <Script
          src="https://analytics.nikhilgarg.com/script.js"
          data-website-id="2515a2c2-1600-4a37-a634-c75826725fa5"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased h-full overflow-auto">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
