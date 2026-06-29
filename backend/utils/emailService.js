import nodemailer from 'nodemailer';
import { createTransporter } from './mailer.js';

const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #eff6ff;
      margin: 0;
      padding: 0;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e7ff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      font-size: 16px;
      line-height: 1.6;
    }
    .content p {
      margin-bottom: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 40px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
      border-top: 1px solid #f1f5f9;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 9999px; /* Fully rounded like pill */
      font-weight: 700;
      font-size: 15px;
      margin-top: 20px;
      margin-bottom: 20px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
      border: 1px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Portal Magang PCS</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Pesan ini dikirim secara otomatis oleh sistem.<br/>Mohon untuk tidak membalas email ini.</p>
      <p>&copy; ${new Date().getFullYear()} PT Pandu Cipta Solusi. All rights reserved.</p>
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
