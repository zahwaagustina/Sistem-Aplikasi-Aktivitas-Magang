import { PrismaClient } from '@prisma/client';
import { sendEmail } from './emailService.js';

// Setup centralized prisma instance
const prisma = new PrismaClient();

// Add middleware to automatically send emails when a notification is created
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (params.model === 'Notifikasi' && (params.action === 'create' || params.action === 'createMany')) {
    try {
      // Handle both create and createMany
      const notifications = Array.isArray(result) ? result : (result ? [result] : []);
      
      for (const notif of notifications) {
        if (!notif.user_id) continue;
        
        // Asynchronously fetch user and send email
        // We don't await this inside the loop to avoid blocking the DB transaction or response
        prisma.user.findUnique({
          where: { id: notif.user_id }
        }).then(user => {
          if (user && user.email) {
            // Build content
            const content = `
              <h3>${notif.judul}</h3>
              <p>Halo ${user.nama},</p>
              <p>${notif.pesan}</p>
            `;
            
            sendEmail(user.email, notif.judul, notif.pesan, content, notif.link)
              .catch(err => console.error('Failed to auto-send notification email:', err));
          }
        }).catch(err => console.error('Error fetching user for auto-email:', err));
      }
    } catch (err) {
      console.error('Error in notification email middleware:', err);
    }
  }

  return result;
});

export default prisma;
