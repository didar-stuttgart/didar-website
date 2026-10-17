import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';
import { adminT, adminDir, getAdminLang } from '../../lib/admin-i18n';

export default function AdminDashboard() {
  const router = useRouter();
  const lang = getAdminLang(router);
  const dir = adminDir(lang);
  const t = (key) => adminT(lang, key);
  const [sessionValid, setSessionValid] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
        if (response.ok) {
          setSessionValid(true);
          loadStats();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  if (!sessionValid || loading) {
    return <div className={styles.loading} dir={dir}>{t('loading')}</div>;
  }

  return (
    <>
      <Head>
        <title>{t('dash_title')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout} dir={dir} lang={lang}>
        <header className={styles.adminHeader}>
          <div>
            <h1>{t('dash_heading')}</h1>
          </div>
          <nav className={styles.langSwitch} aria-label="Language">
            <Link href={router.asPath} locale="fa" aria-current={lang === 'fa' ? 'true' : undefined}>فارسی</Link>
            <Link href={router.asPath} locale="de" aria-current={lang === 'de' ? 'true' : undefined}>Deutsch</Link>
          </nav>
          <button onClick={handleLogout} className={styles.logoutButton}>
            {t('dash_logout')}
          </button>
        </header>

        <div className={styles.dashboardGrid}>
          {stats && (
            <div className={styles.statsSection}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.upcomingEvents || 0}</div>
                <div className={styles.statLabel}>{t('dash_stat_events')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.newRegistrations || 0}</div>
                <div className={styles.statLabel}>{t('dash_stat_regs')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.newMemberships || 0}</div>
                <div className={styles.statLabel}>{t('dash_stat_members')}</div>
              </div>
            </div>
          )}

          <div className={styles.navigationSection}>
            <Link href="/admin/events" className={styles.navCard}>
              <div className={styles.navIcon}>📅</div>
              <h3>{t('dash_events')}</h3>
              <p>{t('dash_events_desc')}</p>
            </Link>

            <Link href="/admin/registrations" className={styles.navCard}>
              <div className={styles.navIcon}>👥</div>
              <h3>{t('dash_regs')}</h3>
              <p>{t('dash_regs_desc')}</p>
            </Link>

            <Link href="/admin/memberships" className={styles.navCard}>
              <div className={styles.navIcon}>🎫</div>
              <h3>{t('dash_members')}</h3>
              <p>{t('dash_members_desc')}</p>
            </Link>

            <Link href="/admin/contact" className={styles.navCard}>
              <div className={styles.navIcon}>✉️</div>
              <h3>{t('dash_contact')}</h3>
              <p>{t('dash_contact_desc')}</p>
            </Link>

            <Link href="/admin/content" className={styles.navCard}>
              <div className={styles.navIcon}>✏️</div>
              <h3>{t('dash_content')}</h3>
              <p>{t('dash_content_desc')}</p>
            </Link>

            <Link href="/admin/settings" className={styles.navCard}>
              <div className={styles.navIcon}>⚙️</div>
              <h3>{t('dash_settings')}</h3>
              <p>{t('dash_settings_desc')}</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
