import nodemailer from 'nodemailer';
import { createTransporter } from './mailer.js';

const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-image: linear-gradient(to bottom right, #dbeafe, #eff6ff, #bfdbfe);
      background-color: #f8fafc; /* Fallback */
      margin: 0;
      padding: 40px 20px;
      min-height: 100vh;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #2563eb, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: #2563eb; /* Fallback */
    }
    .content {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
    }
    .content p {
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-image: linear-gradient(to right, #2563eb, #22d3ee);
      background-color: #2563eb; /* Fallback */
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 0;
    }
    .footer p.copyright {
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PCS Internship Portal</h1>
    </div>
    <div class="content">
      ${content}
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Buka Dashboard Portal</a>
      </div>
    </div>
    <div class="footer">
      <p>Pesan ini dikirim secara otomatis oleh sistem, mohon jangan dibalas.</p>
      <p class="copyright">&copy; ${new Date().getFullYear()} Pandu Cipta Solusi. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await createTransporter();
    
    // Format text with line breaks if HTML is not provided
    const formattedContent = html || text.replace(/\n/g, '<br/>');
    
    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: subject,
      text: text,
      html: getEmailTemplate(formattedContent),
    });

    console.log('\n=============================================');
    console.log(`[EMAIL BERHASIL DIKIRIM] ke: ${to}`);
    console.log(`[SUBJECT]: ${subject}`);
    console.log('Message ID: %s', info.messageId);
    
    // Jika menggunakan ethereal, ini akan memberikan link URL untuk melihat email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    console.log('=============================================\n');

    return true;
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return false;
  }
};
