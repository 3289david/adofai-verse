# ADOFAI.NET

**The Ultimate Community Platform for A Dance of Fire and Ice**

Map database · Global rankings · AI coaching · .adofai analyzer · Bookmarks · Comments · Open REST API

[Live Site](https://adofai.net) · [API Docs](https://adofai.net/api-docs) · [Report Issue](https://github.com/3289david/adofai-verse/issues)

---

## Features

| Feature | Details |
|---|---|
| **Map Browser** | Search, filter by difficulty / BPM / tags, sort by popular, trending, random, newest, or difficulty. Skeleton loading, hover animations, 4,700+ maps. |
| **Map of the Day** | Featured map on the home page, changes daily with a fire-gradient spotlight card. |
| **Map Detail** | BPM timeline chart, AI analysis, records leaderboard, comments, share buttons, similar maps. |
| **Bookmarks** | Save maps for later. Bookmark icon on every card, dedicated `/bookmarks` page. |
| **Comments** | Comment on any map. Threaded per-map discussions with user avatars. |
| **Social Sharing** | Share maps to Twitter/X, Discord (formatted markdown), or copy link — all from the map detail page. |
| **Similar Maps** | "Similar Maps" row on each map page, matched by difficulty range and overlapping tags. |
| **Global Rankings** | XP-based leaderboard with podium view for top 3. Sort by XP, maps cleared, or accuracy. |
| **Profile Stats** | Recharts accuracy distribution, difficulty donut chart, recent activity timeline, 6 summary stat cards. |
| **.adofai Analyzer** | Upload a level file → BPM timeline chart + section difficulty breakdown. |
| **AI Coach** | Free chat coach powered by Pollinations AI — no API key required. Optional per-map context. |
| **AI Map Analysis** | One-click per-map breakdown: difficulty explanation, play style, tips, hardest section. |
| **Auth** | Register / login via JWT + bcrypt. Role system: PLAYER → CREATOR → MODERATOR → ADMIN. |
| **Map Editing** | Creators and admins can fix map metadata (title, artist, difficulty, BPM, tags) inline. |
| **Data Import** | Admin UI pulls live data from adofai.gg (4,734 maps) and Steam Workshop (5,000+ items). |
| **Open REST API** | All map/ranking/bookmark/comment data via documented REST endpoints at `/api-docs`. |
| **Toast Notifications** | Context-based toast system for action feedback (success/error/info). |
| **Scroll to Top** | Floating button appears when scrolled down. |
| **Skeleton Loading** | Pulsing skeleton cards while maps load instead of a plain spinner. |
| **Card Animations** | Map cards lift with a subtle red glow on hover. |

---

## Data Sources

### adofai.gg
Fetches the official ranked map list directly from the Google Sheets spreadsheet backing the adofai.gg website.

- **4,734 maps** with difficulty, BPM, tile count, download links
- 17 Korean gameplay tags automatically mapped to English (`#질주` → `#stream`, `#동시치기` → `#precision`, etc.)
- Maps with negative/zero difficulty (unrated) are skipped

### Steam Workshop
Uses the Steam Web API `IPublishedFileService/QueryFiles` endpoint for ADOFAI (AppID 977950).

- Up to **5,000 workshop items** per import run (100 per page × 50 pages)
- Artist extracted from "Artist - Song" title pattern
- BPM, difficulty, tile count parsed from description via regex
- Subscriber count stored as play count
- Requires a free [Steam Web API key](https://steamcommunity.com/dev/apikey)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack in dev) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 (CSS-first `@theme` config) |
| Database | PostgreSQL via Prisma 6 |
| Charts | Recharts |
| AI | Pollinations AI (free, no API key needed) |
| Auth | `jose` + `bcryptjs`, httpOnly JWT cookies |
| Icons | Lucide React |

---

## REST API

All endpoints return JSON. Full interactive docs at [`/api-docs`](https://adofai.net/api-docs).

### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/maps` | List maps — search, filter, sort, paginate |
| `GET` | `/api/maps/:id` | Single map + top 10 records |
| `GET` | `/api/maps/:id/similar` | Up to 6 similar maps by difficulty and tags |
| `GET` | `/api/maps/:id/comments` | Latest 50 comments on a map |
| `GET` | `/api/rankings` | Global XP rankings |
| `GET` | `/api/stats` | Platform counts (maps, players, records) |

### AI Endpoints (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/analyze` | AI map analysis via Pollinations |
| `POST` | `/api/ai/coach` | AI coach chat via Pollinations |

### Authenticated Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Login (sets httpOnly cookie) |
| `POST` | `/api/auth/logout` | Logout (clears cookie) |
| `GET` | `/api/auth/me` | Current authenticated user |
| `GET/POST` | `/api/bookmarks` | List or toggle bookmarks |
| `POST` | `/api/maps/:id/comments` | Post a comment (1–500 chars) |
| `GET/POST` | `/api/maps/:id/like` | Check or toggle like |
| `PATCH` | `/api/maps/:id` | Edit map metadata (creator/admin) |
| `POST` | `/api/records` | Submit a record with video URL |

### Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/import/adofaigg` | Import from adofai.gg Sheets |
| `POST` | `/api/admin/import/steam` | Import from Steam Workshop |

### `/api/maps` Query Parameters

| Param | Default | Description |
|---|---|---|
| `search` | — | Full-text search on title, artist, creator |
| `diffMin` | `0` | Min difficulty (0 = include unrated) |
| `diffMax` | `99` | Max difficulty |
| `tags` | — | Repeatable: `?tags=%23wave&tags=%23stream` |
| `sort` | `random` | `random` \| `popular` \| `trending` \| `newest` \| `difficulty_asc` \| `difficulty_desc` \| `bpm` |
| `page` | `1` | Page number |
| `limit` | `24` | Per page, max 100 |

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Required
DATABASE_URL="postgresql://USER:PASS@localhost:5432/adofai_verse"
JWT_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional — for Steam Workshop import
STEAM_API_KEY="your_key_from_steamcommunity.com/dev/apikey"
```

---

## Local Development

```bash
git clone https://github.com/3289david/adofai-verse.git
cd adofai-verse
npm install

# Set up .env.local (see above)
createdb adofai_verse

npx prisma generate
npm run db:push

npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home — Map of the Day, popular maps, activity feed
│   ├── maps/page.tsx               # Map browser — search, filter, skeleton loading
│   ├── maps/[id]/page.tsx          # Map detail — chart, records, comments, sharing, similar
│   ├── rankings/page.tsx           # Global rankings
│   ├── analyze/page.tsx            # .adofai file analyzer
│   ├── ai/page.tsx                 # AI Coach chat
│   ├── bookmarks/page.tsx          # Saved maps
│   ├── about/page.tsx              # About page
│   ├── api-docs/page.tsx           # API documentation
│   ├── terms/ privacy/             # Legal pages
│   ├── admin/import/page.tsx       # Admin import UI
│   ├── login/ register/            # Auth pages
│   └── api/
│       ├── maps/                   # GET list, POST create
│       ├── maps/[id]/              # GET detail, PATCH edit
│       ├── maps/[id]/similar/      # GET similar maps
│       ├── maps/[id]/comments/     # GET/POST comments
│       ├── maps/[id]/like/         # GET/POST like toggle
│       ├── bookmarks/              # GET/POST bookmark toggle
│       ├── rankings/               # GET global rankings
│       ├── records/                # POST submit record
│       ├── stats/                  # GET platform counts
│       ├── ai/analyze/             # POST → Pollinations AI
│       ├── ai/coach/               # POST → Pollinations AI
│       ├── auth/                   # login, register, logout, me
│       ├── profile/                # GET/PUT user profile
│       └── admin/import/           # adofaigg, steam
├── components/
│   ├── Navbar.tsx                  # Nav with auth state
│   ├── MapCard.tsx                 # Map card with bookmark toggle
│   ├── DifficultyBadge.tsx         # Difficulty tier badge
│   ├── Toast.tsx                   # Toast notification system
│   └── ScrollToTop.tsx             # Floating scroll button
└── lib/
    ├── db.ts                       # Prisma singleton
    ├── auth.ts                     # JWT sign/verify/cookies
    ├── pollinations.ts             # Pollinations AI client
    ├── utils.ts                    # getDifficultyColor/Label/Tier, formatters
    ├── types.ts                    # Shared TypeScript types
    └── mock-data.ts                # Fallback data when DB is unavailable
```

---

## Difficulty Scale

| Value | Tier | Color |
|---|---|---|
| 0 | Unrated / Unknown | Gray |
| 1–4 | Beginner | Green |
| 5–8 | Easy | Cyan |
| 9–12 | Medium | Yellow |
| 13–16 | Hard | Orange |
| 17–20 | Extreme | Red |
| 21+ | Ultra | Purple |

---

## VPS Deployment

### Fresh install (Ubuntu 22.04 / Debian 12)

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# 2. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER adofai WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE adofai_verse OWNER adofai;"

# 3. Clone and configure
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/3289david/adofai-verse.git
sudo chown -R $USER:$USER /var/www/adofai-verse
cd /var/www/adofai-verse
npm install

# 4. Create .env.local
cat > .env.local << EOF
DATABASE_URL="postgresql://adofai:CHANGE_THIS_PASSWORD@localhost:5432/adofai_verse"
JWT_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
STEAM_API_KEY=""
EOF

# 5. Set up database and build
npx prisma generate
npm run db:push
npm run build

# 6. Run with PM2
sudo npm install -g pm2
pm2 start npm --name "adofai-verse" -- start
pm2 save
pm2 startup    # ← run the command it prints

# 7. Nginx reverse proxy
sudo tee /etc/nginx/sites-available/adofai-verse > /dev/null << 'NGINX'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/adofai-verse /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. SSL (replace yourdomain.com)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Redeploy (existing VPS)

```bash
cd /var/www/adofai-verse
git pull
npm install
npx prisma generate
npm run db:push
npm run build
pm2 restart adofai-verse
```

---

### One-liner setup for a new VPS

Copy-paste this single block (edit the 3 ALL-CAPS values first):

```bash
DOMAIN="yourdomain.com"
DB_PASS="CHANGE_THIS_STRONG_PASSWORD"
STEAM_KEY=""   # optional

# --- do not edit below this line ---
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx postgresql postgresql-contrib && \
sudo systemctl enable --now postgresql && \
sudo -u postgres psql -c "CREATE USER adofai WITH PASSWORD '$DB_PASS';" && \
sudo -u postgres psql -c "CREATE DATABASE adofai_verse OWNER adofai;" && \
sudo mkdir -p /var/www && cd /var/www && \
sudo git clone https://github.com/3289david/adofai-verse.git && \
sudo chown -R $USER:$USER /var/www/adofai-verse && \
cd /var/www/adofai-verse && npm install && \
JWT=$(openssl rand -base64 32) && \
printf "DATABASE_URL=\"postgresql://adofai:$DB_PASS@localhost:5432/adofai_verse\"\nJWT_SECRET=\"$JWT\"\nNEXT_PUBLIC_APP_URL=\"https://$DOMAIN\"\nSTEAM_API_KEY=\"$STEAM_KEY\"\n" > .env.local && \
npx prisma generate && npm run db:push && npm run build && \
sudo npm install -g pm2 && \
pm2 start npm --name "adofai-verse" -- start && pm2 save && \
sudo tee /etc/nginx/sites-available/adofai-verse > /dev/null << NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/adofai-verse /etc/nginx/sites-enabled/ && \
sudo nginx -t && sudo systemctl reload nginx && \
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN && \
pm2 startup | tail -1 | sudo bash
echo "Done! Visit https://$DOMAIN"
```

---

### PM2 quick reference

```bash
pm2 status                  # check running processes
pm2 logs adofai-verse       # live logs
pm2 restart adofai-verse    # restart after changes
pm2 stop adofai-verse       # stop
pm2 delete adofai-verse     # remove from PM2
```

---

## Running the Import

1. Make sure you have an ADMIN user (set via `npm run db:studio` or direct SQL: `UPDATE "User" SET role='ADMIN' WHERE username='yourname';`)
2. Log in at `/login`
3. Go to `/admin/import`
4. Click **Import Now** next to adofai.gg — imports ~4,700 ranked maps
5. (Optional) Enter your Steam API key and click **Import Now** next to Steam Workshop

---

## Contact

- **General:** [contact@adofai.net](mailto:contact@adofai.net)
- **Support:** [help@adofai.net](mailto:help@adofai.net)
- **Legal:** [legal@adofai.net](mailto:legal@adofai.net)
- **Developer API:** [dev@adofai.net](mailto:dev@adofai.net)
- **GitHub:** [github.com/3289david/adofai-verse](https://github.com/3289david/adofai-verse)

---

## License

MIT — community project, not affiliated with 7th Beat Games.
AI features powered by [Pollinations AI](https://pollinations.ai) (free, open).
