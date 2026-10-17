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

const COPY = {
  fa: {
    dir: 'rtl',
    lang: 'fa',
    subject: 'ثبت‌نام شما دریافت شد — دیدار',
    heading: 'ثبت‌نام شما دریافت شد',
    greeting: (firstName) => `سلام ${firstName}،`,
    eventLabel: 'رویداد',
    received:
      'ثبت‌نام شما دریافت شد. در صورت نیاز، دیدار از طریق ایمیل یا شبکه‌های اجتماعی با شما تماس خواهد گرفت.',
    notConfirmation:
      'این ایمیل فقط رسید دریافت ثبت‌نام است و به معنای تأیید حضور یا پذیرش نهایی نیست.',
    spam:
      'ممکن است ایمیل ما در پوشه Spam یا Junk قرار بگیرد. لطفاً آن پوشه را نیز بررسی کنید.',
    cancelIntro:
      'اگر دیگر نمی‌خواهید یا نمی‌توانید شرکت کنید، می‌توانید ثبت‌نام خود را لغو کنید:',
    cancelLabel: 'لغو ثبت‌نام',
  },
  de: {
    dir: 'ltr',
    lang: 'de',
    subject: 'Ihre Anmeldung wurde erhalten — Didar',
    heading: 'Ihre Anmeldung wurde erhalten',
    greeting: (firstName) => `Hallo ${firstName},`,
    eventLabel: 'Veranstaltung',
    received:
      'Ihre Anmeldung wurde erhalten. Bei Bedarf wird Didar Sie per E-Mail oder über soziale Netzwerke kontaktieren.',
    notConfirmation:
      'Diese E-Mail ist nur eine Eingangsbestätigung. Sie bedeutet keine Bestätigung Ihrer Teilnahme und keine endgültige Zusage.',
    spam:
      'Es kann sein, dass unsere E-Mail im Spam- oder Junk-Ordner landet. Bitte prüfen Sie diesen ebenfalls.',
    cancelIntro:
      'Wenn Sie nicht mehr teilnehmen möchten oder können, können Sie Ihre Anmeldung stornieren:',
    cancelLabel: 'Anmeldung stornieren',
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
 */
export function buildRegistrationReceiptEmail({ firstName, eventTitle, language, cancellationUrl }) {
  const c = language === 'fa' ? COPY.fa : COPY.de;
  const title = eventTitle || '';

  const html = `
<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, Tahoma, sans-serif; line-height: 1.7; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .note { background-color: #f5f5f5; padding: 10px 12px; border-radius: 4px; margin: 16px 0; }
    .cancel { margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container" dir="${c.dir}">
    <h2>${escapeHtml(c.heading)}</h2>
    <p>${escapeHtml(c.greeting(firstName))}</p>
    <p><strong>${escapeHtml(c.eventLabel)}:</strong> ${escapeHtml(title)}</p>
    <p>${escapeHtml(c.received)}</p>
    <p class="note">${escapeHtml(c.notConfirmation)}</p>
    <p>${escapeHtml(c.spam)}</p>
    <p class="cancel">${escapeHtml(c.cancelIntro)}<br>
      <a href="${escapeHtml(cancellationUrl)}">${escapeHtml(c.cancelLabel)}</a>
    </p>
  </div>
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
    c.notConfirmation,
    '',
    c.spam,
    '',
    c.cancelIntro,
    `${c.cancelLabel}: ${cancellationUrl}`,
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
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'DIDAR Stuttgart <noreply@didar-stuttgart.com>';

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
