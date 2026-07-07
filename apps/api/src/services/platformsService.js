import { randomUUID } from "node:crypto";
import { AppError } from "../utils/appError.js";
import { now } from "../utils/date.js";
import { platformsRepository } from "../repositories/platformsRepository.js";

export const platformsService = {
  list(restaurantId) {
    return platformsRepository.listNamesByRestaurant(restaurantId);
  },

  create(restaurantId, payload) {
    const name = payload.name?.trim().toUpperCase();

    if (!name) {
      throw new AppError("Nome da plataforma e obrigatorio.", 400);
    }

    try {
      platformsRepository.create({
        id: randomUUID(),
        restaurantId,
        name,
        createdAt: now()
      });
    } catch {
      throw new AppError(`${name} ja esta cadastrada.`, 409);
    }

    return { name };
  },

  remove(restaurantId, name) {
    platformsRepository.deleteByName(restaurantId, name, now());
  }
};
