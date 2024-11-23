import type { Metadata } from "next";
import RootLayoutClient from './RootLayoutClient';
import "./globals.css";

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
    <html suppressHydrationWarning>
      <body className="antialiased h-full overflow-auto">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
