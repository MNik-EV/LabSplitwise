<div align="center">

# 🍽️ LabSplitwise

**Splitwise for research labs — track daily lunch orders, lab subsidies & weekly settlements in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) · [Deploy](#-choose-your-deployment) · [Live Demo](https://lab-splitwise.vercel.app) · [فارسی](#-persian)

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
- 🌐 **Bilingual** — Persian (RTL) · English (LTR) — amounts in **thousand Toman**
- 🌓 **Light & Dark mode**
- 🎨 Modern SaaS design — Linear / Notion inspired
- ✨ Framer Motion animations, toasts, skeletons, empty states
- 📱 Fully responsive

### Tech
- Next.js 15 App Router · React 19 · Server Actions
- Prisma ORM · PostgreSQL
- Docker Compose · optional [Authentik](https://goauthentik.io/) OIDC
- Zustand · React Hook Form · Zod · shadcn/ui · Recharts

---

## 🚢 Choose your deployment

Pick **one** path — all work from the same repo. **Login is optional:** if OIDC env vars are empty, the app runs open (no sign-in).

| Path | Best for | Auth | Database |
|------|----------|------|----------|
| **[Vercel + Neon](#-vercel--neon)** | Public demo, quick cloud deploy | Off by default | Neon (free) |
| **[Docker](#-docker-self-hosted)** | Private server, LAN, homelab | Off by default | Bundled Postgres |
| **[Docker + Authentik](#-docker--authentik-sso-optional)** | Team SSO on your infra | Authentik OIDC | Bundled Postgres |
| **[Local dev](#-quick-start)** | Development | Off by default | Your Postgres / Neon |

**Auth rule:** SSO turns on **only** when all of these are set: `AUTH_SECRET`, `AUTH_AUTHENTIK_ISSUER`, `AUTH_AUTHENTIK_ID`, `AUTH_AUTHENTIK_SECRET`.  
Set `AUTH_DISABLED=true` to force open access even if OIDC is configured.

---

## ⚡ Quick Start (local dev)

### Prerequisites
- Node.js 20+
- PostgreSQL ([Neon](https://neon.tech) free tier works)

```bash
git clone https://github.com/MNik-EV/LabSplitwise.git
cd LabSplitwise
cp .env.example .env        # set DATABASE_URL
npm install
npm run db:setup            # schema + sample data
npm run dev
```

Open **http://localhost:3000** — no login required.

### Configuration

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_DEFAULT_LOCALE=fa          # fa | en
NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON=350
```

Or change at runtime in **Settings → General**.

| Locale | Direction | Currency display |
|--------|-----------|------------------|
| `fa`   | RTL       | `۱,۰۰۰ هزار تومان` |
| `en`   | LTR       | `1,000 k Toman` |

---

## 🧮 How calculations work

All amounts are in **thousand Toman** (`1000` = one million Toman).

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

## 🐳 Docker (self-hosted)

PostgreSQL runs on an **internal Docker network only** (no host port). Only the app is published.

```bash
git clone https://github.com/MNik-EV/LabSplitwise.git
cd LabSplitwise
cp .env.docker.example .env
# Edit .env — at minimum set POSTGRES_PASSWORD
docker compose up -d --build
```

Open **http://localhost:3000** — works without SSO out of the box.

On first start the container applies the database schema automatically.

```
┌────────────┐     labsplitwise network     ┌────────────┐
│    app     │ ────────────────────────────►│  postgres  │
│  :3000     │         (internal only)      │  no port   │
└────────────┘                              └────────────┘
```

Put **Caddy**, **Traefik**, or **nginx** in front for HTTPS on a public domain.

---

## 🔐 Docker + Authentik SSO (optional)

For private deployments with [Authentik](https://goauthentik.io/), add to `.env`:

```env
AUTH_URL=https://labsplitwise.example.com
AUTH_SECRET=<openssl rand -base64 32>
AUTH_AUTHENTIK_ID=your-client-id
AUTH_AUTHENTIK_SECRET=your-client-secret
AUTH_AUTHENTIK_ISSUER=https://auth.example.com/application/o/labsplitwise/
```

In Authentik admin:

1. **Providers → OAuth2/OIDC** — Redirect URI: `{AUTH_URL}/api/auth/callback/authentik`
2. **Applications** — link the provider, copy Client ID / Secret / Issuer (trailing `/` required)

Restart: `docker compose up -d --build`

If Authentik runs in Docker, attach both stacks to the same network so they can reach each other.

---

## 🌍 Vercel + Neon

> SQLite **does not work** on Vercel. Use **Neon PostgreSQL** (free).

### 1 — Database on [Neon](https://neon.tech)

Create a project → copy the **connection string**.

### 2 — Deploy on [Vercel](https://vercel.com)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MNik-EV/LabSplitwise&env=DATABASE_URL,NEXT_PUBLIC_DEFAULT_LOCALE,NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | From Neon |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | — | `fa` (default) |
| `NEXT_PUBLIC_DEFAULT_LAB_PER_PERSON` | — | `350` (default) |
| `AUTH_*` | — | **Leave empty** for open access |

No auth env vars needed — the live demo works without login.

### 3 — Optional: Authentik on Vercel

Add all `AUTH_*` vars from the Docker SSO section. Redirect URI:  
`https://your-app.vercel.app/api/auth/callback/authentik`

### Redeploy

Build runs `prisma db push` (no seed on production). Local demo data: `npm run db:setup`.

Live demo: **https://lab-splitwise.vercel.app**

---

## 📜 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build (Vercel / with DB)
npm run build:docker # Next.js build only (Docker image)
npm run start        # Start production server
npm run db:setup     # Push schema + seed
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test         # Vitest unit tests
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

**LabSplitwise** یک سیستم مدیریت ناهار و تسویه حساب گروهی برای آزمایشگاه‌هاست.

| روش | توضیح |
|-----|--------|
| **Vercel** | فقط `DATABASE_URL` — بدون login |
| **Docker** | `docker compose up` — Postgres داخلی، بدون SSO |
| **Docker + Authentik** | envهای `AUTH_*` را پر کن — SSO فعال می‌شود |

زبان را از سایدبار (`EN` / `فا`) یا تنظیمات تغییر دهید.

---

<div align="center">

**Built with ❤️ for labs that lunch together**

[⬆ Back to top](#-labsplitwise)

</div>
