import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Remove duplicate settlements so unique(weekStart, fromUserId, toUserId) can apply */
async function dedupeSettlements() {
  const all = await prisma.settlement.findMany({ orderBy: { createdAt: "asc" } });
  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const row of all) {
    const key = `${row.weekStart.getTime()}:${row.fromUserId}:${row.toUserId}`;
    if (seen.has(key)) {
      duplicateIds.push(row.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicateIds.length > 0) {
    await prisma.settlement.deleteMany({ where: { id: { in: duplicateIds } } });
    console.log(`Removed ${duplicateIds.length} duplicate settlement row(s)`);
  }
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
