import { ordersService } from "../services/ordersService.js";
import { readJson, sendSuccess } from "../utils/http.js";
import { logger } from "../utils/logger.js";

export const ordersController = {
  async list(_request, response, context) {
    const orders = ordersService.list(context.user.restaurant_id);
    sendSuccess(response, 200, "Pedidos carregados com sucesso.", { orders });
  },

  async create(request, response, context) {
    const order = ordersService.create(
      context.user.restaurant_id,
      await readJson(request)
    );
    logger.info("orders.created", {
      ...context.request,
      orderId: order.id,
      orderNumber: order.number,
      platform: order.platform
    });
    sendSuccess(response, 201, "Pedido cadastrado com sucesso.", { order });
  },

  async updateStatus(request, response, context) {
    const order = ordersService.updateStatus(
      context.user.restaurant_id,
      context.params.id,
      await readJson(request)
    );
    logger.info("orders.status_changed", {
      ...context.request,
      orderId: order.id,
      orderNumber: order.number,
      platform: order.platform,
      status: order.status
    });
    sendSuccess(response, 200, "Status atualizado com sucesso.", { order });
  },

  async clearFinalized(_request, response, context) {
    ordersService.clearFinalized(context.user.restaurant_id);
    logger.info("orders.finalized_soft_deleted", context.request);
    sendSuccess(response, 200, "Pedidos finalizados removidos com sucesso.");
  }
};
