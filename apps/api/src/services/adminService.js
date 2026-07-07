import { randomUUID } from "node:crypto";
import { AppError } from "../utils/appError.js";
import { hashPassword } from "../utils/password.js";
import { validatePasswordPolicy } from "../utils/passwordPolicy.js";
import { now, planToExpiration } from "../utils/date.js";
import { rowToPublicUser, rowToRestaurant, rowToPlan, rowToPlanFeature } from "../models/mappers.js";
import { adminStatsRepository } from "../repositories/adminStatsRepository.js";
import { ordersRepository } from "../repositories/ordersRepository.js";
import { restaurantsRepository } from "../repositories/restaurantsRepository.js";
import { plansRepository } from "../repositories/plansRepository.js";
import { runInTransaction } from "../repositories/transactionRepository.js";
import { usersRepository } from "../repositories/usersRepository.js";
import { auditService } from "./auditService.js";

export const adminService = {
  dashboard() {
    return {
      activeClients: adminStatsRepository.countActiveRestaurants(),
      blockedClients: adminStatsRepository.countBlockedRestaurants(),
      expiringPlans: adminStatsRepository.countExpiringRestaurants(),
      expiredPlans: adminStatsRepository.countExpiredRestaurants(),
      registeredUsers: adminStatsRepository.countUsers(),
      todayOrders: ordersRepository.countToday(),
      monthlyRevenue: 0,
      processedOrders: ordersRepository.countAll()
    };
  },

  listRestaurants() {
    return restaurantsRepository.listAll().map(rowToRestaurant);
  },

  getRestaurant(id) {
    const restaurant = restaurantsRepository.findById(id);

    if (!restaurant) {
      throw new AppError("Restaurante nao encontrado.", 404);
    }

    return rowToRestaurant(restaurant);
  },

  listPlans() {
    const plans = plansRepository.listAll();

    return plans.map((planRow) => {
      const plan = rowToPlan(planRow);
      plan.features = plansRepository.listFeatures(plan.id).map(rowToPlanFeature);
      return plan;
    });
  },

  createRestaurant(payload, metadata = {}) {
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();

    if (!name || !email || !payload.initialPassword) {
      throw new AppError("Nome, e-mail e senha inicial sao obrigatorios.", 400);
    }

    const createdAt = now();
    const restaurantId = randomUUID();
    const userId = randomUUID();
    const planId = payload.planId?.trim() ? payload.planId : null;
    const planRow = planId ? plansRepository.findById(planId) : null;
    const planName = planRow ? planRow.name : payload.plan ?? "Mensal";
    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt).toISOString()
      : planRow
      ? planToExpiration(planRow.billing_cycle)
      : planToExpiration(payload.plan ?? "Mensal", payload.expiresAt);
    const initialPassword = payload.initialPassword;

    validatePasswordPolicy(initialPassword);

    try {
      runInTransaction(() => {
        restaurantsRepository.create({
          id: restaurantId,
          name,
          cnpj: payload.cnpj ?? "",
          phone: payload.phone ?? "",
          email,
          logo: payload.logo ?? "",
          plan: planName,
          planId: planRow ? planRow.id : null,
          status: payload.status ?? "Ativo",
          expiresAt,
          createdAt,
          updatedAt: createdAt
        });

        usersRepository.createClientUser({
          id: userId,
          restaurantId,
          name: payload.userName ?? name,
          email,
          password: hashPassword(initialPassword),
          createdAt
        });
      });
    } catch {
      throw new AppError("Nao foi possivel cadastrar restaurante.", 400);
    }

    const restaurant = rowToRestaurant(restaurantsRepository.findById(restaurantId));

    auditService.record({
      action: "RESTAURANT_CREATED",
      entity: "restaurants",
      entityId: restaurantId,
      userId: metadata.user?.id,
      afterData: { name: restaurant.name, email: restaurant.email, plan: restaurant.plan },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return restaurant;
  },

  updateRestaurant(id, payload, metadata = {}) {
    const current = restaurantsRepository.findById(id);

    if (!current) {
      throw new AppError("Restaurante nao encontrado.", 404);
    }

    const name = payload.name?.trim() || current.name;
    const email = payload.email?.trim().toLowerCase() || current.email;

    if (!name || !email) {
      throw new AppError("Nome e e-mail sao obrigatorios.", 400);
    }

    const planId = payload.planId?.trim() ? payload.planId : current.planId;
    const planRow = planId ? plansRepository.findById(planId) : null;
    const planName = planRow ? planRow.name : payload.plan ?? current.plan;
    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt).toISOString()
      : current.expiresAt;
    const updatedAt = now();
    const nextStatus = payload.status ?? current.status;

    try {
      runInTransaction(() => {
        restaurantsRepository.update(id, {
          name,
          cnpj: payload.cnpj ?? current.cnpj,
          phone: payload.phone ?? current.phone,
          email,
          logo: payload.logo ?? current.logo,
          plan: planName,
          planId: planRow ? planRow.id : null,
          status: nextStatus,
          expiresAt,
          updatedAt
        });

        usersRepository.updateClientUserByRestaurantId({
          restaurantId: id,
          name,
          email,
          active: nextStatus === "Ativo",
          updatedAt
        });
      });
    } catch {
      throw new AppError("Nao foi possivel atualizar restaurante.", 400);
    }

    const updated = rowToRestaurant(restaurantsRepository.findById(id));

    auditService.record({
      action: "RESTAURANT_UPDATED",
      entity: "restaurants",
      entityId: id,
      userId: metadata.user?.id,
      beforeData: rowToRestaurant(current),
      afterData: updated,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return updated;
  },

  deleteRestaurant(id, metadata = {}) {
    const current = restaurantsRepository.findById(id);

    if (!current) {
      throw new AppError("Restaurante nao encontrado.", 404);
    }

    const deletedAt = now();

    try {
      runInTransaction(() => {
        restaurantsRepository.delete(id, deletedAt);
        usersRepository.updateClientUserByRestaurantId({
          restaurantId: id,
          active: false,
          updatedAt: deletedAt,
          deletedAt,
          deletedBy: metadata.user?.id
        });
      });
    } catch {
      throw new AppError("Nao foi possivel excluir restaurante.", 400);
    }

    const deletedRestaurant = rowToRestaurant({ ...current, deleted_at: deletedAt });

    auditService.record({
      action: "RESTAURANT_DELETED",
      entity: "restaurants",
      entityId: id,
      userId: metadata.user?.id,
      beforeData: rowToRestaurant(current),
      afterData: { id, deletedAt, deleted: true },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    return deletedRestaurant;
  },

  listUsers() {
    return usersRepository.listAll().map(rowToPublicUser);
  }
};
