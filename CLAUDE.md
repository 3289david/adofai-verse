# CLAUDE.md — ADOFAI.VERSE

## Project Overview

ADOFAI.VERSE is a full-stack Next.js 15 community platform for the rhythm game *A Dance of Fire and Ice*. It features a map database, global rankings, a `.adofai` file analyzer with recharts visualizations, an AI coaching chat, and AI-powered per-map analysis using Pollinations AI.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack in dev)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4 with CSS-first `@theme {}` config in `src/app/globals.css`
- **Database:** PostgreSQL via Prisma 6 (`src/lib/db.ts`)
- **AI:** Pollinations AI — no API key required (`src/lib/pollinations.ts`)
- **Auth:** JWT via `jose` + `bcryptjs` + httpOnly cookies (`src/lib/auth.ts`)
- **Charts:** Recharts (used in map detail BPM chart and analyze page)
- **Icons:** Lucide React

---

## Commands

```bash
npm run dev        # Dev server (Turbopack) → localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run db:push    # Push Prisma schema to database (no migration files)
npm run db:seed    # Seed database with demo maps + users (prisma/seed.ts)
npm run db:studio  # Prisma Studio GUI
npm run db:generate  # Regenerate Prisma client after schema changes
```

---

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL        PostgreSQL connection string
JWT_SECRET          Secret for signing JWTs (generate: openssl rand -base64 32)
NEXT_PUBLIC_APP_URL Public URL of the app
```

---

## Key Architectural Decisions

### Server vs Client Components
- Pages with event handlers (`onMouseEnter`, `onClick`, `useState`) use `'use client'`
- API routes in `src/app/api/` are always server-side
- When the DB is unavailable (no `DATABASE_URL` set), API routes fall back to `src/lib/mock-data.ts`

### Mock Data Fallback
`src/lib/mock-data.ts` exports `MOCK_MAPS`, `MOCK_RANKINGS`, and `PLATFORM_STATS`. All API routes have a `try/catch` that returns mock data if the Prisma DB call fails — so the frontend works without a database during development.

### Styling System (Tailwind CSS 4)
All custom colors are defined in `src/app/globals.css` under `@theme {}`. Custom utility classes (e.g. `.gradient-fire`, `.glow-ice`, `.tile-bg`, `.card-glass`) are also defined there as plain CSS. Use these class names freely — they are NOT Tailwind utilities.

Color palette:
- `--color-bg` `#07070f` — main background
- `--color-fire` `#ff2244` / `--color-fire-end` `#ff8800` — fire gradient
- `--color-ice` `#0066ff` / `--color-ice-end` `#00ddff` — ice gradient
- `--color-ultra` `#cc44ff` — ultra difficulty purple
- `--color-muted` `#7777aa` — secondary text

Prefer inline `style={{ color: ..., background: ... }}` for dynamic colors (e.g. difficulty-based). Use Tailwind classes for layout/spacing.

### Difficulty System
`src/lib/utils.ts` exports helpers:
- `getDifficultyColor(n)` — returns hex color string based on 1–21+ scale
- `getDifficultyLabel(n)` — returns "Beginner" / "Easy" / "Medium" / "Hard" / "Extreme" / "Ultra"
- `getDifficultyTier(n)` — returns typed tier string

Always use these functions for difficulty-related styling, never hardcode colors.

### Pollinations AI Integration
`src/lib/pollinations.ts` exports:
- `analyzeMap(map)` → returns `AIAnalysisResult` (JSON from Pollinations)
- `getAICoachResponse(message, context?)` → returns plain text
- `generateMapSuggestions(level, tags, recentMaps)` → returns plain text

The API calls `POST https://text.pollinations.ai/` with a `messages` array. The `jsonMode: true` flag is used when structured JSON output is expected. Always wrap in `try/catch` with a sensible fallback.

### Auth Flow
1. `POST /api/auth/register` or `/api/auth/login` → sets `auth_token` httpOnly cookie
2. Server-side auth check: `import { getCurrentUser } from "@/lib/auth"` → returns `AuthUser | null`
3. JWT payload: `{ id, username, email, role }`

### Database Schema
Main models in `prisma/schema.prisma`:
- `User` — id, username, email, passwordHash, avatar, country, role
- `Map` — title, artist, creatorId, difficulty (Float), bpmMin, bpmMax, duration, tileCount, tags (String[]), bpmData (Json), status
- `Record` — userId, mapId, accuracy, attempts, cleared, score, xp
- `MapLike` — userId, mapId

Use `npm run db:push` (not `prisma migrate dev`) since this project targets a bare VPS with no migration history.

---

## Adding New Features

### New page
Create `src/app/<route>/page.tsx`. If it needs state/events, add `'use client'` at the top. Add a nav link in `src/components/Navbar.tsx`.

### New API route
Create `src/app/api/<route>/route.ts`. Pattern:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const data = await db.something.findMany(...);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fallback" }, { status: 500 });
  }
}
```

### New Prisma model
1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate` then `npm run db:push`
3. Import `db` from `@/lib/db`

---

## Do Not Do

- Do not add `tailwind.config.ts` — this project uses Tailwind 4 CSS-first config only
- Do not use `prisma migrate dev` — use `db:push` for this VPS setup
- Do not store secrets in `src/` files — use `.env.local`
- Do not add `export const dynamic = 'force-static'` to routes that use Prisma or cookies
