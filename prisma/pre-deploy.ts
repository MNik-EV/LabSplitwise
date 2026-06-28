import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SettlementRow = {
  id: string;
  weekStart: Date;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
};

/** Remove duplicate settlements so unique(weekStart, fromUserId, toUserId) can apply */
async function dedupeSettlements() {
  const tableExists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Settlement'
    ) AS "exists"
  `;

  if (!tableExists[0]?.exists) {
    console.log("Settlement table not found — skipping dedupe");
    return;
  }

  // Raw SQL avoids Prisma selecting columns (e.g. paidAt) not yet migrated in production
  const all = await prisma.$queryRaw<SettlementRow[]>`
    SELECT id, "weekStart", "fromUserId", "toUserId", "createdAt"
    FROM "Settlement"
    ORDER BY "createdAt" ASC
  `;

  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const row of all) {
    const key = `${new Date(row.weekStart).getTime()}:${row.fromUserId}:${row.toUserId}`;
    if (seen.has(key)) {
      duplicateIds.push(row.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicateIds.length === 0) return;

  const BATCH = 100;
  for (let i = 0; i < duplicateIds.length; i += BATCH) {
    const batch = duplicateIds.slice(i, i + BATCH);
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Settlement" WHERE id IN (${batch.map((_, j) => `$${j + 1}`).join(", ")})`,
      ...batch,
    );
  }

  console.log(`Removed ${duplicateIds.length} duplicate settlement row(s)`);
}

async function main() {
  await dedupeSettlements();
}

main()
  .catch((error) => {
    console.error("Pre-deploy failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
