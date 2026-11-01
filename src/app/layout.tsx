import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edgelink SEO Platform — Autonomous SEO Auditing Engine",
  description: "Full-Stack SEO Automation Dashboard & AI Analysis Engine built for Edgelink Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
