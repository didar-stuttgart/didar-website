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
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
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
              capacity: null,
              registration_deadline: '',
              image_url: '',
              status: 'draft',
              registration_status: 'not_open',
              admin_notes: '',
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

  const handlePreview = () => {
    if (event.slug) {
      window.open(`/events/${event.slug}`, '_blank');
    }
  };

  const handleDuplicate = async () => {
    try {
      const newEvent = { ...event };
      delete newEvent.id;
      delete newEvent.slug;
      delete newEvent.created_at;
      delete newEvent.updated_at;
      newEvent.title_fa = `${newEvent.title_fa} (کپی)`;
      newEvent.title_de = `${newEvent.title_de} (Kopie)`;
      newEvent.status = 'draft';

      setSaving(true);
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event: newEvent }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('رویداد با موفقیت تکرار شد');
        router.push(`/admin/events/${data.event.slug}`);
      } else {
        alert('خطا در تکرار رویداد');
      }
    } catch (err) {
      console.error('Failed to duplicate event:', err);
      alert('خطا در تکرار رویداد');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('آیا می‌خواهید این رویداد را بایگانی کنید؟')) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/events/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        alert('رویداد با موفقیت بایگانی شد');
        router.push('/admin/events');
      } else {
        alert('خطا در بایگانی رویداد');
      }
    } catch (err) {
      console.error('Failed to archive event:', err);
      alert('خطا در بایگانی رویداد');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = slug === 'new' ? 'POST' : 'PATCH';
      const url = slug === 'new' ? '/api/admin/events' : `/api/admin/events/${slug}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }
  if (!event) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

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

              <div className={styles.formGroup}>
                <label>ظرفیت (اختیاری)</label>
                <input
                  type="number"
                  value={event.capacity || ''}
                  onChange={(e) => handleChange('capacity', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="تعداد شرکت‌کنندگان"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>آخرین مهلت ثبت‌نام (اختیاری)</label>
                <input
                  type="date"
                  value={event.registration_deadline || ''}
                  onChange={(e) => handleChange('registration_deadline', e.target.value)}
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
                <label>یادداشت‌های مدیر (اختیاری)</label>
                <textarea
                  value={event.admin_notes || ''}
                  onChange={(e) => handleChange('admin_notes', e.target.value)}
                  placeholder="یادداشت‌های داخلی برای مدیران"
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>وضعیت ثبت‌نام</label>
                <select
                  value={event.registration_status || 'not_open'}
                  onChange={(e) => handleChange('registration_status', e.target.value)}
                >
                  <option value="not_open">هنوز باز نشده (به‌زودی)</option>
                  <option value="open">باز است</option>
                  <option value="closed">بسته شده</option>
                </select>
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
              {slug !== 'new' && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePreview()}
                    className={styles.secondaryButton}
                  >
                    پیش‌نمایش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate()}
                    className={styles.secondaryButton}
                  >
                    تکرار رویداد
                  </button>
                  {event.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleArchive()}
                      className={styles.dangerButton}
                    >
                      بایگانی
                    </button>
                  )}
                </>
              )}
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
