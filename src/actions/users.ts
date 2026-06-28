"use server";

import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { buildValidationSchemas } from "@/lib/validation-schemas";
import { ActionError } from "@/lib/errors";
import { getWeekRange } from "@/lib/utils";
import { revalidateAll } from "./shared";
import { requireSession } from "@/lib/auth-session";
import { getSettings } from "./settings";

export async function getUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

/** Active users + inactive members already on an order (for edit form) */
export async function getUsersForOrderEdit(orderId?: string) {
  const active = await getUsers();
  if (!orderId) return active;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { members: { select: { userId: true } } },
  });
  if (!order) return active;

  const activeIds = new Set(active.map((u) => u.id));
  const extraIds = order.members.map((m) => m.userId).filter((id) => !activeIds.has(id));
  if (extraIds.length === 0) return active;

  const inactive = await prisma.user.findMany({
    where: { id: { in: extraIds } },
    orderBy: { name: "asc" },
  });

  return [...active, ...inactive].sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export async function createUser(data: unknown) {
  await requireSession();
  const locale = await getLocale();
  const { createUserSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = createUserSchema.parse(data);
  const user = await prisma.user.create({
    data: { name: parsed.name, cardNumber: parsed.cardNumber },
  });
  revalidateAll();
  return user;
}

export async function updateUser(data: unknown) {
  await requireSession();
  const locale = await getLocale();
  const { updateUserSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = updateUserSchema.parse(data);
  const user = await prisma.user.update({
    where: { id: parsed.id },
    data: { name: parsed.name, cardNumber: parsed.cardNumber },
  });
  revalidateAll();
  return user;
}

export async function deleteUser(id: string) {
  await requireSession();
  if (!id) throw new ActionError("validation.invalidId");

  const settings = await getSettings();
  const { start, end } = getWeekRange(new Date(), settings.weekStartDay);
  const openWeekOrders = await prisma.orderMember.count({
    where: {
      userId: id,
      order: { date: { gte: start, lte: end } },
    },
  });
  if (openWeekOrders > 0) {
    throw new ActionError("validation.userHasOpenWeekOrders");
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  revalidateAll();
}
