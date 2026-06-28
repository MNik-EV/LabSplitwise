"use server";

import { prisma } from "@/lib/prisma";
import {
  calculateOrderBalances,
} from "@/lib/calculations";
import { localDateKey } from "@/lib/date-input";
import { getWeekRange } from "@/lib/utils";
import { weekKeyFromDate } from "@/lib/week";
import { getSettings } from "./settings";

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
    const key = localDateKey(order.date);
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
    include: { orderMembers: true, ordersPaid: true },
    orderBy: { name: "asc" },
  });

  const settings = await getSettings();
  const { start, end } = getWeekRange(new Date(), settings.weekStartDay);

  const weekOrders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { members: true },
  });

  const balanceMaps = weekOrders.map((order) =>
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
        ? Math.round(user.orderMembers.reduce((s, m) => s + m.foodPrice, 0) / attendance)
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

export async function getReports() {
  const settings = await getSettings();
  const weekStartDay = settings.weekStartDay;

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
    const dayKey = localDateKey(order.date);
    dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + order.totalAmount);

    const weekStartKey = weekKeyFromDate(getWeekRange(order.date, weekStartDay).start);
    weeklyMap.set(weekStartKey, (weeklyMap.get(weekStartKey) ?? 0) + order.totalAmount);

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
