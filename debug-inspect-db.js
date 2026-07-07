import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = resolve('apps/api/data/fila-delivery.sqlite');
const db = new DatabaseSync(dbPath);

console.log('DB PATH:', dbPath);

const admin = db.prepare("SELECT id, email, role, active, password FROM users WHERE role='ADMIN'").get();
console.log('ADMIN:', admin);

const countUsers = db.prepare('SELECT COUNT(*) AS total FROM users').get();
console.log('TOTAL USERS:', countUsers);

const sample = db.prepare('SELECT id, email, role, active, restaurant_id FROM users ORDER BY created_at DESC LIMIT 10').all();
console.log('LATEST USERS:', sample);
