import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';
import AdminDeleteDialog from '../../components/AdminDeleteDialog';
import { adminT, adminDir, adminDate, getAdminLang } from '../../lib/admin-i18n';

export default function AdminRegistrations() {
  const router = useRouter();
  const lang = getAdminLang(router);
  const dir = adminDir(lang);
  const t = (key) => adminT(lang, key);

  const [sessionValid, setSessionValid] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [eventFilter, setEventFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const requestCounter = useRef(0);

  const loadRegistrations = useCallback(async (filter) => {
    // Ignore responses of superseded requests (fast filter switching)
    const requestId = ++requestCounter.current;
    setListLoading(true);
    setLoadError(false);
    try {
      const url = filter && filter !== 'all'
        ? `/api/admin/registrations?eventId=${encodeURIComponent(filter)}`
        : '/api/admin/registrations';
      const res = await fetch(url, { credentials: 'include' });
      if (requestId !== requestCounter.current) return;
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      if (requestId !== requestCounter.current) return;
      console.error('Failed to load registrations:', err);
      setLoadError(true);
    }
    if (requestId === requestCounter.current) {
      setListLoading(false);
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/events', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setEventsError(false);
      } else {
        setEventsError(true);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setEventsError(true);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
        if (response.ok) {
          setSessionValid(true);
          loadEvents();
          loadRegistrations('all');
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (value) => {
    setEventFilter(value);
    setNotice('');
    loadRegistrations(value);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        credentials: 'include',
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
      const res = await fetch('/api/admin/registrations/export', { credentials: 'include' });
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

  const openDelete = (reg) => {
    setDeleteError('');
    setNotice('');
    setDeleteTarget(reg);
  };

  const closeDelete = useCallback(() => {
    setDeleteTarget(null);
    setDeleteError('');
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        // Only remove the row after the server confirmed the deletion
        const deletedId = deleteTarget.id;
        setRegistrations((prev) => prev.filter((r) => r.id !== deletedId));
        setDeleteTarget(null);
        setNotice(t('deleted_ok'));
      } else if (res.status === 401) {
        router.push('/admin/login');
      } else if (res.status === 404) {
        setDeleteError(t('delete_not_found'));
        loadRegistrations(eventFilter);
      } else {
        setDeleteError(t('delete_failed'));
      }
    } catch (err) {
      console.error('Failed to delete registration:', err);
      setDeleteError(t('delete_failed'));
    }
    setDeleting(false);
  };

  const eventTitle = (ev) => (lang === 'de' ? ev.title_de || ev.title_fa : ev.title_fa || ev.title_de) || '';
  const regEventTitle = (reg) => (lang === 'de' ? reg.event_title_de || reg.event_title : reg.event_title);

  const sortedRegs = [...registrations].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'name') return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  if (!sessionValid || loading) {
    return <div className={styles.loading} dir={dir}>{t('loading')}</div>;
  }

  return (
    <>
      <Head>
        <title>{t('reg_title')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout} dir={dir} lang={lang}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>{t('back')}</Link>
            <h1>{t('reg_heading')}</h1>
          </div>
          <nav className={styles.langSwitch} aria-label="Language">
            <Link href={router.asPath} locale="fa" aria-current={lang === 'fa' ? 'true' : undefined}>فارسی</Link>
            <Link href={router.asPath} locale="de" aria-current={lang === 'de' ? 'true' : undefined}>Deutsch</Link>
          </nav>
        </header>

        <div className={styles.contentArea}>
          {notice && <div className={styles.noticeSuccess} role="status">{notice}</div>}
          {eventsError && <div className={styles.noticeError} role="alert">{t('filter_events_error')}</div>}

          <div className={styles.controls}>
            <div className={styles.filterRow}>
              <label htmlFor="event-filter">{t('filter_event')}</label>
              <select
                id="event-filter"
                value={eventFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                disabled={listLoading}
              >
                <option value="all">{t('all_events')}</option>
                {events.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>
                    {eventTitle(ev)}{ev.event_date ? ` — ${ev.event_date}` : ''}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label={t('sort_by')}
              >
                <option value="date">{t('reg_sort_date')}</option>
                <option value="name">{t('reg_sort_name')}</option>
                <option value="status">{t('reg_sort_status')}</option>
              </select>
              <button
                onClick={handleDownloadCSV}
                style={{ padding: '10px 20px' }}
              >
                {t('csv')}
              </button>
            </div>
          </div>

          {loadError ? (
            <div className={styles.noticeError} role="alert">
              <span>{t('load_error')}</span>
              <button type="button" onClick={() => loadRegistrations(eventFilter)}>{t('retry')}</button>
            </div>
          ) : listLoading ? (
            <div className={styles.loading}>{t('loading')}</div>
          ) : registrations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{eventFilter === 'all' ? t('reg_empty') : t('reg_empty_filtered')}</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {sortedRegs.map((reg) => (
                <div key={reg.id} className={styles.registrationCard}>
                  <div className={styles.regHeader}>
                    <div>
                      <h3>{reg.first_name} {reg.last_name}</h3>
                      <div className={styles.regMeta}>
                        {t('reg_event')} {regEventTitle(reg)}
                      </div>
                      <div className={styles.regMeta}>
                        {t('reg_date')} {adminDate(reg.created_at, lang)}
                      </div>
                      {reg.cancelled_at && (
                        <div className={styles.regMeta}>
                          {t('reg_cancelled_at')} {adminDate(reg.cancelled_at, lang)}
                        </div>
                      )}
                    </div>
                    <div className={styles.statusSelect}>
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                      >
                        <option value="new">{t('status_new')}</option>
                        <option value="contacted">{t('status_contacted')}</option>
                        <option value="confirmed">{t('status_confirmed')}</option>
                        <option value="declined">{t('status_declined')}</option>
                        <option value="cancelled">{t('status_cancelled')}</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.regDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>{t('email')}</span>
                      <a href={`mailto:${reg.email}`}>{reg.email}</a>
                    </div>
                    {reg.phone && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('phone')}</span>
                        <p>{reg.phone}</p>
                      </div>
                    )}
                    {reg.telegram_id && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('telegram')}</span>
                        <p>{reg.telegram_id}</p>
                      </div>
                    )}
                    {reg.comment && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('reg_comment')}</span>
                        <p>{reg.comment}</p>
                      </div>
                    )}
                  </div>

                  {reg.admin_notes && (
                    <div className={styles.adminNotes}>
                      <strong>{t('notes')}</strong> {reg.admin_notes}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button type="button" className={styles.deleteButton} onClick={() => openDelete(reg)}>
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminDeleteDialog
        open={Boolean(deleteTarget)}
        lang={lang}
        busy={deleting}
        error={deleteError}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
        details={deleteTarget ? [
          `${deleteTarget.first_name} ${deleteTarget.last_name}`,
          deleteTarget.email,
          `${t('reg_event')} ${regEventTitle(deleteTarget)}`,
          `${t('reg_date')} ${adminDate(deleteTarget.created_at, lang)}`,
        ] : []}
      />
    </>
  );
}
