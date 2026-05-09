/**
 * Client-side Proof-of-Work solver using Web Crypto API (SHA-256).
 * Runs entirely in the browser — no server round-trip until submission.
 */

async function sha256hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Solves a PoW challenge: finds a nonce such that sha256(challenge+nonce)
 * starts with `difficulty` hex zeros.
 */
export async function solvePoW(
  challenge: string,
  difficulty: number,
  signal?: AbortSignal
): Promise<string> {
  const prefix = "0".repeat(difficulty);
  const BATCH = 200; // parallel hashes per tick
  let nonce = Math.floor(Math.random() * 1_000_000); // random start to vary per user

  while (!signal?.aborted) {
    const batch = Array.from({ length: BATCH }, (_, i) => nonce + i);
    const results = await Promise.all(
      batch.map(async (n) => {
        const h = await sha256hex(challenge + n);
        return { h, n };
      })
    );
    for (const { h, n } of results) {
      if (h.startsWith(prefix)) return String(n);
    }
    nonce += BATCH;
    // Yield to the event loop every batch so the UI stays responsive
    await new Promise((r) => setTimeout(r, 0));
  }
  throw new Error("PoW aborted");
}
