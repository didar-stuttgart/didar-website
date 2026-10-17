/**
 * Registration receipt email (sent to the person who registered)
 *
 * This is an acknowledgment of receipt ONLY. It must never state or imply that
 * attendance or the registration has been confirmed/accepted: registrations
 * remain manually reviewed by the admins.
 *
 * - Sent after the registration was saved successfully
 * - Never throws: failures are logged server-side and never affect the
 *   registration (which is already stored)
 * - Never logs the cancellation link / raw token
 * - Uses a deterministic Idempotency-Key so a retry cannot send it twice
 */

import { buildCancellationUrl } from '@/lib/registration-cancellation';

// Official Didar identity/links (fixed values; not derived from environment)
const SITE_URL = 'https://www.didar-stuttgart.com';
const LOGO_URL = `${SITE_URL}/images/logo.png`;
const CONTACT_EMAIL = 'info@didar-stuttgart.com';
const CONTACT_URL = `${SITE_URL}/kontakt`;
const INSTAGRAM_URL = 'https://www.instagram.com/didar_stuttgart/';
const TELEGRAM_URL = 'https://t.me/Didar_stuttgart';

// Colors taken from styles/globals.css
const C = {
  cream: '#fdf7f2',
  offWhite: '#faf8f5',
  grayLight: '#f5f1eb',
  border: '#e5ddd3',
  olive: '#556b2f',
  oliveDark: '#3d4d1f',
  text: '#2c2c2c',
  muted: '#666666',
};

