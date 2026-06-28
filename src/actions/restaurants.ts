"use server";

import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { buildValidationSchemas } from "@/lib/validation-schemas";
import { ActionError } from "@/lib/errors";
import { revalidateAll } from "./shared";

export async function getRestaurants() {
  return prisma.restaurant.findMany({ orderBy: { name: "asc" } });
}

export async function createRestaurant(data: unknown) {
  const locale = await getLocale();
  const { createRestaurantSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = createRestaurantSchema.parse(data);
  const restaurant = await prisma.restaurant.create({ data: parsed });
  revalidateAll();
  return restaurant;
}

export async function updateRestaurant(data: unknown) {
  const locale = await getLocale();
  const { updateRestaurantSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = updateRestaurantSchema.parse(data);
  const restaurant = await prisma.restaurant.update({
    where: { id: parsed.id },
    data: { name: parsed.name },
  });
  revalidateAll();
  return restaurant;
}

export async function deleteRestaurant(id: string) {
  if (!id) throw new ActionError("validation.invalidId");

  const orderCount = await prisma.order.count({ where: { restaurantId: id } });
  if (orderCount > 0) {
    throw new ActionError("validation.restaurantHasOrders");
  }

  await prisma.restaurant.delete({ where: { id } });
  revalidateAll();
}
