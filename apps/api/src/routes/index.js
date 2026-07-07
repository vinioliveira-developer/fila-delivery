import { adminController } from "../controllers/adminController.js";
import { authController } from "../controllers/authController.js";
import { ordersController } from "../controllers/ordersController.js";
import { platformsController } from "../controllers/platformsController.js";
import { systemController } from "../controllers/systemController.js";

export const routes = [
  { method: "GET", path: "/health", handler: systemController.health },
  { method: "GET", path: "/ready", handler: systemController.ready },
  { method: "GET", path: "/version", handler: systemController.version },
  { method: "GET", path: "/api/version", handler: systemController.version },

  { method: "POST", path: "/api/auth/login", handler: authController.login },
  { method: "POST", path: "/api/auth/logout", auth: "ANY", handler: authController.logout },
  { method: "POST", path: "/api/auth/password/forgot", handler: authController.requestPasswordReset },
  { method: "POST", path: "/api/auth/password/validate", handler: authController.validatePasswordReset },
  { method: "POST", path: "/api/auth/password/reset", handler: authController.resetPassword },
  { method: "GET", path: "/api/me", auth: "ANY", handler: authController.me },

  { method: "GET", path: "/api/platforms", auth: "CLIENT", handler: platformsController.list },
  { method: "POST", path: "/api/platforms", auth: "CLIENT", handler: platformsController.create },
  { method: "DELETE", path: "/api/platforms/:name", auth: "CLIENT", handler: platformsController.remove },

  { method: "GET", path: "/api/orders", auth: "CLIENT", handler: ordersController.list },
  { method: "POST", path: "/api/orders", auth: "CLIENT", handler: ordersController.create },
  { method: "PATCH", path: "/api/orders/:id", auth: "CLIENT", handler: ordersController.updateStatus },
  { method: "DELETE", path: "/api/orders/finalized", auth: "CLIENT", handler: ordersController.clearFinalized },

  { method: "GET", path: "/api/admin/dashboard", auth: "ADMIN", handler: adminController.dashboard },
  { method: "GET", path: "/api/admin/restaurants", auth: "ADMIN", handler: adminController.listRestaurants },
  { method: "GET", path: "/api/admin/restaurants/:id", auth: "ADMIN", handler: adminController.getRestaurant },
  { method: "POST", path: "/api/admin/restaurants", auth: "ADMIN", handler: adminController.createRestaurant },
  { method: "PUT", path: "/api/admin/restaurants/:id", auth: "ADMIN", handler: adminController.updateRestaurant },
  { method: "PATCH", path: "/api/admin/restaurants/:id", auth: "ADMIN", handler: adminController.updateRestaurant },
  { method: "DELETE", path: "/api/admin/restaurants/:id", auth: "ADMIN", handler: adminController.deleteRestaurant },
  { method: "GET", path: "/api/admin/users", auth: "ADMIN", handler: adminController.listUsers },
  { method: "GET", path: "/api/admin/plans", auth: "ADMIN", handler: adminController.listPlans }
];
