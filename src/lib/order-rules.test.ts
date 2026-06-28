import { describe, expect, it, vi, beforeEach } from "vitest";
import { ActionError } from "./errors";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    restaurant: { findUnique: vi.fn() },
    user: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { validateOrderBusinessRules } from "./order-rules";

const baseOrder = {
  date: "2025-06-01",
  restaurantId: "r1",
  payerId: "u1",
  members: [{ userId: "u1", foodPrice: 100 }],
  sharedExpenses: [],
  labPerPerson: 350,
  notes: "",
};

describe("validateOrderBusinessRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue({
      id: "r1",
      name: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "u1",
        name: "Ali",
        cardNumber: null,
        avatar: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  it("rejects payer not in members", async () => {
    await expect(
      validateOrderBusinessRules({
        ...baseOrder,
        payerId: "u2",
        members: [{ userId: "u1", foodPrice: 100 }],
      }),
    ).rejects.toThrow(ActionError);
  });

  it("rejects duplicate members", async () => {
    await expect(
      validateOrderBusinessRules({
        ...baseOrder,
        members: [
          { userId: "u1", foodPrice: 100 },
          { userId: "u1", foodPrice: 200 },
        ],
      }),
    ).rejects.toThrow(ActionError);
  });

  it("passes valid order", async () => {
    await expect(validateOrderBusinessRules(baseOrder)).resolves.toBeUndefined();
  });
});
