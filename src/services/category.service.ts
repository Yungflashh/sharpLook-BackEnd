import prisma from "../config/prisma";

export const createServiceCategory = async (name: string) => {
  return await prisma.serviceCategory.create({
    data: { name },
  });
};

export const getAllServiceCategories = async () => {
  return await prisma.serviceCategory.findMany({
    orderBy: { createdAt: "desc" },
  });
};
