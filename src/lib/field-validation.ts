import { fieldLimits } from "./field-limits";

export function trimField(value: string): string {
  return value.trim();
}

export function isNameTooShort(name: string): boolean {
  const t = trimField(name);
  return t.length > 0 && t.length < 2;
}

export function isNameTooLong(name: string, max = fieldLimits.memberName): boolean {
  return trimField(name).length > max;
}

export function isExpenseNameTooLong(name: string): boolean {
  return trimField(name).length > fieldLimits.expenseName;
}

export function isRestaurantNameTooLong(name: string): boolean {
  return trimField(name).length > fieldLimits.restaurantName;
}
