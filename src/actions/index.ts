"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  calculateOrder,
  calculateOrderBalances,
} from "@/lib/calculations";
import { minimumCashFlow } from "@/lib/settlement";
import { getWeekRange } from "@/lib/utils";
import { getWeekRangeFromKey, weekKeyFromDate } from "@/lib/week";
import { appDefaults } from "@/config/defaults";
import {
  createOrderSchema,
  updateOrderSchema,
  createUserSchema,
  updateUserSchema,
  createRestaurantSchema,
  updateSettingsSchema,
} from "@/lib/validations";

const REVALIDATE_PATHS = [
  "/",
  "/orders",
  "/members",
  "/settlement",
  "/archive",
  "/settings",
];

function revalidateAll() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "default",
        labPerPerson: appDefaults.labPerPerson,
        defaultLocale: appDefaults.locale,
        labName: appDefaults.labName.fa,
        weekStartDay: appDefaults.weekStartDay,
      },
    });
  }
  return settings;
}

export async function updateSettings(data: unknown) {
  const parsed = updateSettingsSchema.parse(data);
  const settings = await prisma.settings.update({
    where: { id: "default" },
    data: parsed,
  });
  revalidateAll();
  return settings;
}

export async function getUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createUser(data: unknown) {
  const parsed = createUserSchema.parse(data);
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      cardNumber: parsed.cardNumber,
    },
  });
  revalidateAll();
  return user;
}

export async function updateUser(data: unknown) {
  const parsed = updateUserSchema.parse(data);
  const user = await prisma.user.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      cardNumber: parsed.cardNumber,
    },
  });
  revalidateAll();
  return user;
}

export async function deleteUser(id: string) {
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  revalidateAll();
}

export async function getRestaurants() {
  return prisma.restaurant.findMany({ orderBy: { name: "asc" } });
}

export async function createRestaurant(data: unknown) {
  const parsed = createRestaurantSchema.parse(data);
  const restaurant = await prisma.restaurant.create({ data: parsed });
  revalidateAll();
  return restaurant;
}

export async function getOrders(filters?: {
  weekStart?: Date;
  weekEnd?: Date;
  currentWeekOnly?: boolean;
}) {
  let range = filters?.weekStart
    ? { start: filters.weekStart, end: filters.weekEnd! }
    : undefined;

  if (!range && filters?.currentWeekOnly !== false) {
    const settings = await getSettings();
    range = getWeekRange(new Date(), settings.weekStartDay);
  }

  return prisma.order.findMany({
    where: range
      ? {
          date: {
            gte: range.start,
            lte: range.end,
          },
        }
      : undefined,
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true } },
      expenses: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true }, orderBy: { shareAmount: "desc" } },
      expenses: true,
    },
  });
}

export async function createOrder(data: unknown) {
  const parsed = createOrderSchema.parse(data);

  const calc = calculateOrder({
    members: parsed.members,
    sharedExpenses: parsed.sharedExpenses,
    labPerPerson: parsed.labPerPerson,
  });

  const order = await prisma.order.create({
    data: {
      date: new Date(parsed.date),
      totalAmount: calc.totalAmount,
      labPerPerson: parsed.labPerPerson,
      labTotalAmount: calc.labTotalAmount,
      notes: parsed.notes,
      restaurantId: parsed.restaurantId,
      payerId: parsed.payerId,
      members: {
        create: calc.members.map((m) => ({
          userId: m.userId,
          foodPrice: m.foodPrice,
          shareAmount: m.shareAmount,
          pocketAmount: m.pocketAmount,
        })),
      },
      expenses: {
        create: parsed.sharedExpenses,
      },
    },
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true } },
      expenses: true,
    },
  });

  revalidateAll();
  return order;
}

