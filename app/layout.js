import "./globals.css";
import Navbar from "@/components/Navbar";
import {Footer} from "@/components/Footer";



export const metadata = {
  title: "kalangsariPride",
  description: "Community website for Kalangsari Pride",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
