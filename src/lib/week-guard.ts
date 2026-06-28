import { prisma } from "@/lib/prisma";
import { getWeekRange } from "@/lib/utils";
import { getWeekRangeFromKey } from "@/lib/week";
import { ActionError } from "@/lib/errors";

export async function isWeekClosed(date: Date, weekStartDay: number): Promise<boolean> {
  const { start } = getWeekRange(date, weekStartDay);
  const report = await prisma.weeklyReport.findUnique({ where: { weekStart: start } });
  return report?.isClosed ?? false;
}

export async function isWeekKeyClosed(weekKey: string, weekStartDay: number): Promise<boolean> {
  const { start } = getWeekRangeFromKey(weekKey, weekStartDay);
  const report = await prisma.weeklyReport.findUnique({ where: { weekStart: start } });
  return report?.isClosed ?? false;
}

export async function assertWeekOpen(date: Date, weekStartDay: number): Promise<void> {
  if (await isWeekClosed(date, weekStartDay)) {
    throw new ActionError("validation.weekClosed");
  }
}
