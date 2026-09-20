import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import { t } from '@/lib/i18n';
import { SOCIAL_LINKS, InstagramIcon, TelegramIcon } from '@/components/SocialIcons';

export default function Contact({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input changes
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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const errors = {};
          data.details.forEach(detail => {
            if (detail.includes('Name')) errors.name = detail;
            else if (detail.includes('email')) errors.email = detail;
            else if (detail.includes('Message')) errors.message = detail;
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
        setFormData({ name: '', email: '', message: '' });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(t('form.error', currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('contact.title', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('contact.title', currentLang)}</h1>
          <p className="mt-4">{t('contact.intro', currentLang)}</p>

          <div className="grid grid-2 gap-12 mt-12">
            <div>
              <h2>{t('contact.form_title', currentLang)}</h2>

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
              <div className="alert alert-info mt-6" role="region" aria-label="Privacy notice">
                <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  <strong>{currentLang === 'fa' ? 'اطلاع حریم خصوصی' : 'Datenschutzhinweis'}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  {t('form.privacy_contact_notice', currentLang)}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                  <Link href="/datenschutz">
                    {t('form.privacy_policy_link', currentLang)}
                  </Link>
                </p>
              </div>


              <form className="mt-8" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    {t('form.name', currentLang)}
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder={t('form.name', currentLang)}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="error-text">{fieldErrors.name}</p>
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
                  <label className="form-label" htmlFor="message">
                    {t('form.message', currentLang)}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder={t('form.message', currentLang)}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  ></textarea>
                  {fieldErrors.message && (
                    <p className="error-text">{fieldErrors.message}</p>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.loading', currentLang) : t('contact.send', currentLang)}
                </button>
              </form>
            </div>

            <div>
              <img
                src="/images/contact-visual.jpg"
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                }}
              />
              <h2>{t('footer.contact', currentLang)}</h2>
              <p className="mt-4">
                <strong>{currentLang === 'fa' ? 'ایمیل' : 'E-Mail'}:</strong>
                <br />
                <a href="mailto:info@didar-stuttgart.com" dir="ltr">info@didar-stuttgart.com</a>
              </p>

              <h3 className="mt-8">{t('footer.follow_us', currentLang)}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li className="mt-2">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                  >
                    <InstagramIcon size={18} /> Instagram
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href={SOCIAL_LINKS.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                  >
                    <TelegramIcon size={18} /> Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
