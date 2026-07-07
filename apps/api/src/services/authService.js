import { randomBytes, randomUUID } from "node:crypto";
import { AppError } from "../utils/appError.js";
import { now } from "../utils/date.js";
import { env } from "../config/env.js";
import { getBrowserFromUserAgent } from "../utils/request.js";
import { hashToken, signToken, TOKEN_TTL_MS } from "../utils/token.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { validatePasswordPolicy } from "../utils/passwordPolicy.js";
import { rowToRestaurant } from "../models/mappers.js";
import { passwordResetsRepository } from "../repositories/passwordResetsRepository.js";
import { restaurantsRepository } from "../repositories/restaurantsRepository.js";
import { userSessionsRepository } from "../repositories/userSessionsRepository.js";
import { usersRepository } from "../repositories/usersRepository.js";
import { auditService } from "./auditService.js";

export const authService = {
  login({ email, password }, metadata = {}) {
    const cleanEmail = email?.trim().toLowerCase();
    const user = usersRepository.findByEmail(cleanEmail);

    if (!user || !user.active || !verifyPassword(password ?? "", user.password)) {
      auditService.record({
        action: "LOGIN_FAILED",
        entity: "users",
        entityId: user?.id ?? null,
        restaurantId: user?.restaurant_id ?? null,
        userId: user?.id ?? null,
        afterData: { email: cleanEmail },
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      });
      throw new AppError("E-mail ou senha invalidos.", 401);
    }

    if (user.role === "CLIENT") {
      if (user.restaurant_status !== "Ativo") {
        throw new AppError(
          "Sua assinatura esta inativa. Entre em contato para renovar seu acesso.",
          403
        );
      }

      if (new Date(user.expires_at).getTime() < Date.now()) {
        throw new AppError(
          "Sua assinatura expirou. Entre em contato para renovar seu acesso.",
          403
        );
      }
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
    const createdAt = now();
    const token = signToken({
      sessionId,
      userId: user.id,
      restaurantId: user.restaurant_id,
      role: user.role
    });

    userSessionsRepository.create({
      id: sessionId,
      userId: user.id,
      restaurantId: user.restaurant_id,
      tokenHash: hashToken(token),
      ipAddress: metadata.ipAddress ?? "",
      userAgent: metadata.userAgent ?? "",
      browser: getBrowserFromUserAgent(metadata.userAgent),
      createdAt,
      expiresAt
    });

    auditService.record({
      action: "LOGIN_SUCCEEDED",
      entity: "users",
      entityId: user.id,
      restaurantId: user.restaurant_id,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      restaurant:
        user.role === "CLIENT"
          ? {
              id: user.restaurant_id,
              name: user.restaurant_name,
              logo: user.restaurant_logo ?? ""
            }
          : null
    };
  },

  getSession(user) {
    const restaurant = user.restaurant_id
      ? restaurantsRepository.findById(user.restaurant_id)
      : null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      restaurant: restaurant ? rowToRestaurant(restaurant) : null
    };
  },

  logout(user, sessionId, metadata = {}) {
    userSessionsRepository.revoke(sessionId, now());
    auditService.record({
      action: "LOGOUT",
      entity: "user_sessions",
      entityId: sessionId,
      restaurantId: user.restaurant_id,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });
  },

  requestPasswordReset({ email }, metadata = {}) {
    const cleanEmail = email?.trim().toLowerCase();
    passwordResetsRepository.expireExpired(now());
    const user = usersRepository.findByEmail(cleanEmail);

    if (!user || !user.active) {
      auditService.record({
        action: "PASSWORD_RESET_REQUESTED",
        entity: "users",
        afterData: { email: cleanEmail, found: false },
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      });
      return { resetToken: env.isProduction ? undefined : null };
    }

    const timestamp = now();
    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    passwordResetsRepository.invalidateUserTokens(user.id, timestamp);
    passwordResetsRepository.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash: hashToken(resetToken),
      requestedIp: metadata.ipAddress ?? "",
      requestedUserAgent: metadata.userAgent ?? "",
      createdAt: timestamp,
      expiresAt
    });

    auditService.record({
      action: "PASSWORD_RESET_REQUESTED",
      entity: "users",
      entityId: user.id,
      restaurantId: user.restaurant_id,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return env.isProduction ? {} : { resetToken };
  },

  validatePasswordResetToken({ token }) {
    passwordResetsRepository.expireExpired(now());
    const reset = passwordResetsRepository.findValidByTokenHash(hashToken(token ?? ""));

    return {
      valid: Boolean(reset && new Date(reset.expires_at).getTime() >= Date.now())
    };
  },

  resetPassword({ token, password }, metadata = {}) {
    validatePasswordPolicy(password);

    const timestamp = now();
    passwordResetsRepository.expireExpired(timestamp);
    const reset = passwordResetsRepository.findValidByTokenHash(hashToken(token ?? ""));

    if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
      throw new AppError("Token de recuperacao invalido ou expirado.", 400);
    }

    const user = usersRepository.findById(reset.user_id);

    if (!user || !user.active) {
      throw new AppError("Usuario invalido.", 400);
    }

    usersRepository.updatePassword(user.id, hashPassword(password), timestamp);
    passwordResetsRepository.markUsed(reset.id, timestamp);
    userSessionsRepository.revokeActiveByUser(user.id, timestamp);

    auditService.record({
      action: "PASSWORD_CHANGED",
      entity: "users",
      entityId: user.id,
      restaurantId: user.restaurant_id,
      userId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return { changed: true };
  }
};