export async function updateOrder(data: unknown) {
  const parsed = updateOrderSchema.parse(data);

  const calc = calculateOrder({
    members: parsed.members,
    sharedExpenses: parsed.sharedExpenses,
    labPerPerson: parsed.labPerPerson,
  });

  await prisma.expense.deleteMany({ where: { orderId: parsed.id } });
  await prisma.orderMember.deleteMany({ where: { orderId: parsed.id } });

  const order = await prisma.order.update({
    where: { id: parsed.id },
    data: {
      date: new Date(parsed.date),
      totalAmount: calc.totalAmount,
      labPerPerson: parsed.labPerPerson,
      labTotalAmount: calc.labTotalAmount,
      notes: parsed.notes,
      restaurantId: parsed.restaurantId,
      payerId: parsed.payerId,
      members: {
        create: calc.members.map((m) => ({
          userId: m.userId,
          foodPrice: m.foodPrice,
          shareAmount: m.shareAmount,
          pocketAmount: m.pocketAmount,
        })),
      },
      expenses: {
        create: parsed.sharedExpenses,
      },
    },
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true } },
      expenses: true,
    },
  });

  revalidateAll();
  return order;
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
  revalidateAll();
}

export async function getDashboardStats(weekStartDay = 6) {
  const { start, end } = getWeekRange(new Date(), weekStartDay);

  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalExpenses = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const labContribution = orders.reduce((sum, o) => sum + o.labTotalAmount, 0);
  const memberPaid = orders.reduce(
    (sum, o) => sum + o.members.reduce((s, m) => s + m.pocketAmount, 0),
    0,
  );
  const remainingBalance = totalExpenses - labContribution - memberPaid;

  const memberActivity = new Map<
    string,
    { user: (typeof orders)[0]["members"][0]["user"]; count: number; totalSpent: number }
  >();

  for (const order of orders) {
    for (const member of order.members) {
      const existing = memberActivity.get(member.userId);
      if (existing) {
        existing.count++;
        existing.totalSpent += member.shareAmount;
      } else {
        memberActivity.set(member.userId, {
          user: member.user,
          count: 1,
          totalSpent: member.shareAmount,
        });
      }
    }
  }

  const activeMembers = Array.from(memberActivity.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dailyExpenses = new Map<string, number>();
  for (const order of orders) {
    const key = order.date.toISOString().split("T")[0];
    dailyExpenses.set(key, (dailyExpenses.get(key) ?? 0) + order.totalAmount);
  }

  const chartData = Array.from(dailyExpenses.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  return {
    totalExpenses,
    totalOrders,
    labContribution,
    memberPaid,
    remainingBalance,
    recentOrders: orders.slice(0, 5),
    activeMembers,
    chartData,
    weekStart: start,
    weekEnd: end,
  };
}

export async function getMemberStats() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      orderMembers: true,
      ordersPaid: true,
    },
    orderBy: { name: "asc" },
  });

  const settings = await getSettings();
  const { start, end } = getWeekRange(new Date(), settings.weekStartDay);

  const weekOrders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { members: true },
  });

  const balanceMaps: Map<string, number>[] = weekOrders.map((order) =>
    calculateOrderBalances({
      payerId: order.payerId,
      totalAmount: order.totalAmount,
      labTotalAmount: order.labTotalAmount,
      members: order.members.map((m) => ({
        userId: m.userId,
        pocketAmount: m.pocketAmount,
      })),
    }),
  );

  const mergedBalances = new Map<string, number>();
  for (const map of balanceMaps) {
    for (const [userId, amount] of map) {
      mergedBalances.set(userId, (mergedBalances.get(userId) ?? 0) + amount);
    }
  }

  return users.map((user) => {
    const attendance = user.orderMembers.length;
    const payments = user.ordersPaid.length;
    const totalPaid = user.ordersPaid.reduce((s, o) => s + o.totalAmount, 0);
    const totalShare = user.orderMembers.reduce((s, m) => s + m.shareAmount, 0);
    const avgFoodPrice =
      attendance > 0
        ? Math.round(
            user.orderMembers.reduce((s, m) => s + m.foodPrice, 0) / attendance,
          )
        : 0;
    const balance = mergedBalances.get(user.id) ?? 0;

    return {
      ...user,
      attendance,
      payments,
      totalPaid,
      totalShare,
      avgFoodPrice,
      credit: balance > 0 ? balance : 0,
      debt: balance < 0 ? -balance : 0,
      weekBalance: balance,
    };
  });
}

