import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AA Classic Hub", template: "%s | AA Classic Hub" },
  description: "Guides, boss timers, calculators and videos for ArcheAge Classic.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
