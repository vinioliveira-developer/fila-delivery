import { createServer } from "node:http";
import { env, validateEnv } from "./config/env.js";
import { migrate } from "./database/migrations.js";
import { seedDatabase } from "./database/seed.js";
import { handleError } from "./middlewares/errorMiddleware.js";
import { createRequestContext } from "./middlewares/requestContext.js";
import { dispatch } from "./routes/router.js";
import { applyCorsHeaders, sendOptions } from "./utils/http.js";
import { logger } from "./utils/logger.js";

const port = env.apiPort;

validateEnv();
migrate();
seedDatabase();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const requestContext = createRequestContext(request, url.pathname);
  response.setHeader("X-Request-Id", requestContext.requestId);
  applyCorsHeaders(request, response);

  logger.info("request.started", requestContext);

  if (request.method === "OPTIONS") {
    sendOptions(response);
    logger.info("request.completed", {
      ...requestContext,
      statusCode: 204,
      durationMs: Date.now() - requestContext.startedAt,
    });
    return;
  }

  try {
    await dispatch(request, response, url.pathname, requestContext);
  } catch (error) {
    handleError(error, response, requestContext);
  }

  logger.info("request.completed", {
    ...requestContext,
    statusCode: response.statusCode,
    durationMs: Date.now() - requestContext.startedAt,
  });
});

server.listen(port, () => {
  logger.info("application.started", {
    port,
    version: env.appVersion,
    build: env.buildSha,
  });
});

function shutdown(signal) {
  logger.info("application.stopping", { signal });
  server.close(() => {
    logger.info("application.stopped", { signal });
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
