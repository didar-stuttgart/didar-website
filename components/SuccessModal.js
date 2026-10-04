import { useEffect, useRef } from 'react';
import { t } from '@/lib/i18n';

/**
 * Success popup shown after a successful form submission.
 * Same visual pattern as the event registration confirmation modal.
 */
export default function SuccessModal({ currentLang, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        dir={currentLang === 'fa' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: currentLang === 'fa' ? 'right' : 'left',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px', color: '#27ae60' }} aria-hidden="true">✓</div>
          <h2 id="success-modal-title" style={{ margin: '0 0 15px 0', color: '#27ae60' }}>
            {t('form.success_title', currentLang)}
          </h2>
        </div>

        <p style={{ margin: '15px 0', fontSize: '16px', lineHeight: '1.6' }}>
          {t('form.success_message', currentLang)}
        </p>

        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          {t('form.success_close', currentLang)}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
