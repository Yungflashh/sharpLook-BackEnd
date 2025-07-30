// src/services/admin.service.ts
import prisma from "../config/prisma"
import { Role, BroadcastAudience } from "@prisma/client"
import { subDays, subWeeks, subMonths, subYears } from "date-fns";
import { ApprovalStatus } from '@prisma/client';


export const sendBroadcast = async (
  adminId: string,
  title: string,
  message: string,
  audience: BroadcastAudience
) => {
  const broadcast = await prisma.broadcast.create({
    data: {
      title,
      message,
      audience,
      createdById: adminId,
    },
  });

  const roles: Role[] =
    audience === "BOTH"
      ? ["CLIENT", "VENDOR"]
      : [audience === "CLIENT" ? "CLIENT" : "VENDOR"];

  const users = await prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  });

  if (users.length === 0) return broadcast;

  const notifications = users.map((user) => ({
    userId: user.id,
    message,
    type: "BROADCAST",
  }));

  await prisma.notification.createMany({ data: notifications });

  await prisma.broadcast.update({
    where: { id: broadcast.id },
    data: { sentCount: users.length },
  });

  return { message: `Broadcast sent to ${users.length} users.` };
};






export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      isEmailVerified: true,
      isOtpVerified: true,
      acceptedPersonalData: true,
      powerGiven: true,
      isBanned: true,

      vendorOnboarding: {
        select: {
          businessName: true,
          bio: true,
          location: true,
          serviceType: true,
          specialties: true,
          serviceRadiusKm: true,
          servicesOffered: true,
          profileImage: true,
          createdAt: true
        }
      },

      vendorReviews: {
        select: { rating: true }
      }
    }
  });

  // Map in average rating & review count for vendors
  return users.map((user) => {
    let averageRating = null;
    let totalReviews = 0;

    if (user.role === "VENDOR" && user.vendorReviews.length > 0) {
      totalReviews = user.vendorReviews.length;
      const sum = user.vendorReviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / totalReviews;
    }

    return {
      ...user,
      averageRating,
      totalReviews
    };
  });
};

export const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: { client: true, vendor: true },
  })
}

export const banUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true }, 
  })
}

export const unbanUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false },
  })
}


export const promoteUserToAdmin = async (adminId: string) => {

  console.log(adminId);
  
  const user = await prisma.user.findUnique({ where: { id: adminId } });

  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id: adminId },
    data: {
      role: "ADMIN",
      powerGiven: true, // ✅ Set admin power as granted
    },
  });
};

export const getUsersByRole = async (role: Role) => {
  return await prisma.user.findMany({
    where: { role },
    orderBy: { createdAt: "desc" }
  });
};



export const getNewUsersByRange = async (range: string) => {
  let date: Date;

  switch (range) {
    case "days":
      date = subDays(new Date(), 7);
      break;
    case "weeks":
      date = subWeeks(new Date(), 4);
      break;
    case "months":
      date = subMonths(new Date(), 6);
      break;
    case "years":
      date = subYears(new Date(), 1);
      break;
    default:
      throw new Error("Invalid range");
  }

  return await prisma.user.findMany({
    where: { createdAt: { gte: date } },
    orderBy: { createdAt: "desc" }
  });
};


export const getDailyActiveUsers = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.user.findMany({
    where: { updatedAt: { gte: today } }
  });
};

export const getAllProducts = async () => {
  const allProducts = await prisma.product.findMany({
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
          wallet: true,
          products: true,
          cartItems: true,
          wishlistItems: true,
          orders: true,
          referralsMade: true,
          referralsGotten: true,
          notifications: true,
          sentMessages: true,
          receivedMessages: true,
        },
      },
    },
  });

  // Group products by approvalStatus
  const grouped = allProducts.reduce((acc, product) => {
    const status = product.approvalStatus || "UNKNOWN";
    if (!acc[status]) acc[status] = [];
    acc[status].push(product);
    return acc;
  }, {} as Record<string, typeof allProducts>);

  return grouped;
};


export const getSoldProducts = async () => {
  return await prisma.product.findMany({
    where: { qtyAvailable: 0 },
    orderBy: { createdAt: "desc" }
  });
};


export const getUserDetail = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorOnboarding: true,
      wallet: true,
      clientBookings: true,
      vendorBookings: true,
      products: true,
    },
  });
};


export const deleteUser = async (userId: string) => {
  return await prisma.user.delete({ where: { id: userId } });
};


export const getProductDetail = async (productId: string) => {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: true,
      reviews: true,
    },
  });
};


export const deleteProduct = async (productId: string) => {
  return await prisma.product.delete({ where: { id: productId } });
};


export const approveProduct = async (productId: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { approvalStatus: ApprovalStatus.APPROVED },
  });
};


export const suspendProduct = async (productId: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { approvalStatus: ApprovalStatus.SUSPENDED },
  });
};

