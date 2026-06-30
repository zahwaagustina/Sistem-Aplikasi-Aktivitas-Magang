import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const forms = await prisma.dynamicForm.findMany();
  console.log(JSON.stringify(forms, null, 2));
}
main();
