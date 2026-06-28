"use client";

import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({
  authEnabled,
  children,
}: {
  authEnabled: boolean;
  children: React.ReactNode;
}) {
  if (!authEnabled) {
    return children;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
