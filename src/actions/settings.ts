"use server";

import { prisma } from "@/lib/prisma";
import { appDefaults } from "@/config/defaults";
import { getDictionary } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { buildValidationSchemas } from "@/lib/validation-schemas";
import { revalidateAll } from "./shared";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "default",
        labPerPerson: appDefaults.labPerPerson,
        defaultLocale: appDefaults.locale,
        labName: appDefaults.labName.fa,
        weekStartDay: appDefaults.weekStartDay,
      },
    });
  }
  return settings;
}

export async function updateSettings(data: unknown) {
  const locale = await getLocale();
  const { updateSettingsSchema } = buildValidationSchemas(getDictionary(locale).validation);
  const parsed = updateSettingsSchema.parse(data);
  const settings = await prisma.settings.update({
    where: { id: "default" },
    data: parsed,
  });
  revalidateAll();
  return settings;
}
