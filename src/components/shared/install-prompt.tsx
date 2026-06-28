"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/layout/i18n-provider";

const DISMISS_KEY = "zlab-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (!isMobileDevice() || isStandalone()) return;

    if (isIOS()) {
      setIosMode(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          {iosMode ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("pwa.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {iosMode ? t("pwa.iosHint") : t("pwa.androidHint")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!iosMode && installEvent && (
            <Button size="sm" onClick={install}>
              {t("pwa.install")}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={dismiss} aria-label={t("common.close")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
