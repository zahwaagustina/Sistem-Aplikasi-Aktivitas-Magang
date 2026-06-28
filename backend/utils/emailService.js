import nodemailer from 'nodemailer';
import { createTransporter } from './mailer.js';

export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: subject,
      text: text,
      html: html || `<p>${text}</p>`,
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
