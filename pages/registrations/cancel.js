/**
 * Registration cancellation page
 * Path: /registrations/cancel?token=<opaque-token>   (German: /de/registrations/cancel?...)
 *
 * Opening this page (GET) changes NOTHING: it only shows a short explanation
 * and a final button. Only that button sends a real POST to
 * /api/registrations/cancel. This protects against email security scanners
 * and link previews that open links automatically.
 *
 * Language follows the site's existing Next.js locale routing (fa / de).
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { t } from '@/lib/i18n';

export default function CancelRegistration({ currentLang }) {
  const router = useRouter();
  const lang = currentLang === 'fa' ? 'fa' : 'de';
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  // idle | submitting | cancelled | already_cancelled | invalid | missing | error
  const [state, setState] = useState('idle');

  const rawToken = router.query.token;
  const token = typeof rawToken === 'string' ? rawToken : '';

  const handleCancel = async () => {
    if (!token) {
      setState('missing');
      return;
    }

    setState('submitting');

    try {
      const response = await fetch('/api/registrations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.status === 'cancelled') {
        setState('cancelled');
      } else if (response.ok && data.status === 'already_cancelled') {
        setState('already_cancelled');
      } else if (response.status === 404) {
        setState('invalid');
      } else if (response.status === 400) {
        setState('missing');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  const showConfirmation =
    router.isReady && token && (state === 'idle' || state === 'submitting' || state === 'error');

  return (
    <>
      <Head>
        <title>{t('cancel.title', lang)} - {lang === 'fa' ? 'دیدار' : 'Didar'}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h1>{t('cancel.title', lang)}</h1>

          {router.isReady && !token && state === 'idle' && (
            <div className="alert alert-error mt-6" role="alert">
              {t('cancel.missing', lang)}
            </div>
          )}

          {showConfirmation && (
            <div className="mt-6">
              <p>{t('cancel.intro', lang)}</p>

              {state === 'error' && (
                <div className="alert alert-error mt-4" role="alert">
                  {t('cancel.error', lang)}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary mt-6"
                onClick={handleCancel}
                disabled={state === 'submitting'}
              >
                {state === 'submitting' ? t('cancel.processing', lang) : t('cancel.button', lang)}
              </button>
            </div>
          )}

          {state === 'cancelled' && (
            <div className="alert alert-success mt-6" role="status">
              {t('cancel.success', lang)}
            </div>
          )}

          {state === 'already_cancelled' && (
            <div className="alert alert-success mt-6" role="status">
              {t('cancel.already', lang)}
            </div>
          )}

          {state === 'invalid' && (
            <div className="alert alert-error mt-6" role="alert">
              {t('cancel.invalid', lang)}
            </div>
          )}

          {state === 'missing' && (
            <div className="alert alert-error mt-6" role="alert">
              {t('cancel.missing', lang)}
            </div>
          )}

          {(state === 'cancelled' ||
            state === 'already_cancelled' ||
            state === 'invalid' ||
            state === 'missing' ||
            (router.isReady && !token)) && (
            <p className="mt-8">
              <Link href="/veranstaltungen" className="btn btn-tertiary">
                {lang === 'fa' ? '→' : '←'} {t('event.back_to_events', lang)}
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
