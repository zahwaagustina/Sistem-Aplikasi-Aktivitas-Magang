import { PrismaClient } from '@prisma/client';
import { sendEmail } from './utils/emailService.js';

const prisma = new PrismaClient();

async function main() {
  const email = 'anomali@example.com';
  
  const content = `
    <h3>Pemberitahuan Sistem</h3>
    <p>Halo,</p>
    <p>Ini adalah contoh notifikasi dari sistem untuk memastikan semua desain email notifikasi sudah seragam.</p>
    <p>Silakan klik tombol di bawah untuk masuk ke dashboard portal magang.</p>
  `;

  console.log('Sending notification email to ' + email + '...');
  await sendEmail(email, 'Test Notifikasi Seragam', 'Ini adalah test notifikasi.', content);
  console.log('Email sent successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
