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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
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
      const res = await fetch('/api/admin/events', { credentials: 'include' });
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

  const handleArchive = async (slug) => {
    if (!confirm('آیا می‌خواهید این رویداد را بایگانی کنید؟')) return;

    try {
      const res = await fetch(`/api/admin/events/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        // Update the event status to archived instead of removing it
        setEvents(events.map((e) =>
          e.slug === slug ? { ...e, status: 'archived' } : e
        ));
      } else {
        alert('خطا در بایگانی رویداد');
      }
    } catch (err) {
      console.error('Failed to archive event:', err);
      alert('خطا در بایگانی رویداد');
    }
  };

  // Filter events based on search and status
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title_fa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.title_de.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

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

          {events.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="جستجو بر اساس عنوان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="all">تمام وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی شده</option>
              </select>
            </div>
          )}

          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <p>هیچ رویدادی وجود ندارد</p>
              <Link href="/admin/events/new">ایجاد رویداد اول</Link>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <p>نتیجه‌ای برای جستجو یافت نشد</p>
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
                {filteredEvents.map((event) => (
                  <tr key={event.slug}>
                    <td>{event.title_fa || event.title_de}</td>
                    <td>{event.event_date}</td>
                    <td>
                      <span
                        className={
                          event.status === 'published'
                            ? styles.statusPublished
                            : event.status === 'archived'
                            ? styles.statusArchived
                            : styles.statusDraft
                        }
                      >
                        {event.status === 'published'
                          ? 'منتشر شده'
                          : event.status === 'archived'
                          ? 'بایگانی شده'
                          : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          event.registration_status === 'open'
                            ? styles.statusOpen
                            : styles.statusClosed
                        }
                      >
                        {event.registration_status === 'open'
                          ? 'باز'
                          : event.registration_status === 'closed'
                          ? 'بسته'
                          : 'به‌زودی'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link
                        href={`/admin/events/${event.slug}`}
                        className={styles.editButton}
                      >
                        ویرایش
                      </Link>
                      {event.status === 'published' && (
                        <a
                          href={`/events/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.previewButton}
                        >
                          پیش‌نمایش
                        </a>
                      )}
                      {event.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(event.slug)}
                          className={styles.deleteButton}
                        >
                          بایگانی
                        </button>
                      )}
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
