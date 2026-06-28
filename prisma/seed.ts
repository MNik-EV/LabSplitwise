import { PrismaClient } from "@prisma/client";
import { calculateOrder, calculateOrderBalances } from "../src/lib/calculations";

import { appDefaults } from "../src/config/defaults";

const prisma = new PrismaClient();

async function main() {
  await prisma.settlement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.orderMember.deleteMany();
  await prisma.order.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.create({
    data: {
      id: "default",
      labPerPerson: appDefaults.labPerPerson,
      labName: appDefaults.labName.fa,
      defaultLocale: appDefaults.locale,
      currency: "تومان",
      weekStartDay: appDefaults.weekStartDay,
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: "مهدی", cardNumber: "6219861927824416" } }),
    prisma.user.create({ data: { name: "داوود" } }),
    prisma.user.create({ data: { name: "محمدحسین" } }),
    prisma.user.create({ data: { name: "حسن" } }),
    prisma.user.create({ data: { name: "علی" } }),
    prisma.user.create({ data: { name: "رضا" } }),
  ]);

  const [mahdi, davood, mohammad, hassan, ali, reza] = users;

  const restaurants = await Promise.all([
    prisma.restaurant.create({ data: { name: "رستوران سنتی" } }),
    prisma.restaurant.create({ data: { name: "کافه رستوران" } }),
    prisma.restaurant.create({ data: { name: "فست‌فود برگر" } }),
    prisma.restaurant.create({ data: { name: "رستوران ایرانی" } }),
  ]);

  const labPerPerson = 350;

  const orderData = [
    {
      daysAgo: 1,
      restaurant: restaurants[0],
      payer: mahdi,
      members: [
        { user: mahdi, food: 420 },
        { user: davood, food: 370 },
        { user: mohammad, food: 370 },
        { user: hassan, food: 370 },
      ],
      expenses: [
        { name: "پیک", amount: 10 },
        { name: "نوشابه", amount: 110 },
      ],
    },
    {
      daysAgo: 2,
      restaurant: restaurants[1],
      payer: davood,
      members: [
        { user: mahdi, food: 380 },
        { user: davood, food: 350 },
        { user: mohammad, food: 390 },
        { user: ali, food: 360 },
        { user: reza, food: 340 },
      ],
      expenses: [
        { name: "سالاد", amount: 150 },
        { name: "مالیات", amount: 50 },
      ],
    },
    {
      daysAgo: 3,
      restaurant: restaurants[2],
      payer: mohammad,
      members: [
        { user: mahdi, food: 450 },
        { user: davood, food: 420 },
        { user: mohammad, food: 400 },
        { user: hassan, food: 380 },
      ],
      expenses: [{ name: "پیک", amount: 20 }],
    },
    {
      daysAgo: 4,
      restaurant: restaurants[3],
      payer: hassan,
      members: [
        { user: mahdi, food: 400 },
        { user: hassan, food: 380 },
        { user: ali, food: 370 },
        { user: reza, food: 350 },
      ],
      expenses: [
        { name: "نوشابه", amount: 80 },
        { name: "دسر", amount: 120 },
      ],
    },
    {
      daysAgo: 5,
      restaurant: restaurants[0],
      payer: ali,
      members: [
        { user: davood, food: 360 },
        { user: mohammad, food: 380 },
        { user: ali, food: 340 },
        { user: reza, food: 320 },
      ],
      expenses: [{ name: "پیک", amount: 15 }],
    },
    {
      daysAgo: 6,
      restaurant: restaurants[1],
      payer: reza,
      members: [
        { user: mahdi, food: 410 },
        { user: davood, food: 390 },
        { user: mohammad, food: 400 },
        { user: hassan, food: 370 },
        { user: reza, food: 380 },
      ],
      expenses: [
        { name: "نوشابه", amount: 100 },
        { name: "سالاد", amount: 100 },
      ],
    },
  ];

  for (const data of orderData) {
    const date = new Date();
    date.setDate(date.getDate() - data.daysAgo);
    date.setHours(12, 0, 0, 0);

    const calc = calculateOrder({
      members: data.members.map((m) => ({
        userId: m.user.id,
        foodPrice: m.food,
      })),
      sharedExpenses: data.expenses,
      labPerPerson,
    });

    const order = await prisma.order.create({
      data: {
        date,
        totalAmount: calc.totalAmount,
        labPerPerson,
        labTotalAmount: calc.labTotalAmount,
        restaurantId: data.restaurant.id,
        payerId: data.payer.id,
        members: {
          create: calc.members.map((m) => ({
            userId: m.userId,
            foodPrice: m.foodPrice,
            shareAmount: m.shareAmount,
            pocketAmount: m.pocketAmount,
          })),
        },
        expenses: {
          create: data.expenses,
        },
      },
    });

    calculateOrderBalances({
      payerId: data.payer.id,
      totalAmount: calc.totalAmount,
      labTotalAmount: calc.labTotalAmount,
      members: calc.members.map((m) => ({
        userId: m.userId,
        pocketAmount: m.pocketAmount,
      })),
    });
  }

  console.log("✅ دیتابیس با موفقیت پر شد");
  console.log(`   ${users.length} عضو`);
  console.log(`   ${restaurants.length} رستوران`);
  console.log(`   ${orderData.length} سفارش`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
