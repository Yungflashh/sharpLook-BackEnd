import prisma from "../config/prisma";

export const getVendorAnalytics = async (vendorId: string) => {
  // Get Products sold and revenue
 const products = await prisma.product.findMany({
  where: { vendorId },
  select: {
    id: true,
    productName: true,
    price: true,
    unitsSold: true,
    updatedAt: true, // <-- Add this line
  },
});

  const totalProductRevenue = products.reduce((acc, p) => acc + p.unitsSold * p.price, 0);
  const totalUnitsSold = products.reduce((acc, p) => acc + p.unitsSold, 0);

  // Get Bookings and revenue
  const bookings = await prisma.booking.findMany({
    where: { vendorId },
    select: {
      id: true,
      date: true,
      serviceName: true,
      price: true,
      status: true,
      createdAt: true,
    },
  });

  const completedBookings = bookings.filter(b => b.status === "COMPLETED");
  const bookingRevenue = completedBookings.reduce((sum, b) => sum + b.price, 0);

  const newBookingsCount = bookings.filter(b =>
    b.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Get disputes
  const disputesCount = await prisma.dispute.count({
    where: {
      booking: {
        vendorId
      }
    }
  });

  // Recent earnings (last 7 days)
  const recentBookings = completedBookings.filter(b =>
    b.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const recentEarningItems = [
    ...recentBookings.map(b => ({
      type: "BOOKING",
      sourceId: b.id,
      name: b.serviceName,
      amount: b.price,
      date: b.createdAt,
    })),
    ...products
      .filter(p => p.unitsSold > 0)
      .map(p => ({
        type: "PRODUCT",
        sourceId: p.id,
        name: p.productName,
        amount: p.price * p.unitsSold,
        date: p.updatedAt ?? new Date(), // fallback if no updatedAt
      }))
  ];

  const recentEarnings = recentEarningItems
    .filter(e => e.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    totalRevenue: totalProductRevenue + bookingRevenue,
    totalProductRevenue,
    totalUnitsSold,
    bookingRevenue,
    newBookingsCount,
    disputesCount,
    recentEarnings
  };
};



export const getVendorEarningsGraphData = async (vendorId: string) => {
  // --- 1. Get product reviews/sales with timestamps ---
  const products = await prisma.product.findMany({
    where: { vendorId },
    select: {
      id: true,
      price: true,
      unitsSold: true,
      updatedAt: true,
    },
  });

  // Optional: track product sales by updatedAt (assuming sale = update)
  const productEarningsByDate: Record<string, number> = {};
  for (const p of products) {
    const date = p.updatedAt.toISOString().split("T")[0];
    const total = p.price * p.unitsSold;
    productEarningsByDate[date] = (productEarningsByDate[date] || 0) + total;
  }

  // --- 2. Get completed bookings for this vendor ---
  const bookings = await prisma.booking.findMany({
    where: {
      vendorId,
      status: "COMPLETED",
      paymentStatus: "COMPLETED",
    },
    select: {
      date: true,
      totalAmount: true,
    },
  });

  const serviceEarningsByDate: Record<string, number> = {};
  for (const b of bookings) {
    const date = b.date.toISOString().split("T")[0];
    serviceEarningsByDate[date] = (serviceEarningsByDate[date] || 0) + b.totalAmount;
  }

  // --- 3. Merge product and service earnings ---
  const allDates = new Set([
    ...Object.keys(productEarningsByDate),
    ...Object.keys(serviceEarningsByDate),
  ]);

  const earningsByDate: Record<string, { product: number; service: number; total: number }> = {};
  for (const date of allDates) {
    const product = productEarningsByDate[date] || 0;
    const service = serviceEarningsByDate[date] || 0;
    earningsByDate[date] = {
      product,
      service,
      total: product + service,
    };
  }

  return { earningsByDate };
};
