import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
const globalForPrisma = globalThis;
function createPrismaClient() {
    const adapter = new PrismaPg({
        connectionString: env.DATABASE_URL,
    });
    return new PrismaClient({ adapter });
}
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (env.isDevelopment)
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map