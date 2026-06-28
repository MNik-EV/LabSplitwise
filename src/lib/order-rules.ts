import { prisma } from "@/lib/prisma";
import { ActionError } from "@/lib/errors";
import type { CreateOrderInput } from "@/lib/validation-schemas";

export async function validateOrderBusinessRules(parsed: CreateOrderInput): Promise<void> {
  const memberIds = parsed.members.map((m) => m.userId);

  if (!memberIds.includes(parsed.payerId)) {
    throw new ActionError("validation.payerMustBeMember");
  }

  if (new Set(memberIds).size !== memberIds.length) {
    throw new ActionError("validation.duplicateMember");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parsed.restaurantId },
  });
  if (!restaurant) throw new ActionError("validation.restaurantNotFound");

  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set([...memberIds, parsed.payerId])] } },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  if (!userMap.get(parsed.payerId)?.isActive) {
    throw new ActionError("validation.payerNotFound");
  }

  for (const id of memberIds) {
    const user = userMap.get(id);
    if (!user?.isActive) {
      throw new ActionError("validation.memberNotFound");
    }
  }
}
