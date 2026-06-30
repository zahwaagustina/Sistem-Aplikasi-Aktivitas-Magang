import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendVerificationEmail } from './utils/mailer.js';

const prisma = new PrismaClient();

async function main() {
  const email = 'anomali@example.com';
  let user = await prisma.user.findFirst({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found. Creating dummy user for verification test...`);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user = await prisma.user.create({
      data: {
        nama: 'Anomali User',
        email,
        username: email,
        password: 'dummy_password', // won't be able to login without hash but this is just for testing
        role: 'KANDIDAT',
        is_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
      }
    });
    console.log('Dummy user created.');
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verification_token: verificationToken,
      verification_expires: verificationExpires,
      is_verified: false
    }
  });

  console.log(`Sending email to ${email} with token ${verificationToken}...`);
  await sendVerificationEmail(email, verificationToken);
  console.log('Email sent successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
