import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
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
    console.log("Organization created:", org.name, org.id);
  }

  // Update existing users with organizationId
  const users = await prisma.user.findMany({ where: { organizationId: undefined as any } });
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: org.id },
    });
  }
  console.log(`Updated ${users.length} users`);

  // Update existing patients with organizationId
  const patients = await prisma.patient.findMany({ where: { organizationId: undefined as any } });
  for (const patient of patients) {
    await prisma.patient.update({
      where: { id: patient.id },
      data: { organizationId: org.id },
    });
  }
  console.log(`Updated ${patients.length} patients`);

  // Update existing medicines with organizationId
  const medicines = await prisma.medicine.findMany({ where: { organizationId: undefined as any } });
  for (const med of medicines) {
    await prisma.medicine.update({
      where: { id: med.id },
      data: { organizationId: org.id },
    });
  }
  console.log(`Updated ${medicines.length} medicines`);

  // Update existing notifications with organizationId
  const notifications = await prisma.notification.findMany({ where: { organizationId: undefined as any } });
  for (const n of notifications) {
    await prisma.notification.update({
      where: { id: n.id },
      data: { organizationId: org.id },
    });
  }
  console.log(`Updated ${notifications.length} notifications`);

  // Seed admin user if not exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@hospital.com", organizationId: org.id },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@hospital.com",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        phone: "1234567890",
        organizationId: org.id,
      },
    });
    console.log("Super Admin user created");
  }

  console.log("Migration seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
