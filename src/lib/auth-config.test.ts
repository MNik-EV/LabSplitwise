import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { hasOidcConfig, isAuthDisabled } from "./auth-config";

describe("auth-config", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.AUTH_DISABLED;
    delete process.env.AUTH_SECRET;
    delete process.env.AUTH_AUTHENTIK_ISSUER;
    delete process.env.AUTH_AUTHENTIK_ID;
    delete process.env.AUTH_AUTHENTIK_SECRET;
  });

  afterEach(() => {
    process.env = env;
  });

  it("disables auth when OIDC is not configured", () => {
    expect(hasOidcConfig()).toBe(false);
    expect(isAuthDisabled()).toBe(true);
  });

  it("enables auth when all OIDC vars are set", () => {
    process.env.AUTH_SECRET = "secret";
    process.env.AUTH_AUTHENTIK_ISSUER = "https://auth.example.com/o/app/";
    process.env.AUTH_AUTHENTIK_ID = "id";
    process.env.AUTH_AUTHENTIK_SECRET = "client-secret";
    expect(hasOidcConfig()).toBe(true);
    expect(isAuthDisabled()).toBe(false);
  });

  it("respects AUTH_DISABLED=true even with OIDC configured", () => {
    process.env.AUTH_SECRET = "secret";
    process.env.AUTH_AUTHENTIK_ISSUER = "https://auth.example.com/o/app/";
    process.env.AUTH_AUTHENTIK_ID = "id";
    process.env.AUTH_AUTHENTIK_SECRET = "client-secret";
    process.env.AUTH_DISABLED = "true";
    expect(isAuthDisabled()).toBe(true);
  });
});