export async function getSettlementForRange(start: Date, end: Date, weekStartDay = 6) {
  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: {
      members: true,
      payer: true,
    },
  });

  const balanceMaps = orders.map((order) =>
    calculateOrderBalances({
      payerId: order.payerId,
      totalAmount: order.totalAmount,
      labTotalAmount: order.labTotalAmount,
      members: order.members.map((m) => ({
        userId: m.userId,
        pocketAmount: m.pocketAmount,
      })),
    }),
  );

  const merged = new Map<string, number>();
  for (const map of balanceMaps) {
    for (const [userId, amount] of map) {
      merged.set(userId, (merged.get(userId) ?? 0) + amount);
    }
  }

  const transfers = minimumCashFlow(merged);

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const totalExpenses = orders.reduce((s, o) => s + o.totalAmount, 0);
  const labContribution = orders.reduce((s, o) => s + o.labTotalAmount, 0);

  let existingSettlements = await prisma.settlement.findMany({
    where: { weekStart: start },
    include: { fromUser: true, toUser: true },
  });

  if (transfers.length > 0) {
    existingSettlements = await syncSettlementsForWeek(start, end, transfers);
  }

  const weeklyReport = await prisma.weeklyReport.findUnique({
    where: { weekStart: start },
  });

  return {
    weekStart: start,
    weekEnd: end,
    weekKey: weekKeyFromDate(start),
    totalExpenses,
    labContribution,
    totalOrders: orders.length,
    isClosed: weeklyReport?.isClosed ?? false,
    transfers: transfers.map((t) => {
      const existing = existingSettlements.find(
        (s) => s.fromUserId === t.fromUserId && s.toUserId === t.toUserId,
      );
      return {
        ...t,
        settlementId: existing?.id,
        isPaid: existing?.isPaid ?? false,
        paidAt: existing?.paidAt,
        fromUser: userMap.get(t.fromUserId)!,
        toUser: userMap.get(t.toUserId)!,
      };
    }),
    balances: Array.from(merged.entries()).map(([userId, amount]) => ({
      user: userMap.get(userId)!,
      amount,
    })),
    paidCount: existingSettlements.filter((s) => s.isPaid).length,
    totalTransferCount: existingSettlements.length,
  };
}

async function syncSettlementsForWeek(
  start: Date,
  end: Date,
  transfers: { fromUserId: string; toUserId: string; amount: number }[],
) {
  const transferKeys = new Set(
    transfers.map((t) => `${t.fromUserId}:${t.toUserId}`),
  );

  for (const t of transfers) {
    await prisma.settlement.upsert({
      where: {
        weekStart_fromUserId_toUserId: {
          weekStart: start,
          fromUserId: t.fromUserId,
          toUserId: t.toUserId,
        },
      },
      create: {
        weekStart: start,
        weekEnd: end,
        fromUserId: t.fromUserId,
        toUserId: t.toUserId,
        amount: t.amount,
        isPaid: false,
      },
      update: {
        amount: t.amount,
        weekEnd: end,
      },
    });
  }

  const all = await prisma.settlement.findMany({
    where: { weekStart: start },
    include: { fromUser: true, toUser: true },
  });

  const toDelete = all.filter(
    (s) => !transferKeys.has(`${s.fromUserId}:${s.toUserId}`),
  );
  if (toDelete.length > 0) {
    await prisma.settlement.deleteMany({
      where: { id: { in: toDelete.map((s) => s.id) } },
    });
  }

  return prisma.settlement.findMany({
    where: { weekStart: start },
    include: { fromUser: true, toUser: true },
  });
}

