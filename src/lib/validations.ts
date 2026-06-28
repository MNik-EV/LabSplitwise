import { z } from "zod";
import { normalizeCardNumber } from "./card-number";

const cardNumberField = z
  .string()
  .default("")
  .transform((v) => {
    const digits = normalizeCardNumber(v);
    return digits.length ? digits : null;
  })
  .refine((v) => v === null || v.length === 16, "شماره کارت باید ۱۶ رقم باشد");

export const createUserSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  cardNumber: cardNumberField,
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  cardNumber: cardNumberField,
});

export const orderMemberSchema = z.object({
  userId: z.string().min(1, "عضو را انتخاب کنید"),
  foodPrice: z.coerce.number().min(0, "قیمت غذا باید مثبت باشد"),
});

export const sharedExpenseSchema = z.object({
  name: z.string().min(1, "نام هزینه الزامی است"),
  amount: z.coerce.number().min(0, "مبلغ باید مثبت باشد"),
});

export const createOrderSchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  restaurantId: z.string().min(1, "رستوران را انتخاب کنید"),
  payerId: z.string().min(1, "پرداخت‌کننده را انتخاب کنید"),
  members: z.array(orderMemberSchema).min(1, "حداقل یک عضو لازم است"),
  sharedExpenses: z.array(sharedExpenseSchema).default([]),
  labPerPerson: z.coerce.number().min(0).default(350),
  notes: z.string().optional(),
});

export const updateOrderSchema = createOrderSchema.extend({
  id: z.string().min(1),
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2, "نام رستوران باید حداقل ۲ کاراکتر باشد"),
});

export const updateSettingsSchema = z.object({
  labPerPerson: z.coerce.number().min(0),
  labName: z.string().min(1),
  defaultLocale: z.enum(["fa", "en"]),
  weekStartDay: z.coerce.number().min(0).max(6),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
