<div align="center">

# 🍽️ LabSplitwise

**Splitwise for research labs — track daily lunch orders, lab subsidies & weekly settlements in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) · [Live Demo](https://lab-splitwise.vercel.app) · [Deploy](#-deployment) · [فارسی](#-persian)

<br />

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-lab--splitwise.vercel.app-2563eb?style=for-the-badge)](https://lab-splitwise.vercel.app)

*Beautiful bilingual dashboard · RTL/LTR · Dark mode · Real-time expense splitting*

</div>

---

## ✨ Why LabSplitwise?

Research labs eat lunch together every day. Someone pays, the lab subsidizes each person, shared costs get split — and by Friday nobody remembers who owes whom.

**LabSplitwise** fixes that:

| Problem | Solution |
|---------|----------|
| Manual math after every order | Auto-calculated shares, pocket costs & lab subsidies |
| Messy group debts | **Minimum Cash Flow** algorithm — fewest transfers only |
| Slow order entry | 4-step wizard — register an order in **< 10 seconds** |
| Language barrier | **Persian ↔ English** one-click toggle + auto currency |
| Spreadsheet chaos | Production-ready dashboard, charts & weekly reports |

---

## 🚀 Features

### Core
- 📊 **Dashboard** — weekly stats, daily charts, recent orders, active members
- ⚡ **Quick order wizard** — date, restaurant, payer, attendees, shared expenses
- 🧮 **Smart calculations** — food + shared split − lab subsidy = pocket cost
- 💸 **Weekly settlement** — optimal peer-to-peer transfers (not raw debt matrix)
- 👥 **Member analytics** — attendance, payments, credit/debt, avg food price
- 🏪 **Restaurant & member management**

### UX / UI
- 🌐 **Bilingual** — Persian (RTL, Toman) · English (LTR, USD)
- 🌓 **Light & Dark mode**
- 🎨 Modern SaaS design — Linear / Notion inspired
- ✨ Framer Motion animations, toasts, skeletons, empty states
- 📱 Fully responsive

### Tech
- Next.js 15 App Router · React 19 · Server Actions
- Prisma ORM · PostgreSQL (Neon free tier)
- Zustand · React Hook Form · Zod · shadcn/ui · Recharts

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm

### Install

```bash
git clone https://github.com/MNik-EV/LabSplitwise.git
cd LabSplitwise
npm install
npm run db:setup   # migrate + seed sample data
npm run dev
```

Open **http://localhost:3000**

### Configuration

Edit defaults in **one place** — `src/config/defaults.ts` or `.env`:

```env
NEXT_PUBLIC_DEFAULT_LOCALE=fa          # fa | en
NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON=350   # lab subsidy per person
```

Or change at runtime in **Settings → General**.

| Locale | Direction | Currency display |
|--------|-----------|------------------|
| `fa`   | RTL       | `۱۲۳,۴۵۶ تومان`  |
| `en`   | LTR       | `$123,456`       |

---

## 🧮 How calculations work

```
Food prices:     420 + 370 + 370 + 370 = 1,530
Shared costs:    delivery 10 + drinks 110 = 120 ÷ 4 = 30/person
Per-person share: 450, 400, 400, 400 → Total 1,650
Lab pays 350×4 = 1,400
Pocket costs:    100, 50, 50, 50

If Mahdi paid the full bill → 3 transfers of 50 to Mahdi (minimum cash flow)
```

---

## 📁 Project structure

```
src/
├── app/           # Pages (App Router)
├── actions/       # Server Actions (CRUD)
├── components/    # UI modules
├── config/        # App defaults ⭐
├── i18n/          # fa/en dictionaries
├── lib/           # Calculations & settlement algorithm
└── stores/        # Zustand state
prisma/            # Schema & seed
```

---

## 🌍 Deployment (Vercel)

> SQLite **does not work** on Vercel serverless. Use **Neon PostgreSQL** (free).

### Step 1 — Create free database on [Neon](https://neon.tech)

1. Sign up → **New Project**
2. Copy the **Connection string** (PostgreSQL)
3. Use the **pooled** URL if available (ends with `-pooler`)

### Step 2 — Add env var on Vercel

1. Vercel → your project → **Settings** → **Environment Variables**
2. Add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | `postgresql://...` from Neon |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `fa` |
| `NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON` | `350` |

3. Apply to **Production**, **Preview**, **Development**

### Step 3 — Redeploy

**Deployments** → latest deployment → **⋯** → **Redeploy**

Build runs `prisma db push` + seed automatically.

Live demo: `https://lab-splitwise.vercel.app`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MNik-EV/LabSplitwise&env=DATABASE_URL,NEXT_PUBLIC_DEFAULT_LOCALE,NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON)

### GitHub Pages

GitHub Pages **cannot** run this app (needs server + database). Use Vercel.

---

## 📜 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run db:setup     # Push schema + seed
npm run lint         # ESLint
```

---

## 🤝 Contributing

PRs welcome! Ideas:

- [ ] Export to PDF / Excel
- [ ] Telegram bot notifications
- [ ] Multi-lab support

**Star ⭐ this repo** if it saved your lab from lunch debt chaos!

---

## 📄 License

MIT © ZLab

---

## 🇮🇷 Persian

**LabSplitwise** یک سیستم مدیریت ناهار و تسویه حساب گروهی برای آزمایشگاه‌هاست — شبیه Splitwise، با پشتیبانی کامل فارسی، الگوریتم Minimum Cash Flow، و رابط کاربری مدرن.

زبان را از سایدبار (`EN` / `فا`) یا تنظیمات تغییر دهید.

---

<div align="center">

**Built with ❤️ for labs that lunch together**

[⬆ Back to top](#-labsplitwise)

</div>
