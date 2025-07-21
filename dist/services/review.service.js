"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorReviews = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const createReview = async ({ vendorId, clientId, rating, comment, bookingId, productId, serviceId, type }) => {
    return await prisma_1.default.review.create({
        data: {
            vendorId,
            clientId,
            rating,
            comment,
            bookingId,
            productId,
            serviceId,
            type
        }
    });
};
exports.createReview = createReview;
// export const getVendorReviews = async (vendorId: string) => {
//   return await prisma.review.findMany({
//     where: { vendorId },
//     include: {
//       client: {
//         select: {
//           firstName: true,
//           lastName: true,
//           avatar: true,
//         },
//       },
//       booking: {
//         select: {
//           id: true,
//           date: true,
//           serviceName: true,
//         },
//       },
//       product: {
//         select: {
//           id: true,
//           productName: true,
//           picture: true,
//         },
//       },
//       service: {
//         select: {
//           id: true,
//           serviceName: true,
//           serviceImage: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });
// };
const getVendorReviews = async (vendorId, type) => {
    if (!vendorId)
        throw new Error("vendorId is required");
    // Only set enumType if it's a valid ReviewType value
    const enumValues = Object.values(client_1.ReviewType);
    const isValidType = type && enumValues.includes(type);
    const enumType = isValidType ? type : undefined;
    return await prisma_1.default.review.findMany({
        where: {
            vendorId,
            ...(enumType ? { type: enumType } : {}),
        },
        include: {
            client: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            booking: {
                select: {
                    id: true,
                    date: true,
                    serviceName: true,
                },
            },
            product: {
                select: {
                    id: true,
                    productName: true,
                    picture: true,
                },
            },
            service: {
                select: {
                    id: true,
                    serviceName: true,
                    serviceImage: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getVendorReviews = getVendorReviews;
