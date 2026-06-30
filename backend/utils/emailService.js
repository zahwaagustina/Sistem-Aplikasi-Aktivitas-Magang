import nodemailer from 'nodemailer';
import { createTransporter } from './mailer.js';

const getEmailTemplate = (content, link) => {
  const targetLink = link 
    ? (link.startsWith('http') ? link : `${process.env.FRONTEND_URL || 'http://localhost:5173'}${link}`)
    : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4f46e5;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 32px;
      font-size: 16px;
      line-height: 1.6;
      color: #334155;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4f46e5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
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
      <div style="text-align: center; margin-top: 30px;">
        <a href="${targetLink}" class="btn">Buka Aplikasi</a>
      </div>
    </div>
    <div class="footer">
      <p>Pesan ini dikirim secara otomatis oleh sistem.<br/>Mohon untuk tidak membalas email ini.</p>
      <p>&copy; ${new Date().getFullYear()} PT Pandu Cipta Solusi. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const sendEmail = async (to, subject, text, html, link = null) => {
  try {
    const transporter = await createTransporter();
    
    // Format text with line breaks if HTML is not provided
    const formattedContent = html || text.replace(/\n/g, '<br/>');
    
    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: subject,
      text: text,
      html: getEmailTemplate(formattedContent, link),
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
