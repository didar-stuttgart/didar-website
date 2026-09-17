import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
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
      const res = await fetch('/api/admin/stats');
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
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (!sessionValid) return null;
  if (loading) return <div className={styles.loading}>درحال بارگذاری...</div>;

  return (
    <>
      <Head>
        <title>پنل مدیریت — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <h1>پنل مدیریت</h1>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            خروج
          </button>
        </header>

        <div className={styles.dashboardGrid}>
          {stats && (
            <div className={styles.statsSection}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.upcomingEvents || 0}</div>
                <div className={styles.statLabel}>رویدادهای آینده</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.newRegistrations || 0}</div>
                <div className={styles.statLabel}>ثبت‌نام جدید این هفته</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.newMemberships || 0}</div>
                <div className={styles.statLabel}>درخواست عضویت جدید</div>
              </div>
            </div>
          )}

          <div className={styles.navigationSection}>
            <Link href="/admin/events" className={styles.navCard}>
              <div className={styles.navIcon}>📅</div>
              <h3>رویدادها</h3>
              <p>ایجاد و ویرایش رویدادها</p>
            </Link>

            <Link href="/admin/registrations" className={styles.navCard}>
              <div className={styles.navIcon}>👥</div>
              <h3>ثبت‌نام‌ها</h3>
              <p>مدیریت ثبت‌نام‌های رویدادها</p>
            </Link>

            <Link href="/admin/memberships" className={styles.navCard}>
              <div className={styles.navIcon}>🎫</div>
              <h3>عضویت</h3>
              <p>مدیریت درخواست‌های عضویت</p>
            </Link>

            <Link href="/admin/content" className={styles.navCard}>
              <div className={styles.navIcon}>✏️</div>
              <h3>محتوا</h3>
              <p>ویرایش متن‌های صفحات</p>
            </Link>

            <Link href="/admin/settings" className={styles.navCard}>
              <div className={styles.navIcon}>⚙️</div>
              <h3>تنظیمات</h3>
              <p>اطلاعات تماس و شبکه‌های اجتماعی</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
