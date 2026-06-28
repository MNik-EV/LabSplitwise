@import "./globals.css";

import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { I18nProvider } from "@/components/layout/i18n-provider";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ClientErrorBoundary } from "@/components/shared/client-error-boundary";
import { getLocale } from "@/i18n/server";
import { localeConfig } from "@/config/defaults";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZLab Lunch | Group Expense Manager",
  description: "Smart lunch expense & settlement system for research labs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const { dir } = localeConfig[locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider locale={locale}>
            <ClientErrorBoundary>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                  <MobileHeader />
                  <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                  </main>
                </div>
              </div>
            </ClientErrorBoundary>
            <Toaster position="top-center" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
