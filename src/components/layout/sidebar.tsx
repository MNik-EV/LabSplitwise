"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Users,
  ArrowLeftRight,
  Settings,
  Menu,
  X,
  UtensilsCrossed,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { isNavActive } from "@/lib/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

const navKeys = [
  { href: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/orders/new", key: "nav.newOrder", icon: PlusCircle },
  { href: "/orders", key: "nav.orders", icon: ClipboardList },
  { href: "/members", key: "nav.members", icon: Users },
  { href: "/settlement", key: "nav.settlement", icon: ArrowLeftRight },
  { href: "/archive", key: "nav.archive", icon: Archive },
  { href: "/settings", key: "nav.settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { t, dir } = useI18n();
  const [mounted, setMounted] = useState(false);
  const isRtl = dir === "rtl";

  useEffect(() => setMounted(true), []);

  return (
    <>
      <AnimatePresence>
        {mounted && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-card shadow-card transition-transform lg:static lg:translate-x-0 lg:shadow-none",
          isRtl ? "right-0 border-l" : "left-0 border-r",
          !mounted || sidebarOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">ZLab</p>
              <p className="text-xs text-muted-foreground">{t("common.appSubtitle")}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navKeys.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  whileHover={{ x: isRtl ? -4 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.key)}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t p-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

export function MobileHeader() {
  const { setSidebarOpen } = useAppStore();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <span className="font-bold">{t("common.appName")}</span>
        </div>
      </div>
      <LocaleSwitcher compact />
    </header>
  );
}
