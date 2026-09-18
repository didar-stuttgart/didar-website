import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminRegistrations() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          loadRegistrations();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadRegistrations = async () => {
    try {
      const res = await fetch('/api/admin/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRegistrations(
          registrations.map((r) =>
            r.id === id ? { ...r, status: newStatus } : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to update registration:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch('/api/admin/registrations/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registrations.csv';
        a.click();
      }
    } catch (err) {
      console.error('Failed to download CSV:', err);
    }
  };

  const sortedRegs = [...registrations].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.registration_date) - new Date(a.registration_date);
    if (sortBy === 'name') return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

  return (
    <>
      <Head>
        <title>ثبت‌نام‌ها — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>ثبت‌نام‌های رویدادها</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          <div className={styles.controls}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.controls}
            >
              <option value="date">جدیدترین اول</option>
              <option value="name">نام</option>
              <option value="status">وضعیت</option>
            </select>
            <button
              onClick={handleDownloadCSV}
              style={{ marginRight: '10px', padding: '10px 20px' }}
            >
              ⬇️ دانلود CSV
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>هیچ ثبت‌نامی وجود ندارد</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {sortedRegs.map((reg) => (
                <div key={reg.id} className={styles.registrationCard}>
                  <div className={styles.regHeader}>
                    <div>
                      <h3>{reg.first_name} {reg.last_name}</h3>
                      <div className={styles.regMeta}>
                        رویداد: {reg.event_title || reg.event}
                      </div>
                      <div className={styles.regMeta}>
                        تاریخ ثبت‌نام: {new Date(reg.registration_date).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                    <div className={styles.statusSelect}>
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                      >
                        <option value="new">جدید</option>
                        <option value="contacted">تماس گرفته شده</option>
                        <option value="confirmed">تأیید شده</option>
                        <option value="declined">رد شده</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.regDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>ایمیل:</span>
                      <a href={`mailto:${reg.email}`}>{reg.email}</a>
                    </div>
                    {reg.phone && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>تلفن:</span>
                        <p>{reg.phone}</p>
                      </div>
                    )}
                    {reg.telegram_id && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>تلگرام:</span>
                        <p>{reg.telegram_id}</p>
                      </div>
                    )}
                    {reg.comment && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>نوشته:</span>
                        <p>{reg.comment}</p>
                      </div>
                    )}
                  </div>

                  {reg.admin_notes && (
                    <div className={styles.adminNotes}>
                      <strong>یادداشت:</strong> {reg.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
