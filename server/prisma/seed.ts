import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL || "",
});
const prisma = new PrismaClient({ adapter });

// ─── Permission definitions ───────────────────────────────────────────────────
const PERMISSIONS = [
  { module: "patients",      action: "read"   },
  { module: "patients",      action: "create" },
  { module: "patients",      action: "update" },
  { module: "patients",      action: "delete" },
  { module: "appointments",  action: "read"   },
  { module: "appointments",  action: "create" },
  { module: "appointments",  action: "update" },
  { module: "appointments",  action: "delete" },
  { module: "consultations", action: "read"   },
  { module: "consultations", action: "create" },
  { module: "consultations", action: "update" },
  { module: "prescriptions", action: "read"   },
  { module: "prescriptions", action: "create" },
  { module: "pharmacy",      action: "read"   },
  { module: "pharmacy",      action: "create" },
  { module: "pharmacy",      action: "update" },
  { module: "pharmacy",      action: "delete" },
  { module: "lab",           action: "read"   },
  { module: "lab",           action: "create" },
  { module: "lab",           action: "update" },
  { module: "invoices",      action: "read"   },
  { module: "invoices",      action: "create" },
  { module: "invoices",      action: "update" },
  { module: "invoices",      action: "delete" },
  { module: "users",         action: "read"   },
  { module: "users",         action: "create" },
  { module: "users",         action: "update" },
  { module: "users",         action: "delete" },
  { module: "departments",   action: "read"   },
  { module: "departments",   action: "create" },
  { module: "departments",   action: "update" },
  { module: "departments",   action: "delete" },
  { module: "settings",      action: "read"   },
  { module: "settings",      action: "update" },
  { module: "audit-logs",    action: "read"   },
  { module: "reports",       action: "read"   },
  { module: "notifications", action: "read"   },
  { module: "notifications", action: "create" },
];

// ─── Role → permission mappings ───────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "users.read", "users.create", "users.update", "users.delete",
    "departments.read", "departments.create", "departments.update", "departments.delete",
    "settings.read", "settings.update",
    "audit-logs.read",
    "reports.read",
    "invoices.read", "invoices.create", "invoices.update", "invoices.delete",
    "notifications.read", "notifications.create",
    // Admin can VIEW (read-only) clinical data for oversight
    "patients.read",
    "appointments.read",
    "prescriptions.read",
  ],
  RECEPTIONIST: [
    "patients.read", "patients.create", "patients.update",
    "appointments.read", "appointments.create", "appointments.update",
    "invoices.read", "invoices.create", "invoices.update",
    "notifications.read",
    "reports.read",
  ],
  DOCTOR: [
    "patients.read",
    "appointments.read", "appointments.update",
    "consultations.read", "consultations.create", "consultations.update",
    "prescriptions.read", "prescriptions.create",
    "pharmacy.read",
    "lab.read", "lab.create", "lab.update",
    "notifications.read",
  ],
  PHARMACIST: [
    "pharmacy.read", "pharmacy.create", "pharmacy.update", "pharmacy.delete",
    "prescriptions.read",
    "lab.read",
    "notifications.read",
  ],
};

async function seedPermissions() {
  console.log("📋 Seeding permissions...");
  let created = 0;
  for (const def of PERMISSIONS) {
    const name = `${def.module}.${def.action}`;
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, module: def.module, action: def.action, description: `${def.action} ${def.module}` },
    });
    created++;
  }
  console.log(`  ✓ ${created} permissions upserted`);
}

