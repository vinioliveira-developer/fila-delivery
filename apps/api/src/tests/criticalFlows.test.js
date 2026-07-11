import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const apiRoot = fileURLToPath(new URL("../../", import.meta.url));
const port = 43000 + Math.floor(Math.random() * 1000);
const databasePath = resolve(apiRoot, `data/critical-flow-${Date.now()}.sqlite`);
const backupDir = resolve(apiRoot, "backups/test");
const baseUrl = `http://127.0.0.1:${port}`;
const adminEmail = `admin-${Date.now()}@filadelivery.test`;
const adminPassword = "SenhaAdmin@123";

mkdirSync(resolve(apiRoot, "data"), { recursive: true });

const server = spawn(
  process.execPath,
  ["--experimental-sqlite", "src/server.js"],
  {
    cwd: apiRoot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      DATABASE_PATH: databasePath,
      BACKUP_DIR: backupDir,
      CORS_ORIGIN: "http://localhost:5173,http://localhost:5174",
      FILA_DELIVERY_TOKEN_SECRET: "test-secret-with-more-than-32-characters",
      SEED_ADMIN_EMAIL: adminEmail,
      SEED_ADMIN_PASSWORD: adminPassword
    },
    stdio: ["ignore", "pipe", "pipe"]
  }
);

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

async function stopServer() {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");
  await new Promise((resolveClose) => {
    const timer = setTimeout(resolveClose, 2000);
    server.once("close", () => {
      clearTimeout(timer);
      resolveClose();
    });
  });
}

async function waitForHealth() {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 150));
    }
  }

  throw new Error(`API nao ficou saudavel. Logs: ${output}`);
}

