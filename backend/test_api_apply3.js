import { PrismaClient } from '@prisma/client';
import { Blob } from 'buffer';

const prisma = new PrismaClient();

async function testApply() {
  try {
    // Clean up fadlika's pendaftaran
    await prisma.pendaftaran.deleteMany({
      where: { user_id: 19 }
    });

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'fadlika@gmail.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const form = new FormData();
    form.append('lowongan_id', '1');
    form.append('universitas', 'UI');
    form.append('jurusan', 'CS');
    form.append('angkatan', '2020');
    form.append('semester', '7');
    
    // We just create a Blob to simulate a file
    const cvBlob = new Blob(['dummy pdf content'], { type: 'application/pdf' });
    form.append('cv', cvBlob, 'dummy.pdf');

    const applyRes = await fetch('http://localhost:5000/api/kandidat/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    
    const applyData = await applyRes.json();
    console.log("Status:", applyRes.status);
    console.log("Response:", applyData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
testApply();
