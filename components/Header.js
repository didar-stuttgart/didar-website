import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { t, languages } from '@/lib/i18n';
import { SOCIAL_LINKS, InstagramIcon, TelegramIcon } from '@/components/SocialIcons';

export default function Header({ currentLang, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const toggleRef = useRef(null);

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

  // Close the mobile menu on Escape and return focus to the toggle button
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Close the mobile menu automatically on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  return (
    <header className="header" dir={dir}>
      <div className="header-content">
        <Link href="/" className="logo">
          <picture>
            <source srcSet="/images/logo-header.webp" type="image/webp" />
            <img
              src="/images/logo-header.png"
              alt={currentLang === 'fa' ? 'دیدار' : 'DIDAR'}
              className="logo-image"
              width="50"
              height="50"
              style={{
                height: '50px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </picture>
          <span className="logo-text">{currentLang === 'fa' ? 'دیدار' : 'DIDAR'}</span>
        </Link>

        <nav className="nav" aria-label={t('nav.primary', currentLang)}>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? 'active' : ''}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-end">
          <ul className="social-links">
            <li>
              <a
                href={SOCIAL_LINKS.instagram}
                aria-label="Instagram"
                title="Instagram"
                rel="noopener noreferrer"
                target="_blank"
              >
                <InstagramIcon size={22} />
              </a>
            </li>
            <li>
              <a
                href={SOCIAL_LINKS.telegram}
                aria-label="Telegram"
                title="Telegram"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TelegramIcon size={22} />
              </a>
            </li>
          </ul>

          <ul className="language-switch" aria-label={t('nav.languages', currentLang)}>
            {Object.entries(languages).map(([lang, config]) => (
              <li key={lang}>
                <button
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={currentLang === lang ? 'active' : ''}
                  aria-pressed={currentLang === lang}
                  title={config.name}
                >
                  {config.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t('nav.close_menu', currentLang) : t('nav.menu', currentLang)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            ref={toggleRef}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="mobile-menu"
          id="mobile-menu"
          aria-label={t('nav.primary', currentLang)}
        >
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? 'active' : ''}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-menu-social">
            <a href={SOCIAL_LINKS.telegram} rel="noopener noreferrer" target="_blank">
              <TelegramIcon size={18} /> Telegram
            </a>
            <a href={SOCIAL_LINKS.instagram} rel="noopener noreferrer" target="_blank">
              <InstagramIcon size={18} /> Instagram
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
