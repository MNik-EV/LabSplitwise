"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CopyCardNumber } from "@/components/shared/copy-card-number";
import { useI18n } from "@/components/layout/i18n-provider";

interface MemberTileProps {
  name: string;
  cardNumber?: string | null;
  avatar?: string | null;
}

export function MemberTile({ name, cardNumber, avatar }: MemberTileProps) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        <UserAvatar src={avatar} name={name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          {cardNumber ? (
            <CopyCardNumber value={cardNumber} compact />
          ) : (
            <p className="text-xs text-muted-foreground">{t("members.noCard")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
