import { describe, expect, it, vi, beforeEach } from "vitest";
import { ActionError } from "./errors";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    weeklyReport: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/utils", () => ({
  getWeekRange: () => ({
    start: new Date(2025, 5, 1),
    end: new Date(2025, 5, 7),
  }),
}));

import { prisma } from "@/lib/prisma";
import { isWeekClosed, assertWeekOpen } from "./week-guard";

describe("week-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when week is not closed", async () => {
    vi.mocked(prisma.weeklyReport.findUnique).mockResolvedValue(null);
    expect(await isWeekClosed(new Date(), 6)).toBe(false);
  });

  it("returns true when week report is closed", async () => {
    vi.mocked(prisma.weeklyReport.findUnique).mockResolvedValue({
      id: "1",
      weekStart: new Date(),
      weekEnd: new Date(),
      totalExpenses: 0,
      totalOrders: 0,
      labContribution: 0,
      memberPaid: 0,
      remainingBalance: 0,
      isClosed: true,
      closedAt: new Date(),
      totalTransfers: 0,
      paidTransfers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(await isWeekClosed(new Date(), 6)).toBe(true);
  });

  it("assertWeekOpen throws when week is closed", async () => {
    vi.mocked(prisma.weeklyReport.findUnique).mockResolvedValue({
      id: "1",
      weekStart: new Date(),
      weekEnd: new Date(),
      totalExpenses: 0,
      totalOrders: 0,
      labContribution: 0,
      memberPaid: 0,
      remainingBalance: 0,
      isClosed: true,
      closedAt: new Date(),
      totalTransfers: 0,
      paidTransfers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await expect(assertWeekOpen(new Date(), 6)).rejects.toThrow(ActionError);
  });
});
