"use client";

import { LogIn, LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/layout/i18n-provider";

interface AuthUserMenuProps {
  authEnabled: boolean;
}

export function AuthUserMenu({ authEnabled }: AuthUserMenuProps) {
  const { t } = useI18n();
  const { data: session, status } = useSession();

  if (!authEnabled) return null;

  if (status === "loading") {
    return (
      <p className="px-2 text-xs text-muted-foreground">{t("auth.loading")}</p>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => signIn("authentik")}
      >
        <LogIn className="h-4 w-4" />
        {t("auth.signIn")}
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate font-medium">{session.user.name}</p>
          {session.user.email && (
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-4 w-4" />
        {t("auth.signOut")}
      </Button>
    </div>
  );
}
