import nodemailer from 'nodemailer';
import { createTransporter } from './mailer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, '../../frontend/public/logo pcs.png.png');

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
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 4px;
      padding: 30px;
      border: 1px solid #dddddd;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      color: #333333;
    }
    .content {
      font-size: 14px;
      line-height: 1.5;
      color: #333333;
    }
    .content p {
      margin-bottom: 15px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0056b3;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      border-top: 1px solid #eeeeee;
      padding-top: 20px;
    }
    .footer p {
      font-size: 12px;
      color: #888888;
      margin: 0 0 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:pcs_logo" alt="PCS Logo" style="max-height: 60px; margin-bottom: 15px;">
      <h1>PCS Internship Portal</h1>
    </div>
    <div class="content">
      ${content}
      <div style="text-align: center; margin-top: 20px;">
        <a href="${targetLink}" class="btn">Buka Aplikasi</a>
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
      attachments: [{
        filename: 'logo pcs.png.png',
        path: logoPath,
        cid: 'pcs_logo'
      }]
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
