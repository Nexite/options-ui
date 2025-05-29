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
          data-website-id="6872013d-d46c-4513-80c7-c296a9c6033f"
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
