import prisma from "../config/prisma"
import uploadToCloudinary  from "../utils/cloudinary"


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
    include: {
      vendor: {
        include: {
          vendorOnboarding: true,
          vendorAvailabilities: true,
          vendorServices: true,
          vendorReviews: {
            include: {
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
};


export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })
}


export const getTopSellingProducts = async (limit = 10) => {
  return await prisma.product.findMany({
    where: {
      unitsSold: {
        gt: 0,
      },
    },
    orderBy: {
      unitsSold: "desc",
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    take: limit,
  })
}






export const updateProduct = async (
  productId: string,
  vendorId: string,
  productName: string,
  price: number,
  qtyAvailable: number,
  picture?: string
) => {
  const status = qtyAvailable === 0 ? "not in stock" : "in stock"

  return await prisma.product.update({
    where: {
      id: productId,
      vendorId: vendorId, // ensures vendor can only edit their own product
    },
    data: {
      productName,
      price,
      qtyAvailable,
      status,
      ...(picture && { picture }), // only update if a new picture was uploaded
    },
  })
}



export const deleteProduct = async (productId: string) => {
  return await prisma.product.delete({
    where: { id: productId },
  })
}