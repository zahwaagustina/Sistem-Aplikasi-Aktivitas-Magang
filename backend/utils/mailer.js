import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, '../../frontend/public/logo pcs.png.png');

// Konfigurasi transporter untuk nodemailer
// Saat environment variables belum diatur, kita akan menggunakan Ethereal Email (layanan testing gratis)
export const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback ke Ethereal untuk testing lokal jika .env belum diset
  console.log('Menggunakan Ethereal Email untuk testing...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendVerificationEmail = async (to, token) => {
  try {
    const transporter = await createTransporter();
    
    // URL frontend tempat user akan memverifikasi email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: 'Verifikasi Akun Magang Anda',
      attachments: [{
        filename: 'logo pcs.png.png',
        path: logoPath,
        cid: 'pcs_logo'
      }],
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; padding: 30px; border: 1px solid #dddddd;">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
              <img src="cid:pcs_logo" alt="PCS Logo" style="max-height: 60px; margin-bottom: 15px;">
              <h2 style="margin: 0; font-size: 20px; color: #333333;">PCS Internship Portal</h2>
            </div>
            
            <h3 style="font-size: 16px; margin-top: 0;">Halo, Calon Kandidat!</h3>
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              Terima kasih telah mendaftar. Untuk dapat login dan mulai menggunakan platform magang kami, Anda harus memverifikasi alamat email ini terlebih dahulu.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #0056b3; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">Verifikasi Email Saya</a>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 8px;">Atau copy link berikut ke browser Anda:</p>
            <div style="background-color: #f9f9f9; padding: 10px; border: 1px solid #eeeeee; border-radius: 4px; margin-bottom: 20px;">
              <p style="word-break: break-all; color: #0056b3; font-size: 12px; margin: 0; font-family: monospace;">${verifyUrl}</p>
            </div>
            
            <p style="color: #888888; font-size: 12px; margin-bottom: 30px;">
              Link ini akan kedaluwarsa dalam 24 jam. Jika Anda merasa tidak mendaftar di portal kami, silakan abaikan email ini.
            </p>
            
            <div style="text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 12px; color: #888888; margin: 0 0 5px 0;">Pesan ini dikirim secara otomatis, mohon jangan dibalas.</p>
              <p style="font-size: 12px; color: #888888; margin: 0;">&copy; ${new Date().getFullYear()} Pandu Cipta Solusi. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Jika menggunakan ethereal, ini akan memberikan link URL untuk melihat email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (to, token) => {
  try {
    const transporter = await createTransporter();
    
    // URL frontend tempat user akan reset password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: 'Reset Password Akun Anda',
      attachments: [{
        filename: 'logo pcs.png.png',
        path: logoPath,
        cid: 'pcs_logo'
      }],
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; padding: 30px; border: 1px solid #dddddd;">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
              <img src="cid:pcs_logo" alt="PCS Logo" style="max-height: 60px; margin-bottom: 15px;">
              <h2 style="margin: 0; font-size: 20px; color: #333333;">PCS Internship Portal</h2>
            </div>
            
            <h3 style="font-size: 16px; margin-top: 0;">Reset Password Anda</h3>
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              Halo, kami menerima permintaan untuk mengatur ulang password pada akun Anda. Klik tombol di bawah ini untuk membuat password baru.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0056b3; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 8px;">Atau copy link berikut ke browser Anda:</p>
            <div style="background-color: #f9f9f9; padding: 10px; border: 1px solid #eeeeee; border-radius: 4px; margin-bottom: 20px;">
              <p style="word-break: break-all; color: #0056b3; font-size: 12px; margin: 0; font-family: monospace;">${resetUrl}</p>
            </div>
            
            <p style="color: #888888; font-size: 12px; margin-bottom: 10px;">
              Link ini akan kedaluwarsa dalam 60 menit.
            </p>
            <p style="color: #888888; font-size: 12px; margin-bottom: 30px;">
              Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini secara aman. Password Anda tidak akan berubah.
            </p>
            
            <div style="text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 12px; color: #888888; margin: 0 0 5px 0;">Pesan ini dikirim secara otomatis, mohon jangan dibalas.</p>
              <p style="font-size: 12px; color: #888888; margin: 0;">&copy; ${new Date().getFullYear()} Pandu Cipta Solusi. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Jika menggunakan ethereal, ini akan memberikan link URL untuk melihat email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
