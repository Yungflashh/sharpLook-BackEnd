import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "superadmin@example.com";
  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("SuperSecurePassword123!", 10);
    await prisma.user.create({
      data: {
        firstName: "Super",
        lastName: "Admin",
        email: superAdminEmail,
        password: hashedPassword,
        role: "SUPERADMIN",
        referralCode: "",
        isEmailVerified: true,
        isOtpVerified: true,
      },
    });
    console.log("✅ SuperAdmin created.");
  } else {
    console.log("⚠️ SuperAdmin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
