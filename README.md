# BLACK BULLS - GTA 5 Roleplay Gang Fan Hub

A production-ready full-stack fan website for the **BLACK BULLS** GTA 5 Roleplay syndicate led by streamers **MOTA BHAI (Krish Malik)** and **Thunderbolt Gaming (Ansh Mehta / Kancha Bhau)**.

---

## 1. Features

- **GTA 5 RP Aesthetic**: Dark Los Santos night-city atmosphere with drifting canvas embers, blood red neon accents, Bebas Neue condensed display typography, and responsive modern layout.
- **Section Sequence**:
  1. **Hero**: Animated Los Santos backdrop, tagline, active stream indicators, and Watch Live / Shop CTAs.
  2. **Our Story**: Gang genesis, Cypress Flats stand, Code of the Horns, Vinewood ascendancy (editable by Admin).
  3. **Streamers**: Detailed cards for Mota Bhai and Thunderbolt Gaming with characters, bios, platform links, and live badges.
  4. **Live Streams**: Real-time YouTube and Kick broadcast embeds, streamer selector tabs, viewer count badges, and offline video replay fallbacks.
  5. **Highlights & Clips**: YouTube & Kick clips/highlights archive with filtering and modal playback.
  6. **Merchandise Store**: Hoodies, caps, tees, mugs, product detail modal, sizes/quantities, slide-over cart, and authenticated checkout flow.
  7. **Fan Wall**: Community shoutouts with streamer recipient filter, favoritism indicators, and verified submission form.
  8. **Footer**: Socials and exact Take-Two / Rockstar Games legal disclaimer.

---

## 2. Authentication & Roles

- **Fan Account**:
  - Sign up & login (JWT + cookie/header auth)
  - Order official merch with saved delivery addresses
  - View personal order history and shipment tracking
  - Post comments to the Fan Wall for any streamer
- **Streamer Account**:
  - Streamer Command Dashboard
  - View all comments addressed to them
  - Search & filter fan messages
  - Star / "Favorite" fan comments (shows badge on the public fan wall)
  - Edit own bio, socials (YouTube, Kick, Instagram), and photo
- **Admin Account**:
  - Control Center with real-time stats (revenue, orders, comments, users)
  - Manage all orders (Pending, Confirmed, Shipped, Delivered, Cancelled)
  - Full merchandise CRUD (create, update price/sizes/stock, delete)
  - Streamer CRUD: Add new streamers dynamically (propagates automatically to Streamers, Live and Clips sections)
  - Moderate fan wall comments (approve, reject, delete)
  - Edit gang story & chapters live
  - Live broadcast simulation switcher (test YouTube & Kick live states)

### Pre-Seeded Demo Accounts (1-Click Login available in UI):
- **Admin**: `admin@blackbulls.rp` / `adminpassword123`
- **Streamer (Mota Bhai)**: `motabhai@blackbulls.rp` / `motapassword123`
- **Streamer (Thunderbolt)**: `kancha@blackbulls.rp` / `kanchapassword123`
- **Fan**: `fan@blackbulls.rp` / `fanpassword123`

---

## 3. Project Structure

```
├── server/
│   ├── types.ts              # Data types (User, Streamer, Product, Order, Comment, Story)
│   ├── seedData.ts           # Initial streamers, merchandise, story, and demo accounts
│   ├── db.ts                 # Database persistence engine & query helpers
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication & role-based route guard
│   ├── routes/
│   │   ├── auth.ts           # /api/auth (register, login, logout, me, demo-login)
│   │   ├── streamers.ts      # /api/streamers CRUD
│   │   ├── live.ts           # /api/live (cached live broadcast status & simulation toggle)
│   │   ├── videos.ts         # /api/videos (YouTube & Kick video archives)
│   │   ├── products.ts       # /api/products (Merch CRUD)
│   │   ├── orders.ts         # /api/orders (fan orders & admin status management)
│   │   ├── comments.ts       # /api/comments (fan wall & streamer moderation)
│   │   ├── story.ts          # /api/story (gang lore)
│   │   └── admin.ts          # /api/admin/stats
│   └── services/
│       ├── youtube.ts        # YouTube Data API v3 with 60s cache
│       └── kick.ts           # Kick public API with 60s cache
├── src/
│   ├── assets/               # Generated high-resolution visuals
│   ├── components/
│   │   ├── EmberCanvas.tsx   # Canvas ambient sparks backdrop
│   │   ├── Navbar.tsx        # 3-zone top bar contract
│   │   ├── HeroSection.tsx   # Cinematic hero
│   │   ├── StorySection.tsx  # Gang origins
│   │   ├── StreamersSection.tsx # Streamer profiles
│   │   ├── LiveSection.tsx   # YouTube & Kick broadcast player
│   │   ├── ClipsSection.tsx  # Video archive & player modal
│   │   ├── MerchSection.tsx  # Product catalog & quick view
│   │   ├── CartDrawer.tsx    # Slide-over cart & checkout form
│   │   ├── FanWallSection.tsx # Fan shoutouts
│   │   ├── Footer.tsx        # Verbatim disclaimer & links
│   │   ├── AuthModal.tsx     # Sign in & 1-click demo switcher
│   │   ├── StreamerDashboardModal.tsx # Streamer control
│   │   ├── AdminDashboardModal.tsx    # Admin control center
│   │   └── UserOrdersModal.tsx        # Order history
│   ├── context/
│   │   ├── AuthContext.tsx   # Auth state & token handling
│   │   └── CartContext.tsx   # Shopping cart state & storage
│   ├── App.tsx               # Main application container
│   ├── main.tsx              # React DOM mounting
│   └── index.css             # Tailwind v4 styles & GTA neon glow
├── server.ts                 # Full-stack entry point (Express + Vite middlewares)
└── package.json
```

---

## 4. Environment Variables (`.env`)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET="black_bulls_gang_secret_jwt_key_los_santos_2026"

# Optional: Add your YouTube Data API v3 Key to auto-query live video status directly from Google
YOUTUBE_API_KEY=""
```

---

## 5. Deployment Guide

### Option A: Full-Stack on Render / Railway
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm run start` (or `tsx server.ts`)
3. Set environment variable `PORT=3000` and `JWT_SECRET`.

### Option B: Separate Frontend (Vercel / Netlify) + Backend (Render / Fly.io)
1. Frontend build: `npm run build` with output directory `dist`.
2. Configure API proxy or `VITE_API_URL` to route `/api/*` to the backend.
