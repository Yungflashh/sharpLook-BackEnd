import  prisma  from "../config/prisma"

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } })
}

export const updateUserProfile = async (id: string, data: Partial<any>) => {
  return await prisma.user.update({
    where: { id },
    data
  })
}
