"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function connectDB() {
    try {
        await prisma.$connect();
        console.log("✅ Database is connected");
    }
    catch (error) {
        console.error("❌ Failed to connect to Database:", error);
        process.exit(1);
    }
}
connectDB();
exports.default = prisma;
