import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminContent() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          loadContent();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        console.error('API error:', res.status);
        // Set default empty content if API fails
        setContent({
          homepage_hero_title_fa: '',
          homepage_hero_subtitle_fa: '',
          homepage_hero_title_de: '',
          homepage_hero_subtitle_de: '',
          about_intro_fa: '',
          about_intro_de: '',
        });
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      // Set default empty content on error
      setContent({
        homepage_hero_title_fa: '',
        homepage_hero_subtitle_fa: '',
        homepage_hero_title_de: '',
        homepage_hero_subtitle_de: '',
        about_intro_fa: '',
        about_intro_de: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        alert('تغییرات با موفقیت ذخیره شدند');
      } else {
        alert('خطا در ذخیره تغییرات');
      }
    } catch (err) {
      console.error('Failed to save content:', err);
      alert('خطا در ذخیره تغییرات');
    } finally {
      setSaving(false);
    }
  };

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

  return (
    <>
      <Head>
        <title>محتوا — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>محتوای وب‌سایت</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          {content ? (
            <form className={styles.contentForm}>
              <section className={styles.formSection}>
                <h2>صفحه خانگی</h2>

                <div className={styles.formGroup}>
                  <label>عنوان اصلی (فارسی)</label>
                  <input
                    type="text"
                    value={content.homepage_hero_title_fa || ''}
                    onChange={(e) => handleChange('homepage_hero_title_fa', e.target.value)}
                    placeholder="عنوان صفحه خانگی"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>زیر عنوان (فارسی)</label>
                  <input
                    type="text"
                    value={content.homepage_hero_subtitle_fa || ''}
                    onChange={(e) => handleChange('homepage_hero_subtitle_fa', e.target.value)}
                    placeholder="زیر عنوان صفحه خانگی"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Haupttitel (Deutsch)</label>
                  <input
                    type="text"
                    value={content.homepage_hero_title_de || ''}
                    onChange={(e) => handleChange('homepage_hero_title_de', e.target.value)}
                    placeholder="Titel der Startseite"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Untertitel (Deutsch)</label>
                  <input
                    type="text"
                    value={content.homepage_hero_subtitle_de || ''}
                    onChange={(e) => handleChange('homepage_hero_subtitle_de', e.target.value)}
                    placeholder="Untertitel der Startseite"
                  />
                </div>
              </section>

              <section className={styles.formSection}>
                <h2>درباره ما</h2>

                <div className={styles.formGroup}>
                  <label>متن درباره‌ای (فارسی)</label>
                  <textarea
                    value={content.about_intro_fa || ''}
                    onChange={(e) => handleChange('about_intro_fa', e.target.value)}
                    placeholder="متن صفحه درباره‌ی ما"
                    rows="6"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Über uns Text (Deutsch)</label>
                  <textarea
                    value={content.about_intro_de || ''}
                    onChange={(e) => handleChange('about_intro_de', e.target.value)}
                    placeholder="Text der Seite Über uns"
                    rows="6"
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
          ) : (
            <div className={styles.loading}>درحال بارگذاری...</div>
          )}
        </div>
      </div>
    </>
  );
}
