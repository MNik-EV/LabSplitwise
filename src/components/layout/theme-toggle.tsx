"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "./i18n-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" className="relative w-full justify-start gap-2" disabled>
        <Sun className="h-4 w-4" />
        <span className="ms-2">{t("theme.dark")}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="relative w-full justify-start gap-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute start-3 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="ms-6">
        {theme === "dark" ? t("theme.light") : t("theme.dark")}
      </span>
    </Button>
  );
}
