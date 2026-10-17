import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';
import AdminDeleteDialog from '../../components/AdminDeleteDialog';
import { adminT, adminDir, adminDate, getAdminLang } from '../../lib/admin-i18n';

export default function AdminContact() {
  const router = useRouter();
  const lang = getAdminLang(router);
  const dir = adminDir(lang);
  const t = (key) => adminT(lang, key);

  const [sessionValid, setSessionValid] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadContacts = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch('/api/admin/contact', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      console.error('Failed to load contact submissions:', err);
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
          loadContacts();
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

  const openDelete = (contact) => {
    setDeleteError('');
    setNotice('');
    setDeleteTarget(contact);
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
      const res = await fetch(`/api/admin/contact/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        // Only remove the row after the server confirmed the deletion
        const deletedId = deleteTarget.id;
        setContacts((prev) => prev.filter((c) => c.id !== deletedId));
        setDeleteTarget(null);
        setNotice(t('deleted_ok'));
      } else if (res.status === 401) {
        router.push('/admin/login');
      } else if (res.status === 404) {
        setDeleteError(t('delete_not_found'));
        loadContacts();
      } else {
        setDeleteError(t('delete_failed'));
      }
    } catch (err) {
      console.error('Failed to delete contact submission:', err);
      setDeleteError(t('delete_failed'));
    }
    setDeleting(false);
  };

  const preview = (text) => (text && text.length > 120 ? `${text.slice(0, 120)}…` : text || '');

  if (!sessionValid || loading) {
    return <div className={styles.loading} dir={dir}>{t('loading')}</div>;
  }

  return (
    <>
      <Head>
        <title>{t('con_title')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout} dir={dir} lang={lang}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>{t('back')}</Link>
            <h1>{t('con_heading')}</h1>
          </div>
          <nav className={styles.langSwitch} aria-label="Language">
            <Link href={router.asPath} locale="fa" aria-current={lang === 'fa' ? 'true' : undefined}>فارسی</Link>
            <Link href={router.asPath} locale="de" aria-current={lang === 'de' ? 'true' : undefined}>Deutsch</Link>
          </nav>
        </header>

        <div className={styles.contentArea}>
          {notice && <div className={styles.noticeSuccess} role="status">{notice}</div>}

          {loadError ? (
            <div className={styles.noticeError} role="alert">
              <span>{t('load_error')}</span>
              <button type="button" onClick={loadContacts}>{t('retry')}</button>
            </div>
          ) : contacts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('con_empty')}</p>
            </div>
          ) : (
            <div className={styles.registrationsList}>
              {contacts.map((contact) => (
                <div key={contact.id} className={styles.registrationCard}>
                  <div className={styles.regHeader}>
                    <div>
                      <h3>{contact.name}</h3>
                      <div className={styles.regMeta}>
                        {t('con_date')} {adminDate(contact.created_at, lang)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.regDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>{t('email')}</span>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>{t('con_message')}</span>
                      <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{contact.message}</p>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button type="button" className={styles.deleteButton} onClick={() => openDelete(contact)}>
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
          deleteTarget.name,
          deleteTarget.email,
          `${t('con_date')} ${adminDate(deleteTarget.created_at, lang)}`,
          preview(deleteTarget.message),
        ] : []}
      />
    </>
  );
}
