export interface OrderMemberInput {
  userId: string;
  foodPrice: number;
}

export interface SharedExpenseInput {
  name: string;
  amount: number;
}

export interface OrderCalculationInput {
  members: OrderMemberInput[];
  sharedExpenses: SharedExpenseInput[];
  labPerPerson: number;
}

export interface MemberCalculation {
  userId: string;
  foodPrice: number;
  sharedPortion: number;
  shareAmount: number;
  pocketAmount: number;
}

export interface OrderCalculationResult {
  members: MemberCalculation[];
  totalSharedExpenses: number;
  totalAmount: number;
  labTotalAmount: number;
  memberCount: number;
}

export function calculateOrder(input: OrderCalculationInput): OrderCalculationResult {
  const memberCount = input.members.length;
  const totalSharedExpenses = input.sharedExpenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const sharedPortion =
    memberCount > 0 ? Math.round(totalSharedExpenses / memberCount) : 0;

  const members: MemberCalculation[] = input.members.map((m) => {
    const shareAmount = m.foodPrice + sharedPortion;
    const pocketAmount = Math.max(0, shareAmount - input.labPerPerson);
    return {
      userId: m.userId,
      foodPrice: m.foodPrice,
      sharedPortion,
      shareAmount,
      pocketAmount,
    };
  });

  const totalAmount = members.reduce((sum, m) => sum + m.shareAmount, 0);
  const labTotalAmount = input.labPerPerson * memberCount;

  return {
    members,
    totalSharedExpenses,
    totalAmount,
    labTotalAmount,
    memberCount,
  };
}

export interface OrderBalanceInput {
  payerId: string;
  totalAmount: number;
  labTotalAmount: number;
  members: { userId: string; pocketAmount: number }[];
}

export function calculateOrderBalances(
  input: OrderBalanceInput,
): Map<string, number> {
  const balances = new Map<string, number>();

  for (const member of input.members) {
    if (member.userId !== input.payerId) {
      balances.set(member.userId, -(member.pocketAmount ?? 0));
    }
  }

  const payerCredit = input.totalAmount - input.labTotalAmount;
  const payerPocket =
    input.members.find((m) => m.userId === input.payerId)?.pocketAmount ?? 0;
  balances.set(input.payerId, payerCredit - payerPocket);

  return balances;
}

export function mergeBalances(
  maps: Map<string, number>[],
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const map of maps) {
    for (const [userId, amount] of map) {
      merged.set(userId, (merged.get(userId) ?? 0) + amount);
    }
  }
  return merged;
}
