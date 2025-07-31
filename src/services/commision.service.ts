import { PrismaClient, DeductionStartOption, ServiceType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Automatically creates a VendorCommissionSetting for HOME_SERVICE vendors.
 */
export async function maybeCreateVendorCommission(userId: string) {
  const onboarding = await prisma.vendorOnboarding.findUnique({
    where: { userId },
  });

  if (!onboarding) {
    console.warn(`⚠️ No VendorOnboarding found for user: ${userId}`);
    return;
  }

  if (onboarding.serviceType !== ServiceType.HOME_SERVICE) {
    console.log(`ℹ️ Skipped vendor ${userId} — not a HOME_SERVICE`);
    return;
  }

  const existing = await prisma.vendorCommissionSetting.findUnique({
    where: { userId },
  });

  if (!existing) {
    await prisma.vendorCommissionSetting.create({
      data: {
        userId,
        commissionRate: 0.1,
        deductionStart: DeductionStartOption.AFTER_FIRST_WEEK,
      },
    });

    console.log(`✅ Commission setting created for vendor ${userId}`);
  } else {
    console.log(`ℹ️ Commission already set for vendor ${userId}`);
  }
}
