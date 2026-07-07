import { adminService } from "../services/adminService.js";
import { readJson, sendSuccess } from "../utils/http.js";
import { getRequestIp, getUserAgent } from "../utils/request.js";
import { logger } from "../utils/logger.js";

export const adminController = {
  async dashboard(_request, response) {
    sendSuccess(
      response,
      200,
      "Dashboard administrativo carregado com sucesso.",
      adminService.dashboard()
    );
  },

  async listRestaurants(_request, response) {
    const restaurants = adminService.listRestaurants();
    sendSuccess(response, 200, "Restaurantes carregados com sucesso.", {
      restaurants
    });
  },

  async createRestaurant(request, response, context) {
    const restaurant = adminService.createRestaurant(await readJson(request), {
      ipAddress: getRequestIp(request),
      user: context.user,
      userAgent: getUserAgent(request)
    });
    logger.info("admin.restaurant_created", {
      ...context.request,
      targetRestaurantId: restaurant.id
    });
    sendSuccess(response, 201, "Restaurante cadastrado com sucesso.", {
      restaurant
    });
  },

  async getRestaurant(_request, response, context) {
    const restaurant = adminService.getRestaurant(context.params.id);
    sendSuccess(response, 200, "Restaurante carregado com sucesso.", {
      restaurant
    });
  },

  async updateRestaurant(request, response, context) {
    const restaurant = adminService.updateRestaurant(
      context.params.id,
      await readJson(request),
      {
        ipAddress: getRequestIp(request),
        user: context.user,
        userAgent: getUserAgent(request)
      }
    );
    logger.info("admin.restaurant_updated", {
      ...context.request,
      targetRestaurantId: restaurant.id,
      plan: restaurant.plan,
      status: restaurant.status
    });
    sendSuccess(response, 200, "Restaurante atualizado com sucesso.", {
      restaurant
    });
  },

  async deleteRestaurant(_request, response, context) {
    const restaurant = adminService.deleteRestaurant(context.params.id, {
      user: context.user
    });
    logger.info("admin.restaurant_deleted", {
      ...context.request,
      targetRestaurantId: restaurant.id
    });
    sendSuccess(response, 200, "Restaurante excluido com sucesso.", {
      restaurant
    });
  },

  async listUsers(_request, response) {
    const users = adminService.listUsers();
    sendSuccess(response, 200, "Usuarios carregados com sucesso.", { users });
  },

  async listPlans(_request, response) {
    const plans = adminService.listPlans();
    sendSuccess(response, 200, "Planos carregados com sucesso.", { plans });
  }
};
