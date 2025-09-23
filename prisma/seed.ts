import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  const guildId = '972537656368066620';
  const discordIds = [
    '443545183997657120',
    '184405311681986560',
    '672822334641537041',
    '159985870458322944',
    '678344927997853742',
    '1210214493041336370',
    '810395162110459925',
    '691975497751592971',
  ];

  for (const discordId of discordIds) {
    const user = await prisma.user.upsert({
      where: {
        discordId_guildId: {
          discordId: discordId,
          guildId: guildId,
        },
      },
      update: {},
      create: {
        discordId: discordId,
        guildId: guildId,
        adminLevel: 0,
      },
    });
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
