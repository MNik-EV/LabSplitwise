import { PageTransition, PageHeader } from "@/components/shared/page-transition";
import { MembersSettings } from "@/components/members/members-settings";
import { MemberTile } from "@/components/members/member-tile";
import { getMemberStats } from "@/actions";
import { getServerI18n } from "@/i18n/server";

export default async function MembersPage() {
  const { t } = await getServerI18n();
  const members = await getMemberStats();

  return (
    <PageTransition>
      <PageHeader
        title={t("members.title")}
        description={t("members.count", { count: members.length })}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MembersSettings
            members={members.map((m) => ({
              id: m.id,
              name: m.name,
              cardNumber: m.cardNumber,
              avatar: m.avatar,
            }))}
          />
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {t("members.list")}
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {members.map((member) => (
                <MemberTile
                  key={member.id}
                  name={member.name}
                  cardNumber={member.cardNumber}
                  avatar={member.avatar}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
