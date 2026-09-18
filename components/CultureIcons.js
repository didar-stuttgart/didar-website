/**
 * Restrained SVG line icons for the homepage Cultural Areas section.
 * Phase 11 / Item 7: replaces the colorful emoji (book, film, art, music)
 * that were inconsistent with the site's editorial photography and
 * typography. Same stroke-based style as components/SocialIcons.js, so the
 * whole site uses one consistent icon language.
 */

const defaultProps = {
  width: 32,
  height: 32,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function LiteratureIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function FilmIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <line x1="7" y1="4" x2="7" y2="20" />
      <line x1="17" y1="4" x2="17" y2="20" />
      <line x1="2.5" y1="9" x2="7" y2="9" />
      <line x1="2.5" y1="15" x2="7" y2="15" />
      <line x1="17" y1="9" x2="21.5" y2="9" />
      <line x1="17" y1="15" x2="21.5" y2="15" />
    </svg>
  );
}

export function ArtIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M12 2C6.5 2 2 6.03 2 11c0 3.31 2.69 5 5 5h1.2c.72 0 1.3.58 1.3 1.3 0 .35-.14.66-.36.9-.4.44-.64 1.03-.64 1.67 0 1.4 1.23 2.13 2.5 2.13 5.52 0 10-4.48 10-10S17.5 2 12 2z" />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MusicIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}
