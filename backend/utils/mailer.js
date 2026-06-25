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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Selamat datang di PCS Internship Portal!</h2>
          <p>Halo,</p>
          <p>Terima kasih telah mendaftar. Untuk dapat login dan mulai menggunakan platform, Anda harus memverifikasi alamat email ini terlebih dahulu.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifikasi Email Saya</a>
          </div>
          <p>Atau copy link berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #64748b; font-size: 14px;">${verifyUrl}</p>
          <br/>
          <p>Link ini akan kedaluwarsa dalam 24 jam.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Email ini dihasilkan secara otomatis, mohon jangan dibalas.</p>
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
