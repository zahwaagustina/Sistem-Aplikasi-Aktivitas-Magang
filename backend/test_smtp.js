import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testSMTP() {
  console.log('Testing SMTP connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // kirim ke diri sendiri
      subject: 'Test Email SMTP',
      text: 'Ini adalah test pengiriman email.',
    });
    console.log('Berhasil terhubung dan mengirim email!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Gagal SMTP:', error.message);
  }
}

testSMTP();
