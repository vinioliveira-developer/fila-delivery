import { randomUUID } from "node:crypto";
import { auditLogsRepository } from "../repositories/auditLogsRepository.js";
import { now } from "../utils/date.js";

function stringify(value) {
  return value === undefined ? null : JSON.stringify(value);
}

export const auditService = {
  record({
    action,
    entity,
    entityId = null,
    restaurantId = null,
    userId = null,
    beforeData,
    afterData,
    ipAddress = "",
    userAgent = ""
  }) {
    auditLogsRepository.create({
      id: randomUUID(),
      restaurantId,
      userId,
      action,
      entity,
      entityId,
      beforeData: stringify(beforeData),
      afterData: stringify(afterData),
      ipAddress,
      userAgent,
      createdAt: now()
    });
  }
};
