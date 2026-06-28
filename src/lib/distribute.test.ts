import { describe, expect, it } from "vitest";
import { distributeIntegerTotal } from "./distribute";

describe("distributeIntegerTotal", () => {
  it("returns empty array for zero count", () => {
    expect(distributeIntegerTotal(100, 0)).toEqual([]);
  });

  it("splits evenly when divisible", () => {
    expect(distributeIntegerTotal(300, 3)).toEqual([100, 100, 100]);
  });

  it("distributes remainder to first members", () => {
    expect(distributeIntegerTotal(100, 3)).toEqual([34, 33, 33]);
    expect(distributeIntegerTotal(10, 3)).toEqual([4, 3, 3]);
  });

  it("sums to original total", () => {
    const total = 12345;
    const count = 7;
    const parts = distributeIntegerTotal(total, count);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
    expect(parts).toHaveLength(count);
  });
});
