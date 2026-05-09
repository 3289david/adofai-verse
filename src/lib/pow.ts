import { createHmac, createHash, randomBytes } from "crypto";

/** Number of leading hex zeros required. 4 = ~65K hashes ≈ 0.5–2s in browser. */
export const POW_DIFFICULTY = 4;
/** Challenge token validity window */
const EXPIRES_MS = 10 * 60_000; // 10 minutes

/**
 * Generates a signed PoW challenge.
 * Returns the opaque token string to send to the client.
 */
export function createPoWChallenge(): { challenge: string; difficulty: number; token: string } {
  const secret = process.env.JWT_SECRET ?? "dev-pow-secret";
  const challenge = randomBytes(16).toString("hex");
  const expires = Date.now() + EXPIRES_MS;
  const hmac = createHmac("sha256", secret)
    .update(`${challenge}:${expires}`)
    .digest("hex");
  return {
    challenge,
    difficulty: POW_DIFFICULTY,
    token: `${challenge}:${expires}:${hmac}`,
  };
}

/**
 * Verifies a PoW solution submitted by the client.
 * @param token  The signed token issued by createPoWChallenge
 * @param nonce  The nonce found by the client
 */
export function verifyPoWSolution(token: string | undefined, nonce: string | undefined): boolean {
  if (!token || !nonce) return false;
  if (nonce.length > 32) return false; // sanity limit

  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [challenge, expiresStr, hmac] = parts;

    // Verify HMAC signature
    const secret = process.env.JWT_SECRET ?? "dev-pow-secret";
    const expectedHmac = createHmac("sha256", secret)
      .update(`${challenge}:${expiresStr}`)
      .digest("hex");
    if (!hmacEqual(hmac, expectedHmac)) return false;

    // Check expiry
    if (Date.now() > parseInt(expiresStr, 10)) return false;

    // Verify nonce
    const hash = createHash("sha256").update(challenge + nonce).digest("hex");
    return hash.startsWith("0".repeat(POW_DIFFICULTY));
  } catch {
    return false;
  }
}

/** Constant-time comparison to prevent timing attacks */
function hmacEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
