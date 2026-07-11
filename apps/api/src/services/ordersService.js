import { randomUUID } from "node:crypto";
import { AppError } from "../utils/appError.js";
import { now } from "../utils/date.js";
import { rowToOrder } from "../models/mappers.js";
import { ordersRepository } from "../repositories/ordersRepository.js";

const allowedStatuses = ["EM_PREPARO", "PRONTO", "ENTREGUE", "CANCELADO"];
const allowedCreateStatuses = ["EM_PREPARO", "PRONTO"];

export const ordersService = {
  list(restaurantId) {
    return ordersRepository.listByRestaurant(restaurantId).map(rowToOrder);
  },

  create(restaurantId, payload) {
    const orderNumber = payload.number?.trim();
    const platform = payload.platform?.trim().toUpperCase();
    const status = payload.status ?? "EM_PREPARO";

    if (!orderNumber || !platform) {
      throw new AppError("Numero e plataforma sao obrigatorios.", 400);
    }

    if (!allowedCreateStatuses.includes(status)) {
      throw new AppError("Status inicial invalido.", 400);
    }

    const timestamp = now();
    const duplicate = ordersRepository.findActiveDuplicate({
      restaurantId,
      orderNumber,
      platform
    });

    if (duplicate) {
      throw new AppError(`Pedido ${orderNumber} ja esta ativo em ${platform}.`, 409);
    }

    const id = randomUUID();
    ordersRepository.create({
      id,
      restaurantId,
      orderNumber,
      platform,
      status,
      createdAt: timestamp,
      readyAt: status === "PRONTO" ? timestamp : null,
      note: payload.note ?? null
    });

    return rowToOrder(ordersRepository.findByIdForRestaurant(id, restaurantId));
  },

  updateStatus(restaurantId, orderId, payload) {
    const status = payload.status;

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Status invalido.", 400);
    }

    ordersRepository.updateStatus({
      id: orderId,
      restaurantId,
      status,
      timestamp: now()
    });

    const order = ordersRepository.findByIdForRestaurant(orderId, restaurantId);

    if (!order) {
      throw new AppError("Pedido nao encontrado.", 404);
    }

    return rowToOrder(order);
  },

  clearFinalized(restaurantId) {
    ordersRepository.deleteFinalized(restaurantId, now());
  }
};
