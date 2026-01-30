import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotoVault | Secure Private Photo Storage",
  description: "Enterprise-grade, invite-only photo storage platform. Store your memories securely with advanced encryption and privacy-first design.",
  keywords: ["photo storage", "private photos", "secure storage", "encrypted photos", "photo vault"],
  authors: [{ name: "PhotoVault Team" }],
  robots: "noindex, nofollow", // Private app - no indexing
  openGraph: {
    title: "PhotoVault | Secure Private Photo Storage",
    description: "Enterprise-grade, invite-only photo storage platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-background text-accent-primary antialiased">
        {children}
      </body>
    </html>
  );
}
