import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const API_URL = 'http://127.0.0.1:3333/api';
const DB_PATH = resolve('apps/api/data/fila-delivery.sqlite');

function log(...args) {
  console.log(...args);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function main() {
  log('Using DB:', DB_PATH);

  log('\n1/6: login admin');
  const adminEmail = 'admin@filadelivery.com.br';
  const adminPassword = 'SenhaAdmin@123';
  let result = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  log('admin login status', result.status);
  log('admin login body', JSON.stringify(result.body, null, 2));

  if (result.status !== 200) {
    throw new Error('Admin login failed, cannot proceed');
  }

  const adminToken = result.body.token;
  const email = `cliente-debug-${Date.now()}@filadelivery.test`;
  const password = `SenhaCliente@${Date.now()}`;

  log('\n2/6: create restaurant');
  result = await request('/admin/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: `Restaurante Debug ${Date.now()}`,
      cnpj: '00.000.000/0000-00',
      phone: '11999999999',
      email,
      initialPassword: password,
      plan: 'Mensal',
      status: 'Ativo',
      expiresAt: '2027-12-31'
    })
  });
  log('create restaurant status', result.status);
  log('create restaurant body', JSON.stringify(result.body, null, 2));

  log('\n3/6: inspect DB user row');
  const db = new DatabaseSync(DB_PATH);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  log('db user row', user);
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(user.restaurant_id);
  log('db restaurant row', restaurant);

  log('\n4/6: login new restaurant');
  result = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  log('restaurant login status', result.status);
  log('restaurant login body', JSON.stringify(result.body, null, 2));

  if (result.status !== 200) {
    log('\n5/6: login failed, inspect user record and flow');
  } else {
    log('\n5/6: login succeeded');
  }
}

main().catch((error) => {
  console.error('ERROR', error);
  process.exit(1);
});
