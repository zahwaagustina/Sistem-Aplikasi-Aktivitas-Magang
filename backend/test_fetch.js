import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!admin) {
      console.log("No super admin found");
      return;
    }
    
    const token = jwt.sign({ id: admin.id }, 'super_secret_jwt_key_here');
    
    const res = await fetch('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:");
    console.log(text);
  } catch (e) {
    console.log("FETCH ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
