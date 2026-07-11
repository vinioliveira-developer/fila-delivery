import { env } from "../config/env.js";

const corsHeaders = {
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Vary": "Origin"
};

const securityHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0"
};

export async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function applyCorsHeaders(request, response) {
  const origin = request.headers.origin;

  if (origin && env.allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsHeaders).forEach(([header, value]) => {
    response.setHeader(header, value);
  });
}

export function sendSuccess(response, statusCode, message, data = {}) {
  response.writeHead(statusCode, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(
    JSON.stringify({
      success: true,
      message,
      data
    })
  );
}

export function sendError(response, statusCode, message, errors = []) {
  response.writeHead(statusCode, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(
    JSON.stringify({
      success: false,
      message,
      errors
    })
  );
}

export function sendOptions(response) {
  response.writeHead(204, {
    ...securityHeaders
  });
  response.end();
}

export function matchPath(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  return patternParts.reduce((params, part, index) => {
    if (params === null) {
      return null;
    }

    if (part.startsWith(":")) {
      return { ...params, [part.slice(1)]: decodeURIComponent(pathParts[index]) };
    }

    return part === pathParts[index] ? params : null;
  }, {});
}