async function refreshWeeklyReportStats(start: Date, end: Date) {
  const settlement = await getSettlementForRange(start, end);
  const settlements = await prisma.settlement.findMany({ where: { weekStart: start } });
  const paidTransfers = settlements.filter((s) => s.isPaid).length;

  await prisma.weeklyReport.upsert({
    where: { weekStart: start },
    create: {
      weekStart: start,
      weekEnd: end,
      totalExpenses: settlement.totalExpenses,
      totalOrders: settlement.totalOrders,
      labContribution: settlement.labContribution,
      memberPaid: settlement.transfers.reduce((s, t) => s + t.amount, 0),
      remainingBalance: 0,
      totalTransfers: settlements.length,
      paidTransfers,
    },
    update: {
      totalExpenses: settlement.totalExpenses,
      totalOrders: settlement.totalOrders,
      labContribution: settlement.labContribution,
      totalTransfers: settlements.length,
      paidTransfers,
    },
  });
}

export async function getWeeklySettlement(weekStartDay = 6) {
  const { start, end } = getWeekRange(new Date(), weekStartDay);
  return getSettlementForRange(start, end, weekStartDay);
}

export async function getSettlementByWeekKey(weekKey: string, weekStartDay = 6) {
  const { start, end } = getWeekRangeFromKey(weekKey, weekStartDay);
  return getSettlementForRange(start, end, weekStartDay);
}

export async function saveWeeklySettlements(weekStartDay = 6) {
  const { start, end } = getWeekRange(new Date(), weekStartDay);
  const settlement = await getSettlementForRange(start, end, weekStartDay);
  await refreshWeeklyReportStats(start, end);
  revalidateAll();
  return settlement;
}

export async function toggleSettlementPaid(id: string) {
  const current = await prisma.settlement.findUnique({ where: { id } });
  if (!current) throw new Error("Settlement not found");

  const nextPaid = !current.isPaid;
  await prisma.settlement.update({
    where: { id },
    data: {
      isPaid: nextPaid,
      paidAt: nextPaid ? new Date() : null,
    },
  });

  await refreshWeeklyReportStats(current.weekStart, current.weekEnd);
  revalidateAll();
  return nextPaid;
}

export async function closeWeek(weekStartDay = 6, weekKey?: string) {
  const { start, end } = weekKey
    ? getWeekRangeFromKey(weekKey, weekStartDay)
    : getWeekRange(new Date(), weekStartDay);

  const settlement = await getSettlementForRange(start, end, weekStartDay);
  const settlements = await prisma.settlement.findMany({ where: { weekStart: start } });
  const paidTransfers = settlements.filter((s) => s.isPaid).length;

  await prisma.weeklyReport.upsert({
    where: { weekStart: start },
    create: {
      weekStart: start,
      weekEnd: end,
      totalExpenses: settlement.totalExpenses,
      totalOrders: settlement.totalOrders,
      labContribution: settlement.labContribution,
      memberPaid: settlement.transfers.reduce((s, t) => s + t.amount, 0),
      remainingBalance: 0,
      isClosed: true,
      closedAt: new Date(),
      totalTransfers: settlements.length,
      paidTransfers,
    },
    update: {
      weekEnd: end,
      totalExpenses: settlement.totalExpenses,
      totalOrders: settlement.totalOrders,
      labContribution: settlement.labContribution,
      isClosed: true,
      closedAt: new Date(),
      totalTransfers: settlements.length,
      paidTransfers,
    },
  });

  revalidateAll();
  return settlement;
}

