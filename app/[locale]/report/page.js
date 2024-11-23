import { ReportPolluted } from "@/components/ReportPolluted";
import initTranslations from "../../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

const i18nNamespaces = ['report'];

export default async function ReportPage({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <div className="my-20 min-h-screen">
        <ReportPolluted />
      </div>
    </TranslationsProvider>
  );
}