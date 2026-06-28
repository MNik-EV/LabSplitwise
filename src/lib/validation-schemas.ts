import { z } from "zod";
import { normalizeCardNumber } from "./card-number";
import { fieldLimits } from "./field-limits";
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
    foodPrice: z.coerce.number().min(1, v.foodPricePositive),
  });

  const sharedExpenseSchema = z.object({
    name: z
      .string()
      .min(1, v.expenseNameRequired)
      .max(fieldLimits.expenseName, v.expenseNameMax),
    amount: z.coerce.number().min(0, v.amountPositive),
  });

  const createOrderSchema = z.object({
    date: z.string().min(1, v.dateRequired),
    restaurantId: z.string().min(1, v.restaurantRequired),
    payerId: z.string().min(1, v.payerRequired),
    members: z.array(orderMemberSchema).min(1, v.minMembers),
    sharedExpenses: z.array(sharedExpenseSchema).default([]),
    labPerPerson: z.coerce.number().min(0).default(350),
    notes: z.string().max(fieldLimits.orderNotes, v.notesMax).optional(),
  });

  return {
    orderMemberSchema,
    sharedExpenseSchema,
    createOrderSchema,
    updateOrderSchema: createOrderSchema.extend({ id: z.string().min(1) }),
    createUserSchema: z.object({
      name: z
        .string()
        .min(2, v.nameMin)
        .max(fieldLimits.memberName, v.nameMax),
      cardNumber: cardNumberField(v.cardInvalid),
    }),
    updateUserSchema: z.object({
      id: z.string().min(1),
      name: z
        .string()
        .min(2, v.nameMin)
        .max(fieldLimits.memberName, v.nameMax),
      cardNumber: cardNumberField(v.cardInvalid),
    }),
    createRestaurantSchema: z.object({
      name: z
        .string()
        .min(2, v.restaurantNameMin)
        .max(fieldLimits.restaurantName, v.restaurantNameMax),
    }),
    updateRestaurantSchema: z.object({
      id: z.string().min(1),
      name: z
        .string()
        .min(2, v.restaurantNameMin)
        .max(fieldLimits.restaurantName, v.restaurantNameMax),
    }),
    updateSettingsSchema: z.object({
      labPerPerson: z.coerce.number().min(0),
      labName: z
        .string()
        .min(1)
        .max(fieldLimits.labName, v.labNameMax),
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
