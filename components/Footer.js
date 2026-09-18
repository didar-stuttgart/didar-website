import Link from 'next/link';
import { t } from '@/lib/i18n';
import { SOCIAL_LINKS, InstagramIcon, TelegramIcon } from '@/components/SocialIcons';

export default function Footer({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const year = new Date().getFullYear();

  return (
    <footer className="footer" dir={dir}>
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>{currentLang === 'fa' ? 'دیدار' : 'DIDAR'}</h3>
            <p>
              {currentLang === 'fa'
                ? 'انجمن فرهنگی هنری دیدار — شتوتگارت'
                : 'Iranische Kulturgemeinschaft Stuttgart'}
            </p>
          </div>

          <div className="footer-section">
            <h3>{t('footer.follow_us', currentLang)}</h3>
            <ul>
              <li>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <InstagramIcon size={18} /> Instagram
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <TelegramIcon size={18} /> Telegram
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t('footer.contact', currentLang)}</h3>
            <ul>
              <li>
                <a href="mailto:info@didar-stuttgart.com" dir="ltr">info@didar-stuttgart.com</a>
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
