# ADOFAI.VERSE

**The Ultimate Community Platform for A Dance of Fire and Ice**

Map database · Global rankings · AI coaching · .adofai analyzer · Open REST API

---

## What's Inside

| Feature | Details |
|---|---|
| **Map Browser** | Search, filter by difficulty / BPM / tags, sort by popularity or newest. Serves 4,700+ imported maps from adofai.gg + Steam Workshop. |
| **Global Rankings** | XP-based leaderboard. Sort by total XP, maps cleared, or average accuracy. Podium view for top 3. |
| **.adofai Analyzer** | Upload a level file → BPM timeline chart + section difficulty breakdown (Recharts). |
| **AI Coach** | Free chat coach powered by Pollinations AI — no API key required. Optional per-map context. |
| **AI Map Analysis** | One-click per-map breakdown: difficulty explanation, play style, tips, hardest section, recommended for. |
| **Auth** | Register / login via JWT + bcrypt. Role system: PLAYER → CREATOR → MODERATOR → ADMIN. |
| **Data Import** | Admin UI at `/admin/import` pulls live data from adofai.gg (Google Sheets, 4,734 maps) and Steam Workshop (appid 977950). |
| **Open REST API** | All map/ranking data served via documented REST endpoints at `/api-docs`. |

---

## Data Sources

### adofai.gg
Fetches the official ranked map list directly from the Google Sheets spreadsheet backing the adofai.gg website (discovered by reverse-engineering the [`xyz.krmentos:adofai-gg-api`](https://libraries.io/maven/xyz.krmentos:adofai-gg-api/1.0.0) Java library from Maven Central).

- **4,734 maps** with difficulty, BPM, tile count, download links
- 17 Korean gameplay tags automatically mapped to English (`#질주` → `#stream`, `#동시치기` → `#precision`, etc.)
- Maps with negative/zero difficulty (unrated) are skipped

### Steam Workshop
Uses the Steam Web API `IPublishedFileService/QueryFiles` endpoint for ADOFAI (AppID 977950).

- Up to **5,000 workshop items** per import run (100 per page × 50 pages)
- Cover image from Steam preview URL
- Subscriber count stored as play count
- Difficulty extracted from item tags if present (e.g. `Difficulty:20.3`)
- Requires a free [Steam Web API key](https://steamcommunity.com/dev/apikey)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack in dev) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 (`tailwind.config.ts`) |
| Database | PostgreSQL via Prisma 6 |
| Charts | Recharts |
| AI | Pollinations AI (free, no API key needed) |
| Auth | `jose` + `bcryptjs`, httpOnly JWT cookies |
| Icons | Lucide React |

---

## REST API

All endpoints return JSON. Full interactive docs at `/api-docs`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/maps` | List maps — params: `search`, `diffMin`, `diffMax`, `tags[]`, `sort`, `page`, `limit` |
| `GET` | `/api/maps/:id` | Single map + top 10 records |
| `POST` | `/api/maps` | Create map |
| `GET` | `/api/rankings` | Global XP rankings — param: `limit` |
| `GET` | `/api/stats` | Platform counts (maps, players, records) |
| `POST` | `/api/ai/analyze` | AI map analysis via Pollinations |
| `POST` | `/api/ai/coach` | AI coach chat via Pollinations |
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login (sets httpOnly cookie) |
| `POST` | `/api/admin/import/adofaigg` | **Admin** — import from adofai.gg Sheets |
| `POST` | `/api/admin/import/steam` | **Admin** — import from Steam Workshop |

### `/api/maps` parameters

| Param | Default | Description |
|---|---|---|
| `search` | — | Full-text search on title, artist, creator |
| `diffMin` | `0` | Min difficulty (0 = include unrated) |
| `diffMax` | `99` | Max difficulty |
| `tags` | — | Repeatable: `?tags=%23wave&tags=%23stream` |
| `sort` | `popular` | `popular` \| `newest` \| `difficulty_asc` \| `difficulty_desc` \| `bpm` |
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
│   ├── page.tsx                    # Home — server component, queries DB directly
│   ├── maps/page.tsx               # Map browser — client, debounced search
│   ├── maps/[id]/page.tsx          # Map detail — BPM chart, AI analysis, records
│   ├── rankings/page.tsx           # Global rankings
│   ├── analyze/page.tsx            # .adofai file analyzer
│   ├── ai/page.tsx                 # AI Coach chat
│   ├── api-docs/page.tsx           # API documentation
│   ├── admin/import/page.tsx       # Admin import UI (redirects non-admins)
│   ├── login/ register/            # Auth pages
│   └── api/
│       ├── maps/                   # GET list + POST create
│       ├── maps/[id]/              # GET single map
│       ├── rankings/               # GET global rankings
│       ├── stats/                  # GET platform counts
│       ├── ai/analyze/             # POST → Pollinations AI
│       ├── ai/coach/               # POST → Pollinations AI
│       ├── auth/login register/    # Auth
│       └── admin/import/
│           ├── adofaigg/           # POST — adofai.gg Google Sheets import
│           └── steam/              # POST — Steam Workshop import
├── components/
│   ├── Navbar.tsx
│   ├── MapCard.tsx
│   └── DifficultyBadge.tsx         # Shows "?" for unrated (difficulty=0) maps
└── lib/
    ├── db.ts                       # Prisma singleton
    ├── auth.ts                     # JWT sign/verify/cookies
    ├── pollinations.ts             # Pollinations AI client
    ├── utils.ts                    # getDifficultyColor/Label/Tier, formatters
    └── types.ts                    # Shared TypeScript types
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

### Restart / Redeploy (existing VPS)

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

### First-time setup on a SECOND / NEW VPS

Copy-paste this single block (edit the 4 ALL-CAPS values first):

```bash
DOMAIN="yourdomain.com"
DB_PASS="CHANGE_THIS_STRONG_PASSWORD"
STEAM_KEY=""   # optional, leave blank if you don't have one yet

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

After deployment, go to `https://yourdomain.com/admin/import` and run the adofai.gg import to populate the database. Log in first with an ADMIN account.

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
4. Click **Import Now** next to adofai.gg — imports ~4,700 ranked maps in one request
5. (Optional) Enter your Steam API key and click **Import Now** next to Steam Workshop

Imported maps appear immediately in the map browser and REST API.

---

## License

MIT — community project, not affiliated with 7th Beat Games.  
AI features powered by [Pollinations AI](https://pollinations.ai) (free, open).
