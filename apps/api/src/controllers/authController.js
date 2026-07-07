import { authService } from "../services/authService.js";
import { env } from "../config/env.js";
import { assertRateLimit, clearRateLimit } from "../middlewares/rateLimitMiddleware.js";
import { readJson, sendSuccess } from "../utils/http.js";
import { getRequestIp, getUserAgent } from "../utils/request.js";
import { logger } from "../utils/logger.js";

export const authController = {
  async login(request, response, context) {
    const ipAddress = getRequestIp(request);
    const rateLimitKey = `login:${ipAddress}`;
    assertRateLimit({
      key: rateLimitKey,
      limit: env.loginRateLimitMaxAttempts,
      windowMs: env.loginRateLimitWindowMs
    });

    const data = authService.login(await readJson(request), {
      ipAddress,
      userAgent: getUserAgent(request)
    });
    clearRateLimit(rateLimitKey);
    logger.info("auth.login_succeeded", {
      ...context.request,
      userId: data.user.id,
      restaurantId: data.user.restaurant?.id ?? null
    });
    sendSuccess(response, 200, "Login realizado com sucesso.", data);
  },

  async me(_request, response, context) {
    const data = authService.getSession(context.user);
    sendSuccess(response, 200, "Sessao carregada com sucesso.", data);
  },

  async logout(request, response, context) {
    authService.logout(context.user, context.sessionId, {
      ipAddress: getRequestIp(request),
      userAgent: getUserAgent(request)
    });
    logger.info("auth.logout", context.request);
    sendSuccess(response, 200, "Logout realizado com sucesso.");
  },

  async requestPasswordReset(request, response, context) {
    const data = authService.requestPasswordReset(await readJson(request), {
      ipAddress: getRequestIp(request),
      userAgent: getUserAgent(request)
    });
    logger.info("auth.password_reset_requested", context.request);
    sendSuccess(response, 200, "Se o e-mail existir, a recuperacao sera iniciada.", data);
  },

  async validatePasswordReset(request, response) {
    const data = authService.validatePasswordResetToken(await readJson(request));
    sendSuccess(response, 200, "Token verificado.", data);
  },

  async resetPassword(request, response, context) {
    const data = authService.resetPassword(await readJson(request), {
      ipAddress: getRequestIp(request),
      userAgent: getUserAgent(request)
    });
    logger.info("auth.password_changed", context.request);
    sendSuccess(response, 200, "Senha alterada com sucesso.", data);
  }
};
