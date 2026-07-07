import { AppError } from "../utils/appError.js";
import { hashToken, verifyToken } from "../utils/token.js";
import { usersRepository } from "../repositories/usersRepository.js";
import { userSessionsRepository } from "../repositories/userSessionsRepository.js";
import { now } from "../utils/date.js";

export function getAuthenticatedUser(request) {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError("Nao autenticado.", 401);
  }

  if (!payload.sessionId) {
    throw new AppError("Sessao invalida.", 401);
  }

  userSessionsRepository.expireExpired(now());
  const session = userSessionsRepository.findActiveById(payload.sessionId);

  if (!session) {
    throw new AppError("Sessao expirada ou revogada.", 401);
  }

  if (session.user_id !== payload.userId || session.token_hash !== hashToken(token)) {
    throw new AppError("Sessao invalida.", 401);
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    userSessionsRepository.expire(session.id, now());
    throw new AppError("Sessao expirada.", 401);
  }

  const user = usersRepository.findActiveById(payload.userId);

  if (!user) {
    throw new AppError("Nao autenticado.", 401);
  }

  if (user.restaurant_id && user.restaurant_status && user.restaurant_status !== "Ativo") {
    throw new AppError("Restaurante inativo.", 403);
  }

  if (
    user.restaurant_id &&
    user.restaurant_expires_at &&
    new Date(user.restaurant_expires_at).getTime() < Date.now()
  ) {
    throw new AppError("Assinatura expirada.", 403);
  }

  userSessionsRepository.touch(session.id, now());

  return { sessionId: session.id, user };
}

export function requireRole(user, role) {
  if (user.role !== role) {
    throw new AppError("Acesso negado.", 403);
  }
}

export function requireClientUser(user) {
  requireRole(user, "CLIENT");

  if (!user.restaurant_id) {
    throw new AppError("Acesso negado.", 403);
  }
}
