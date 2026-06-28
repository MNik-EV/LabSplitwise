import { revalidatePath } from "next/cache";

export const REVALIDATE_PATHS = [
  "/",
  "/orders",
  "/members",
  "/settlement",
  "/archive",
  "/settings",
] as const;

export function revalidateAll() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}
