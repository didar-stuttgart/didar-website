import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin.module.css';

export default function AdminSettings() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify', { method: 'POST', credentials: 'include' });
        if (response.ok) {
          setSessionValid(true);
          loadSettings();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/organization', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setMessage({ type: 'error', text: 'خطا در بارگذاری تنظیمات' });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setMessage({ type: 'error', text: 'خطا در بارگذاری تنظیمات' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings/organization', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شدند' });
        setEditingId(null);
        loadSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'خطا در ذخیره تنظیمات' });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    } finally {
      setSaving(false);
    }
  };

  if (!sessionValid || loading) {
    return <div className={styles.loading}>درحال بارگذاری...</div>;
  }

  return (
    <>
      <Head>
        <title>تنظیمات — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.adminLayout}>
        <header className={styles.adminHeader}>
          <div>
            <Link href="/admin" className={styles.backLink}>← بازگشت</Link>
            <h1>تنظیمات سازمان</h1>
          </div>
        </header>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ margin: '1rem', padding: '1rem', borderRadius: '4px' }}>
            {message.text}
          </div>
        )}

        <div className={styles.contentArea}>
          {editingId ? (
            <SettingsEditor
              item={items.find(i => i.id === editingId)}
              onSave={handleSaveItem}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          ) : (
            <div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: item.key?.includes('[TEST]') ? '#fff3cd' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4>{item.admin_label}</h4>
                        {item.key?.includes('[TEST]') && <span style={{ color: '#856404', fontSize: '0.85rem' }}>🧪 TEST</span>}
                      </div>
                      <button
                        onClick={() => setEditingId(item.id)}
                        style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ویرایش
                      </button>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                      {item.admin_help}
                    </p>
                    {item.value_text && (
                      <p style={{ color: '#333', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                        <strong>مقدار:</strong> {item.value_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SettingsEditor({ item, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(item);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManagerChange = (index, field, value) => {
    const managers = formData.value_json || [];
    managers[index] = { ...managers[index], [field]: value };
    handleChange('value_json', [...managers]);
  };

  const handleAddManager = () => {
    const managers = formData.value_json || [];
    const newId = `mgr_${Date.now()}`;
    managers.push({ id: newId, name: '', role: '', email: '' });
    handleChange('value_json', [...managers]);
  };

  const handleRemoveManager = (index) => {
    const managers = formData.value_json || [];
    managers.splice(index, 1);
    handleChange('value_json', [...managers]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isManager = item.key === 'organization_managers';

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3>{formData.admin_label}</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{formData.admin_help}</p>
      </div>

      {isManager ? (
        // Managers structured editor with form fields
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
            اعضای تیم
          </label>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', marginBottom: '1rem', background: '#f9f9f9' }}>
            {(!formData.value_json || formData.value_json.length === 0) ? (
              <p style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                هیچ عضوی اضافه نشده است
              </p>
            ) : (
              formData.value_json.map((manager, index) => (
                <div key={manager.id} style={{ marginBottom: '1rem', padding: '1rem', background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                      نام
                    </label>
                    <input
                      type="text"
                      value={manager.name || ''}
                      onChange={(e) => handleManagerChange(index, 'name', e.target.value)}
                      placeholder="نام و نام‌خانوادگی"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                      نقش
                    </label>
                    <input
                      type="text"
                      value={manager.role || ''}
                      onChange={(e) => handleManagerChange(index, 'role', e.target.value)}
                      placeholder="مثال: مدیر، بنیانگذار"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={manager.email || ''}
                      onChange={(e) => handleManagerChange(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveManager(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={handleAddManager}
            style={{
              padding: '0.5rem 1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}
          >
            + افزودن عضو جدید
          </button>
        </div>
      ) : formData.is_bilingual ? (
        // Bilingual scalar
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              فارسی
            </label>
            <input
              type="text"
              value={formData.value_text_fa || ''}
              onChange={(e) => handleChange('value_text_fa', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Deutsch
            </label>
            <input
              type="text"
              value={formData.value_text_de || ''}
              onChange={(e) => handleChange('value_text_de', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </>
      ) : (
        // Scalar
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            مقدار
          </label>
          <input
            type="text"
            value={formData.value_text || ''}
            onChange={(e) => handleChange('value_text', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
      )}

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
