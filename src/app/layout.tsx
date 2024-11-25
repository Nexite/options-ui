import type { Metadata } from "next";
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
    <html suppressHydrationWarning lang="en">
      <body className="antialiased h-full overflow-auto">
        {children}
      </body>
    </html>
  );
}
