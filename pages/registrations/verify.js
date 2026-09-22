/**
 * Event Registration Verification Page
 * Path: /registrations/verify?id={registrationId}&token={token}
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { t } from '@/lib/i18n';

export default function VerificationPage() {
  const router = useRouter();
  const { id, token } = router.query;
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [capacityStatus, setCapacityStatus] = useState('');
  const currentLang = router.locale || 'de';

  useEffect(() => {
    if (!id || !token) {
      setState('error');
      setError('Missing verification parameters');
      return;
    }

    async function verify() {
      try {
        const response = await fetch(`/api/registrations/verify?id=${id}&token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setState('error');
          setError(data.error || 'Verification failed');
          return;
        }

        setCapacityStatus(data.capacityStatus || '');
        setState('success');
      } catch (err) {
        setState('error');
        setError('An error occurred during verification');
      }
    }

    verify();
  }, [id, token]);

  return (
    <>
      <Head>
        <title>{currentLang === 'fa' ? 'تأیید ثبت‌نام' : 'Anmeldungsbestätigung'}</title>
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center' }}>
          {state === 'loading' && (
            <div>
              <h1>{t('registration.verification_loading', currentLang)}</h1>
              <p>{t('registration.verification_loading_message', currentLang)}</p>
            </div>
          )}
          {state === 'success' && (
            <div>
              <h1>{t('registration.success', currentLang)}</h1>
              <p>{t('registration.verify_message', currentLang)}</p>
              {capacityStatus === 'at_capacity' && <p>{t('registration.capacity_full', currentLang)}</p>}
              <button onClick={() => router.push(`/${currentLang}/veranstaltungen`)}>{t('registration.back_to_events', currentLang)}</button>
            </div>
          )}
          {state === 'error' && (
            <div>
              <h1>{t('registration.verification_error', currentLang)}</h1>
              <p>{error}</p>
              <button onClick={() => router.push(`/${currentLang}/veranstaltungen`)}>{t('registration.back_to_events', currentLang)}</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
