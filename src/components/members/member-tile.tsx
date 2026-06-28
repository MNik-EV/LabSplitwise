"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getAvatarColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyCardNumber } from "@/components/shared/copy-card-number";
import { useI18n } from "@/components/layout/i18n-provider";

interface MemberTileProps {
  name: string;
  cardNumber?: string | null;
}

export function MemberTile({ name, cardNumber }: MemberTileProps) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar className={cn("h-10 w-10 shrink-0", getAvatarColor(name))}>
          <AvatarFallback className="bg-transparent text-sm text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
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
