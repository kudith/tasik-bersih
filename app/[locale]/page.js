import Hero from "@/components/Hero";
import AboutUs from "@/components/About";
import EventCarousel from "@/components/Events";
import { VolunteerForm } from "@/components/VolunteerForm";
import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

const i18nNamespaces = ['home'];

export default async function Home({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <div>
        <Hero />
        <AboutUs />
        <EventCarousel />
        <VolunteerForm />
      </div>
    </TranslationsProvider>
  );
}