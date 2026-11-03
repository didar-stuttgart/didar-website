/**
 * Admin Email Notification Utility
 * Sends admin-only notifications for form submissions via Resend
 * 
 * - No user-facing emails here (the registration receipt lives in
 *   lib/registration-receipt-email.js)
 * - No verification flows
 * - Notifications only sent after successful database insertion
 * - Email failure does not affect form submission response
 * - Uses idempotency keys to prevent duplicate notifications
 */

function logNotificationFailure(notificationType, submissionId, errorCategory, statusCode = null) {
  const metadata = {
    notificationType,
    submissionId,
    errorCategory,
  };

  if (Number.isInteger(statusCode)) {
    metadata.statusCode = statusCode;
  }

  console.error('[Admin Email] Notification failure', metadata);
}

/**
 * Send event registration notification to admin
 * Called after successful database insertion
 */
export async function sendRegistrationNotification({
  submissionId,
  eventTitle,
  firstName,
  lastName,
  email,
  phone,
  telegramId,
  comment,
  timestamp,
}) {
  const notificationEmail = process.env.DIDAR_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'Didar Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    logNotificationFailure('event_registration', submissionId, 'configuration_missing');
    return;
  }

  try {
    const idempotencyKey = `registration-${submissionId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 8px; background-color: #fafafa; border-left: 3px solid #007bff; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>[DIDAR] New Event Registration — ${escapeHtml(eventTitle)}</h2>
    </div>

    <div class="field">
      <div class="label">Event Name:</div>
      <div class="value">${escapeHtml(eventTitle)}</div>
    </div>

    <div class="field">
      <div class="label">First Name:</div>
      <div class="value">${escapeHtml(firstName)}</div>
    </div>

    <div class="field">
      <div class="label">Last Name:</div>
      <div class="value">${escapeHtml(lastName)}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div class="value">${escapeHtml(email)}</div>
    </div>

    ${phone ? `
    <div class="field">
      <div class="label">Phone:</div>
      <div class="value">${escapeHtml(phone)}</div>
    </div>
    ` : ''}

    ${telegramId ? `
    <div class="field">
      <div class="label">Telegram ID:</div>
      <div class="value">${escapeHtml(telegramId)}</div>
    </div>
    ` : ''}

    ${comment ? `
    <div class="field">
      <div class="label">Comment:</div>
      <div class="value">${escapeHtml(comment)}</div>
    </div>
    ` : ''}

    <div class="field">
      <div class="label">Submission ID:</div>
      <div class="value">${escapeHtml(String(submissionId))}</div>
    </div>

    <div class="field">
      <div class="label">Timestamp:</div>
      <div class="value">${escapeHtml(timestamp)}</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: `[DIDAR] New Event Registration — ${eventTitle}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      logNotificationFailure('event_registration', submissionId, 'provider_rejected', response.status);
    }
  } catch {
    logNotificationFailure('event_registration', submissionId, 'request_failed');
  }
}

/**
 * Send membership application notification to admin
 * Called after successful database insertion
 */
