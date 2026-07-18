import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check existing SUPER_ADMIN
  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existing) {
    console.log("SUPER_ADMIN exists:", existing.email, "orgId:", existing.organizationId);

    // Fix: ensure no organizationId
    if (existing.organizationId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { organizationId: null },
      });
      console.log("Fixed: removed organizationId from SUPER_ADMIN");
    }

    // Reset password to known value
    const hash = await bcrypt.hash("admin123", 10);
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hash },
    });
    console.log("Reset password to: admin123");
  } else {
    // Create SUPER_ADMIN
    const hash = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: "superadmin@hms.com",
        password: hash,
        role: "SUPER_ADMIN",
        phone: "1234567890",
        organizationId: null,
      },
    });
    console.log("Created SUPER_ADMIN:", user.email, "id:", user.id);
  }

  // List all users for reference
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, organizationId: true, isActive: true },
  });
  console.log("\nAll users:");
  allUsers.forEach(u => console.log(`  ${u.email} | ${u.role} | org: ${u.organizationId || "none"} | active: ${u.isActive}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
