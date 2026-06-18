import nodemailer from 'nodemailer';

// Konfigurasi transporter untuk testing/mock.
// Karena kita tidak benar-benar mengirim email di lingkungan dev, 
// kita akan menggunakan Ethereal Email atau cukup log ke console.
// Untuk kemudahan, kita cukup melakukan console.log sebagai simulasi.

export const sendEmail = async (to, subject, text, html) => {
  try {
    console.log('\n=============================================');
    console.log(`[SIMULASI EMAIL] Mengirim email ke: ${to}`);
    console.log(`[SUBJECT]: ${subject}`);
    console.log(`[ISI PESAN]:\n${text}`);
    console.log('=============================================\n');
    return true;
  } catch (error) {
    console.error('Gagal mengirim email simulasi:', error);
    return false;
  }
};