async function request(path, { method = "GET", token, body, origin } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function expectSuccess(path, options) {
  const result = await request(path, options);
  assert.equal(
    result.response.ok,
    true,
    `${path} deveria retornar sucesso: ${JSON.stringify(result.payload)}`
  );
  assert.equal(result.payload.success, true);
  assert.ok(result.response.headers.get("x-request-id"));
  return result.payload.data;
}

async function expectStatus(path, status, options) {
  const result = await request(path, options);
  assert.equal(
    result.response.status,
    status,
    `${path} deveria retornar ${status}: ${JSON.stringify(result.payload)}`
  );
  assert.equal(result.payload.success, false);
  return result.payload;
}

async function login(email, password) {
  const data = await expectSuccess("/api/auth/login", {
    method: "POST",
    body: { email, password }
  });
  assert.ok(data.token);
  assert.ok(data.user);
  return data;
}

async function createRestaurant(adminToken, suffix) {
  const email = `cliente-${suffix}-${Date.now()}@filadelivery.test`;
  const password = `SenhaCliente@${suffix}123`;
  const data = await expectSuccess("/api/admin/restaurants", {
    method: "POST",
    token: adminToken,
    body: {
      name: `Restaurante ${suffix}`,
      cnpj: `00.000.000/000${suffix}-00`,
      phone: "11999999999",
      email,
      initialPassword: password,
      plan: "Mensal",
      status: "Ativo",
      expiresAt: "2027-12-31"
    }
  });

  assert.ok(data.restaurant.id);
  return { restaurant: data.restaurant, email, password };
}

try {
  await waitForHealth();

  const health = await expectSuccess("/health");
  assert.equal(health.status, "online");
  assert.equal(health.database, "connected");

  const localCors = await request("/health", { origin: "http://localhost:5174" });
  assert.equal(
    localCors.response.headers.get("access-control-allow-origin"),
    "http://localhost:5174"
  );

  const blockedCors = await request("/health", { origin: "http://localhost:9999" });
  assert.equal(blockedCors.response.headers.get("access-control-allow-origin"), null);

  const ready = await expectSuccess("/ready");
  assert.equal(ready.ready, true);

  const version = await expectSuccess("/version");
  assert.equal(version.name, "Fila Delivery");

  const admin = await login(adminEmail, adminPassword);
  assert.equal(admin.user.role, "ADMIN");

  const adminDashboard = await expectSuccess("/api/admin/dashboard", {
    token: admin.token
  });
  assert.ok("activeClients" in adminDashboard);

  const clientASeed = await createRestaurant(admin.token, "A");
  const clientBSeed = await createRestaurant(admin.token, "B");
  const removableSeed = await createRestaurant(admin.token, "DELETE");

  const usersAfterCreate = await expectSuccess("/api/admin/users", { token: admin.token });
  const clientAUser = usersAfterCreate.users.find(
    (user) => user.email === clientASeed.restaurant.email.toLowerCase()
  );
  assert.ok(clientAUser);
  assert.equal(clientAUser.role, "CLIENT");
  assert.equal(clientAUser.restaurantName, clientASeed.restaurant.name);

  const restaurantDetail = await expectSuccess(`/api/admin/restaurants/${clientASeed.restaurant.id}`, {
    token: admin.token
  });
  assert.equal(restaurantDetail.restaurant.name, clientASeed.restaurant.name);

  const updatedRestaurant = await expectSuccess(`/api/admin/restaurants/${clientASeed.restaurant.id}`, {
    method: "PUT",
    token: admin.token,
    body: {
      name: "Restaurante A Atualizado",
      cnpj: clientASeed.restaurant.cnpj,
      phone: clientASeed.restaurant.phone,
      email: clientASeed.restaurant.email,
      plan: "Mensal",
      status: "Ativo",
      expiresAt: "2027-12-31"
    }
  });
  assert.equal(updatedRestaurant.restaurant.name, "Restaurante A Atualizado");

  const usersAfterUpdate = await expectSuccess("/api/admin/users", { token: admin.token });
  const updatedUser = usersAfterUpdate.users.find(
    (user) => user.email === updatedRestaurant.restaurant.email.toLowerCase()
  );
  assert.ok(updatedUser);
  assert.equal(updatedUser.name, "Restaurante A Atualizado");

  await expectSuccess(`/api/admin/restaurants/${removableSeed.restaurant.id}`, {
    method: "DELETE",
    token: admin.token
  });
  const remainingRestaurants = await expectSuccess("/api/admin/restaurants", { token: admin.token });
  assert.equal(
    remainingRestaurants.restaurants.some((restaurant) => restaurant.id === removableSeed.restaurant.id),
    false
  );

  const usersAfterDelete = await expectSuccess("/api/admin/users", { token: admin.token });
  const deletedUser = usersAfterDelete.users.find(
    (user) => user.email === removableSeed.restaurant.email.toLowerCase()
  );
  assert.equal(deletedUser, undefined);

  const clientA = await login(clientASeed.email, clientASeed.password);
  const clientB = await login(clientBSeed.email, clientBSeed.password);
  assert.equal(clientA.user.role, "CLIENT");

  await expectStatus("/api/admin/dashboard", 403, { token: clientA.token });

  await expectSuccess("/api/platforms", {
    method: "POST",
    token: clientA.token,
    body: { name: "IFOOD" }
  });

  const platforms = await expectSuccess("/api/platforms", { token: clientA.token });
  assert.deepEqual(platforms.platforms, ["IFOOD"]);

  const orderData = await expectSuccess("/api/orders", {
    method: "POST",
    token: clientA.token,
    body: { number: "1001", platform: "IFOOD" }
  });
  const order = orderData.order;
  assert.equal(order.status, "EM_PREPARO");

  await expectStatus("/api/orders", 409, {
    method: "POST",
    token: clientA.token,
    body: { number: "1001", platform: "IFOOD" }
  });

  const readyOrder = await expectSuccess(`/api/orders/${order.id}`, {
    method: "PATCH",
    token: clientA.token,
    body: { status: "PRONTO" }
  });
  assert.equal(readyOrder.order.status, "PRONTO");

  const deliveredOrder = await expectSuccess(`/api/orders/${order.id}`, {
    method: "PATCH",
    token: clientA.token,
    body: { status: "ENTREGUE" }
  });
  assert.equal(deliveredOrder.order.status, "ENTREGUE");

  const manualReadyOrder = await expectSuccess("/api/orders", {
    method: "POST",
    token: clientA.token,
    body: { number: "1002", platform: "IFOOD", status: "PRONTO" }
  });
  assert.equal(manualReadyOrder.order.status, "PRONTO");
  assert.ok(manualReadyOrder.order.readyAt);

  await expectSuccess(`/api/orders/${manualReadyOrder.order.id}`, {
    method: "PATCH",
    token: clientA.token,
    body: { status: "CANCELADO" }
  });

  await expectSuccess("/api/orders/finalized", {
    method: "DELETE",
    token: clientA.token
  });
  const afterSoftDelete = await expectSuccess("/api/orders", { token: clientA.token });
  assert.equal(afterSoftDelete.orders.length, 0);

  const isolatedOrder = await expectSuccess("/api/orders", {
    method: "POST",
    token: clientA.token,
    body: { number: "2002", platform: "IFOOD" }
  });

  await expectStatus(`/api/orders/${isolatedOrder.order.id}`, 404, {
    method: "PATCH",
    token: clientB.token,
    body: { status: "PRONTO" }
  });

  const forgot = await expectSuccess("/api/auth/password/forgot", {
    method: "POST",
    body: { email: clientASeed.email }
  });
  assert.ok(forgot.resetToken);

  const validation = await expectSuccess("/api/auth/password/validate", {
    method: "POST",
    body: { token: forgot.resetToken }
  });
  assert.equal(validation.valid, true);

  const newPassword = "SenhaNova@123";
  await expectSuccess("/api/auth/password/reset", {
    method: "POST",
    body: { token: forgot.resetToken, password: newPassword }
  });

  await expectStatus("/api/me", 401, { token: clientA.token });
  const clientAAfterReset = await login(clientASeed.email, newPassword);

  await expectSuccess("/api/auth/logout", {
    method: "POST",
    token: clientAAfterReset.token
  });
  await expectStatus("/api/me", 401, { token: clientAAfterReset.token });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await expectStatus("/api/auth/login", 401, {
      method: "POST",
      body: { email: "nao-existe@filadelivery.test", password: "errada" }
    });
  }
  await expectStatus("/api/auth/login", 429, {
    method: "POST",
    body: { email: "nao-existe@filadelivery.test", password: "errada" }
  });

  process.stdout.write("Critical API flows passed.\n");
} finally {
  await stopServer();
}
