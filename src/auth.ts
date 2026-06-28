import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

function authentikProvider() {
  const issuer = process.env.AUTH_AUTHENTIK_ISSUER;
  const clientId = process.env.AUTH_AUTHENTIK_ID;
  const clientSecret = process.env.AUTH_AUTHENTIK_SECRET;

  if (!issuer || !clientId || !clientSecret) {
    return null;
  }

  return {
    id: "authentik",
    name: "Authentik",
    type: "oidc" as const,
    issuer,
    clientId,
    clientSecret,
    profile(profile: Record<string, unknown>) {
      return {
        id: String(profile.sub),
        name:
          (profile.name as string | undefined) ??
          (profile.preferred_username as string | undefined) ??
          (profile.email as string | undefined) ??
          "User",
        email: profile.email as string | undefined,
        image: profile.picture as string | undefined,
      };
    },
  };
}

const authentik = authentikProvider();

const config = {
  trustHost: true,
  // Placeholder when SSO is off so /api/auth/session works on Vercel without AUTH_SECRET
  secret: process.env.AUTH_SECRET ?? (authentik ? undefined : "open-access-no-sso"),
  providers: authentik ? [authentik] : [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
