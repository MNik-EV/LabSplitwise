"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildValidationSchemas } from "@/lib/validations";
import { updateSettings } from "@/actions";
import { toastActionError } from "@/lib/action-error-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { fieldLimits } from "@/lib/field-limits";
import { appDefaults } from "@/config/defaults";
import { useI18n } from "@/components/layout/i18n-provider";

interface SettingsFormProps {
  settings: {
    labPerPerson: number;
    labName: string;
    defaultLocale: string;
    weekStartDay: number;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t, dict } = useI18n();

  const settingsSchema = useMemo(
    () => buildValidationSchemas(dict.validation).updateSettingsSchema,
    [dict],
  );

  type SettingsFormData = z.infer<typeof settingsSchema>;

  const weekDays = [
    { value: 0, label: t("days.sun") },
    { value: 1, label: t("days.mon") },
    { value: 2, label: t("days.tue") },
    { value: 3, label: t("days.wed") },
    { value: 4, label: t("days.thu") },
    { value: 5, label: t("days.fri") },
    { value: 6, label: t("days.sat") },
  ];

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      labPerPerson: settings.labPerPerson ?? appDefaults.labPerPerson,
      labName: settings.labName,
      defaultLocale: (settings.defaultLocale as "fa" | "en") ?? appDefaults.locale,
      weekStartDay: settings.weekStartDay,
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    startTransition(async () => {
      try {
        await updateSettings(data);
        document.cookie = `locale=${data.defaultLocale};path=/;max-age=31536000;sameSite=lax`;
        toast.success(t("settings.saveSuccess"));
        router.refresh();
      } catch (error) {
        toastActionError(error, t, "settings.saveError");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("settings.general")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labName">{t("settings.labName")}</Label>
            <Input id="labName" maxLength={fieldLimits.labName} {...form.register("labName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labPerPerson">{t("settings.labPerPerson")}</Label>
            <Input id="labPerPerson" type="number" {...form.register("labPerPerson")} />
            <p className="text-xs text-muted-foreground">
              {t("settings.currencyNote")} · {t("settings.defaultLabel")}:{" "}
              {appDefaults.labPerPerson}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("settings.defaultLocale")}</Label>
            <Select
              value={form.watch("defaultLocale")}
              onValueChange={(v) => form.setValue("defaultLocale", v as "fa" | "en")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fa">{t("locale.fa")}</SelectItem>
                <SelectItem value="en">{t("locale.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("settings.weekStart")}</Label>
            <Select
              value={String(form.watch("weekStartDay"))}
              onValueChange={(v) => form.setValue("weekStartDay", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("settings.saving") : t("settings.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
