import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [algorithm, salt, hash] = stored.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const incoming = scryptSync(password, salt, 64);
  const saved = Buffer.from(hash, "hex");

  return saved.length === incoming.length && timingSafeEqual(saved, incoming);
}
