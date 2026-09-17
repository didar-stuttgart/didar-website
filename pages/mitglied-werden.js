import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import { t } from '@/lib/i18n';

export default function Membership({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    telegramId: '',
    additionalInfo: '',
    privacyAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    // Client-side validation for privacy checkbox
    if (!formData.privacyAgreed) {
      setFieldErrors({
        privacyAgreed: t('form.privacy_notice', currentLang),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/memberships/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          telegramId: formData.telegramId || undefined,
          additionalInfo: formData.additionalInfo || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate email
        if (response.status === 409) {
          setError(data.error || t('form.error', currentLang));
        } else if (data.details && Array.isArray(data.details)) {
          // Handle validation errors
          const errors = {};
          data.details.forEach(detail => {
            if (detail.includes('First name')) errors.firstName = detail;
            else if (detail.includes('Last name')) errors.lastName = detail;
            else if (detail.includes('email')) errors.email = detail;
            else if (detail.includes('Phone')) errors.phone = detail;
            else if (detail.includes('Telegram')) errors.telegramId = detail;
            else if (detail.includes('Additional')) errors.additionalInfo = detail;
          });
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            setError(data.error || t('form.error', currentLang));
          }
        } else {
          setError(data.error || t('form.error', currentLang));
        }
      } else {
        // Success
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          telegramId: '',
          additionalInfo: '',
          privacyAgreed: false,
        });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Membership form error:', err);
      setError(t('form.error', currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('membership.title', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('membership.title', currentLang)}</h1>

          <div className="mt-12 mb-16" style={{ backgroundColor: 'var(--color-off-white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)' }}>
            <h2>{t('membership.intro', currentLang)}</h2>
            <p className="mt-4">
              {currentLang === 'fa'
                ? 'با پیوستن به دیدار، بخشی از جامعه‌ای فعال و پویا می‌شوید که علاقمند به فرهنگ و هنر ایرانی است. عضویت شما به ما کمک می‌کند تا رویدادها و برنامه‌های فرهنگی بیشتری سازماندهی کنیم.'
                : 'Durch die Mitgliedschaft bei DIDAR werden Sie Teil einer aktiven und dynamischen Gemeinschaft, die sich für iranische Kultur und Kunst interessiert. Ihre Mitgliedschaft hilft uns, mehr kulturelle Veranstaltungen und Programme zu organisieren.'
              }
            </p>
          </div>

          <h2>{t('membership.form_title', currentLang)}</h2>
          <p className="mt-4">{t('membership.form_intro', currentLang)}</p>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success mt-4">
              {t('form.success', currentLang)}
            </div>
          )}

          {/* General Error Message */}
          {error && !Object.keys(fieldErrors).length && (
            <div className="alert alert-error mt-4">
              {error}
            </div>
          )}

          <form className="mt-8" onSubmit={handleSubmit} noValidate style={{ maxWidth: '600px' }}>
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
                required
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
                required
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
                required
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
              />
              {fieldErrors.telegramId && (
                <p className="error-text">{fieldErrors.telegramId}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="additionalInfo">
                {t('form.additional_info', currentLang)}
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder={t('form.additional_info', currentLang)}
                value={formData.additionalInfo}
                onChange={handleChange}
                disabled={isSubmitting}
              ></textarea>
              {fieldErrors.additionalInfo && (
                <p className="error-text">{fieldErrors.additionalInfo}</p>
              )}
            </div>
            <div className="alert alert-info mt-6" role="region" aria-label="Privacy notice">
              <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                <strong>{currentLang === 'fa' ? 'اطلاع حریم خصوصی' : 'Datenschutzhinweis'}</strong>
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                {t('form.privacy_membership_notice', currentLang)}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                <Link href="/datenschutz">
                  {t('form.privacy_policy_link', currentLang)}
                </Link>
              </p>
            </div>


            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  style={{ marginRight: 'var(--space-2)' }}
                />
                <span>{t('form.privacy_notice', currentLang)}</span>
              </label>
              {fieldErrors.privacyAgreed && (
                <p className="error-text">{fieldErrors.privacyAgreed}</p>
              )}
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading', currentLang) : t('common.submit', currentLang)}
            </button>
          </form>

          <p className="mt-8" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            {t('membership.response_time', currentLang)}
          </p>
        </div>
      </section>
    </>
  );
}
