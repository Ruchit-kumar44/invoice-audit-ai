import { PrismaClient } from '@/generated/prisma/client' 
import { PrismaNeon } from '@prisma/adapter-neon';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load the .env.local file specifically (where Next.js stores keys local development)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
  console.log("🔄 Testing standalone connection to Neon via Prisma...");
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL is missing in your .env.local file!");
    return;
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const client = new PrismaClient({ adapter });

  try {
    // Run a raw SQL command to fetch the current timestamp from Postgres
    const result = await client.$queryRawUnsafe<{ now: Date }[]>(`SELECT now();`);
    console.log("✅ Success! Database connected perfectly.");
    console.log("🕒 Current Database Time:", result[0].now);
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error(error);
  } finally {
    await client.$disconnect();
  }
}

runTest();
