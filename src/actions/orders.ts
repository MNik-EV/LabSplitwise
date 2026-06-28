"use server";

import { prisma } from "@/lib/prisma";
import { calculateOrder } from "@/lib/calculations";
import { parseDateInput } from "@/lib/date-input";
import { ActionError } from "@/lib/errors";
import { getDictionary } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { buildValidationSchemas, type CreateOrderInput } from "@/lib/validation-schemas";
import { assertWeekOpen, isWeekClosed } from "@/lib/week-guard";
import { getWeekRange } from "@/lib/utils";
import { revalidateAll } from "./shared";
import { requireSession } from "@/lib/auth-session";
import { getSettings } from "./settings";
import { validateOrderBusinessRules } from "@/lib/order-rules";

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
      ? { date: { gte: range.start, lte: range.end } }
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

export async function getOrderWeekClosed(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { date: true },
  });
  if (!order) return false;
  const settings = await getSettings();
  return isWeekClosed(order.date, settings.weekStartDay);
}

async function parseOrderInput(data: unknown): Promise<CreateOrderInput> {
  const locale = await getLocale();
  const { createOrderSchema } = buildValidationSchemas(getDictionary(locale).validation);
  return createOrderSchema.parse(data);
}

export async function createOrder(data: unknown) {
  await requireSession();
  const parsed = await parseOrderInput(data);
  await validateOrderBusinessRules(parsed);

  const orderDate = parseDateInput(parsed.date);
  if (!orderDate) throw new ActionError("validation.dateRequired");

  const settings = await getSettings();
  await assertWeekOpen(orderDate, settings.weekStartDay);

  const calc = calculateOrder({
    members: parsed.members,
    sharedExpenses: parsed.sharedExpenses,
    labPerPerson: parsed.labPerPerson,
  });

  const order = await prisma.order.create({
    data: {
      date: orderDate,
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
      expenses: { create: parsed.sharedExpenses },
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
  await requireSession();
  const locale = await getLocale();
  const { updateOrderSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = updateOrderSchema.parse(data);
  await validateOrderBusinessRules(parsed);

  const existing = await prisma.order.findUnique({ where: { id: parsed.id } });
  if (!existing) throw new ActionError("validation.orderNotFound");

  const settings = await getSettings();
  await assertWeekOpen(existing.date, settings.weekStartDay);

  const orderDate = parseDateInput(parsed.date);
  if (!orderDate) throw new ActionError("validation.dateRequired");

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
      date: orderDate,
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
      expenses: { create: parsed.sharedExpenses },
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
  await requireSession();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new ActionError("validation.orderNotFound");

  const settings = await getSettings();
  await assertWeekOpen(order.date, settings.weekStartDay);

  await prisma.order.delete({ where: { id } });
  revalidateAll();
}

export async function isCurrentWeekClosed(): Promise<boolean> {
  const settings = await getSettings();
  return isWeekClosed(new Date(), settings.weekStartDay);
}
