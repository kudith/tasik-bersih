import EventCarousel from "@/components/Events";
import { VolunteerForm } from "@/components/VolunteerForm";
import TranslationsProvider from "@/components/TranslationsProvider";
import initTranslations from "@/app/i18n";
import Gallery from "@/components/Gallery";
import ReportAlert from "@/components/ReportAlert";

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
                <Gallery/>
                <ReportAlert/>
                <EventCarousel />
                <VolunteerForm />
            </div>
        </TranslationsProvider>
    );
}