async function seedRolePermissions() {
  console.log("🔐 Assigning permissions to roles...");
  for (const [role, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    // Clear existing role permissions first
    await prisma.rolePermission.deleteMany({ where: { role: role as any } });

    for (const name of permNames) {
      const permission = await prisma.permission.findUnique({ where: { name } });
      if (!permission) {
        console.warn(`  ⚠ Permission "${name}" not found, skipping`);
        continue;
      }
      await prisma.rolePermission.create({
        data: { role: role as any, permissionId: permission.id },
      });
    }
    console.log(`  ✓ ${role}: ${permNames.length} permissions assigned`);
  }
}

async function seedDefaultOrg() {
  console.log("🏥 Seeding default organization...");
  const existing = await prisma.organization.findUnique({ where: { slug: "default-hospital" } });
  if (existing) {
    console.log("  ✓ Default Hospital already exists");
    return existing;
  }
  const org = await prisma.organization.create({
    data: {
      name: "Default Hospital",
      slug: "default-hospital",
      email: "admin@hospital.com",
      phone: "+91-9999999999",
      address: "123 Health Street, Medical City",
      timezone: "Asia/Kolkata",
      currency: "INR",
    },
  });
  console.log(`  ✓ Created: ${org.name} (/${org.slug})`);
  return org;
}

async function seedDefaultAdmin(orgId: string) {
  console.log("👤 Seeding default admin user...");
  const existing = await prisma.user.findFirst({
    where: { email: "admin@hospital.com", organizationId: orgId },
  });
  if (existing) {
    console.log("  ✓ Admin user already exists:", existing.email);
    return existing;
  }
  const hashed = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@hospital.com",
      password: hashed,
      role: "ADMIN",
      organizationId: orgId,
      isActive: true,
    },
  });
  console.log(`  ✓ Created admin: ${user.email} / admin123`);
  return user;
}

async function seedDefaultPlan() {
  console.log("💳 Seeding default subscription plans...");
  const plans = [
    {
      name: "Free",
      description: "For small clinics getting started",
      price: 0,
      maxUsers: 3,
      maxDoctors: 1,
      modules: ["reception", "doctor"],
      features: ["Patient registration", "Appointments", "Basic prescriptions"],
      sortOrder: 0,
    },
    {
      name: "Starter",
      description: "For growing clinics",
      price: 999,
      maxUsers: 10,
      maxDoctors: 3,
      modules: ["reception", "doctor", "pharmacy"],
      features: ["Everything in Free", "Pharmacy module", "Invoice management", "Reports"],
      sortOrder: 1,
    },
    {
      name: "Professional",
      description: "For established hospitals",
      price: 2999,
      maxUsers: 30,
      maxDoctors: 10,
      modules: ["reception", "doctor", "pharmacy", "admin"],
      features: ["Everything in Starter", "Lab module", "Analytics", "Audit logs", "Priority support"],
      sortOrder: 2,
    },
    {
      name: "Enterprise",
      description: "For large hospital networks",
      price: 7999,
      maxUsers: 0,  // unlimited
      maxDoctors: 0, // unlimited
      modules: ["reception", "doctor", "pharmacy", "admin"],
      features: ["Everything in Professional", "Unlimited users & doctors", "Custom integrations", "Dedicated support"],
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: { ...plan, modules: plan.modules as any },
    });
  }
  console.log(`  ✓ ${plans.length} plans upserted`);

  // Assign Professional plan to default hospital
  const org = await prisma.organization.findUnique({ where: { slug: "default-hospital" } });
  const plan = await prisma.plan.findUnique({ where: { name: "Professional" } });
  if (org && plan) {
    const existing = await prisma.subscription.findUnique({ where: { organizationId: org.id } });
    if (!existing) {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      await prisma.subscription.create({
        data: {
          organizationId: org.id,
          planId: plan.id,
          status: "ACTIVE",
          endDate,
        },
      });
      console.log("  ✓ Professional plan assigned to Default Hospital (1 year)");
    } else {
      console.log("  ✓ Default Hospital already has a subscription");
    }
  }
}

async function main() {
  console.log("\n🌱 Starting HM System database seed...\n");
  
  await seedPermissions();
  await seedRolePermissions();
  const org = await seedDefaultOrg();
  await seedDefaultAdmin(org.id);
  await seedDefaultPlan();

  console.log("\n✅ Seed complete!\n");
  console.log("Default credentials:");
  console.log("  Staff login:   /default-hospital/login");
  console.log("  Email:         admin@hospital.com");
  console.log("  Password:      admin123");
  console.log("  Super Admin:   /super-admin (set up separately)\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
