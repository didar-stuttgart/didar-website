import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('رمز عبور نادرست است');
      }
    } catch (err) {
      setError('خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ورود مدیر — دیدار</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>دیدار</h1>
          <p className={styles.subtitle}>پنل مدیریت</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="password">رمز عبور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'درحال بررسی...' : 'ورود'}
            </button>
          </form>

          <p className={styles.description}>
            این پنل تنها برای مدیران دیدار است
          </p>
        </div>
      </div>
    </>
  );
}
