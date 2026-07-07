import { db } from "../database/connection.js";
import { env } from "../config/env.js";

function getAppInfo() {
  return {
    name: env.appName,
    version: env.appVersion,
    environment: env.environment,
    build: env.buildSha,
    date: env.buildDate ?? new Date().toISOString()
  };
}

function checkDatabase() {
  const result = db.prepare("SELECT 1 AS ok").get();
  return result?.ok === 1;
}

export const systemService = {
  health() {
    return {
      status: "online",
      database: checkDatabase() ? "connected" : "unavailable",
      ...getAppInfo(),
      timestamp: new Date().toISOString()
    };
  },

  ready() {
    return {
      ready: checkDatabase(),
      timestamp: new Date().toISOString()
    };
  },

  version() {
    return {
      ...getAppInfo(),
      database: checkDatabase() ? "Connected" : "Offline"
    };
  }
};
