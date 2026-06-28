import { describe, expect, it } from "vitest";
import {
  calculateOrder,
  calculateOrderBalances,
  mergeBalances,
} from "./calculations";

describe("calculateOrder", () => {
  it("splits shared expenses with integer rounding", () => {
    const result = calculateOrder({
      members: [
        { userId: "a", foodPrice: 100 },
        { userId: "b", foodPrice: 200 },
        { userId: "c", foodPrice: 150 },
      ],
      sharedExpenses: [{ name: "delivery", amount: 100 }],
      labPerPerson: 350,
    });

    expect(result.totalSharedExpenses).toBe(100);
    expect(result.members.map((m) => m.sharedPortion)).toEqual([34, 33, 33]);
    expect(result.totalAmount).toBe(550);
  });

  it("computes pocket amounts after lab contribution", () => {
    const result = calculateOrder({
      members: [
        { userId: "a", foodPrice: 400 },
        { userId: "b", foodPrice: 300 },
      ],
      sharedExpenses: [],
      labPerPerson: 350,
    });

    expect(result.members.find((m) => m.userId === "a")?.pocketAmount).toBe(50);
    expect(result.members.find((m) => m.userId === "b")?.pocketAmount).toBe(0);
  });
});

describe("calculateOrderBalances", () => {
  it("assigns debts to non-payers and credit to payer", () => {
    const balances = calculateOrderBalances({
      payerId: "payer",
      totalAmount: 800,
      labTotalAmount: 700,
      members: [
        { userId: "payer", pocketAmount: 50 },
        { userId: "other", pocketAmount: 50 },
      ],
    });

    expect(balances.get("other")).toBe(-50);
    expect(balances.get("payer")).toBe(50);
  });
});

describe("mergeBalances", () => {
  it("sums balances across orders", () => {
    const a = new Map([["u1", 100], ["u2", -100]]);
    const b = new Map([["u1", -30], ["u2", 30]]);
    const merged = mergeBalances([a, b]);
    expect(merged.get("u1")).toBe(70);
    expect(merged.get("u2")).toBe(-70);
  });
});
