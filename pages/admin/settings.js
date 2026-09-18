import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminSettings() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          loadSettings();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        alert('تنظیمات با موفقیت ذخیره شدند');
      } else {
        alert('خطا در ذخیره تنظیمات');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }
  if (!settings) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

  return (
    <>
      <Head>
        <title>تنظیمات — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>تنظیمات</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          <form className={styles.contentForm}>
            <section className={styles.formSection}>
              <h2>اطلاعات تماس</h2>

              <div className={styles.formGroup}>
                <label>ایمیل تماس</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="info@example.com"
                />
              </div>
            </section>

            <section className={styles.formSection}>
              <h2>شبکه‌های اجتماعی</h2>

              <div className={styles.formGroup}>
                <label>کانال تلگرام</label>
                <input
                  type="text"
                  value={settings.telegram_channel || ''}
                  onChange={(e) => handleChange('telegram_channel', e.target.value)}
                  placeholder="@channel_name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>تماس تلگرام</label>
                <input
                  type="text"
                  value={settings.telegram_contact || ''}
                  onChange={(e) => handleChange('telegram_contact', e.target.value)}
                  placeholder="@username"
                />
              </div>

              <div className={styles.formGroup}>
                <label>اینستاگرام</label>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </section>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={styles.primaryButton}
              >
                {saving ? 'درحال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
