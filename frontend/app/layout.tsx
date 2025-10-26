import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grand Archive Meta - Tournament Data & Analysis",
  description: "Comprehensive meta analysis, decklists, and tournament results for Grand Archive TCG",
  keywords: ["Grand Archive", "TCG", "meta", "decklists", "tournament", "champions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
