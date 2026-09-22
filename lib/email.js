/**
 * Email Service
 * Handles sending verification and confirmation emails
 * Supports multiple providers with fallback to console logging
 */

import { t } from './i18n';

/**
 * Send verification email with token link
 */
export async function sendVerificationEmail(recipientEmail, userName, registrationId, token, language = 'de') {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://didar-stuttgart.com';
  const verifyLink = `${appUrl}/registrations/verify?id=${registrationId}&token=${token}`;
  
  const subject = language === 'fa' 
    ? 'تأیید ثبت‌نام'
    : 'Bestätigung der Anmeldung';
  
  const htmlContent = language === 'fa'
    ? getVerificationEmailFa(userName, verifyLink)
    : getVerificationEmailDe(userName, verifyLink);

  return sendEmail(recipientEmail, subject, htmlContent);
}

/**
 * Send confirmation email after successful verification
 */
export async function sendConfirmationEmail(recipientEmail, userName, eventTitle, language = 'de') {
  const subject = language === 'fa'
    ? 'تأیید نهایی ثبت‌نام'
    : 'Anmeldungsbestätigung';

  const htmlContent = language === 'fa'
    ? getConfirmationEmailFa(userName, eventTitle)
    : getConfirmationEmailDe(userName, eventTitle);

  return sendEmail(recipientEmail, subject, htmlContent);
}

/**
 * Generic email sending function
 * Routes to appropriate provider or fallback
 */
async function sendEmail(to, subject, html) {
  try {
    // Check for Resend API key
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend(to, subject, html);
    }

    // Check for SendGrid API key
    if (process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(to, subject, html);
    }

    // Fallback: log to console (development mode)
    console.log(`
================================================================================
EMAIL (Development Mode - Not Sent)
================================================================================
To: ${to}
Subject: ${subject}
================================================================================
${html}
================================================================================
    `);

    return { success: true, message: 'Email logged to console (no provider configured)' };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send email via Resend
 */
async function sendWithResend(to, subject, html) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@didar-stuttgart.com',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend error: ${error.message}`);
    }

    return { success: true, message: 'Email sent via Resend' };
  } catch (error) {
    console.error('Resend error:', error);
    throw error;
  }
}

/**
 * Send email via SendGrid
 */
async function sendWithSendGrid(to, subject, html) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@didar-stuttgart.com' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid error: ${error.message}`);
    }

    return { success: true, message: 'Email sent via SendGrid' };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}

/**
 * Email templates
 */

function getVerificationEmailFa(name, verifyLink) {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { font-size: 12px; color: #7f8c8d; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>دیدار</h1>
    </div>
    <div class="content">
      <p>سلام ${name},</p>
      <p>برای تأیید ثبت‌نام خود، لطفاً بر روی لینک زیر کلیک کنید:</p>
      <a href="${verifyLink}" class="button">تأیید ثبت‌نام</a>
      <p>یا این لینک را کپی و در مرورگر خود وارد کنید:</p>
      <p style="word-break: break-all; background-color: #ecf0f1; padding: 10px;">${verifyLink}</p>
      <p>این لینک برای 24 ساعت معتبر است.</p>
      <p>اگر این درخواست را نکرده‌اید، می‌توانید این پیام را نادیده بگیرید.</p>
    </div>
    <div class="footer">
      <p>© 2026 انجمن فرهنگی هنری دیدار. تمام حقوق محفوظ است.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getVerificationEmailDe(name, verifyLink) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { font-size: 12px; color: #7f8c8d; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DIDAR</h1>
    </div>
    <div class="content">
      <p>Hallo ${name},</p>
      <p>Um Ihre Anmeldung zu bestätigen, klicken Sie bitte auf den folgenden Link:</p>
      <a href="${verifyLink}" class="button">Bestätigen</a>
      <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
      <p style="word-break: break-all; background-color: #ecf0f1; padding: 10px;">${verifyLink}</p>
      <p>Dieser Link ist 24 Stunden lang gültig.</p>
      <p>Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
    </div>
    <div class="footer">
      <p>© 2026 DIDAR. Alle Rechte vorbehalten.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getConfirmationEmailFa(name, eventTitle) {
  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #27ae60; color: #ecf0f1; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .footer { font-size: 12px; color: #7f8c8d; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ تأیید نهایی ثبت‌نام</h1>
    </div>
    <div class="content">
      <p>سلام ${name},</p>
      <p>ثبت‌نام شما برای رویداد <strong>${eventTitle}</strong> تأیید شد.</p>
      <p>پیش از برگزاری رویداد، اطلاعات بیشتری برای شما ارسال خواهد شد.</p>
      <p>از شرکت شما سپاسگزاریم!</p>
    </div>
    <div class="footer">
      <p>© 2026 انجمن فرهنگی هنری دیدار. تمام حقوق محفوظ است.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getConfirmationEmailDe(name, eventTitle) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #27ae60; color: #ecf0f1; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .footer { font-size: 12px; color: #7f8c8d; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Anmeldungsbestätigung</h1>
    </div>
    <div class="content">
      <p>Hallo ${name},</p>
      <p>Ihre Anmeldung für die Veranstaltung <strong>${eventTitle}</strong> wurde bestätigt.</p>
      <p>Sie erhalten vor der Veranstaltung weitere Informationen.</p>
      <p>Vielen Dank für Ihre Teilnahme!</p>
    </div>
    <div class="footer">
      <p>© 2026 DIDAR. Alle Rechte vorbehalten.</p>
    </div>
  </div>
</body>
</html>
  `;
}