const COPY = {
  fa: {
    dir: 'rtl',
    lang: 'fa',
    align: 'right',
    subject: 'ثبت‌نام شما دریافت شد — دیدار',
    logoAlt: 'دیدار',
    heading: 'درخواست ثبت‌نام شما دریافت شد',
    greeting: (firstName) => `سلام ${firstName}،`,
    eventLabel: 'رویداد',
    received:
      'ثبت‌نام شما دریافت شد. در صورت نیاز، دیدار از طریق ایمیل یا شبکه‌های اجتماعی با شما تماس خواهد گرفت.',
    spam:
      'ممکن است ایمیل ما در پوشه Spam یا Junk قرار بگیرد. لطفاً آن پوشه را نیز بررسی کنید.',
    cancelIntro:
      'اگر دیگر نمی‌خواهید یا نمی‌توانید شرکت کنید، می‌توانید ثبت‌نام خود را لغو کنید:',
    cancelLabel: 'لغو ثبت‌نام',
    contactIntro: 'برای تماس با ما می‌توانید از طریق ایمیل زیر با ما در ارتباط باشید:',
    contactForm: 'یا فرم تماس وب‌سایت دیدار را تکمیل کنید:',
    websiteLabel: 'وب‌سایت',
    signoff: ['با احترام', 'دیدار', 'انجمن فرهنگی هنری اشتوتگارت'],
    org: ['دیدار', 'انجمن فرهنگی هنری اشتوتگارت'],
    font: "Tahoma, 'Segoe UI', Arial, sans-serif",
    headingFont: "Tahoma, 'Segoe UI', Arial, sans-serif",
  },
  de: {
    dir: 'ltr',
    lang: 'de',
    align: 'left',
    subject: 'Ihre Anmeldung wurde erhalten — Didar',
    logoAlt: 'Didar',
    heading: 'Ihre Anmeldeanfrage ist eingegangen',
    greeting: (firstName) => `Hallo ${firstName},`,
    eventLabel: 'Veranstaltung',
    received:
      'Ihre Anmeldung wurde erhalten. Bei Bedarf wird Didar Sie per E-Mail oder über soziale Netzwerke kontaktieren.',
    spam:
      'Es kann sein, dass unsere E-Mail im Spam- oder Junk-Ordner landet. Bitte prüfen Sie diesen ebenfalls.',
    cancelIntro:
      'Wenn Sie nicht mehr teilnehmen möchten oder können, können Sie Ihre Anmeldung stornieren:',
    cancelLabel: 'Anmeldung stornieren',
    contactIntro: 'Bei Fragen können Sie uns per E-Mail kontaktieren:',
    contactForm: 'Alternativ können Sie unser Kontaktformular auf der Website nutzen:',
    websiteLabel: 'Website',
    signoff: ['Mit freundlichen Grüßen', 'Iranische Kulturgemeinschaft Stuttgart', 'Stuttgart'],
    org: ['Iranische Kulturgemeinschaft Stuttgart'],
    font: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    headingFont: "Georgia, 'Times New Roman', serif",
  },
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Build subject/html/text for the receipt email. Exported for testing.
 *
 * Layout: simple centered table layout with inline CSS only (no JavaScript,
 * no external CSS/fonts, no tracking, one logo image). The plain-text part
 * mirrors the same content.
 */
export function buildRegistrationReceiptEmail({ firstName, eventTitle, language, cancellationUrl }) {
  const c = language === 'fa' ? COPY.fa : COPY.de;
  const title = eventTitle || '';
  const accentSide = c.dir === 'rtl' ? 'right' : 'left';
  const link = `color:${C.olive};text-decoration:underline;`;
  const ltr = (t) => `<span dir="ltr" style="unicode-bidi:embed;">${t}</span>`;
  const p = (inner, extra = '') =>
    `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${C.text};${extra}">${inner}</p>`;

  const html = `
<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(c.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.cream}" style="background-color:${C.cream};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${c.dir}" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid ${C.border};border-radius:8px;font-family:${c.font};">
          <tr>
            <td align="center" style="padding:32px 24px 8px 24px;">
              <img src="${LOGO_URL}" width="72" height="72" alt="${escapeHtml(c.logoAlt)}" style="display:block;width:72px;height:72px;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 24px 8px 24px;">
              <h1 style="margin:0;font-family:${c.headingFont};font-size:26px;line-height:1.3;font-weight:normal;color:${C.oliveDark};">${escapeHtml(c.heading)}</h1>
            </td>
          </tr>
          <tr>
            <td align="${c.align}" dir="${c.dir}" style="padding:16px 32px 0 32px;font-family:${c.font};">
              ${p(escapeHtml(c.greeting(firstName)))}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
                <tr>
                  <td dir="${c.dir}" align="${c.align}" bgcolor="${C.offWhite}" style="background-color:${C.offWhite};border:1px solid ${C.border};border-${accentSide}:4px solid ${C.olive};border-radius:6px;padding:14px 16px;font-family:${c.font};">
                    <div style="font-size:13px;line-height:1.4;color:${C.muted};margin:0 0 4px 0;">${escapeHtml(c.eventLabel)}</div>
                    <div style="font-size:18px;line-height:1.5;color:${C.oliveDark};font-weight:bold;">${escapeHtml(title)}</div>
                  </td>
                </tr>
              </table>
              ${p(escapeHtml(c.received))}
              ${p(escapeHtml(c.cancelIntro), 'margin-bottom:12px;')}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${C.olive}" style="background-color:${C.olive};border-radius:6px;">
                    <a href="${escapeHtml(cancellationUrl)}" style="display:inline-block;padding:13px 28px;font-family:${c.font};font-size:16px;font-weight:bold;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(c.cancelLabel)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="${c.align}" dir="${c.dir}" style="padding:20px 32px 0 32px;font-family:${c.font};">
              ${p(escapeHtml(c.spam), `font-size:14px;color:${C.muted};`)}
            </td>
          </tr>
          <tr>
            <td dir="${c.dir}" align="${c.align}" style="padding:8px 32px 0 32px;font-family:${c.font};">
              <div style="border-top:1px solid ${C.border};padding-top:20px;">
                ${p(escapeHtml(c.contactIntro), 'margin-bottom:4px;')}
                ${p(`<a href="mailto:${CONTACT_EMAIL}" style="${link}">${ltr(CONTACT_EMAIL)}</a>`, 'margin-bottom:12px;')}
                ${p(escapeHtml(c.contactForm), 'margin-bottom:4px;')}
                ${p(`<a href="${CONTACT_URL}" style="${link}">${ltr('www.didar-stuttgart.com/kontakt')}</a>`, 'margin-bottom:20px;')}
                <p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:${C.text};">${c.signoff
                  .map((l, i) => (i === 0 ? escapeHtml(l) : `<strong>${escapeHtml(l)}</strong>`))
                  .join('<br>')}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td dir="${c.dir}" align="center" bgcolor="${C.grayLight}" style="background-color:${C.grayLight};border-top:1px solid ${C.border};border-radius:0 0 8px 8px;padding:20px 24px;font-family:${c.font};font-size:13px;line-height:1.8;color:${C.muted};">
              <div style="font-weight:bold;color:${C.oliveDark};">${c.org.map(escapeHtml).join('<br>')}</div>
              <div style="margin-top:8px;">${escapeHtml(c.websiteLabel)}: <a href="${SITE_URL}/" style="${link}">${ltr('www.didar-stuttgart.com')}</a></div>
              <div>Instagram: <a href="${INSTAGRAM_URL}" style="${link}">${ltr('@didar_stuttgart')}</a></div>
              <div>Telegram: <a href="${TELEGRAM_URL}" style="${link}">${ltr('@Didar_stuttgart')}</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = [
    c.heading,
    '',
    c.greeting(firstName),
    '',
    `${c.eventLabel}: ${title}`,
    '',
    c.received,
    '',
    c.cancelIntro,
    `${c.cancelLabel}: ${cancellationUrl}`,
    '',
    c.spam,
    '',
    '--',
    c.contactIntro,
    CONTACT_EMAIL,
    '',
    c.contactForm,
    'www.didar-stuttgart.com/kontakt',
    '',
    ...c.signoff,
    '',
    '--',
    ...c.org,
    `${c.websiteLabel}: www.didar-stuttgart.com`,
    'Instagram: @didar_stuttgart',
    'Telegram: @Didar_stuttgart',
  ].join('\n');

  return { subject: c.subject, html, text };
}

/**
 * Send the receipt email to the registrant. Never throws.
 * @returns {Promise<boolean>} true if Resend accepted the message
 */
export async function sendRegistrationReceipt({
  registrationId,
  eventTitle,
  firstName,
  email,
  language,
  cancellationToken,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'Didar Stuttgart <noreply@didar-stuttgart.com>';

  if (!apiKey) {
    // Never log the cancellation link or the recipient here
    console.log('[Receipt Email] Resend not configured; receipt email skipped.', { registrationId });
    return false;
  }

  try {
    const lang = language === 'fa' ? 'fa' : 'de';
    const { subject, html, text } = buildRegistrationReceiptEmail({
      firstName,
      eventTitle,
      language: lang,
      cancellationUrl: buildCancellationUrl(cancellationToken, lang),
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `registration-receipt-${registrationId}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Receipt Email] Failed to send registration receipt:', {
        statusCode: response.status,
        error: String(error).slice(0, 300),
        registrationId,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Receipt Email] Error sending registration receipt:', error.message);
    return false;
  }
}
