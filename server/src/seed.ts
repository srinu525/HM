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

  // Seed SUPER_ADMIN (no organization — platform admin)
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@hms.com", role: "SUPER_ADMIN" },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: "superadmin@hms.com",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        phone: "1234567890",
        organizationId: null,
      },
    });
    console.log("Super Admin user created: superadmin@hms.com / admin123");
  }

  // Seed hospital ADMIN (belongs to default organization)
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@hospital.com", organizationId: org.id },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Hospital Admin",
        email: "admin@hospital.com",
        password: hashedPassword,
        role: "ADMIN",
        phone: "1234567890",
        organizationId: org.id,
      },
    });
    console.log("Hospital Admin user created: admin@hospital.com / admin123");
  }

  // Seed subscription plans (patients are always unlimited)
  const plansData = [
    { name: "Free", description: "Basic features for small clinics", price: 0, maxUsers: 3, maxDoctors: 1, modules: ["reception", "doctor"], features: ["Patient registration", "Appointment booking", "Doctor consultations", "Prescriptions"], sortOrder: 1 },
    { name: "Starter", description: "Essential features for growing practices", price: 999, maxUsers: 10, maxDoctors: 3, modules: ["reception", "doctor", "pharmacy", "admin"], features: ["Everything in Free", "Pharmacy management", "Lab module", "Reports & analytics"], sortOrder: 2 },
    { name: "Professional", description: "Advanced features for established hospitals", price: 2999, maxUsers: 50, maxDoctors: 10, modules: ["reception", "doctor", "pharmacy", "admin"], features: ["Everything in Starter", "Advanced analytics", "Audit logs", "Scheduling", "Priority support"], sortOrder: 3 },
    { name: "Enterprise", description: "Full-featured for large organizations", price: 9999, maxUsers: -1, maxDoctors: -1, modules: ["reception", "doctor", "pharmacy", "admin"], features: ["Everything in Professional", "Unlimited users & doctors", "API access", "Dedicated support", "SLA guarantee", "Custom integrations"], sortOrder: 4 },
  ];

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log("Subscription plans seeded");

  // Seed add-on catalog
  const addonsData = [
    { name: "Pharmacy Module", description: "Enables the pharmacy module (inventory, sales)", price: 499, module: "pharmacy" },
    { name: "Lab Module", description: "Enables lab tests and results management", price: 399, module: "lab" },
    { name: "Reports & Analytics", description: "Advanced reports and analytics dashboards", price: 299, module: "reports" },
    { name: "Extra Doctors", description: "Add 5 additional doctor seats", price: 999, module: "doctor" },
    { name: "SMS Notifications", description: "Patient SMS appointment reminders", price: 199, module: "notifications" },
  ];

  for (const addon of addonsData) {
    await prisma.planAddon.upsert({
      where: { name: addon.name },
      update: addon,
      create: addon,
    });
  }
  console.log("Add-on catalog seeded");

  // Set passwords for existing patients (if any) for patient portal access
  const existingPatients = await prisma.patient.findMany({ where: { password: null as any } });
  for (const patient of existingPatients) {
    const hashedPassword = await bcrypt.hash("patient123", 10);
    await prisma.patient.update({
      where: { id: patient.id },
      data: { password: hashedPassword },
    });
  }
  if (existingPatients.length > 0) {
    console.log(`Set passwords for ${existingPatients.length} patients (password: patient123)`);
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
