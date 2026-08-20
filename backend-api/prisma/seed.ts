import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed initial severity weight version (expert-tuned fixed weights)
  await prisma.severityWeightVersion.create({
    data: {
      weights: { volume: 0.35, hazard: 0.30, proximity: 0.20, age: 0.15 },
      method: 'FIXED_EXPERT',
      complaintCount: 0,
    },
  });

  console.log('Seeded severity_weight_versions with FIXED_EXPERT weights.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
