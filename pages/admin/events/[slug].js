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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

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
              slug: '',
              description_fa: '',
              description_de: '',
              event_date: '',
              event_time: '',
              location_fa: '',
              location_de: '',
              capacity: null,
              remaining_capacity: null,
              registration_deadline: '',
              image_url: '',
              status: 'draft',
              registration_status: 'not_open',
              admin_notes: '',
              is_recurring: false,
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
          setImagePreview(data.event.image_url || '');
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

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(new Error('Unable to read the selected image.'));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('فقط فایل‌های JPG، PNG و WebP مجاز هستند.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم تصویر نباید بیشتر از 5 مگابایت باشد.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadingImage(true);

    try {
      const data = await fileToBase64(file);
      const res = await fetch('/api/admin/events/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          data,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'خطا در آپلود تصویر');
      }

      setEvent((prev) => ({ ...prev, image_url: result.publicUrl }));
      setImagePreview(result.publicUrl);
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setImagePreview(event?.image_url || '');
      alert(err.message || 'خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateEvent = () => {
    if (!event.title_fa || !event.title_de) {
      alert('عنوان فارسی و آلمانی الزامی است');
      return false;
    }

    // Both recurring and non-recurring events may exist without a date
    return true;
  };

  const handlePreview = () => {
    if (event.slug) {
      window.open(`/veranstaltungen/${event.slug}`, '_blank');
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
    if (!validateEvent()) {
      return;
    }

    if (uploadingImage) {
      alert('لطفاً تا پایان آپلود تصویر صبر کنید.');
      return;
    }

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

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('رویداد با موفقیت ذخیره شد');
        router.push('/admin/events');
      } else {
        alert(data.error || 'خطا در ذخیره رویداد');
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
                <label>آدرس URL رویداد (Slug)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', direction: 'ltr' }}>
                  <span>/veranstaltungen/</span>
                  <input
                    type="text"
                    value={event.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="critical-thinking"
                    style={{ flex: 1 }}
                  />
                </div>
                <p style={{ marginTop: '0.4rem', color: '#666', fontSize: '0.85rem' }}>
                  فقط یک بخش از مسیر URL وارد کنید؛ مثلاً critical-thinking. در رویداد جدید، خالی گذاشتن این فیلد باعث ساخت خودکار URL از عنوان فارسی می‌شود.
                  تغییر slug یک URL قبلی را تغییر می‌دهد و برای URL قبلی redirect خودکار ساخته نمی‌شود.
                </p>
                {event.slug && (
                  <p dir="ltr" style={{ marginTop: '0.35rem', color: '#556b2f', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    https://www.didar-stuttgart.com/veranstaltungen/{event.slug}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>نوع رویداد</label>
                <select
                  value={event.is_recurring ? 'recurring' : 'dated'}
                  onChange={(e) => handleChange('is_recurring', e.target.value === 'recurring')}
                >
                  <option value="dated">رویداد موقتی (تاریخ مشخص)</option>
                  <option value="recurring">رویداد درحال برگزاری (تکرارشونده)</option>
                </select>
              </div>

              {!event.is_recurring && (
                <div className={styles.formGroup}>
                  <label>تاریخ رویداد (اختیاری)</label>
                  <input
                    type="date"
                    value={event.event_date || ''}
                    onChange={(e) => handleChange('event_date', e.target.value)}
                  />
                </div>
              )}

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
                  min="1"
                  step="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>ظرفیت باقیمانده (نمایش عمومی، اختیاری)</label>
                <input
                  type="number"
                  value={event.remaining_capacity ?? ''}
                  onChange={(e) => handleChange('remaining_capacity', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="مثلاً 5 — به‌صورت «ظرفیت باقیمانده: 5» نمایش داده می‌شود"
                  min="0"
                  step="1"
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
                <label>تصویر رویداد</label>
                {imagePreview && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش تصویر رویداد"
                      style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '420px',
                        maxHeight: '240px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  disabled={uploadingImage}
                />
                <p style={{ marginTop: '0.4rem', color: '#666', fontSize: '0.85rem' }}>
                  JPG، PNG یا WebP، حداکثر ۵ مگابایت.
                </p>

                <label style={{ display: 'block', marginTop: '0.75rem' }}>یا آدرس تصویر (URL)</label>
                <input
                  type="url"
                  value={event.image_url || ''}
                  onChange={(e) => {
                    handleChange('image_url', e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="/images/my-event.jpg"
                />
                <p style={{ marginTop: '0.4rem', color: '#666', fontSize: '0.85rem' }}>
                  برای فایل‌های داخل پروژه می‌توانید مسیرهایی مثل /images/my-event.jpg را وارد کنید.
                </p>
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
                disabled={saving || uploadingImage}
                className={styles.primaryButton}
              >
                {uploadingImage ? 'درحال آپلود تصویر...' : saving ? 'درحال ذخیره...' : 'ذخیره رویداد'}
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
