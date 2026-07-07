import { createHmac } from "node:crypto";
import { env } from "../config/env.js";

export const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: expiresAt
    })
  );
  const signature = createHmac("sha256", env.tokenSecret)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

export function hashToken(token) {
  return createHmac("sha256", env.tokenSecret).update(token).digest("hex");
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  const expected = createHmac("sha256", env.tokenSecret)
    .update(body)
    .digest("base64url");

  if (signature !== expected) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));

  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
