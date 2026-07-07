import { AppError } from "../utils/appError.js";

const attempts = new Map();

function currentWindow(now, windowMs) {
  return Math.floor(now / windowMs);
}

export function assertRateLimit({
  key,
  limit,
  windowMs,
  message = "Muitas tentativas. Aguarde alguns minutos e tente novamente."
}) {
  const now = Date.now();
  const bucket = currentWindow(now, windowMs);
  const current = attempts.get(key);

  if (!current || current.bucket !== bucket) {
    attempts.set(key, { bucket, count: 1 });
    return;
  }

  if (current.count >= limit) {
    throw new AppError(message, 429);
  }

  current.count += 1;
}

export function clearRateLimit(key) {
  attempts.delete(key);
}
