# 🔥❄️ ADOFAI.VERSE

**The Ultimate Community Platform for A Dance of Fire and Ice**

> Map database · Record tracking · AI coaching · Deep analytics · Open API

Live demo: coming soon · Built with Next.js 15, Prisma, Pollinations AI

---

## Features

| Feature | Description |
|---|---|
| 🗂 **Map Database** | 4,800+ custom maps. Search by title, artist, difficulty, BPM, tags |
| 📊 **Rankings** | Global leaderboard sorted by XP, maps cleared, or accuracy |
| 🔬 **Map Analyzer** | Upload `.adofai` files → BPM timeline + section difficulty charts |
| 🤖 **AI Coach** | Chat with an ADOFAI coach powered by Pollinations AI (free, no key needed) |
| 🧠 **AI Map Analysis** | Per-map AI breakdown: difficulty explanation, play style, tips, practice advice |
| 🔑 **Auth** | JWT-based registration/login with bcrypt password hashing |
| 🌐 **Open API** | REST endpoints for maps, rankings, and AI — documented at `/api-docs` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 (CSS-first config) |
| Database ORM | Prisma 6 + PostgreSQL |
| Charts | Recharts |
| AI | Pollinations AI (free, no API key) |
| Auth | JWT via `jose` + `bcryptjs` |
| Icons | Lucide React |

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Clone & install

```bash
git clone https://github.com/3289david/adofai-verse.git
cd adofai-verse
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/adofai_verse"
JWT_SECRET="generate-with: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> ⚠️ **Always generate a fresh `JWT_SECRET`** — never use the example value in production.

### 3. Set up database

```bash
# Create the database
createdb adofai_verse

# Push schema
npm run db:push

# Seed with demo maps + users
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## VPS Deployment (Production)

See the full deployment guide in the [VPS section below](#vps-deployment-ubuntu--debian).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── maps/
│   │   ├── page.tsx          # Map browser
│   │   └── [id]/page.tsx     # Map detail + AI analysis + BPM chart
│   ├── rankings/page.tsx     # Global rankings
│   ├── analyze/page.tsx      # .adofai file analyzer
│   ├── ai/page.tsx           # AI Coach chat
│   ├── api-docs/page.tsx     # API documentation
│   ├── login/page.tsx        # Auth
│   ├── register/page.tsx
│   └── api/
│       ├── maps/             # GET list, GET [id], POST
│       ├── rankings/         # GET global rankings
│       ├── ai/analyze/       # POST → Pollinations AI map analysis
│       ├── ai/coach/         # POST → Pollinations AI coach chat
│       └── auth/             # POST login, POST register
├── components/
│   ├── Navbar.tsx
│   ├── MapCard.tsx
│   └── DifficultyBadge.tsx
└── lib/
    ├── db.ts                 # Prisma singleton
    ├── auth.ts               # JWT sign/verify/cookies
    ├── pollinations.ts       # Pollinations AI client
    ├── utils.ts              # Formatting helpers
    ├── types.ts              # Shared TypeScript types
    └── mock-data.ts          # Fallback data (used before DB is ready)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/maps` | List maps (search, diff, BPM, tags, sort, page) |
| `GET` | `/api/maps/:id` | Single map with records |
| `POST` | `/api/maps` | Create map (auth required) |
| `GET` | `/api/rankings` | Global XP rankings |
| `POST` | `/api/ai/analyze` | AI map analysis |
| `POST` | `/api/ai/coach` | AI coach chat |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |

Full docs: `/api-docs`

---

## VPS Deployment (Ubuntu / Debian)

### 1. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # should be v20+
```

### 2. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create DB and user
sudo -u postgres psql -c "CREATE USER adofai WITH PASSWORD 'STRONG_PASSWORD_HERE';"
sudo -u postgres psql -c "CREATE DATABASE adofai_verse OWNER adofai;"
```

### 3. Clone and configure

```bash
cd /var/www
git clone https://github.com/3289david/adofai-verse.git
cd adofai-verse
npm install

cat > .env.local << 'EOF'
DATABASE_URL="postgresql://adofai:STRONG_PASSWORD_HERE@localhost:5432/adofai_verse"
JWT_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
EOF
```

### 4. Build and seed

```bash
npm run db:push
npm run db:seed
npm run build
```

### 5. Run with PM2

```bash
sudo npm install -g pm2

pm2 start npm --name "adofai-verse" -- start
pm2 save
pm2 startup  # run the command it outputs

# Check status
pm2 status
pm2 logs adofai-verse
```

### 6. Nginx reverse proxy

```bash
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/adofai-verse << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/adofai-verse /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Update / redeploy

```bash
cd /var/www/adofai-verse
git pull
npm install
npm run build
pm2 restart adofai-verse
```

---

## Difficulty Scale

| Range | Tier | Color |
|---|---|---|
| 1–4 | Beginner | 🟢 Green |
| 5–8 | Easy | 🔵 Blue |
| 9–12 | Medium | 🟡 Yellow |
| 13–16 | Hard | 🟠 Orange |
| 17–20 | Extreme | 🔴 Red |
| 21+ | Ultra | 🟣 Purple |

---

## License

MIT — community project, not affiliated with 7th Beat Games.

AI features powered by [Pollinations AI](https://pollinations.ai) (free, open).
