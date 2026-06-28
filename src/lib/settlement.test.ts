import { describe, expect, it } from "vitest";
import { minimumCashFlow, calculateWeeklySettlements } from "./settlement";

describe("minimumCashFlow", () => {
  it("returns no transfers when all balances are zero", () => {
    const balances = new Map([
      ["a", 0],
      ["b", 0],
    ]);
    expect(minimumCashFlow(balances)).toEqual([]);
  });

  it("settles simple two-party debt", () => {
    const balances = new Map([
      ["debtor", -100],
      ["creditor", 100],
    ]);
    expect(minimumCashFlow(balances)).toEqual([
      { fromUserId: "debtor", toUserId: "creditor", amount: 100 },
    ]);
  });

  it("minimizes transfers for multiple parties", () => {
    const balances = new Map([
      ["a", 150],
      ["b", -100],
      ["c", -50],
    ]);
    const transfers = minimumCashFlow(balances);
    const total = transfers.reduce((s, t) => s + t.amount, 0);
    expect(total).toBe(150);
    expect(transfers.length).toBeLessThanOrEqual(2);
  });
});

describe("calculateWeeklySettlements", () => {
  it("merges order balances then settles", () => {
    const order1 = new Map([
      ["a", 50],
      ["b", -50],
    ]);
    const order2 = new Map([
      ["a", -20],
      ["b", 20],
    ]);
    const transfers = calculateWeeklySettlements([order1, order2]);
    expect(transfers).toEqual([
      { fromUserId: "b", toUserId: "a", amount: 30 },
    ]);
  });
});
