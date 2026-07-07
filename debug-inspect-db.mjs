import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = resolve('apps/api/data/fila-delivery.sqlite');
const db = new DatabaseSync(dbPath);

console.log('DB PATH:', dbPath);
console.log('ADMIN USER:', db.prepare("SELECT id, email, role, active, password, created_at FROM users WHERE role='ADMIN'").get());
console.log('CLIENT USERS:', db.prepare("SELECT id, email, role, active, restaurant_id, created_at FROM users WHERE role = 'CLIENT' ORDER BY created_at DESC LIMIT 10").all());
console.log('RESTAURANTS:', db.prepare('SELECT id, name, email, status, expires_at, created_at FROM restaurants ORDER BY created_at DESC LIMIT 10').all());
console.log('USER TABLE COUNT:', db.prepare('SELECT COUNT(*) AS total FROM users').get());
console.log('RESTAURANT TABLE COUNT:', db.prepare('SELECT COUNT(*) AS total FROM restaurants').get());
