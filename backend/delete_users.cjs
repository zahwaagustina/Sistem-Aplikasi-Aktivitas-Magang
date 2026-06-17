const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUsers() {
  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: 'awa', mode: 'insensitive' } },
          { nama: { contains: 'awa', mode: 'insensitive' } }
        ]
      }
    });

    console.log('Found users to delete:', usersToDelete.map(u => u.username + ' (' + u.nama + ')'));

    if (usersToDelete.length > 0) {
      const ids = usersToDelete.map(u => u.id);
      const result = await prisma.user.deleteMany({
        where: { id: { in: ids } }
      });
      console.log(`Successfully deleted ${result.count} users.`);
    } else {
      console.log('No users found matching "mbg" or "bahlil".');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();
