import "./globals.css";

import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { I18nProvider } from "@/components/layout/i18n-provider";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ClientErrorBoundary } from "@/components/shared/client-error-boundary";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { PwaRegister } from "@/components/shared/pwa-register";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { isAuthEnabled } from "@/lib/auth-session";
import { getLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n";
import { getSettings } from "@/actions";
import { localeConfig } from "@/config/defaults";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: dict.common.appName,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: dict.common.appName,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const { dir } = localeConfig[locale];
  const authEnabled = isAuthEnabled();
  const settings = await getSettings();

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <I18nProvider locale={locale}>
              <ClientErrorBoundary>
                <PwaRegister />
                <div className="flex min-h-screen">
                  <Sidebar authEnabled={authEnabled} labName={settings.labName} />
                <div className="flex flex-1 flex-col">
                  <InstallPrompt />
                  <MobileHeader />
                  <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                  </main>
                </div>
              </div>
            </ClientErrorBoundary>
            <Toaster position="top-center" richColors />
            </I18nProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
