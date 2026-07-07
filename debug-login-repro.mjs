import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const API_URL = 'http://127.0.0.1:3333/api';
const DB_PATH = resolve('apps/api/data/fila-delivery.sqlite');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body, headers: Object.fromEntries(response.headers.entries()) };
}

function log(name, value) {
  console.log(`=== ${name} ===`);
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
}

async function main() {
  console.log('DB_PATH', DB_PATH);

  const adminEmail = 'admin@filadelivery.com.br';
  const adminPassword = 'SenhaAdmin@123';

  log('ADMIN LOGIN PAYLOAD', { email: adminEmail, password: adminPassword });
  let result = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  log('ADMIN LOGIN RESPONSE', result);

  if (result.status !== 200) {
    console.error('Admin login failed. Aborting reproduction.');
    return;
  }

  const adminToken = result.body.token;
  const email = `cliente-debug-${Date.now()}@filadelivery.test`;
  const password = `SenhaCliente@${Date.now()}`;
  const restaurantName = `Restaurante Debug ${Date.now()}`;

  log('CREATE RESTAURANT PAYLOAD', {
    name: restaurantName,
    cnpj: '00.000.000/0000-00',
    phone: '11999999999',
    email,
    initialPassword: password,
    plan: 'Mensal',
    status: 'Ativo',
    expiresAt: '2027-12-31'
  });

  result = await request('/admin/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: restaurantName,
      cnpj: '00.000.000/0000-00',
      phone: '11999999999',
      email,
      initialPassword: password,
      plan: 'Mensal',
      status: 'Ativo',
      expiresAt: '2027-12-31'
    })
  });
  log('CREATE RESTAURANT RESPONSE', result);

  const db = new DatabaseSync(DB_PATH);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  log('DB USER ROW', user);
  const restaurant = user ? db.prepare('SELECT * FROM restaurants WHERE id = ?').get(user.restaurant_id) : null;
  log('DB RESTAURANT ROW', restaurant);

  log('RESTAURANT LOGIN PAYLOAD', { email, password });
  result = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  log('RESTAURANT LOGIN RESPONSE', result);
}

main().catch((err) => {
  console.error('ERROR', err);
  process.exit(1);
});
