import "../globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import i18nConfig from "../../i18nConfig";
import { notFound } from "next/navigation";
import { Suspense } from "react";  // Import Suspense

export const metadata = {
  title: "kalangsariPride",
  description: "Community website for Kalangsari Pride",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale)) {
    notFound();
  }

  return (
      <html lang={locale}>
      <body className="antialiased">
      <Navbar />
      {children}
      {/* Gunakan Suspense untuk menunda rendering Footer */}
      <Suspense fallback={<div>Loading footer...</div>}>
        <Footer />
      </Suspense>
      </body>
      </html>
  );
}