export async function getArchivedWeeks(weekStartDay = 6) {
  const { start: currentStart } = getWeekRange(new Date(), weekStartDay);

  const closed = await prisma.weeklyReport.findMany({
    where: { isClosed: true },
    orderBy: { weekStart: "desc" },
  });

  const pastOrders = await prisma.order.findMany({
    where: { date: { lt: currentStart } },
    select: { date: true },
  });

  const closedKeys = new Set(closed.map((r) => weekKeyFromDate(r.weekStart)));
  const pendingStarts = new Map<string, Date>();

  for (const order of pastOrders) {
    const { start } = getWeekRange(order.date, weekStartDay);
    const key = weekKeyFromDate(start);
    if (!closedKeys.has(key)) {
      pendingStarts.set(key, start);
    }
  }

  const pending = await Promise.all(
    Array.from(pendingStarts.entries()).map(async ([key, start]) => {
      const { end } = getWeekRange(start, weekStartDay);
      const [orderCount, settlements] = await Promise.all([
        prisma.order.count({ where: { date: { gte: start, lte: end } } }),
        prisma.settlement.findMany({ where: { weekStart: start } }),
      ]);
      const expenseSum = await prisma.order.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { totalAmount: true },
      });

      return {
        weekKey: key,
        weekStart: start,
        weekEnd: end,
        isClosed: false as const,
        totalOrders: orderCount,
        totalExpenses: expenseSum._sum.totalAmount ?? 0,
        totalTransfers: settlements.length,
        paidTransfers: settlements.filter((s) => s.isPaid).length,
      };
    }),
  );

  pending.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  return { closed, pending };
}

export async function getPendingPreviousWeek(weekStartDay = 6) {
  const { pending } = await getArchivedWeeks(weekStartDay);
  return pending[0] ?? null;
}

export async function getReports() {
  const orders = await prisma.order.findMany({
    include: {
      restaurant: true,
      payer: true,
      members: { include: { user: true } },
    },
    orderBy: { date: "desc" },
  });

  const dailyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const restaurantCount = new Map<string, { name: string; count: number }>();
  const payerCount = new Map<string, { name: string; count: number; total: number }>();
  const memberAttendance = new Map<string, { name: string; count: number }>();
  let totalFoodPrice = 0;
  let totalMembers = 0;

  for (const order of orders) {
    const dayKey = order.date.toISOString().split("T")[0];
    dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + order.totalAmount);

    const weekStart = getWeekRange(order.date).start.toISOString().split("T")[0];
    weeklyMap.set(weekStart, (weeklyMap.get(weekStart) ?? 0) + order.totalAmount);

    const rest = restaurantCount.get(order.restaurantId) ?? {
      name: order.restaurant.name,
      count: 0,
    };
    rest.count++;
    restaurantCount.set(order.restaurantId, rest);

    const payer = payerCount.get(order.payerId) ?? {
      name: order.payer.name,
      count: 0,
      total: 0,
    };
    payer.count++;
    payer.total += order.totalAmount;
    payerCount.set(order.payerId, payer);

    for (const member of order.members) {
      const att = memberAttendance.get(member.userId) ?? {
        name: member.user.name,
        count: 0,
      };
      att.count++;
      memberAttendance.set(member.userId, att);
      totalFoodPrice += member.foodPrice;
      totalMembers++;
    }
  }

  const topRestaurant = Array.from(restaurantCount.values()).sort(
    (a, b) => b.count - a.count,
  )[0];
  const topPayer = Array.from(payerCount.values()).sort((a, b) => b.total - a.total)[0];
  const topAttendance = Array.from(memberAttendance.values()).sort(
    (a, b) => b.count - a.count,
  )[0];
  const avgFoodPrice = totalMembers > 0 ? Math.round(totalFoodPrice / totalMembers) : 0;

  return {
    dailyChart: Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, amount]) => ({ date, amount })),
    weeklyChart: Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([date, amount]) => ({ date, amount })),
    topRestaurant,
    topPayer,
    topAttendance,
    avgFoodPrice,
    totalOrders: orders.length,
  };
}
