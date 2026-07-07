import { randomUUID } from "node:crypto";
import { getRequestIp, getUserAgent } from "../utils/request.js";

export function createRequestContext(request, pathname) {
  return {
    requestId: request.headers["x-request-id"] || randomUUID(),
    method: request.method,
    route: pathname,
    ipAddress: getRequestIp(request),
    userAgent: getUserAgent(request),
    startedAt: Date.now()
  };
}

export function completeRequestContext(context, authContext) {
  if (!authContext?.user) {
    return context;
  }

  return {
    ...context,
    userId: authContext.user.id,
    restaurantId: authContext.user.restaurant_id ?? null
  };
}
