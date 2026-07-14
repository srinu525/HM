"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../generated/prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
exports.default = prisma;
