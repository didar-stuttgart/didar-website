import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/admin.module.css';

export default function AdminEvents() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST' });
        if (response.ok) {
          setSessionValid(true);
          loadEvents();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load events:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('آیا از حذف این رویداد اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/admin/events/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((e) => e.slug !== slug));
      } else {
        alert('خطا در حذف رویداد');
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('خطا در حذف رویداد');
    }
  };

  if (!sessionValid) return null;
  if (loading) return <div className={styles.loading}>درحال بارگذاری...</div>;

  return (
    <>
      <Head>
        <title>رویدادها — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>رویدادها</h1>
          </div>
        </header>

        <div className={styles.contentArea}>
          <div style={{ marginBottom: '20px' }}>
            <Link href="/admin/events/new" className={styles.primaryButton}>
              + رویداد جدید
            </Link>
          </div>

          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <p>هیچ رویدادی وجود ندارد</p>
              <Link href="/admin/events/new">ایجاد رویداد اول</Link>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>ثبت‌نام</th>
                  <th>اقدامات</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.slug}>
                    <td>{event.title_fa || event.title_de}</td>
                    <td>{event.event_date}</td>
                    <td>
                      <span
                        className={
                          event.status === 'published'
                            ? styles.statusPublished
                            : styles.statusDraft
                        }
                      >
                        {event.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          event.registration_open
                            ? styles.statusOpen
                            : styles.statusClosed
                        }
                      >
                        {event.registration_open ? 'باز' : 'بسته'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link
                        href={`/admin/events/${event.slug}`}
                        className={styles.editButton}
                      >
                        ویرایش
                      </Link>
                      <button
                        onClick={() => handleDelete(event.slug)}
                        className={styles.deleteButton}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
