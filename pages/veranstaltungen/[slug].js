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
import { useState, useEffect } from 'react';
import { createServerClient } from '@/lib/supabase';
import { t, formatDate, formatTime } from '@/lib/i18n';
import { filterPublicEvent } from '@/lib/events-filter';
import { getEventImage } from '@/lib/event-image';

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

    // Auto-correct registration_status for published events
    // If event is published but registration_status is 'not_open', set it to 'open'
    if (event.status === 'published' && event.registration_status === 'not_open') {
      const { error: updateError } = await supabase
        .from('events')
        .update({ registration_status: 'open' })
        .eq('id', event.id);

      if (!updateError) {
        event.registration_status = 'open';
      }
    }

    // Filter to only public-safe fields, removing admin_notes and other admin-only data
    const publicEvent = filterPublicEvent(event);

    return {
      props: { event: publicEvent },
      revalidate: 60, // Regenerate every minute to ensure fresh data
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
  const [capacityStatus, setCapacityStatus] = useState(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch capacity status on mount and whenever event.id changes
  useEffect(() => {
    const fetchCapacityStatus = async () => {
      if (!event || !event.id) return;
      setLoadingCapacity(true);
      try {
        const response = await fetch(`/api/events/${event.id}/capacity-status`);
        if (response.ok) {
          const data = await response.json();
          setCapacityStatus(data);
        }
      } catch (err) {
        console.error('Error fetching capacity status:', err);
      } finally {
        setLoadingCapacity(false);
      }
    };

    fetchCapacityStatus();
    // Refetch capacity every 10 seconds to stay updated
    const interval = setInterval(fetchCapacityStatus, 10000);
    return () => clearInterval(interval);
  }, [event?.id]);

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

  // Registration status is a 3-state field: 'not_open' (upcoming, not yet
  // opened), 'open' (upcoming, accepting registrations), or 'closed'
  // (upcoming, registration period has ended). It is independent of whether
  // the event itself is in the past.
  const registrationStatus = event.registration_status || 'not_open';
  const registrationOpen = registrationStatus === 'open';
  const registrationClosed = registrationStatus === 'closed';

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

    // In manual registration model, capacity is informational only.
    // Registrations are not blocked by capacity - admins manage manually.

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
          language: currentLang,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (data.errorType === 'capacity_full') {
            // Capacity full - show bilingual message and refresh capacity
            setError(currentLang === 'fa'
              ? 'ظرفیت رویداد تکمیل شده است'
              : 'Die Veranstaltung ist ausgebucht');
            // Refresh capacity status
            if (event.id) {
              const capacityResponse = await fetch(`/api/events/${event.id}/capacity-status`);
              if (capacityResponse.ok) {
                const capacityData = await capacityResponse.json();
                setCapacityStatus(capacityData);
              }
            }
          } else {
            // Duplicate email
            setError(t('event.duplicate_registration', currentLang));
          }
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

      setShowSuccessModal(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        telegramId: '',
        comment: '',
      });

      // Refresh capacity after successful registration
      if (event.id) {
        const capacityResponse = await fetch(`/api/events/${event.id}/capacity-status`);
        if (capacityResponse.ok) {
          const capacityData = await capacityResponse.json();
          setCapacityStatus(capacityData);
        }
      }
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
        <title>{title} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <Link href="/veranstaltungen" className="btn btn-tertiary mb-8">
            {currentLang === 'fa' ? '→' : '←'} {t('event.back_to_events', currentLang)}
          </Link>

          {/* Two-zone layout: LEFT carries the title, status, description
              and registration form; RIGHT is the sticky cover image with the
              date/time overlaid on it. On mobile these stack (image first,
              content follows) via .event-detail-layout's own responsive
              rules rather than a separate mobile-only markup branch. */}
          <div className="event-detail-layout">
            <div className="event-detail-main">
              {category && <p className="event-category">{category}</p>}
              <h1>{title}</h1>

              <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>
                {isPastEvent
                  ? t('events.past_event', currentLang)
                  : registrationOpen
                  ? t('events.registration_open', currentLang)
                  : registrationClosed
                  ? t('events.registration_closed', currentLang)
                  : t('events.coming_soon', currentLang)}
              </p>

              {event.slug === 'book-club' && (
                <p className="alert alert-info mt-4" role="note">
                  {t('event.weekly_schedule_note', currentLang)}
                </p>
              )}

              {location && (
                <div className="mt-6">
                  <p className="event-meta-label">{t('event.location', currentLang)}</p>
                  <p className="event-meta-value">{location}</p>
                </div>
              )}

              {eventLanguage && (
                <div className="mt-6">
                  <p className="event-meta-label">{t('event.language', currentLang)}</p>
                  <p className="event-meta-value">{eventLanguage}</p>
                </div>
              )}

              {event.slug === 'critical-thinking-workshop' && (
                <>
                  {/* COURSE INFORMATION BLOCK */}
                  <div className="mt-8 course-info-block">
                    <div className="course-info-item">
                      <p className="course-info-label">📅 {currentLang === 'fa' ? 'تاریخ' : 'Datum'}</p>
                      <p className="course-info-value">
                        {currentLang === 'fa' ? '۳ نوامبر ۲۰۲۶' : '3. November 2026'}
                      </p>
                    </div>

                    <div className="course-info-item">
                      <p className="course-info-label">🗣 {currentLang === 'fa' ? 'زبان' : 'Sprache'}</p>
                      <p className="course-info-value">
                        {currentLang === 'fa'
                          ? 'این دوره به زبان فارسی برگزار می‌شود.'
                          : 'Die Veranstaltung findet auf Persisch statt.'}
                      </p>
                    </div>

                    <div className="course-info-item">
                      <p className="course-info-label">📚 {currentLang === 'fa' ? 'قالب' : 'Format'}</p>
                      <p className="course-info-value">
                        {currentLang === 'fa' ? 'دوره ۱۰ جلسه‌ای' : '10-teiliger Kurs'}
                      </p>
                    </div>
                  </div>

                  {/* COURSE DESCRIPTION */}
                  <div className="mt-8">
                    <h3>{t('event.description', currentLang)}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                  </div>

                  {/* SYLLABUS SECTION */}
                  <div className="mt-8">
                    <h3>{currentLang === 'fa' ? 'سرفصل‌های دوره' : 'Kurssyllabus'}</h3>
                    <div className="syllabus-grid">
                      {currentLang === 'fa' ? (
                        <>
                          <div className="syllabus-item">رؤیااندیشی</div>
                          <div className="syllabus-item">سوگیری تأیید</div>
                          <div className="syllabus-item">سوگیری لنگر انداختن</div>
                          <div className="syllabus-item">سوگیری بیننده–بازیگر</div>
                          <div className="syllabus-item">تمایز تقصیر و مسئولیت</div>
                          <div className="syllabus-item">دین‌اندیشی مدرن (باور به عدل، باور به نجات‌دهنده، باور به عامل فراواقعی)</div>
                          <div className="syllabus-item">کج‌فهمی‌های موجود دربارهٔ مفهوم مغالطه؛ تفاوت مغالطات صوری و غیرصوری</div>
                          <div className="syllabus-item">رفتار مسئولانه در تقابل خودمرکزیت</div>
                        </>
                      ) : (
                        <>
                          <div className="syllabus-item">Fantasiedenken</div>
                          <div className="syllabus-item">Bestätigungsverzerrung</div>
                          <div className="syllabus-item">Verankerungsverzerrung</div>
                          <div className="syllabus-item">Beobachter-Akteur-Vorurteile</div>
                          <div className="syllabus-item">Unterscheidung zwischen Schuld und Verantwortung</div>
                          <div className="syllabus-item">Modernes religiöses Denken (Glaube an Gerechtigkeit, Glaube an Erlöser, Glaube an übernatürliche Agenten)</div>
                          <div className="syllabus-item">Bestehende Missverständnisse zum Konzept des Trugschlusses; Unterschied zwischen formalen und informalen Trugschlüssen</div>
                          <div className="syllabus-item">Verantwortungsvolles Verhalten im Gegensatz zum Egozentrismus</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ORGANIZER SECTION */}
                  <div className="mt-8 organizer-section">
                    <h3>{currentLang === 'fa' ? 'برگزار کننده' : 'Kursleiterin'}</h3>
                    <div className="organizer-card">
                      <img
                        src="/images/Barazandeh.png"
                        alt={currentLang === 'fa' ? 'امیر برازنده' : 'Amir Barazandeh'}
                        loading="lazy"
                        className="organizer-image"
                      />
                      <div className="organizer-info">
                        <p className="organizer-name">
                          {currentLang === 'fa' ? 'امیر برازنده' : 'Amir Barazandeh'}
                        </p>
                        <p className="organizer-bio">
                          {currentLang === 'fa'
                            ? 'ارشد ادبیات انگلیسی و برگزار کننده دوره های تفکر نقاد'
                            : 'Master-Abschluss in Englischer Literatur und Leiter der Critical-Thinking-Kurse.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* PRICING SECTION */}
                  <div className="mt-8">
                    <h3>{currentLang === 'fa' ? 'هزینه دوره' : 'Kursgebühr'}</h3>
                    <div className="pricing-grid">
                      <div className="pricing-option">
                        <p className="pricing-category">
                          {currentLang === 'fa'
                            ? 'دانشجو / کارآموز / پناهنده'
                            : 'Studierende / Auszubildende / Geflüchtete'}
                        </p>
                        <p className="pricing-amount">€45</p>
                      </div>
                      <div className="pricing-option">
                        <p className="pricing-category">
                          {currentLang === 'fa' ? 'سایر شرکت‌کنندگان' : 'Andere Teilnehmer'}
                        </p>
                        <p className="pricing-amount">€60</p>
                      </div>
                    </div>
                  </div>

                  {/* REGISTRATION INFORMATION SECTION */}
                  <div className="mt-8">
                    <h3>{currentLang === 'fa' ? 'ثبت‌نام و پرداخت' : 'Anmeldung und Zahlung'}</h3>
                    
                    <div className="registration-info-block">
                      <div className="registration-status">
                        <p className="registration-status-label">
                          {currentLang === 'fa' ? 'وضعیت فعلی' : 'Aktueller Status'}
                        </p>
                        <p className="registration-status-value" style={{ color: 'var(--color-error)' }}>
                          {currentLang === 'fa' ? '❌ بسته' : '❌ GESCHLOSSEN'}
                        </p>
                      </div>

                      <div className="registration-info-item">
                        <p className="registration-info-label">
                          {currentLang === 'fa' ? 'باز شدن ثبت‌نام' : 'Anmeldung öffnet'}
                        </p>
                        <p className="registration-info-value">
                          {currentLang === 'fa' ? '۱۵ اکتبر ۲۰۲۶' : '15. Oktober 2026'}
                        </p>
                      </div>

                      <div className="registration-info-item">
                        <p className="registration-info-label">
                          {currentLang === 'fa' ? 'اولویت' : 'Priorität'}
                        </p>
                        <p className="registration-info-value">
                          {currentLang === 'fa'
                            ? 'افرادی که پرداخت خود را زودتر انجام دهند، در اولویت هستند.'
                            : 'Personen, die ihre Zahlung früher leisten, haben Priorität.'}
                        </p>
                      </div>

                      <div className="registration-info-item">
                        <p className="registration-info-label">
                          {currentLang === 'fa' ? 'پرداخت اقساطی' : 'Ratenzahlung'}
                        </p>
                        <p className="registration-info-value">
                          {currentLang === 'fa'
                            ? 'پرداخت به‌صورت اقساطی نیز امکان‌پذیر است. برای پرداخت اقساطی می‌توانند با دیدار تماس بگیرند.'
                            : 'Ratenzahlung ist ebenfalls möglich. Interessierte können Didar dafür kontaktieren.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>

              )}

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
            ) : registrationOpen && (!capacityStatus || !capacityStatus.is_full) ? (
              <>
                <h2>{t('event.register', currentLang)}</h2>

                {error && !Object.keys(fieldErrors).length && (
                  <div className="alert alert-error mt-4" role="alert">
                    {error}
                  </div>
                )}

                {/* Remaining capacity — a manually-set, purely informational
                    number from the Admin editor (event.remaining_capacity).
                    Replaces the old "حضور: verified/capacity" display, which
                    always showed 0 under the manual registration model since
                    registrations never reach status='verified'. */}
                {typeof event.remaining_capacity === 'number' && (
                  <div className="mt-6" style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '0.5rem',
                    textAlign: currentLang === 'fa' ? 'right' : 'left'
                  }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-warning)' }}>
                      {t('event.remaining_capacity', currentLang)}: {event.remaining_capacity}
                    </p>
                  </div>
                )}
                {capacityStatus && capacityStatus.is_full && (
                  <div className="mt-6" style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '0.5rem',
                    textAlign: currentLang === 'fa' ? 'right' : 'left'
                  }}>
                    <p style={{
                      margin: 0,
                      color: 'var(--color-error)',
                      fontWeight: 'bold'
                    }}>
                      {currentLang === 'fa' ? '❌ رویداد تکمیل شده است' : '❌ Veranstaltung ist ausgebucht'}
                    </p>
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


                <form
                  className="mt-8"
                  onSubmit={handleSubmit}
                  noValidate
                  style={{
                    opacity: capacityStatus?.is_full ? 0.6 : 1,
                    pointerEvents: capacityStatus?.is_full ? 'none' : 'auto'
                  }}
                >
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
                      disabled={isSubmitting || capacityStatus?.is_full}
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
                      disabled={isSubmitting || capacityStatus?.is_full}
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
                      disabled={isSubmitting || capacityStatus?.is_full}
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
                      disabled={isSubmitting || capacityStatus?.is_full}
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
                      disabled={isSubmitting || capacityStatus?.is_full}
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
                      disabled={isSubmitting || capacityStatus?.is_full}
                      maxLength={1000}
                      aria-invalid={Boolean(fieldErrors.comment)}
                    />
                    <p className="form-hint">
                      {currentLang === 'fa'
                        ? 'لطفاً از درج اطلاعات حساس خودداری کنید.'
                        : 'Bitte geben Sie keine sensiblen Daten an.'}
                    </p>
                    {fieldErrors.comment && (
                      <p className="error-text">{fieldErrors.comment}</p>
                    )}
                  </div>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting || capacityStatus?.is_full}
                  >
                    {isSubmitting ? t('common.loading', currentLang) : t('event.register', currentLang)}
                  </button>
                </form>
              </>
            ) : capacityStatus && capacityStatus.is_full ? (
              <div className="alert alert-warning" role="status">
                {currentLang === 'fa'
                  ? 'ظرفیت ثبت‌نام تکمیل شده است.'
                  : 'Die Anmeldung ist bereits voll.'}
              </div>
            ) : isPastEvent ? (
              <div className="alert alert-warning" role="status">
                {t('event.past_event', currentLang)}
              </div>
            ) : registrationClosed ? (
              <div className="alert alert-warning" role="status">
                {t('event.registration_closed_message', currentLang)}
              </div>
            ) : (
              <div className="alert alert-warning" role="status">
                {t('event.coming_soon_message', currentLang)}
              </div>
            )}
          </div>
            </div>

            <div className="event-detail-media">
              <div className="event-hero" dir={dir}>
                {/* Same canonical image resolution as EventCard (getEventImage),
                    so the detail page never shows a different image — or a
                    blank placeholder — for an event whose card already shows
                    a fallback image. */}
                <div
                  className="event-hero-image"
                  style={{ backgroundImage: `url('${getEventImage(event)}')` }}
                  role="img"
                  aria-label={title}
                />

                <div className="event-hero-overlay">
                  {event.event_date ? (
                    <>
                      <p className="event-hero-date-value">{formatDate(event.event_date, currentLang)}</p>
                      <p className="event-hero-date-label">{t('event.date', currentLang)}</p>

                      {event.event_time && (
                        <>
                          <p className="event-hero-time-value">{formatTime(event.event_time, currentLang)}</p>
                          <p className="event-hero-time-label">{t('event.time', currentLang)}</p>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="event-hero-date-value">{t('events.coming_soon', currentLang)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: currentLang === 'fa' ? 'right' : 'left',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '15px',
              }}>✓</div>
              <h2 style={{ margin: '0 0 15px 0', color: '#27ae60' }}>
                {currentLang === 'fa' ? 'ثبت‌نام شما دریافت شد' : 'Anmeldung erfolgreich'}
              </h2>
            </div>

            <p style={{ margin: '15px 0', fontSize: '16px', lineHeight: '1.6' }}>
              {currentLang === 'fa'
                ? 'درخواست شما دریافت شد. در صورت نیاز، دیدار از طریق ایمیل با شما تماس خواهد گرفت.'
                : 'Ihre Anfrage wurde empfangen. Didar wird sich gegebenenfalls per E-Mail bei Ihnen melden.'}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              {currentLang === 'fa' ? 'بستن' : 'Schließen'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
