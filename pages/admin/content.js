import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminContent() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
        if (response.ok) {
          setSessionValid(true);
          loadContent();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content/cms', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setContentItems(data.items || []);
      } else {
        setMessage({ type: 'error', text: 'خطا در بارگذاری محتوا' });
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      setMessage({ type: 'error', text: 'خطا در بارگذاری محتوا' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/content/cms', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'محتوا با موفقیت ذخیره شد' });
        setEditingItem(null);
        loadContent();
      } else {
        setMessage({ type: 'error', text: data.error || 'خطا در ذخیره محتوا' });
      }
    } catch (err) {
      console.error('Failed to save content:', err);
      setMessage({ type: 'error', text: 'خطا در ذخیره محتوا' });
    } finally {
      setSaving(false);
    }
  };

  const pages = ['all', ...new Set(contentItems.map(item => item.page))].sort();
  const filteredItems = selectedPage === 'all'
    ? contentItems
    : contentItems.filter(item => item.page === selectedPage);

  const groupedBySection = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

  return (
    <>
      <Head>
        <title>محتوای CMS — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>محتوای وب‌سایت</h1>
          </div>
        </header>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ margin: '1rem', padding: '1rem', borderRadius: '4px' }}>
            {message.text}
          </div>
        )}

        <div className={styles.contentArea}>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => setSelectedPage(page)}
                style={{
                  padding: '0.5rem 1rem',
                  border: selectedPage === page ? '2px solid var(--color-primary)' : '1px solid #ccc',
                  background: selectedPage === page ? 'var(--color-primary)' : 'white',
                  color: selectedPage === page ? 'white' : 'black',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {page === 'all' ? 'تمام صفحات' : page}
              </button>
            ))}
          </div>

          {editingItem ? (
            <ContentEditor
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setEditingItem(null)}
              saving={saving}
            />
          ) : (
            <div>
              {Object.entries(groupedBySection).map(([section, items]) => (
                <div key={section} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>{section}</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {items.map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '1rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: item.key.includes('[TEST]') ? '#fff3cd' : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <div>
                            <h4>{item.admin_label}</h4>
                            {item.key.includes('[TEST]') && <span style={{ color: '#856404', fontSize: '0.85rem' }}>🧪 TEST</span>}
                          </div>
                          <button
                            onClick={() => setEditingItem(item)}
                            style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ویرایش
                          </button>
                        </div>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                          {item.content_fa?.substring(0, 50)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ContentEditor({ item, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(item);

  const handleChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      [`content_${lang}`]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3>{formData.admin_label}</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{formData.admin_help}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          محتوای فارسی
        </label>
        {formData.content_type === 'rich_text' ? (
          <textarea
            value={formData.content_fa || ''}
            onChange={(e) => handleChange('fa', e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontFamily: 'monospace'
            }}
            placeholder="Markdown supported"
          />
        ) : formData.content_type === 'textarea' ? (
          <textarea
            value={formData.content_fa || ''}
            onChange={(e) => handleChange('fa', e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        ) : (
          <input
            type="text"
            value={formData.content_fa || ''}
            onChange={(e) => handleChange('fa', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Deutsches Inhaltsfeld
        </label>
        {formData.content_type === 'rich_text' ? (
          <textarea
            value={formData.content_de || ''}
            onChange={(e) => handleChange('de', e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontFamily: 'monospace'
            }}
            placeholder="Markdown supported"
          />
        ) : formData.content_type === 'textarea' ? (
          <textarea
            value={formData.content_de || ''}
            onChange={(e) => handleChange('de', e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        ) : (
          <input
            type="text"
            value={formData.content_de || ''}
            onChange={(e) => handleChange('de', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'درحال ذخیره...' : 'ذخیره'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          لغو
        </button>
      </div>
    </form>
  );
}
