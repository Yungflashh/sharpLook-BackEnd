import prisma from "../config/prisma"

export const logAdminAction = async (
  adminId: string,
  action: string,
  details?: string
) => {
  try {
    await prisma.adminAction.create({
      data: {
        adminId,
        action,
        details,
      },
    });
  } catch (err) {
    console.error('Failed to log admin action', err);
  }
};
