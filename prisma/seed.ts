import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const MAPS = [
  {
    title: "CHAOS",
    artist: "Camellia",
    difficulty: 20,
    bpmMin: 200,
    bpmMax: 400,
    duration: 287,
    tileCount: 1024,
    description: "An absolute nightmare of BPM changes and pattern density.",
    tags: ["#speed", "#pattern", "#stream", "#technical"],
    status: "FEATURED" as const,
    likeCount: 8420,
    playCount: 142000,
  },
  {
    title: "Shelter",
    artist: "Porter Robinson & Madeon",
    difficulty: 7,
    bpmMin: 128,
    bpmMax: 128,
    duration: 218,
    tileCount: 456,
    description: "A beautiful emotional journey. Perfect for new players.",
    tags: ["#beginner-friendly", "#pattern"],
    status: "FEATURED" as const,
    likeCount: 12400,
    playCount: 320000,
  },
  {
    title: "FREEDOM DiVE",
    artist: "xi",
    difficulty: 19,
    bpmMin: 222,
    bpmMax: 222,
    duration: 245,
    tileCount: 890,
    description: "The legendary jump stream map. Constant 222 BPM.",
    tags: ["#stream", "#speed", "#technical"],
    status: "APPROVED" as const,
    likeCount: 6800,
    playCount: 98000,
  },
  {
    title: "Ghost",
    artist: "Camellia",
    difficulty: 17,
    bpmMin: 174,
    bpmMax: 348,
    duration: 312,
    tileCount: 765,
    description: "Intense BPM doubles and complex wave patterns.",
    tags: ["#wave", "#precision", "#speed"],
    status: "FEATURED" as const,
    likeCount: 9100,
    playCount: 167000,
  },
  {
    title: "Stargazer",
    artist: "Yuki Kajiura",
    difficulty: 5,
    bpmMin: 120,
    bpmMax: 120,
    duration: 235,
    tileCount: 278,
    description: "Gentle and beautiful. Perfect introduction to custom maps.",
    tags: ["#beginner-friendly", "#slow"],
    status: "APPROVED" as const,
    likeCount: 5500,
    playCount: 89000,
  },
];

const USERS = [
  { username: "MapMaster_KR", email: "mapmaster@example.com", password: "password123" },
  { username: "EmotionBeats", email: "emotion@example.com", password: "password123" },
  { username: "CamelliaFan_JP", email: "camellia@example.com", password: "password123" },
];

async function main() {
  console.log("Seeding database...");

  const users = await Promise.all(
    USERS.map((u) =>
      db.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          username: u.username,
          email: u.email,
          passwordHash: bcrypt.hashSync(u.password, 10),
          role: "CREATOR",
        },
      })
    )
  );

  console.log(`Created ${users.length} users`);

  for (const mapData of MAPS) {
    const creator = users[Math.floor(Math.random() * users.length)];
    await db.map.upsert({
      where: { id: `seed-${mapData.title.replace(/\s+/g, "-").toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${mapData.title.replace(/\s+/g, "-").toLowerCase()}`,
        ...mapData,
        creatorId: creator.id,
      },
    });
  }

  console.log(`Created ${MAPS.length} maps`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
