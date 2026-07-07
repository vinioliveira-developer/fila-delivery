import { platformsService } from "../services/platformsService.js";
import { readJson, sendSuccess } from "../utils/http.js";
import { logger } from "../utils/logger.js";

export const platformsController = {
  async list(_request, response, context) {
    const platforms = platformsService.list(context.user.restaurant_id);
    sendSuccess(response, 200, "Plataformas carregadas com sucesso.", {
      platforms
    });
  },

  async create(request, response, context) {
    const platform = platformsService.create(
      context.user.restaurant_id,
      await readJson(request)
    );
    logger.info("platforms.created", {
      ...context.request,
      platform: platform.name
    });
    sendSuccess(response, 201, "Plataforma cadastrada com sucesso.", platform);
  },

  async remove(_request, response, context) {
    platformsService.remove(context.user.restaurant_id, context.params.name);
    logger.info("platforms.soft_deleted", {
      ...context.request,
      platform: context.params.name
    });
    sendSuccess(response, 200, "Plataforma removida com sucesso.");
  }
};
