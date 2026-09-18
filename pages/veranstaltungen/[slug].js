/**
 * Event Detail Page
 * Path: /veranstaltungen/[slug]
 * Displays a single event with its registration form
 * 
 * Modified for Phase 3A4: Now fetches real event data from Supabase
 * Preserves Phase 3A3 registration form component and behavior
 */

import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { createServerClient } from '@/lib/supabase';
import { t, formatDate, formatTime } from '@/lib/i18n';

export async function getStaticProps({ params }) {
  try {
    const supabase = createServerClient();

    // Fetch the specific event by slug, only if published
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (error || !event) {
      return { notFound: true };
    }

    return {
      props: { event },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { notFound: true };
  }
}

export async function getStaticPaths() {
  try {
    const supabase = createServerClient();

    // Get all published event slugs for static generation
    const { data: events, error } = await supabase
      .from('events')
      .select('slug')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching event slugs:', error);
      return { paths: [], fallback: 'blocking' };
    }

    const paths = (events || []).map((event) => ({
      params: { slug: event.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Generate new routes on first request
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export default function EventDetail({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    telegramId: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!event) {
    return <div className="container py-8"><h1>{t('common.error', currentLang)}</h1></div>;
  }

  // Select bilingual content based on current language
  const title = event[`title_${currentLang}`] || event.title_de;
  const description = event[`description_${currentLang}`] || event.description_de;
  const location = event[`location_${currentLang}`] || event.location_de;
  const category = event[`category_${currentLang}`] || event.category;
  const eventLanguage = event[`event_language_${currentLang}`] || event.event_language;
  const externalRegistrationUrl = event.external_registration_url || null;

  // Registration is open only if registration_open = true
  const registrationOpen = event.registration_open === true;

  // Distinguish "not yet open / coming soon" from "already took place"
  const eventDateOnly = event.event_date ? new Date(event.event_date) : null;
  const todayOnly = new Date();
  todayOnly.setHours(0, 0, 0, 0);
  const isPastEvent = eventDateOnly ? eventDateOnly < todayOnly : false;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  const getValidationErrors = (details) => {
    const errors = {};

    details.forEach((detail) => {
      if (detail.includes('First name')) {
        errors.firstName = t('form.validation_required', currentLang, {
          field: t('form.first_name', currentLang),
        });
      } else if (detail.includes('Last name')) {
        errors.lastName = t('form.validation_required', currentLang, {
          field: t('form.last_name', currentLang),
        });
      } else if (detail.includes('email')) {
        errors.email = t('form.validation_email', currentLang);
      } else if (detail.includes('Phone')) {
        errors.phone = t('form.validation_phone', currentLang);
      } else if (detail.includes('Telegram')) {
        errors.telegramId = t('form.validation_telegram', currentLang);
      } else if (detail.includes('Comment')) {
        errors.comment = t('form.validation_comment', currentLang);
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/registrations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          telegramId: formData.telegramId || undefined,
          comment: formData.comment || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('event.duplicate_registration', currentLang));
        } else if (Array.isArray(data.details)) {
          const errors = getValidationErrors(data.details);

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            setError(t('form.error', currentLang));
          }
        } else {
          setError(t('form.error', currentLang));
        }

        return;
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        telegramId: '',
        comment: '',
      });
    } catch (submitError) {
      console.error('Event registration form error:', submitError);
      setError(t('form.error', currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{title} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <Link href="/veranstaltungen" className="btn btn-tertiary mb-8">
            {currentLang === 'fa' ? '→' : '←'} {t('event.back_to_events', currentLang)}
          </Link>

          {event.image_url && (
            <div
              style={{
                width: '100%',
                height: '400px',
                backgroundImage: `url('${event.image_url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-8)',
              }}
              role="img"
              aria-label={title}
            />
          )}

          {category && <p className="event-category">{category}</p>}

          <h1>{title}</h1>

          <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {isPastEvent
              ? t('events.past_event', currentLang)
              : registrationOpen
              ? t('events.registration_open', currentLang)
              : t('events.registration_closed', currentLang)}
          </p>

          <div className="grid grid-2 mt-8 gap-8">
            <div>
              <h3>{t('event.date', currentLang)}</h3>
              <p>{formatDate(event.event_date, currentLang)}</p>

              {event.event_time && (
                <>
                  <h3 className="mt-6">{t('event.time', currentLang)}</h3>
                  <p>{formatTime(event.event_time, currentLang)}</p>
                </>
              )}

              {location && (
                <>
                  <h3 className="mt-6">{t('event.location', currentLang)}</h3>
                  <p>{location}</p>
                </>
              )}

              {eventLanguage && (
                <>
                  <h3 className="mt-6">{t('event.language', currentLang)}</h3>
                  <p>{eventLanguage}</p>
                </>
              )}
            </div>

            <div>
              <h3>{t('event.description', currentLang)}</h3>
              <p>{description}</p>
            </div>
          </div>

          <div className="mt-12" style={{ maxWidth: '600px' }}>
            {externalRegistrationUrl ? (
              <a
                href={externalRegistrationUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('event.external_registration', currentLang)}
              </a>
            ) : registrationOpen ? (
              <>
                <h2>{t('event.register', currentLang)}</h2>

                {success && (
                  <div className="alert alert-success mt-4" role="status">
                    {t('form.success', currentLang)}
                  </div>
                )}

                {error && !Object.keys(fieldErrors).length && (
                  <div className="alert alert-error mt-4" role="alert">
                    {error}
                  </div>
                )}
                <div className="alert alert-info mt-6" role="region" aria-label="Privacy notice">
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <strong>{currentLang === 'fa' ? 'اطلاع حریم خصوصی' : 'Datenschutzhinweis'}</strong>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {t('form.privacy_event_notice', currentLang)}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                    <Link href="/datenschutz">
                      {t('form.privacy_policy_link', currentLang)}
                    </Link>
                  </p>
                </div>


                <form className="mt-8" onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">
                      {t('form.first_name', currentLang)}
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder={t('form.first_name', currentLang)}
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={100}
                      required
                      aria-invalid={Boolean(fieldErrors.firstName)}
                    />
                    {fieldErrors.firstName && (
                      <p className="error-text">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">
                      {t('form.last_name', currentLang)}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder={t('form.last_name', currentLang)}
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={100}
                      required
                      aria-invalid={Boolean(fieldErrors.lastName)}
                    />
                    {fieldErrors.lastName && (
                      <p className="error-text">{fieldErrors.lastName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      {t('form.email', currentLang)}
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder={t('form.email', currentLang)}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={254}
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email && (
                      <p className="error-text">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      {t('form.phone', currentLang)}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder={t('form.phone', currentLang)}
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={20}
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone && (
                      <p className="error-text">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="telegramId">
                      {t('form.telegram', currentLang)}
                    </label>
                    <input
                      id="telegramId"
                      type="text"
                      name="telegramId"
                      placeholder={t('form.telegram', currentLang)}
                      value={formData.telegramId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={32}
                      aria-invalid={Boolean(fieldErrors.telegramId)}
                    />
                    {fieldErrors.telegramId && (
                      <p className="error-text">{fieldErrors.telegramId}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="comment">
                      {t('form.message', currentLang)}
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      placeholder={t('form.message', currentLang)}
                      value={formData.comment}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      maxLength={1000}
                      aria-invalid={Boolean(fieldErrors.comment)}
                    />
                    {fieldErrors.comment && (
                      <p className="error-text">{fieldErrors.comment}</p>
                    )}
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('common.loading', currentLang) : t('event.register', currentLang)}
                  </button>
                </form>
              </>
            ) : isPastEvent ? (
              <div className="alert alert-warning" role="status">
                {t('event.past_event', currentLang)}
              </div>
            ) : (
              <div className="alert alert-warning" role="status">
                {t('event.coming_soon_message', currentLang)}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
