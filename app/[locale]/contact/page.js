import initTranslations from "../../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import ContactForm from "@/components/ContactUs";

const i18nNamespaces = ['donation'];

export default async function DonatePage({ params }) {
    const { locale } = await params;
    const { resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources}>
            <div className="my-20">
                <ContactForm/>
            </div>
        </TranslationsProvider>
    );
}
