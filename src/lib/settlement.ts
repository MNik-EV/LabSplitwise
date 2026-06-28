export interface SettlementTransfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Minimum Cash Flow algorithm — finds the minimum number of transfers
 * to settle all balances among members.
 */
export function minimumCashFlow(
  balances: Map<string, number>,
): SettlementTransfer[] {
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of balances) {
    const rounded = Math.round(balance);
    if (rounded > 0) {
      creditors.push({ userId, amount: rounded });
    } else if (rounded < 0) {
      debtors.push({ userId, amount: -rounded });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: SettlementTransfer[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const amount = Math.min(credit.amount, debt.amount);

    if (amount > 0) {
      transfers.push({
        fromUserId: debt.userId,
        toUserId: credit.userId,
        amount,
      });
    }

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount === 0) i++;
    if (debt.amount === 0) j++;
  }

  return transfers;
}

export function calculateWeeklySettlements(
  orderBalances: Map<string, number>[],
): SettlementTransfer[] {
  const merged = new Map<string, number>();
  for (const map of orderBalances) {
    for (const [userId, amount] of map) {
      merged.set(userId, (merged.get(userId) ?? 0) + amount);
    }
  }
  return minimumCashFlow(merged);
}
