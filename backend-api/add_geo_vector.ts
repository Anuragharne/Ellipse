import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running raw SQL migrations for PostGIS and pgvector...');

  // Convert lat/lng to PostGIS geography column
  await prisma.$executeRawUnsafe(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);`);
  
  // Add vector column for image embeddings
  await prisma.$executeRawUnsafe(`ALTER TABLE ai_analysis ADD COLUMN IF NOT EXISTS image_embedding vector(768);`);
  
  // Add spatial index
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST (location);`);
  
  // Add HNSW vector index
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_ai_analysis_embedding ON ai_analysis USING hnsw (image_embedding vector_cosine_ops);`);
  
  // Add performance indexes
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints (citizen_id);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_ai_analysis_severity ON ai_analysis (severity_score DESC);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_activity_citizen_time ON citizen_activity_log (citizen_id, created_at);`);

  console.log('Successfully executed raw SQL migrations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
