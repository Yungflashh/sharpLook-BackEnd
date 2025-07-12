
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


async function connectDB() {
  try {
    await prisma.$connect()
    console.log("✅ Database is connected")
  } catch (error) {
    console.error("❌ Failed to connect to Database:", error)
    process.exit(1)
  }
}

connectDB()

export default prisma
