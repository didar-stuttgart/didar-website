/**
 * Shared, recognizable Instagram and Telegram icon glyphs (inline SVG) plus
 * the site's single source of truth for the canonical social/website URLs.
 * Using one shared component avoids the mismatched icons/handles that were
 * previously hardcoded separately in Header, Footer, the homepage and the
 * Kontakt page.
 */

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/didar_stuttgart/',
  telegram: 'https://t.me/Didar_stuttgart',
  website: 'https://didar-stuttgart.com/',
};

export function InstagramIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TelegramIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path
        fill="currentColor"
        stroke="none"
        d="M6.6 12.1l10.2-4.4c.5-.2 1 .2.8.9l-1.7 8.1c-.1.6-.5.7-1 .4l-2.7-2-1.3 1.3c-.1.1-.3.2-.5.2l.2-2.6 5-4.6c.2-.2 0-.3-.3-.1l-6.2 3.9-2.7-.8c-.6-.2-.6-.6.2-.9z"
      />
    </svg>
  );
}
