/**
 * Manual Registration Confirmation Page
 * Path: /registrations/verify (kept for backward compatibility with old email links)
 * 
 * Since we've reverted to the manual registration model, this page
 * is no longer actively used. Email verification links are not sent.
 * This page remains to handle old links gracefully with a thank-you message
 * consistent with the manual registration model.
 */

import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ManualRegistrationPage() {
  const router = useRouter();
  const currentLang = router.locale || 'de';

  const content = {
    fa: {
      title: 'ثبت‌نام شما دریافت شد',
      message: 'درخواست ثبت‌نام شما دریافت شده است. DIDAR در صورت نیاز از طریق ایمیل با شما تماس خواهد گرفت.',
      button: 'بازگشت به رویدادها',
    },
    de: {
      title: 'Vielen Dank für Ihre Anmeldung',
      message: 'Ihre Anmeldung wurde empfangen. DIDAR wird sich gegebenenfalls per E-Mail bei Ihnen melden.',
      button: 'Zurück zu den Veranstaltungen',
    },
  };

  const lang = content[currentLang] || content.de;

  return (
    <>
      <Head>
        <title>{currentLang === 'fa' ? 'ثبت‌نام' : 'Anmeldung'}</title>
      </Head>
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', 
          maxWidth: '500px', 
          width: '100%', 
          padding: '40px', 
          textAlign: 'center',
          direction: currentLang === 'fa' ? 'rtl' : 'ltr'
        }}>
          <h1>{lang.title}</h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666', marginBottom: '30px' }}>
            {lang.message}
          </p>
          <button 
            onClick={() => router.push(`/${currentLang}/veranstaltungen`)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            {lang.button}
          </button>
        </div>
      </div>
    </>
  );
}
