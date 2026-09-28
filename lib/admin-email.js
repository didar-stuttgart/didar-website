/**
 * Admin Email Notification Utility
 * Sends admin-only notifications for form submissions via Resend
 * 
 * - No user-facing emails
 * - No verification flows
 * - Notifications only sent after successful database insertion
 * - Email failure does not affect form submission response
 * - Uses idempotency keys to prevent duplicate notifications
 */

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
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'DIDAR Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    console.log('[Admin Email] Event registration (console fallback):', {
      submissionId,
      eventTitle,
      firstName,
      lastName,
      email,
      phone: phone || '(not provided)',
      telegramId: telegramId || '(not provided)',
      comment: comment || '(no comment)',
      timestamp,
    });
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
      const error = await response.text();
      console.error('[Admin Email] Failed to send event registration notification:', {
        statusCode: response.status,
        error,
        submissionId,
      });
    }
  } catch (error) {
    console.error('[Admin Email] Error sending event registration notification:', error.message);
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
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'DIDAR Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    console.log('[Admin Email] Membership application (console fallback):', {
      submissionId,
      firstName,
      lastName,
      email,
      phone: phone || '(not provided)',
      telegramId: telegramId || '(not provided)',
      additionalInfo: additionalInfo || '(no additional info)',
      timestamp,
    });
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
      const error = await response.text();
      console.error('[Admin Email] Failed to send membership notification:', {
        statusCode: response.status,
        error,
        submissionId,
      });
    }
  } catch (error) {
    console.error('[Admin Email] Error sending membership notification:', error.message);
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
  const fromEmail = process.env.DIDAR_EMAIL_FROM || 'DIDAR Stuttgart <noreply@didar-stuttgart.com>';

  // Fallback: log to console if Resend not configured
  if (!apiKey || !notificationEmail) {
    console.log('[Admin Email] Contact message (console fallback):', {
      submissionId,
      name,
      email,
      message,
      timestamp,
    });
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
      const error = await response.text();
      console.error('[Admin Email] Failed to send contact notification:', {
        statusCode: response.status,
        error,
        submissionId,
      });
    }
  } catch (error) {
    console.error('[Admin Email] Error sending contact notification:', error.message);
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
