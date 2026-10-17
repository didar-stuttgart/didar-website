import { useEffect, useRef } from 'react';
import styles from '../styles/admin.module.css';
import { adminT, adminDir } from '../lib/admin-i18n';

/**
 * Confirmation dialog for deleting one admin record.
 * `details` is an array of strings that identify the record to the admin.
 * The confirm button is disabled while a request is running, so a second click
 * cannot send a duplicate deletion.
 */
export default function AdminDeleteDialog({ open, lang, details, busy, error, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (cancelRef.current) cancelRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className={styles.dialogOverlay} onClick={() => { if (!busy) onCancel(); }}>
      <div
        className={styles.dialogBox}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-delete-title"
        dir={adminDir(lang)}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-delete-title">{adminT(lang, 'delete_title')}</h2>
        <ul className={styles.dialogDetails}>
          {details.filter(Boolean).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <p className={styles.dialogWarning}>{adminT(lang, 'delete_warning')}</p>
        {error && <p className={styles.dialogError} role="alert">{error}</p>}
        <div className={styles.dialogActions}>
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={busy} className={styles.dialogCancel}>
            {adminT(lang, 'delete_cancel')}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={styles.dialogDelete}>
            {busy ? adminT(lang, 'deleting') : adminT(lang, 'delete_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
