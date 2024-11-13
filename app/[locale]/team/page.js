import Team from "@/components/Team";
import initTranslations from "../../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

const i18nNamespaces = ['team'];

export default async function TeamPage({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <div className="my-20">
        <Team />
      </div>
    </TranslationsProvider>
  );
}