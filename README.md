<div align="center">

# 🍽️ LabSplitwise

**Splitwise for research labs — track daily lunch orders, lab subsidies & weekly settlements in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) · [Demo](#-quick-start) · [Deploy](#-deployment) · [فارسی](#-persian)

<br />

<img src="https://raw.githubusercontent.com/user-attachments/assets/placeholder-dashboard.png" alt="LabSplitwise dashboard" width="720" />

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
- Prisma ORM · SQLite (swap to Postgres in production)
- Zustand · React Hook Form · Zod · shadcn/ui · Recharts

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm

### Install

```bash
git clone https://github.com/YOUR_USERNAME/LabSplitwise.git
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

## 🌍 Deployment

> **Important:** This app uses **Server Actions + SQLite**. GitHub Pages only hosts **static files** and cannot run the backend.

### ✅ Recommended: Vercel (free, 2 minutes)

1. Push this repo to GitHub (see below)
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Add env var: `DATABASE_URL=file:./dev.db` (or use Vercel Postgres + update schema)
4. Deploy → live URL: `https://lab-splitwise.vercel.app`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/LabSplitwise)

### GitHub Pages (`username.github.io`)

GitHub Pages **does not support** Next.js server features. Options:

| Option | Works? | Notes |
|--------|--------|-------|
| GitHub Pages only | ❌ | No Server Actions / DB |
| **Vercel + GitHub repo** | ✅ | Best experience |
| Vercel + custom domain | ✅ | Point `CNAME` to Vercel |
| Docker / VPS | ✅ | `npm run build && npm start` |

**If you want a `github.io` URL:** use Vercel for hosting, then add a custom domain in Vercel settings, *or* use your repo's GitHub Pages for the README/landing only.

### Production database

Replace SQLite with PostgreSQL:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

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

- [ ] PostgreSQL migration guide
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
