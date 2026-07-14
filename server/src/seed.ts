import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const adminEmail = "admin@hospital.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      phone: "1234567890",
    },
  });

  console.log("Admin user created:", admin.email);

  const doctor = await prisma.user.create({
    data: {
      name: "Dr. Smith",
      email: "doctor@hospital.com",
      password: await bcrypt.hash("doctor123", 10),
      role: "DOCTOR",
      phone: "1234567891",
    },
  });

  console.log("Doctor user created:", doctor.email);

  const receptionist = await prisma.user.create({
    data: {
      name: "Receptionist",
      email: "receptionist@hospital.com",
      password: await bcrypt.hash("receptionist123", 10),
      role: "RECEPTIONIST",
      phone: "1234567892",
    },
  });

  console.log("Receptionist user created:", receptionist.email);

  const pharmacist = await prisma.user.create({
    data: {
      name: "Pharmacist",
      email: "pharmacist@hospital.com",
      password: await bcrypt.hash("pharmacist123", 10),
      role: "PHARMACIST",
      phone: "1234567893",
    },
  });

  console.log("Pharmacist user created:", pharmacist.email);

  const medicines = [
    { name: "Paracetamol", description: "Pain reliever", price: 5.0, stock: 100 },
    { name: "Amoxicillin", description: "Antibiotic", price: 15.0, stock: 50 },
    { name: "Ibuprofen", description: "Anti-inflammatory", price: 8.0, stock: 80 },
    { name: "Cetirizine", description: "Antihistamine", price: 6.0, stock: 60 },
    { name: "Omeprazole", description: "Acid reducer", price: 12.0, stock: 40 },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }

  console.log("Medicines seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
