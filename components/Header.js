import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { t, languages } from '@/lib/i18n';

export default function Header({ currentLang, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const navItems = [
    { href: '/', label: t('nav.home', currentLang) },
    { href: '/veranstaltungen', label: t('nav.events', currentLang) },
    { href: '/ueber-uns', label: t('nav.about', currentLang) },
    { href: '/mitglied-werden', label: t('nav.membership', currentLang) },
    { href: '/kontakt', label: t('nav.contact', currentLang) },
  ];

  // Check if link is active (exact match for /, starts with for others)
  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <header className="header" dir={dir}>
      <div className="header-content">
        <Link href="/" className="logo">
          <img 
            src="/images/logo.jpg" 
            alt="DIDAR" 
            className="logo-image"
            style={{
              height: '50px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
          <span className="logo-text">DIDAR</span>
        </Link>

        <nav className="nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </nav>

        <div className="header-end">
          <ul className="social-links">
            <li>
              <a href="https://instagram.com" title="Instagram" rel="noopener noreferrer" target="_blank">
                📷
              </a>
            </li>
            <li>
              <a href="https://t.me" title="Telegram" rel="noopener noreferrer" target="_blank">
                ✈️
              </a>
            </li>
          </ul>

          <ul className="language-switch">
            {Object.entries(languages).map(([lang, config]) => (
              <li key={lang}>
                <button
                  onClick={() => onLanguageChange(lang)}
                  className={currentLang === lang ? 'active' : ''}
                  title={config.name}
                >
                  {config.flag}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" role="navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
