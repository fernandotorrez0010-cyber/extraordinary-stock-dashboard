# TradePro — Broker Dashboard

A full-stack managed investment platform built with **React**, **TailwindCSS**, **Firebase**, **Cloudinary**, and **Finnhub**.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd broker-dashboard
npm install
```

### 2. Configure Firebase (Auth + Firestore only)
1. Go to [Firebase Console](https://console.firebase.google.com/) → New project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Production mode
4. Project Settings → Web App → copy config values
> ⚠️ **Firebase Storage is NOT used** — Cloudinary handles all file uploads.

### 3. Configure Cloudinary (Free file uploads)
1. Sign up at [cloudinary.com](https://cloudinary.com/) — free tier gives 25GB
2. Note your **Cloud Name** from the dashboard top-left
3. Go to **Settings → Upload → Add Upload Preset**
4. Set signing mode to **Unsigned**, save, note the preset name

### 4. Configure Finnhub (Live market data)
1. Sign up at [finnhub.io/register](https://finnhub.io/register) — free tier
2. Copy your **API Key** from the dashboard

### 5. Set environment variables
```bash
cp .env.example .env
# Then fill in all values in .env
```

### 6. Deploy Firestore security rules
In Firebase Console → Firestore → Rules, paste `firestore.rules`.

### 7. Create your admin account
1. Register a normal account via `/register`
2. In Firebase Console → Firestore → `users` collection
3. Find your document → set `role` field to `"admin"`
4. You now have full access to `/admin`

### 8. Run
```bash
npm start
```

---

## 📁 Feature-Based Structure

```
src/
├── features/
│   ├── auth/              LoginPage, RegisterPage, ForgotPasswordPage
│   ├── dashboard/         DashboardHome (stats, chart, recent activity)
│   ├── investments/       Plans browser + active/completed investments
│   ├── trades/            Trade history + live price sidebar
│   ├── markets/           Live rates page (crypto, stocks, forex, indices)
│   ├── wallet/            WalletPage, DepositPage, WithdrawPage, TransactionsPage
│   ├── kyc/               Document upload + status tracking
│   ├── tickets/           Create & view support tickets
│   ├── notifications/     Notification center
│   ├── referral/          Referral code + earnings
│   ├── profile/           Profile editor
│   └── admin/             All 11 admin pages
├── components/
│   ├── ui/                Modal, Table, Badge, StatCard, EmptyState, etc.
│   ├── layout/            Sidebar, Topbar, MarketTicker
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── layouts/
│   ├── DashboardLayout.jsx   (includes MarketTicker + Topbar)
│   └── AdminLayout.jsx
├── context/
│   ├── AuthContext.jsx        Firebase Auth + live profile subscription
│   └── MarketContext.jsx      Finnhub WebSocket state + price cache
├── firebase/
│   ├── config.js              Firebase init (Auth + Firestore only)
│   ├── authService.js         register, login, logout, resetPassword
│   └── firestoreService.js    All Firestore CRUD operations
└── utils/
    ├── helpers.js             formatCurrency, formatDate, statusColor, nanoid
    ├── cloudinaryService.js   uploadToCloudinary (replaces Firebase Storage)
    └── marketDataService.js   FinnhubWebSocket class + REST quote fetchers
```

---

## 🔌 Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Firebase Auth** | User authentication | Unlimited |
| **Firestore** | Database | 1 GB storage, 50K reads/day |
| **Cloudinary** | File uploads (KYC, deposit proof, trade images) | 25 GB storage, 25 GB bandwidth |
| **Finnhub** | Live market data via WebSocket | 60 req/min, WebSocket access |

---

## 📈 Live Market Data

- **WebSocket** (`wss://ws.finnhub.io`) — real-time price ticks
- **REST fallback** (`/api/v1/quote`) — initial load of all symbols
- **Price flash** — green/red flash animation on every price update
- **Auto-reconnect** — exponential backoff on disconnect

### Symbols tracked
| Category | Symbols |
|----------|---------|
| Crypto | BTC, ETH, SOL, BNB, XRP, ADA |
| Stocks | AAPL, MSFT, TSLA, GOOGL, AMZN, NVDA |
| Forex | EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD |
| Indices | S&P 500, NASDAQ, FTSE 100, DAX, Nikkei, ASX 200 |

---

## 📁 Cloudinary Upload Flow

```
User picks file → uploadToCloudinary(file, folder)
  → POST https://api.cloudinary.com/v1_1/{cloud}/auto/upload
  → Returns secure_url
  → Saved in Firestore document (proofUrl / idUrl / imageUrl)
```

No backend required — unsigned upload preset handles auth.

---

## 🔒 Roles & Permissions

| Feature | User | Admin |
|---------|------|-------|
| View dashboard | ✅ | ✅ |
| View/invest in plans | ✅ | — |
| View trades + live prices | ✅ | ✅ |
| View live markets page | ✅ | ✅ |
| Deposit / Withdraw | ✅ | — |
| KYC upload | ✅ | — |
| Support tickets | ✅ | ✅ |
| Manage users + balances | ❌ | ✅ |
| Create plans | ❌ | ✅ |
| Add trades | ❌ | ✅ |
| Approve deposits/withdrawals | ❌ | ✅ |
| Review KYC | ❌ | ✅ |
| Send notifications | ❌ | ✅ |
| Assign profit to users | ❌ | ✅ |

---

## 🛣️ All Routes

### Public
- `/login` `/register` `/forgot-password`

### User Dashboard (`/dashboard/...`)
- `/` Overview · `/investments` · `/trades` · `/markets`
- `/wallet` · `/deposit` · `/withdraw` · `/transactions`
- `/referral` · `/profile` · `/kyc` · `/tickets` · `/notifications`

### Admin (`/admin/...`)
- `/` Dashboard · `/users` · `/plans` · `/investments` · `/trades`
- `/deposits` · `/withdrawals` · `/transactions` · `/kyc` · `/tickets` · `/notifications`

---

## 🏗️ Production Build

```bash
npm run build
```

Deploy `build/` to Firebase Hosting, Vercel, or Netlify:
```bash
# Vercel (easiest)
npx vercel --prod

# Firebase Hosting
firebase init hosting && firebase deploy
```

Add your `.env` values as environment variables in your deployment platform.
