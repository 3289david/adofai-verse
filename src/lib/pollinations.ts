import type { MapData, AIAnalysisResult } from "./types";

const POLLINATIONS_TEXT_URL = "https://text.pollinations.ai/";

async function pollinationsChat(
  messages: { role: string; content: string }[],
  options: { jsonMode?: boolean; model?: string } = {}
): Promise<string> {
  const res = await fetch(POLLINATIONS_TEXT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: options.model ?? "openai",
      seed: 42,
      jsonMode: options.jsonMode ?? false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Pollinations API error: ${res.status}`);
  }

  return res.text();
}

export async function analyzeMap(map: MapData): Promise<AIAnalysisResult> {
  const messages = [
    {
      role: "system",
      content:
        "You are an expert analyst for ADOFAI (A Dance of Fire and Ice), a rhythm game where players hit tiles to the beat. You deeply understand map difficulty, BPM, tile patterns, and gameplay mechanics. Always respond in valid JSON.",
    },
    {
      role: "user",
      content: `Analyze this ADOFAI custom map and return a JSON object with these exact keys:
- difficulty_explanation: why the map is rated at its difficulty (2-3 sentences)
- play_style: classification like "Speed Run", "Precision", "Wave", "Stream", "Technical", etc.
- tips: array of 3-4 specific tips to clear/improve at this map
- recommended_for: who should attempt this map
- hardest_section: description of what's hardest about this map
- practice_advice: how to practice this map effectively

Map data:
Title: ${map.title}
Artist: ${map.artist}
Difficulty: ${map.difficulty}/21+
BPM: ${map.bpmMin === map.bpmMax ? map.bpmMin : `${map.bpmMin}–${map.bpmMax}`}
Duration: ${Math.floor(map.duration / 60)}m ${map.duration % 60}s
Tile Count: ${map.tileCount}
Tags: ${map.tags.join(", ") || "none"}
Description: ${map.description || "none"}`,
    },
  ];

  const raw = await pollinationsChat(messages, { jsonMode: true });

  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;
    return JSON.parse(raw.slice(start, end)) as AIAnalysisResult;
  } catch {
    return {
      difficulty_explanation: `This map is rated ${map.difficulty}/21+ with ${map.bpmMin === map.bpmMax ? map.bpmMin : `${map.bpmMin}–${map.bpmMax}`} BPM. The tile count of ${map.tileCount} indicates a ${map.duration > 120 ? "long" : "short"} but demanding chart.`,
      play_style: map.tags[0]?.replace("#", "") ?? "Mixed",
      tips: [
        "Practice the hardest section in isolation first",
        "Gradually increase speed until you reach full BPM",
        "Focus on consistency over perfection in early attempts",
        "Use the speed change feature to learn pattern timing",
      ],
      recommended_for:
        map.difficulty <= 8
          ? "Beginners to intermediate players"
          : map.difficulty <= 14
          ? "Intermediate players"
          : "Advanced to expert players",
      hardest_section: "The densest tile section likely near the climax",
      practice_advice:
        "Break the map into sections and master each one before attempting a full run",
    };
  }
}

export async function getAICoachResponse(
  userMessage: string,
  context?: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content:
        "You are an expert ADOFAI (A Dance of Fire and Ice) coach. You help players improve their skills, understand maps, and overcome challenges. Be specific, encouraging, and practical. Keep responses concise (under 200 words) but helpful.",
    },
    ...(context
      ? [{ role: "system", content: `Map context: ${context}` }]
      : []),
    { role: "user", content: userMessage },
  ];

  return pollinationsChat(messages);
}

export async function generateMapSuggestions(
  playerLevel: number,
  preferredTags: string[],
  recentMaps: string[]
): Promise<string> {
  const messages = [
    {
      role: "system",
      content:
        "You are an ADOFAI expert recommending maps for players to improve. Be specific about why each suggestion fits the player.",
    },
    {
      role: "user",
      content: `Suggest 5 ADOFAI maps for a player with:
- Current skill level: ${playerLevel}/21+
- Preferred styles: ${preferredTags.join(", ") || "any"}
- Recently played: ${recentMaps.join(", ") || "none yet"}

For each suggestion explain why it's good for this player's progression.`,
    },
  ];

  return pollinationsChat(messages);
}
