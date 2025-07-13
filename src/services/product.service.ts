import prisma from "../config/prisma"

export const createProduct = async (
  vendorId: string,
  productName: string,
  price: number,
  qtyAvailable: number,
  picture: string
) => {
  const status = qtyAvailable === 0 ? "not in stock" : "in stock"

  return await prisma.product.create({
    data: {
      productName,
      price,
      qtyAvailable,
      status,
      picture,
      vendor: {
        connect: { id: vendorId }
      }
    }
  })
}



export const getVendorProducts = async (vendorId: string) => {
  return await prisma.product.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  })
}

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })
}