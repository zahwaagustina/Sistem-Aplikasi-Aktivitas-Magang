const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUsers() {
  const namesToDelete = ['siti zahwa agustina', 'mupid'];

  try {
    for (const name of namesToDelete) {
      // Find users where name contains the target name (case-insensitive)
      const users = await prisma.user.findMany({
        where: {
          nama: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      if (users.length === 0) {
        console.log(`No users found for: ${name}`);
        continue;
      }

      for (const user of users) {
        console.log(`Deleting user: ${user.nama} (ID: ${user.id})`);
        // Prisma will cascade delete related records if schema is set up correctly
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`Successfully deleted user: ${user.nama}`);
      }
    }
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();
