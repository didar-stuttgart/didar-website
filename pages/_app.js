import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';
import '@/styles/layout.css';
import '@/styles/components.css';
import '@/styles/rtl.css';
import '@/styles/enhancements.css';

const defaultLang = 'fa';

export default function App({ Component, pageProps }) {
  const [currentLang, setCurrentLang] = useState(defaultLang);
  const router = useRouter();

  // Sync language with localStorage and document
  useEffect(() => {
    const saved = localStorage.getItem('didar-lang') || defaultLang;
    setCurrentLang(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === 'fa' ? 'rtl' : 'ltr';
  }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('didar-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fdf7f2" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="main-layout">
        <Header currentLang={currentLang} onLanguageChange={handleLanguageChange} />
        <main>
          <Component {...pageProps} currentLang={currentLang} />
        </main>
        <Footer currentLang={currentLang} />
      </div>
    </>
  );
}
