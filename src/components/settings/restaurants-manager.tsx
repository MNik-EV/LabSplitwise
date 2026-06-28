"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createRestaurant } from "@/actions";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/layout/i18n-provider";

interface RestaurantsManagerProps {
  restaurants: { id: string; name: string }[];
}

export function RestaurantsManager({ restaurants }: RestaurantsManagerProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t("settings.restaurantRequired"));
      return;
    }
    startTransition(async () => {
      try {
        await createRestaurant({ name: name.trim() });
        toast.success(t("settings.restaurantSuccess"));
        setName("");
        router.refresh();
      } catch {
        toast.error(t("settings.restaurantError"));
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.restaurants")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("settings.newRestaurant")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isPending}>
            <Plus className="h-4 w-4" />
            {t("settings.addRestaurant")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {restaurants.map((r) => (
            <Badge key={r.id} variant="secondary" className="gap-1 px-3 py-1.5">
              <Store className="h-3 w-3" />
              {r.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
