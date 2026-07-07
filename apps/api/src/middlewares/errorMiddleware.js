import { AppError } from "../utils/appError.js";
import { sendError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

export function handleError(error, response, requestContext = {}) {
  if (error instanceof AppError) {
    logger.warn("request.expected_error", {
      ...requestContext,
      statusCode: error.statusCode,
      errorMessage: error.message,
      errors: error.errors
    });
    sendError(response, error.statusCode, error.message, error.errors);
    return;
  }

  logger.error("request.unexpected_error", {
    ...requestContext,
    errorName: error?.name,
    errorMessage: error?.message
  });
  sendError(response, 500, "Erro interno do servidor.");
}
