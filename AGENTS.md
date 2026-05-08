# AGENTS.md — ADOFAI.VERSE

Instructions for AI agents (Claude, Codex, Gemini, etc.) working on this codebase.

---

## Quick Orient

```
ADOFAI.VERSE — Next.js 15 rhythm game community platform
├── App Router (src/app/)          — pages, layouts, API routes
├── Tailwind CSS 4                 — CSS-first, theme in globals.css
├── Prisma 6 + PostgreSQL          — ORM, schema in prisma/schema.prisma
├── Pollinations AI                — free AI, no key, see src/lib/pollinations.ts
└── Mock data fallback             — src/lib/mock-data.ts (no DB needed to run UI)
```

**Run before making changes:** `npm run dev` to verify the current state compiles.
**After changes:** `npx tsc --noEmit` to check TypeScript, then `npm run build` to verify.

---

## File Map

| File | Purpose |
|---|---|
| `src/app/globals.css` | Tailwind 4 `@theme {}` + custom CSS classes (`.gradient-fire`, `.tile-bg`, etc.) |
| `src/lib/types.ts` | All shared TypeScript interfaces — add new types here |
| `src/lib/utils.ts` | `cn()`, difficulty helpers, formatters — pure functions, no side effects |
| `src/lib/db.ts` | Prisma singleton — import `db` from here, never create new `PrismaClient()` |
| `src/lib/auth.ts` | `signToken`, `verifyToken`, `getCurrentUser`, cookie helpers |
| `src/lib/pollinations.ts` | Pollinations AI calls — `analyzeMap`, `getAICoachResponse`, `generateMapSuggestions` |
| `src/lib/mock-data.ts` | Static demo data used as DB fallback |
| `src/components/DifficultyBadge.tsx` | Difficulty number badge with dynamic color — always use this, never hardcode |
| `src/components/MapCard.tsx` | Map card grid item — client component |
| `src/components/Navbar.tsx` | Top nav with mobile hamburger — client component |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Demo data seed script |

---

## Style Rules

### Colors
Never hardcode difficulty colors. Use `getDifficultyColor(n)` from `src/lib/utils.ts`.

For the design system, these colors are defined in `globals.css @theme {}` and available as Tailwind utilities:
```
bg-bg, bg-bg-secondary, bg-card
text-fire, text-ice, text-muted
border-border, border-border-bright
text-easy, text-medium, text-hard, text-extreme, text-ultra
```

For dynamic/computed colors, use inline `style={{ color: ... }}`.

### Layout Patterns
- Page wrapper: `<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">`
- Section title: `<h2 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>`
- Muted text: `style={{ color: "#7777aa" }}`
- Card base: `background: "rgba(16,16,30,0.8)", border: "1px solid rgba(26,26,53,0.8)"`
- Fire button: `background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white"`
- Ghost button: `border: "1px solid rgba(26,26,53,0.8)", color: "#7777aa"`

### TypeScript
- All pages and components must have proper TypeScript types
- Use types from `src/lib/types.ts` — add new interfaces there, not inline
- Never use `any` — use `unknown` and narrow, or define a proper interface
- `'use client'` is required for any component using `useState`, `useEffect`, `useRef`, event handlers, or browser APIs

---

## Database Rules

- **Use `npm run db:push`, never `prisma migrate dev`** — this project targets a VPS with no migration history
- Always import `db` from `@/lib/db` — never create `new PrismaClient()`
- Every DB call must be wrapped in `try/catch` with a meaningful fallback (see mock-data.ts pattern)
- After schema changes: `npm run db:generate` then `npm run db:push`

---

## AI Integration Rules

Pollinations AI is the ONLY AI provider. Do not add OpenAI, Anthropic, or other paid providers.

```typescript
// Correct pattern
import { analyzeMap, getAICoachResponse } from "@/lib/pollinations";

// For new AI features, add a function to src/lib/pollinations.ts
// and call it from an API route in src/app/api/ai/
```

Always wrap AI calls in `try/catch` — Pollinations can be slow or unavailable. Provide a hardcoded fallback response.

---

## API Route Pattern

```typescript
// src/app/api/something/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // optional auth check:
    // const user = await getCurrentUser();
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await db.model.findMany({ ... });
    return NextResponse.json(data);
  } catch {
    // always fall back gracefully
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## Testing Checklist

Before committing any change:

1. `npx tsc --noEmit` — zero TypeScript errors
2. `npm run build` — clean production build
3. `npm run dev` — visually verify affected pages at localhost:3000
4. For map-related changes: check `/maps`, `/maps/map-1`, `/analyze`
5. For AI changes: check `/ai` and the AI Analysis tab on a map detail page
6. For auth changes: test register → login → protected route flow
7. For API changes: `curl http://localhost:3000/api/<route>` and verify JSON shape

---

## Common Tasks

### Add a new map tag
1. Add to `DIFFICULTY_TAGS` array in `src/lib/utils.ts`
2. Add its color to `TAG_COLORS` in `src/components/MapCard.tsx`
3. Add to `ALL_TAGS` in `src/app/maps/page.tsx`

### Add a new difficulty tier
1. Update `getDifficultyTier`, `getDifficultyColor`, `getDifficultyLabel` in `src/lib/utils.ts`

### Add a new ranking category
1. Add to `TABS` array in `src/app/rankings/page.tsx`
2. Add sort logic in the `sorted` `useMemo`

### Add a new AI feature
1. Add a function to `src/lib/pollinations.ts`
2. Create `src/app/api/ai/<feature>/route.ts` that calls it
3. Call the API route from the UI component

### Deploy changes to VPS
```bash
git push origin main
# then on VPS:
cd /var/www/adofai-verse && git pull && npm install && npm run build && pm2 restart adofai-verse
```
