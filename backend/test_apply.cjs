const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'KANDIDAT' }, include: { profilKandidat: true }});
    console.log("Kandidat:", user);
    
    if(!user) return console.log("No kandidat");

    const lowongan = await prisma.lowongan.findFirst();
    console.log("Lowongan:", lowongan);

    // Simulate creation
    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        user_id: user.id,
        lowongan_id: lowongan.id,
        surat_pengantar: null,
        status: 'SUBMITTED'
      }
    });
    console.log("Created pendaftaran:", pendaftaran);
    
    // delete it back
    await prisma.pendaftaran.delete({ where: { id: pendaftaran.id }});
    console.log("Test success");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
testQuery();
