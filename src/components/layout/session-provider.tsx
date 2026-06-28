"use client";

import { SessionProvider } from "next-auth/react";

/** Always mount SessionProvider so useSession() is safe when auth UI is shown. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
