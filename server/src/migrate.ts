import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function runSql(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
    return true;
  } catch (e: any) {
    if (e.message?.includes("already exists") || e.message?.includes("does not exist")) return true;
    console.error(`SQL: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("Starting migration...");

  // Create Organization table first
  await runSql(`
    CREATE TABLE IF NOT EXISTS "Organization" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "email" TEXT,
      "phone" TEXT,
      "address" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
    )
  `);
  await runSql(`CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug")`);
  console.log("Organization table created");

  // Add organizationId columns
  await runSql(`ALTER TABLE "User" ADD COLUMN "organizationId" TEXT DEFAULT ''`);
  await runSql(`ALTER TABLE "Patient" ADD COLUMN "organizationId" TEXT DEFAULT ''`);
  await runSql(`ALTER TABLE "Medicine" ADD COLUMN "organizationId" TEXT DEFAULT ''`);
  await runSql(`ALTER TABLE "Notification" ADD COLUMN "organizationId" TEXT DEFAULT ''`);
  console.log("Columns added");

  // Create default organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Default Hospital",
        slug: "default-hospital",
        email: "info@defaulthospital.com",
        phone: "1234567890",
      },
    });
    console.log("Organization created:", org.name);
  }

  // Update all rows with empty organizationId
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "organizationId" = $1 WHERE "organizationId" = '' OR "organizationId" IS NULL`, org.id);
  await prisma.$executeRawUnsafe(`UPDATE "Patient" SET "organizationId" = $1 WHERE "organizationId" = '' OR "organizationId" IS NULL`, org.id);
  await prisma.$executeRawUnsafe(`UPDATE "Medicine" SET "organizationId" = $1 WHERE "organizationId" = '' OR "organizationId" IS NULL`, org.id);
  await prisma.$executeRawUnsafe(`UPDATE "Notification" SET "organizationId" = $1 WHERE "organizationId" = '' OR "organizationId" IS NULL`, org.id);
  console.log("Existing data updated");

  // Drop old unique constraints
  await runSql(`ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key"`);
  await runSql(`ALTER TABLE "Patient" DROP CONSTRAINT IF EXISTS "Patient_patientId_key"`);

  // Add NOT NULL + foreign keys
  await runSql(`ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL`);
  await runSql(`ALTER TABLE "Patient" ALTER COLUMN "organizationId" SET NOT NULL`);
  await runSql(`ALTER TABLE "Medicine" ALTER COLUMN "organizationId" SET NOT NULL`);
  await runSql(`ALTER TABLE "Notification" ALTER COLUMN "organizationId" SET NOT NULL`);
  console.log("NOT NULL set");

  // Composite unique indexes
  await runSql(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_organizationId_key" ON "User"("email", "organizationId")`);
  await runSql(`CREATE UNIQUE INDEX IF NOT EXISTS "Patient_patientId_organizationId_key" ON "Patient"("patientId", "organizationId")`);

  // Foreign keys
  await runSql(`ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
  await runSql(`ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
  await runSql(`ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
  await runSql(`ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
  console.log("Foreign keys added");

  // Seed super admin
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@hospital.com", organizationId: org.id },
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@hospital.com",
        password: await bcrypt.hash("admin123", 10),
        role: "SUPER_ADMIN",
        phone: "1234567890",
        organizationId: org.id,
      },
    });
    console.log("Super Admin created");
  }

  console.log("Migration completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
