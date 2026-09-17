import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminMemberships() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          loadMemberships();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadMemberships = async () => {
    try {
      const res = await fetch('/api/admin/memberships');
      if (res.ok) {
        const data = await res.json();
        setMemberships(data.memberships || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load memberships:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/memberships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMemberships(
          memberships.map((m) =>
            m.id === id ? { ...m, status: newStatus } : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to update membership:', err);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch('/api/admin/memberships/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'memberships.csv';
        a.click();
      }
    } catch (err) {
      console.error('Failed to download CSV:', err);
    }
  };

  if (!sessionValid) return null;
  if (loading) return <div className={styles.loading}>درحال بارگذاری...</div>;

  return (
    <>
      <Head>
        <title>درخواست‌های عضویت — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>درخواست‌های عضویت</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          <div className={styles.controls}>
            <button
              onClick={handleDownloadCSV}
              style={{ padding: '10px 20px' }}
            >
              ⬇️ دانلود CSV
            </button>
          </div>

          {memberships.length === 0 ? (
            <div className={styles.emptyState}>
              <p>هیچ درخواست عضویتی وجود ندارد</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {memberships.map((member) => (
                <div key={member.id} className={styles.registrationCard}>
                  <div className={styles.regHeader}>
                    <div>
                      <h3>{member.first_name} {member.last_name}</h3>
                      <div className={styles.regMeta}>
                        تاریخ درخواست: {new Date(member.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                    <div className={styles.statusSelect}>
                      <select
                        value={member.status}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                      >
                        <option value="new">جدید</option>
                        <option value="contacted">تماس گرفته شده</option>
                        <option value="accepted">تأیید شده</option>
                        <option value="declined">رد شده</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.regDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>ایمیل:</span>
                      <a href={`mailto:${member.email}`}>{member.email}</a>
                    </div>
                    {member.phone && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>تلفن:</span>
                        <p>{member.phone}</p>
                      </div>
                    )}
                    {member.telegram_id && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>تلگرام:</span>
                        <p>{member.telegram_id}</p>
                      </div>
                    )}
                    {member.additional_info && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>اطلاعات:</span>
                        <p>{member.additional_info}</p>
                      </div>
                    )}
                  </div>

                  {member.admin_notes && (
                    <div className={styles.adminNotes}>
                      <strong>یادداشت:</strong> {member.admin_notes}
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
