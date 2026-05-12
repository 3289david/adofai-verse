import { createHash, randomBytes } from "crypto";

export function randomVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function randomState(): string {
  return randomBytes(16).toString("base64url");
}

export function s256Challenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
