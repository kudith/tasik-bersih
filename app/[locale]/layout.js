import "../globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import i18nConfig from "../../i18nConfig";
import { notFound } from "next/navigation";
import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

export const metadata = {
  title: "kalangsariPride",
  description: "Community website for Kalangsari Pride",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale)) {
    notFound();
  }

  const { resources } = await initTranslations(locale, ['navbar', 'footer']);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <TranslationsProvider
          namespaces={['navbar', 'footer']}
          locale={locale}
          resources={resources}
        >
          <Navbar />
          {children}
          <Footer />
        </TranslationsProvider>
      </body>
    </html>
  );
}