import { getDictionary } from "@/i18n";
import { buildValidationSchemas } from "./validation-schemas";

/** Default (Persian) schemas — prefer `buildValidationSchemas(getDictionary(locale).validation)` on server */
const defaultSchemas = buildValidationSchemas(getDictionary("fa").validation);

export const orderMemberSchema = defaultSchemas.orderMemberSchema;
export const sharedExpenseSchema = defaultSchemas.sharedExpenseSchema;
export const createOrderSchema = defaultSchemas.createOrderSchema;
export const updateOrderSchema = defaultSchemas.updateOrderSchema;
export const createUserSchema = defaultSchemas.createUserSchema;
export const updateUserSchema = defaultSchemas.updateUserSchema;
export const createRestaurantSchema = defaultSchemas.createRestaurantSchema;
export const updateSettingsSchema = defaultSchemas.updateSettingsSchema;

export { buildValidationSchemas };
export type { CreateOrderInput, UpdateOrderInput } from "./validation-schemas";
