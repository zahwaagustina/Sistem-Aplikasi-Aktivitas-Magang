import { PrismaClient } from '@prisma/client';
import { sendEmail } from './emailService.js';

const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  query: {
    notifikasi: {
      async create({ args, query }) {
        const result = await query(args);
        try {
          if (result && result.user_id) {
            basePrisma.user.findUnique({ where: { id: result.user_id } }).then(user => {
              if (user && user.email) {
                const content = `
                  <h3>${result.judul}</h3>
                  <p>Halo ${user.nama},</p>
                  <p>${result.pesan}</p>
                `;
                sendEmail(user.email, result.judul, result.pesan, content, result.link)
                  .catch(err => console.error('Failed to auto-send notification email:', err));
              }
            });
          }
        } catch (err) {}
        return result;
      },
      async createMany({ args, query }) {
        const result = await query(args);
        try {
          const notifications = Array.isArray(args.data) ? args.data : [args.data];
          for (const notif of notifications) {
            if (notif.user_id) {
              basePrisma.user.findUnique({ where: { id: notif.user_id } }).then(user => {
                if (user && user.email) {
                  const content = `
                    <h3>${notif.judul}</h3>
                    <p>Halo ${user.nama},</p>
                    <p>${notif.pesan}</p>
                  `;
                  sendEmail(user.email, notif.judul, notif.pesan, content, notif.link)
                    .catch(err => console.error('Failed to auto-send notification email:', err));
                }
              });
            }
          }
        } catch (err) {}
        return result;
      }
    }
  }
});

export default prisma;
