import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { SettingsForm } from "@/components/settings/settings-form";
import { RestaurantsManager } from "@/components/settings/restaurants-manager";
import { getSettings, getRestaurants } from "@/actions";
import { getServerI18n } from "@/i18n/server";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const { t } = await getServerI18n();
  const [settings, restaurants] = await Promise.all([
    getSettings(),
    getRestaurants(),
  ]);

  return (
    <PageTransition>
      <PageHeader title={t("settings.title")} description={t("settings.desc")} />

      <div className="mx-auto max-w-2xl space-y-8">
        <SettingsForm settings={settings} />
        <Separator />
        <RestaurantsManager restaurants={restaurants} />
      </div>
    </PageTransition>
  );
}
