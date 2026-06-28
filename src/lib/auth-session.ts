import { auth } from "@/auth";
import { ActionError } from "@/lib/errors";
import { isAuthDisabled } from "@/lib/auth-config";

export { isAuthDisabled, isAuthEnabled, hasOidcConfig } from "@/lib/auth-config";

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
