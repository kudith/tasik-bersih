import "../globals.css";
import Navbar from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import {locales} from "@/i18nConfig";


export const metadata = {
  title: "kalangsariPride",
  description: "Community website for Kalangsari Pride",
};

export default function RootLayout({ children }) {
  return (
    <html lang={locales}>
      <body
        className={`antialiased`}
      >
      <Navbar/>
        {children}
      <Footer/>
      </body>
    </html>
  );
}
