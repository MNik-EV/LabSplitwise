"use server";

import { prisma } from "@/lib/prisma";
import { calculateOrderBalances } from "@/lib/calculations";
import { minimumCashFlow } from "@/lib/settlement";
import { getWeekRange } from "@/lib/utils";
import { getWeekRangeFromKey, weekKeyFromDate } from "@/lib/week";
import { ActionError } from "@/lib/errors";
import { revalidateAll } from "./shared";

async function loadUsersForSettlement(userIds: string[]) {
  if (userIds.length === 0) return new Map();
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  return new Map(users.map((u) => [u.id, u]));
}

export async function getSettlementForRange(start: Date, end: Date) {
  const orders = await prisma.order.findMany({
    where: { date: { gte: start, lte: end } },
    include: { members: true, payer: true },
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

  const allUserIds = new Set<string>();
  for (const [userId] of merged) allUserIds.add(userId);
  for (const t of transfers) {
    allUserIds.add(t.fromUserId);
    allUserIds.add(t.toUserId);
  }
  const userMap = await loadUsersForSettlement([...allUserIds]);

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

  const resolveUser = (id: string) => {
    const user = userMap.get(id);
    if (!user) throw new ActionError("validation.memberNotFound");
    return user;
  };

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
        fromUser: resolveUser(t.fromUserId),
        toUser: resolveUser(t.toUserId),
      };
    }),
    balances: Array.from(merged.entries()).map(([userId, amount]) => ({
      user: resolveUser(userId),
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
      update: { amount: t.amount, weekEnd: end },
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
  return getSettlementForRange(start, end);
}

export async function getSettlementByWeekKey(weekKey: string, weekStartDay = 6) {
  const { start, end } = getWeekRangeFromKey(weekKey, weekStartDay);
  return getSettlementForRange(start, end);
}

export async function saveWeeklySettlements(weekStartDay = 6) {
  const { start, end } = getWeekRange(new Date(), weekStartDay);
  const settlement = await getSettlementForRange(start, end);
  await refreshWeeklyReportStats(start, end);
  revalidateAll();
  return settlement;
}

export async function toggleSettlementPaid(id: string) {
  const current = await prisma.settlement.findUnique({ where: { id } });
  if (!current) throw new ActionError("validation.settlementNotFound");

  const nextPaid = !current.isPaid;
  await prisma.settlement.update({
    where: { id },
    data: { isPaid: nextPaid, paidAt: nextPaid ? new Date() : null },
  });

  await refreshWeeklyReportStats(current.weekStart, current.weekEnd);
  revalidateAll();
  return nextPaid;
}

export async function closeWeek(weekStartDay = 6, weekKey?: string) {
  const { start, end } = weekKey
    ? getWeekRangeFromKey(weekKey, weekStartDay)
    : getWeekRange(new Date(), weekStartDay);

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
    if (!closedKeys.has(key)) pendingStarts.set(key, start);
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
