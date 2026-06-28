import { auth } from "@/auth";
import { ActionError } from "@/lib/errors";

export function isAuthDisabled(): boolean {
  return process.env.AUTH_DISABLED === "true";
}

export function isAuthEnabled(): boolean {
  return !isAuthDisabled();
}

export async function requireSession() {
  if (isAuthDisabled()) return null;

  const session = await auth();
  if (!session?.user) {
    throw new ActionError("errors.unauthorized");
  }

  return session;
}

export async function getOptionalSession() {
  if (isAuthDisabled()) return null;
  return auth();
}
