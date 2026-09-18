import { useEffect } from 'react';
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

// Language is driven by Next.js' own locale routing (see next.config.js:
// locales ['fa', 'de'], defaultLocale 'fa'), which is already set up in
// this project. router.locale is available on both server and client
// render, so a direct link (e.g. /de/kontakt) always shows the intended
// language immediately - no localStorage race, no flash of the wrong
// language while the page hydrates. localStorage is kept only as a
// convenience so the language switch is remembered for the next visit
// to the homepage; it never overrides what a specific URL asks for.
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const currentLang = router.locale || defaultLang;

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('didar-lang', currentLang);
    } catch {
      // Ignore storage errors (private browsing, disabled storage, etc.)
    }
  }, [currentLang]);

  const handleLanguageChange = (lang) => {
    if (lang === currentLang) return;
    // Switch locale while staying on the same page (same route, same
    // params), the standard Next.js i18n routing pattern.
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
      locale: lang,
    });
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fdf7f2" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&family=Lalezar&display=swap"
          rel="stylesheet"
        />
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
