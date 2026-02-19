import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.person.createMany({
    data: [
      { name: 'Jeffrey Lebowski', document: 'DOC-001', birthDate: new Date('1949-12-10') },
      { name: 'Walter Sobchak', document: 'DOC-002', birthDate: new Date('1952-06-23') },
        { name: 'Theodore Donald Kerabatsos', document: 'DOC-003', birthDate: new Date('1960-01-11') },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });