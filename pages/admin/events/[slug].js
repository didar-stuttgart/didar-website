import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/admin.module.css';

export default function AdminEventEdit() {
  const router = useRouter();
  const { slug } = router.query;
  const [sessionValid, setSessionValid] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          if (slug && slug !== 'new') {
            await loadEvent();
          } else {
            setEvent({
              title_fa: '',
              title_de: '',
              description_fa: '',
              description_de: '',
              event_date: '',
              event_time: '',
              location_fa: '',
              location_de: '',
              image_url: '',
              status: 'draft',
              registration_open: false,
            });
            setLoading(false);
          }
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    const loadEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load event:', err);
        setLoading(false);
      }
    };

    if (slug) checkSession();
  }, [slug, router]);

  const handleChange = (field, value) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = slug === 'new' ? 'POST' : 'PATCH';
      const url = slug === 'new' ? '/api/admin/events' : `/api/admin/events/${slug}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });

      if (res.ok) {
        alert('رویداد با موفقیت ذخیره شد');
        router.push('/admin/events');
      } else {
        alert('خطا در ذخیره رویداد');
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      alert('خطا در ذخیره رویداد');
    } finally {
      setSaving(false);
    }
  };

  if (!sessionValid) return null;
  if (loading) return <div className={styles.loading}>درحال بارگذاری...</div>;
  if (!event) return null;

  return (
    <>
      <Head>
        <title>ویرایش رویداد — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin/events" className={styles.backLink}>← بازگشت</Link>
            <h1>{slug === 'new' ? 'رویداد جدید' : 'ویرایش رویداد'}</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          <form className={styles.contentForm}>
            <section className={styles.formSection}>
              <h2>اطلاعات پایه</h2>

              <div className={styles.formGroup}>
                <label>عنوان (فارسی)</label>
                <input
                  type="text"
                  value={event.title_fa || ''}
                  onChange={(e) => handleChange('title_fa', e.target.value)}
                  placeholder="عنوان فارسی"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Titel (Deutsch)</label>
                <input
                  type="text"
                  value={event.title_de || ''}
                  onChange={(e) => handleChange('title_de', e.target.value)}
                  placeholder="Deutscher Titel"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>تاریخ رویداد</label>
                <input
                  type="date"
                  value={event.event_date || ''}
                  onChange={(e) => handleChange('event_date', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>زمان رویداد (اختیاری)</label>
                <input
                  type="time"
                  value={event.event_time || ''}
                  onChange={(e) => handleChange('event_time', e.target.value)}
                />
              </div>
            </section>

            <section className={styles.formSection}>
              <h2>مکان</h2>

              <div className={styles.formGroup}>
                <label>مکان (فارسی)</label>
                <input
                  type="text"
                  value={event.location_fa || ''}
                  onChange={(e) => handleChange('location_fa', e.target.value)}
                  placeholder="نام مکان"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ort (Deutsch)</label>
                <input
                  type="text"
                  value={event.location_de || ''}
                  onChange={(e) => handleChange('location_de', e.target.value)}
                  placeholder="Ortname"
                />
              </div>
            </section>

            <section className={styles.formSection}>
              <h2>توضیحات</h2>

              <div className={styles.formGroup}>
                <label>توضیحات (فارسی)</label>
                <textarea
                  value={event.description_fa || ''}
                  onChange={(e) => handleChange('description_fa', e.target.value)}
                  placeholder="توضیحات فارسی"
                  rows="6"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Beschreibung (Deutsch)</label>
                <textarea
                  value={event.description_de || ''}
                  onChange={(e) => handleChange('description_de', e.target.value)}
                  placeholder="Deutsche Beschreibung"
                  rows="6"
                />
              </div>
            </section>

            <section className={styles.formSection}>
              <h2>تصویر و تنظیمات</h2>

              <div className={styles.formGroup}>
                <label>آدرس تصویر (URL)</label>
                <input
                  type="url"
                  value={event.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={event.registration_open || false}
                    onChange={(e) => handleChange('registration_open', e.target.checked)}
                  />
                  {' '}ثبت‌نام باز است
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>وضعیت</label>
                <select
                  value={event.status || 'draft'}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                </select>
              </div>
            </section>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={styles.primaryButton}
              >
                {saving ? 'درحال ذخیره...' : 'ذخیره رویداد'}
              </button>
              <Link href="/admin/events" className={styles.backLink}>
                انصراف
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
