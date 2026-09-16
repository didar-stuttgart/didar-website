import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function Footer({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const year = new Date().getFullYear();

  return (
    <footer className="footer" dir={dir}>
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>DIDAR</h3>
            <p>
              {currentLang === 'fa'
                ? 'انجمن فرهنگی دیدار — شتوتگارت'
                : 'Iranische Kulturgemeinschaft Stuttgart'}
            </p>
          </div>

          <div className="footer-section">
            <h3>{t('footer.follow_us', currentLang)}</h3>
            <ul>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t('footer.contact', currentLang)}</h3>
            <ul>
              <li>
                <a href="mailto:contact@didar-stuttgart.de">contact@didar-stuttgart.de</a>
              </li>
              <li>
                <Link href="/kontakt">{t('nav.contact', currentLang)}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright', currentLang, { year })}</p>
          <div className="footer-legal">
            <Link href="/impressum">{t('footer.impressum', currentLang)}</Link>
            <Link href="/datenschutz">{t('footer.datenschutz', currentLang)}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
