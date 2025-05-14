import "../globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import i18nConfig from "../../i18nConfig";
import { notFound } from "next/navigation";
import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

export const metadata = {
  title: "TasikBersih",
  description: "Website TasikBersih adalah platform digital yang didedikasikan untuk meningkatkan kesadaran dan partisipasi masyarakat dalam menjaga kebersihan lingkungan Kota Tasikmalaya. Melalui website ini, masyarakat, terutama mahasiswa dan relawan, dapat berkolaborasi dalam berbagai kegiatan kebersihan yang diselenggarakan, seperti pembersihan sampah di area umum, sungai, dan danau. Website ini menawarkan kemudahan akses untuk melaporkan lokasi tercemar, mendonasi untuk mendukung kegiatan kebersihan, serta memberikan informasi mengenai jadwal kegiatan mendatang dan dokumentasi kegiatan sebelumnya. Dengan menggunakan teknologi terkini, seperti integrasi AI Chatbot untuk pelaporan pencemaran dan sistem notifikasi untuk mengingatkan pengguna tentang kegiatan kebersihan, TasikBersih bertujuan untuk menciptakan lingkungan yang lebih bersih dan terkelola dengan baik, sambil melibatkan generasi muda dalam aksi nyata pelestarian lingkungan.",
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