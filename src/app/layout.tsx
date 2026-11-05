import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TALENTSWISS // Enterprise Recruitment Platform",
  description:
    "Institutional AI-assisted technical recruitment engine with Swiss-Grid precision, grounded excerpt verification, and hallucination detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50/70 font-sans text-zinc-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
