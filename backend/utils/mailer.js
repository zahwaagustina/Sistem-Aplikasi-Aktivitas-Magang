import nodemailer from 'nodemailer';

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
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"PCS Internship Portal" <${process.env.SMTP_USER || 'noreply@panduciptasolusi.com'}>`,
      to: to,
      subject: 'Verifikasi Akun Magang Anda',
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-image: linear-gradient(to bottom right, #dbeafe, #eff6ff, #bfdbfe); padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(to right, #2563eb, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #2563eb;">PCS Internship Portal</h2>
            </div>
            
            <h3 style="color: #0f172a; font-size: 18px; margin-top: 0;">Halo, Calon Kandidat!</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Terima kasih telah mendaftar. Untuk dapat login dan mulai menggunakan platform magang kami, Anda harus memverifikasi alamat email ini terlebih dahulu.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verifyUrl}" style="background-image: linear-gradient(to right, #2563eb, #22d3ee); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">Verifikasi Email Saya</a>
            </div>
            
            <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Atau copy link berikut ke browser Anda:</p>
            <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="word-break: break-all; color: #2563eb; font-size: 13px; margin: 0; font-family: monospace;">${verifyUrl}</p>
            </div>
            
            <p style="color: #64748b; font-size: 13px; margin-bottom: 30px;">
              Link ini akan kedaluwarsa dalam 24 jam. Jika Anda merasa tidak mendaftar di portal kami, silakan abaikan email ini.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;"/>
            
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">Email ini dihasilkan secara otomatis, mohon jangan dibalas.</p>
              <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Pandu Cipta Solusi. All rights reserved.</p>
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
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: '"PCS Internship Portal" <noreply@panduciptasolusi.com>',
      to: to,
      subject: 'Reset Password Akun Anda',
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-image: linear-gradient(to bottom right, #dbeafe, #eff6ff, #bfdbfe); padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(to right, #2563eb, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #2563eb;">PCS Internship Portal</h2>
            </div>
            
            <h3 style="color: #0f172a; font-size: 18px; margin-top: 0;">Reset Password Anda</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Halo, kami menerima permintaan untuk mengatur ulang password pada akun Anda. Klik tombol di bawah ini untuk membuat password baru.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="background-image: linear-gradient(to right, #2563eb, #22d3ee); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">Reset Password</a>
            </div>
            
            <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Atau copy link berikut ke browser Anda:</p>
            <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="word-break: break-all; color: #2563eb; font-size: 13px; margin: 0; font-family: monospace;">${resetUrl}</p>
            </div>
            
            <p style="color: #64748b; font-size: 13px; margin-bottom: 10px;">
              Link ini akan kedaluwarsa dalam 60 menit.
            </p>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 30px;">
              Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini secara aman. Password Anda tidak akan berubah.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;"/>
            
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">Email ini dihasilkan secara otomatis, mohon jangan dibalas.</p>
              <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Pandu Cipta Solusi. All rights reserved.</p>
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