export const rejectProduct = async (productId: string, reason?: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { approvalStatus: ApprovalStatus.REJECTED , description: reason || "" },
  });
};


export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getAllPayments = async () => {
  return await prisma.transaction.findMany({
    include: {
      wallet: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const getAllBookingsDetailed = async () => {
  return await prisma.booking.findMany({
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          location: true,
          avatar: true,
          bio: true,
          referralCode: true,
          preferredLatitude: true,
          preferredLongitude: true,
        },
      },
      vendor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          bio: true,
          referralCode: true,
          vendorOnboarding: {
            select: {
              businessName: true,
              serviceType: true,
              location: true,
              // approvalStatus: true,
              pricing: true,
              profileImage: true,
              specialties: true,
              latitude: true,
              longitude: true,
              serviceRadiusKm: true,
            },
          },
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          servicePrice: true,
          serviceImage: true,
          description: true,
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          type: true,
          createdAt: true,
          client: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
      dispute: {
        select: {
          id: true,
          reason: true,
          status: true,
          resolution: true,
          imageUrl: true,
          createdAt: true,
          raisedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};



export const getAllDisputes = async () => {
  return await prisma.dispute.findMany({
    select: {
      id: true,
      reason: true,
      status: true,
      imageUrl: true, // explicitly included
      createdAt: true,
      raisedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      booking: true
    },
    orderBy: { createdAt: "desc" }
  });
};



export const resolveDispute = async (disputeId: string, resolution: string) => {
  return await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolution,
    },
  });
};
export const verifyVendorIdentity = async (vendorId: string) => {
  return prisma.vendorOnboarding.update({
    where: { userId: vendorId },
    data: { bio: "Verified by admin" } 
  });
};


export const getAllPromotions = async () => {
  return prisma.promotion.findMany({
    include: { vendor: true },
    orderBy: { createdAt: "desc" }
  });
};

export const suspendPromotion = async (promotionId: string) => {
  return prisma.promotion.update({
    where: { id: promotionId },
    data: { isActive: false }
  });
};


export const deleteReview = async (reviewId: string) => {
  return prisma.review.delete({
    where: { id: reviewId }
  });
};

export const getAllReviewsWithContent = async () => {
  return prisma.review.findMany({
    where: { comment: { not: null } },
    include: {
      vendor: true,
      client: true,
      product: true,
      service: true
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getAllMessages = async () => {
  return prisma.message.findMany({
    include: {
      sender: true,
      receiver: true
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getReferralHistory = async () => {
  return prisma.referral.findMany({
    include: {
      referredBy: true,
      referredUser: true
    },
    orderBy: { createdAt: "desc" }
  });
};


export const adjustWalletBalance = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
  if (!user || !user.walletId) throw new Error("Wallet not found");

  return prisma.wallet.update({
    where: { id: user.walletId },
    data: {
      balance: { increment: amount }
    }
  });
};






export const getPlatformStats = async () => {
  const oneWeekAgo = subDays(new Date(), 7);

  const [
    totalUsers,
    totalVendors,
    totalBookings,
    totalDisputes,
    totalTransactions,
    totalProducts,
    inStockProducts,
    outOfStockProducts,
    totalUnitsSold,
    newProductsThisWeek,
    totalEmailVerified,
    totalPhoneVerified,
    totalAcceptedPersonalData
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.booking.count(),
    prisma.dispute.count(),
    prisma.transaction.count(),
    prisma.product.count(),
    prisma.product.count({ where: { qtyAvailable: { gt: 0 } } }),
    prisma.product.count({ where: { qtyAvailable: 0 } }),
    prisma.product.aggregate({ _sum: { unitsSold: true } }),
    prisma.product.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.user.count({ where: { isEmailVerified: true } }),
    prisma.user.count({ where: { isOtpVerified: true } }),
    prisma.user.count({ where: { acceptedPersonalData: true } })
  ]);

  return {
    totalUsers,
    totalVendors,
    totalBookings,
    totalDisputes,
    totalTransactions,
    totalProducts,
    inStockProducts,
    outOfStockProducts,
    totalUnitsSold: totalUnitsSold._sum.unitsSold || 0,
    newProductsThisWeek,
    totalEmailVerified,
    totalPhoneVerified,
    totalAcceptedPersonalData
  };
};



export const getAllNotifications = async () => {
  return await prisma.notification.findMany({
    include: {
      user: true, // If notifications are tied to users
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};


export const getAllServices = async () => {
  return await prisma.vendorService.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};



// services/admin.service.ts



export const updateProductAsAdmin = async (
  productId: string,
  productName: string,
  price: number,
  qtyAvailable: number,
  description: string,
  picture?: string,
  approvalStatus?: ApprovalStatus
) => {
  const status = qtyAvailable === 0 ? "not in stock" : "in stock";

  return await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      productName,
      price,
      qtyAvailable,
      status,
      description,
      ...(picture && { picture }),
      ...(approvalStatus && { approvalStatus }),
    },
  });
};
