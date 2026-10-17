import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';
import AdminDeleteDialog from '../../components/AdminDeleteDialog';
import { adminT, adminDir, adminDate, getAdminLang } from '../../lib/admin-i18n';

export default function AdminMemberships() {
  const router = useRouter();
  const lang = getAdminLang(router);
  const dir = adminDir(lang);
  const t = (key) => adminT(lang, key);

  const [sessionValid, setSessionValid] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadMemberships = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch('/api/admin/memberships', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMemberships(data.memberships || []);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      console.error('Failed to load memberships:', err);
      setLoadError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/memberships/${id}`, {
        method: 'PATCH',
        credentials: 'include',
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
      const res = await fetch('/api/admin/memberships/export', { credentials: 'include' });
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

  const openDelete = (member) => {
    setDeleteError('');
    setNotice('');
    setDeleteTarget(member);
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
      const res = await fetch(`/api/admin/memberships/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        // Only remove the row after the server confirmed the deletion
        const deletedId = deleteTarget.id;
        setMemberships((prev) => prev.filter((m) => m.id !== deletedId));
        setDeleteTarget(null);
        setNotice(t('deleted_ok'));
      } else if (res.status === 401) {
        router.push('/admin/login');
      } else if (res.status === 404) {
        setDeleteError(t('delete_not_found'));
        loadMemberships();
      } else {
        setDeleteError(t('delete_failed'));
      }
    } catch (err) {
      console.error('Failed to delete membership:', err);
      setDeleteError(t('delete_failed'));
    }
    setDeleting(false);
  };

  if (!sessionValid || loading) {
    return <div className={styles.loading} dir={dir}>{t('loading')}</div>;
  }

  return (
    <>
      <Head>
        <title>{t('mem_title')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout} dir={dir} lang={lang}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>{t('back')}</Link>
            <h1>{t('mem_heading')}</h1>
          </div>
          <nav className={styles.langSwitch} aria-label="Language">
            <Link href={router.asPath} locale="fa" aria-current={lang === 'fa' ? 'true' : undefined}>فارسی</Link>
            <Link href={router.asPath} locale="de" aria-current={lang === 'de' ? 'true' : undefined}>Deutsch</Link>
          </nav>
        </header>

        <div className={styles.contentArea}>
          {notice && <div className={styles.noticeSuccess} role="status">{notice}</div>}

          <div className={styles.controls}>
            <button
              onClick={handleDownloadCSV}
              style={{ padding: '10px 20px' }}
            >
              {t('csv')}
            </button>
          </div>

          {loadError ? (
            <div className={styles.noticeError} role="alert">
              <span>{t('load_error')}</span>
              <button type="button" onClick={loadMemberships}>{t('retry')}</button>
            </div>
          ) : memberships.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('mem_empty')}</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {memberships.map((member) => (
                <div key={member.id} className={styles.registrationCard}>
                  <div className={styles.regHeader}>
                    <div>
                      <h3>{member.first_name} {member.last_name}</h3>
                      <div className={styles.regMeta}>
                        {t('mem_date')} {adminDate(member.created_at, lang)}
                      </div>
                    </div>
                    <div className={styles.statusSelect}>
                      <select
                        value={member.status}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                      >
                        <option value="new">{t('status_new')}</option>
                        <option value="contacted">{t('status_contacted')}</option>
                        <option value="accepted">{t('status_accepted')}</option>
                        <option value="declined">{t('status_declined')}</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.regDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>{t('email')}</span>
                      <a href={`mailto:${member.email}`}>{member.email}</a>
                    </div>
                    {member.phone && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('phone')}</span>
                        <p>{member.phone}</p>
                      </div>
                    )}
                    {member.telegram_id && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('telegram')}</span>
                        <p>{member.telegram_id}</p>
                      </div>
                    )}
                    {member.additional_info && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>{t('mem_info')}</span>
                        <p>{member.additional_info}</p>
                      </div>
                    )}
                  </div>

                  {member.admin_notes && (
                    <div className={styles.adminNotes}>
                      <strong>{t('notes')}</strong> {member.admin_notes}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button type="button" className={styles.deleteButton} onClick={() => openDelete(member)}>
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
          `${t('mem_date')} ${adminDate(deleteTarget.created_at, lang)}`,
        ] : []}
      />
    </>
  );
}
