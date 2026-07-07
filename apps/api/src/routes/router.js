import { getAuthenticatedUser, requireClientUser, requireRole } from "../middlewares/authMiddleware.js";
import { completeRequestContext } from "../middlewares/requestContext.js";
import { matchPath, sendError } from "../utils/http.js";
import { routes } from "./index.js";

function authorize(route, request) {
  if (!route.auth) {
    return null;
  }

  const authContext = getAuthenticatedUser(request);

  if (route.auth === "ADMIN") {
    requireRole(authContext.user, "ADMIN");
  }

  if (route.auth === "CLIENT") {
    requireClientUser(authContext.user);
  }

  return authContext;
}

export async function dispatch(request, response, pathname, requestContext) {
  const routeMatch = routes
    .map((route) => ({
      route,
      params: route.method === request.method ? matchPath(route.path, pathname) : null
    }))
    .find((item) => item.params !== null);

  if (!routeMatch) {
    sendError(response, 404, "Rota nao encontrada.");
    return;
  }

  const authContext = authorize(routeMatch.route, request);
  const completedRequestContext = completeRequestContext(requestContext, authContext);

  await routeMatch.route.handler(request, response, {
    params: routeMatch.params,
    request: completedRequestContext,
    sessionId: authContext?.sessionId,
    user: authContext?.user ?? null
  });
}
