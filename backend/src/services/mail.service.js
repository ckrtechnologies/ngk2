import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configure Nodemailer Transporter with Gmail SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER || 'strininaidu@gmail.com',
    pass: (process.env.SMTP_PASS || 'aupm msjt vznq okid').replace(/"/g, ''),
  },
});

/**
 * Verify SMTP connection on startup
 */
export async function verifySmtpConnection() {
  try {
    await transporter.verify();
    console.log('✅ [MailService] SMTP connection verified successfully (Gmail)');
    return true;
  } catch (error) {
    console.error('⚠️ [MailService] SMTP connection verification failed:', error.message);
    return false;
  }
}

/**
 * Send 6-Digit Password Reset OTP Email
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - 6-digit numeric OTP
 * @param {string} [params.appName='NGK & KYB Auto Parts'] - Brand name
 */
export async function sendOtpEmail({ to, otp, appName = 'NGK Auto Parts' }) {
  if (!to || !otp) {
    throw new Error('Recipient email and OTP are required');
  }

  const fromAddress = process.env.EMAIL_FROM || '"NGK Parts & Service" <strininaidu@gmail.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Recovery OTP</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .container { max-width: 560px; margin: 30px auto; background: #1E293B; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #111827 0%, #1F2937 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #E31837; }
        .header h1 { margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; }
        .content { padding: 32px 28px; color: #F1F5F9; line-height: 1.6; }
        .greeting { font-size: 16px; color: #E2E8F0; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #94A3B8; margin-bottom: 24px; }
        .otp-container { background: #0F172A; border: 1px solid #334155; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748B; margin-bottom: 6px; }
        .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #E31837; margin: 0; font-family: monospace; }
        .timer-warning { font-size: 13px; color: #D97706; margin-top: 10px; font-weight: 600; }
        .footer { padding: 20px 28px; background: #111827; border-top: 1px solid #1E293B; text-align: center; font-size: 12px; color: #64748B; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${appName}</h1>
          <p>Official Verification Service</p>
        </div>
        <div class="content">
          <div class="greeting">Hello,</div>
          <div class="desc">
            We received a request to reset the password for your account. Use the one-time verification code below to complete your password reset:
          </div>
          <div class="otp-container">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
            <div class="timer-warning">⏱️ Valid for 10 minutes only</div>
          </div>
          <div class="desc">
            If you did not request a password reset, please ignore this email or contact support immediately. Never share your OTP with anyone.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>Automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `${appName} Password Reset Code: ${otp}\n\nThis verification code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[${appName}] Your Password Reset OTP: ${otp}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [MailService] OTP email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [MailService] Failed to send OTP email to ${to}:`, error.message);
    throw error;
  }
}

export default {
  verifySmtpConnection,
  sendOtpEmail,
};
