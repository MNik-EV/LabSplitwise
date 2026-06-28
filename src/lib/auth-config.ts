/** Whether all Authentik / Auth.js env vars are set */
export function hasOidcConfig(): boolean {
  return Boolean(
    process.env.AUTH_SECRET?.trim() &&
      process.env.AUTH_AUTHENTIK_ISSUER?.trim() &&
      process.env.AUTH_AUTHENTIK_ID?.trim() &&
      process.env.AUTH_AUTHENTIK_SECRET?.trim(),
  );
}

/**
 * Auth is OFF when:
 * - AUTH_DISABLED=true, or
 * - OIDC env is incomplete (default — Vercel / local / Docker without SSO)
 *
 * Auth is ON only when all OIDC vars are set and AUTH_DISABLED is not true.
 */
export function isAuthDisabled(): boolean {
  if (process.env.AUTH_DISABLED === "true") return true;
  return !hasOidcConfig();
}

export function isAuthEnabled(): boolean {
  return !isAuthDisabled();
}
