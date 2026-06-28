import { z } from "zod";
import { normalizeCardNumber } from "./card-number";
import type { Dictionary } from "@/i18n/index";

function cardNumberField(message: string) {
  return z
    .string()
    .default("")
    .transform((v) => {
      const digits = normalizeCardNumber(v);
      return digits.length ? digits : null;
    })
    .refine((v) => v === null || v.length === 16, message);
}

export function buildValidationSchemas(v: Dictionary["validation"]) {
  const orderMemberSchema = z.object({
    userId: z.string().min(1, v.memberRequired),
    foodPrice: z.coerce.number().min(0, v.foodPricePositive),
  });

  const sharedExpenseSchema = z.object({
    name: z.string().min(1, v.expenseNameRequired),
    amount: z.coerce.number().min(0, v.amountPositive),
  });

  const createOrderSchema = z.object({
    date: z.string().min(1, v.dateRequired),
    restaurantId: z.string().min(1, v.restaurantRequired),
    payerId: z.string().min(1, v.payerRequired),
    members: z.array(orderMemberSchema).min(1, v.minMembers),
    sharedExpenses: z.array(sharedExpenseSchema).default([]),
    labPerPerson: z.coerce.number().min(0).default(350),
    notes: z.string().optional(),
  });

  return {
    orderMemberSchema,
    sharedExpenseSchema,
    createOrderSchema,
    updateOrderSchema: createOrderSchema.extend({ id: z.string().min(1) }),
    createUserSchema: z.object({
      name: z.string().min(2, v.nameMin),
      cardNumber: cardNumberField(v.cardInvalid),
    }),
    updateUserSchema: z.object({
      id: z.string().min(1),
      name: z.string().min(2, v.nameMin),
      cardNumber: cardNumberField(v.cardInvalid),
    }),
    createRestaurantSchema: z.object({
      name: z.string().min(2, v.restaurantNameMin),
    }),
    updateRestaurantSchema: z.object({
      id: z.string().min(1),
      name: z.string().min(2, v.restaurantNameMin),
    }),
    updateSettingsSchema: z.object({
      labPerPerson: z.coerce.number().min(0),
      labName: z.string().min(1),
      defaultLocale: z.enum(["fa", "en"]),
      weekStartDay: z.coerce.number().min(0).max(6),
    }),
  };
}

export type CreateOrderInput = z.infer<
  ReturnType<typeof buildValidationSchemas>["createOrderSchema"]
>;
export type UpdateOrderInput = z.infer<
  ReturnType<typeof buildValidationSchemas>["updateOrderSchema"]
>;
