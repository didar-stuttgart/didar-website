import Link from 'next/link';
import { useState } from 'react';
import { t, languages } from '@/lib/i18n';

export default function Header({ currentLang, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const navItems = [
    { href: '/', label: t('nav.home', currentLang) },
    { href: '/veranstaltungen', label: t('nav.events', currentLang) },
    { href: '/ueber-uns', label: t('nav.about', currentLang) },
    { href: '/mitglied-werden', label: t('nav.membership', currentLang) },
    { href: '/kontakt', label: t('nav.contact', currentLang) },
  ];

  return (
    <header className="header" dir={dir}>
      <div className="header-content">
        <Link href="/" className="logo">
          <span className="logo-text">DIDAR</span>
        </Link>

        <nav className="nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
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
                  aria-current={currentLang === lang ? 'page' : undefined}
                >
                  {config.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('common.close', currentLang)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