export async function sendMembershipNotification({
  submissionId,
  firstName,
  lastName,
  email,
  phone,
  telegramId,
  additionalInfo,
  timestamp,
}) {
  const notificationEmail = process.env.DIDAR_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'Didar Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    logNotificationFailure('membership_application', submissionId, 'configuration_missing');
    return;
  }

  try {
    const idempotencyKey = `membership-${submissionId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 8px; background-color: #fafafa; border-left: 3px solid #007bff; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>[DIDAR] New Membership Application</h2>
    </div>

    <div class="field">
      <div class="label">First Name:</div>
      <div class="value">${escapeHtml(firstName)}</div>
    </div>

    <div class="field">
      <div class="label">Last Name:</div>
      <div class="value">${escapeHtml(lastName)}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div class="value">${escapeHtml(email)}</div>
    </div>

    ${phone ? `
    <div class="field">
      <div class="label">Phone:</div>
      <div class="value">${escapeHtml(phone)}</div>
    </div>
    ` : ''}

    ${telegramId ? `
    <div class="field">
      <div class="label">Telegram ID:</div>
      <div class="value">${escapeHtml(telegramId)}</div>
    </div>
    ` : ''}

    ${additionalInfo ? `
    <div class="field">
      <div class="label">Additional Information:</div>
      <div class="value">${escapeHtml(additionalInfo)}</div>
    </div>
    ` : ''}

    <div class="field">
      <div class="label">Submission ID:</div>
      <div class="value">${escapeHtml(String(submissionId))}</div>
    </div>

    <div class="field">
      <div class="label">Timestamp:</div>
      <div class="value">${escapeHtml(timestamp)}</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: '[DIDAR] New Membership Application',
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      logNotificationFailure('membership_application', submissionId, 'provider_rejected', response.status);
    }
  } catch {
    logNotificationFailure('membership_application', submissionId, 'request_failed');
  }
}

/**
 * Send contact form notification to admin
 * Called after successful database insertion
 */
export async function sendContactNotification({
  submissionId,
  name,
  email,
  message,
  timestamp,
}) {
  const notificationEmail = process.env.DIDAR_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'Didar Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    logNotificationFailure('contact_message', submissionId, 'configuration_missing');
    return;
  }

  try {
    const idempotencyKey = `contact-${submissionId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 8px; background-color: #fafafa; border-left: 3px solid #007bff; padding-left: 10px; }
    .message-content { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>[DIDAR] New Contact Message</h2>
    </div>

    <div class="field">
      <div class="label">Name:</div>
      <div class="value">${escapeHtml(name)}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div class="value">${escapeHtml(email)}</div>
    </div>

    <div class="field">
      <div class="label">Message:</div>
      <div class="value message-content">${escapeHtml(message)}</div>
    </div>

    <div class="field">
      <div class="label">Submission ID:</div>
      <div class="value">${escapeHtml(String(submissionId))}</div>
    </div>

    <div class="field">
      <div class="label">Timestamp:</div>
      <div class="value">${escapeHtml(timestamp)}</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: '[DIDAR] New Contact Message',
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      logNotificationFailure('contact_message', submissionId, 'provider_rejected', response.status);
    }
  } catch {
    logNotificationFailure('contact_message', submissionId, 'request_failed');
  }
}

/**
 * Send event registration CANCELLED notification to admin
 * Called only when a registrant actually cancelled through the emailed link
 * (state changed now). Never includes the cancellation token.
 */
export async function sendRegistrationCancellationNotification({
  registrationId,
  eventTitle,
  firstName,
  lastName,
  email,
  previousStatus,
  cancelledAt,
}) {
  const notificationEmail = process.env.DIDAR_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'Didar Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    logNotificationFailure('registration_cancellation', registrationId, 'configuration_missing');
    return;
  }

  try {
    const idempotencyKey = `registration-cancellation-${registrationId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #fdecea; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 8px; background-color: #fafafa; border-left: 3px solid #d32f2f; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>[DIDAR] Event Registration Cancelled — ${escapeHtml(eventTitle)}</h2>
      <p>The registrant cancelled this registration through the link in the receipt email. The registration is kept with status "cancelled".</p>
    </div>

    <div class="field">
      <div class="label">Event Name:</div>
      <div class="value">${escapeHtml(eventTitle)}</div>
    </div>

    <div class="field">
      <div class="label">First Name:</div>
      <div class="value">${escapeHtml(firstName)}</div>
    </div>

    <div class="field">
      <div class="label">Last Name:</div>
      <div class="value">${escapeHtml(lastName)}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div class="value">${escapeHtml(email)}</div>
    </div>

    <div class="field">
      <div class="label">Registration ID:</div>
      <div class="value">${escapeHtml(String(registrationId))}</div>
    </div>

    <div class="field">
      <div class="label">Previous Status:</div>
      <div class="value">${escapeHtml(previousStatus || '(unknown)')}</div>
    </div>

    <div class="field">
      <div class="label">Cancelled At:</div>
      <div class="value">${escapeHtml(cancelledAt)}</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmail,
        subject: `[DIDAR] Event Registration Cancelled — ${eventTitle}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      logNotificationFailure('registration_cancellation', registrationId, 'provider_rejected', response.status);
    }
  } catch {
    logNotificationFailure('registration_cancellation', registrationId, 'request_failed');
  }
}

/**
 * Helper: escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
