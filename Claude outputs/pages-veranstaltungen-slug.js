/**
 * Event Detail Page
 * Path: /veranstaltungen/[slug]
 * Displays a single event with its registration form
 */

import Head from 'next/head';
import { useState } from 'react';
import { createServerClient } from '@/lib/supabase';
import { t } from '@/lib/i18n';

export async function getStaticProps({ params }) {
  try {
    const supabase = createServerClient();

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
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

    const { data: events, error } = await supabase
      .from('events')
      .select('slug')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching event slugs:', error);
      return { paths: [], fallback: 'blocking' };
    }

    const paths = (events || []).map(event => ({
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

function EventRegistrationForm({ event, currentLang }) {
  const [formData, setFormData] = useState({
    eventId: event.id,
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

  const canRegister = event.registration_status === 'registration_open';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Build request body, omitting empty optional fields
      const body = {
        eventId: formData.eventId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      // Add optional fields only if they have values
      if (formData.phone.trim()) {
        body.phone = formData.phone;
      }
      if (formData.telegramId.trim()) {
        body.telegramId = formData.telegramId;
      }
      if (formData.comment.trim()) {
        body.comment = formData.comment;
      }

      const response = await fetch('/api/registrations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Success
        setSuccess(true);
        setFormData({
          eventId: event.id,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          telegramId: '',
          comment: '',
        });
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else if (response.status === 400) {
        // Validation error
        const errors = {};
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach(err => {
            // Map validation errors to field names
            if (err.includes('first name')) errors.firstName = err;
            else if (err.includes('last name')) errors.lastName = err;
            else if (err.includes('email')) errors.email = err;
            else if (err.includes('phone')) errors.phone = err;
            else if (err.includes('telegram')) errors.telegramId = err;
            else if (err.includes('comment')) errors.comment = err;
            else setError(err);
          });
        }
        setFieldErrors(errors);
        if (!Object.keys(errors).length) {
          setError(data.error || t('form.error', currentLang));
        }
      } else if (response.status === 409) {
        // Duplicate registration
        setError(currentLang === 'fa'
          ? 'شما قبلاً برای این رویداد ثبت نام کرده اید'
          : 'Sie haben sich bereits für diese Veranstaltung angemeldet'
        );
      } else if (response.status === 429) {
        // Rate limit
        setError(currentLang === 'fa'
          ? 'درخواست‌های بیش از حد. لطفاً بعداً دوباره سعی کنید'
          : 'Zu viele Anfragen. Bitte versuchen Sie es später erneut'
        );
      } else {
        setError(data.error || t('form.error', currentLang));
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setError(t('form.error', currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-registration">
      {canRegister ? (
        <>
          <h2>{t('event.register', currentLang)}</h2>

          {success && (
            <div className="alert alert-success">
              {t('form.success', currentLang)}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="form-group">
              <label className="form-label">
                {t('form.first_name', currentLang)}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('form.first_name', currentLang)}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.firstName && (
                <div className="error-text">{fieldErrors.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('form.last_name', currentLang)}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('form.last_name', currentLang)}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.lastName && (
                <div className="error-text">{fieldErrors.lastName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('form.email', currentLang)}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('form.email', currentLang)}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.email && (
                <div className="error-text">{fieldErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('form.phone', currentLang)}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('form.phone', currentLang)}
                disabled={isSubmitting}
              />
              {fieldErrors.phone && (
                <div className="error-text">{fieldErrors.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('form.telegram', currentLang)}
              </label>
              <input
                type="text"
                name="telegramId"
                value={formData.telegramId}
                onChange={handleChange}
                placeholder={t('form.telegram', currentLang)}
                disabled={isSubmitting}
              />
              {fieldErrors.telegramId && (
                <div className="error-text">{fieldErrors.telegramId}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('form.message', currentLang)}
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder={t('form.message', currentLang)}
                disabled={isSubmitting}
                rows="4"
              ></textarea>
              {fieldErrors.comment && (
                <div className="error-text">{fieldErrors.comment}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading', currentLang) : t('common.submit', currentLang)}
            </button>
          </form>
        </>
      ) : (
        <div className="alert alert-warning">
          {event.registration_status === 'registration_closed'
            ? (currentLang === 'fa' ? 'ثبت نام برای این رویداد بسته شده است' : 'Die Anmeldung für diese Veranstaltung ist geschlossen')
            : (currentLang === 'fa' ? 'این رویداد برگزار شده است' : 'Diese Veranstaltung fand statt')
          }
        </div>
      )}
    </div>
  );
}

export default function EventDetail({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Select bilingual content
  const title = currentLang === 'fa' ? event.title_fa : event.title_de;
  const description = currentLang === 'fa' ? event.description_fa : event.description_de;
  const location = currentLang === 'fa' ? event.location_fa : event.location_de;
  const speaker = currentLang === 'fa' ? event.speaker_fa : event.speaker_de;
  const artist = currentLang === 'fa' ? event.artist_fa : event.artist_de;
  const program = currentLang === 'fa' ? event.program_fa : event.program_de;

  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(
    currentLang === 'fa' ? 'fa-IR' : 'de-DE',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Format time
  const formattedTime = event.time ? event.time.substring(0, 5) : null;

  // SEO title and description
  const pageTitle = `${title} - DIDAR`;
  const pageDescription = description ? description.substring(0, 160) : title;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={pageDescription} />
        {event.image_url && <meta property="og:image" content={event.image_url} />}
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <section className="event-detail" dir={dir}>
        <div className="container">
          {/* Hero Image */}
          {event.image_url && (
            <div className="event-hero">
              <img src={event.image_url} alt={title} />
            </div>
          )}

          {/* Event Header */}
          <div className="event-header mt-12">
            <h1>{title}</h1>

            <div className="event-meta mt-6">
              <div className="meta-item">
                <strong>{t('event.date', currentLang)}:</strong> {formattedDate}
              </div>

              {formattedTime && (
                <div className="meta-item">
                  <strong>{t('event.time', currentLang)}:</strong> {formattedTime}
                </div>
              )}

              {location && (
                <div className="meta-item">
                  <strong>{t('event.location', currentLang)}:</strong> {location}
                </div>
              )}

              <div className="meta-item">
                <strong>{currentLang === 'fa' ? 'وضعیت ثبت‌نام' : 'Anmeldestatus'}:</strong>{' '}
                {event.registration_status === 'registration_open'
                  ? t('events.registration_open', currentLang)
                  : event.registration_status === 'registration_closed'
                  ? t('events.registration_closed', currentLang)
                  : t('events.past_event', currentLang)
                }
              </div>
            </div>
          </div>

          {/* Event Description */}
          {description && (
            <div className="event-description mt-12">
              <h2>{t('event.description', currentLang)}</h2>
              <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
            </div>
          )}

          {/* Speaker */}
          {speaker && (
            <div className="event-speaker mt-12">
              <h3>{currentLang === 'fa' ? 'سخنران' : 'Sprecher'}</h3>
              <p>{speaker}</p>
            </div>
          )}

          {/* Artist */}
          {artist && (
            <div className="event-artist mt-12">
              <h3>{currentLang === 'fa' ? 'هنرمند' : 'Künstler'}</h3>
              <p>{artist}</p>
            </div>
          )}

          {/* Program */}
          {program && (
            <div className="event-program mt-12">
              <h3>{currentLang === 'fa' ? 'برنامه' : 'Programm'}</h3>
              <div className="prose" dangerouslySetInnerHTML={{ __html: program.replace(/\n/g, '<br />') }} />
            </div>
          )}

          {/* Registration Form */}
          <div className="event-registration-section mt-16 mb-16">
            <EventRegistrationForm event={event} currentLang={currentLang} />
          </div>

          {/* Back Link */}
          <div className="mt-12 mb-12">
            <a href="/veranstaltungen" className="link">
              ← {t('event.back_to_events', currentLang)}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
