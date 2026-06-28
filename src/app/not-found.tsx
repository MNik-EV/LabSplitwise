import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getServerI18n();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">{t("notFound.title")}</h2>
      <p className="mb-6 text-muted-foreground">{t("notFound.desc")}</p>
      <Button asChild>
        <Link href="/">{t("notFound.back")}</Link>
      </Button>
    </div>
  );
}
