import fetch from 'node-fetch';

async function main() {
  const base = 'http://localhost:3333/api';

  // Login
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@filadelivery.com.br', password: 'admin123' })
  });
  console.log('login status', loginRes.status);
  const loginBody = await loginRes.text();
  console.log('login body', loginBody);

  if (loginRes.ok) {
    const token = JSON.parse(loginBody).data.token;
    console.log('token', token);

    const plansRes = await fetch(`${base}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('plans status', plansRes.status);
    console.log('plans body', await plansRes.text());

    const restRes = await fetch(`${base}/admin/restaurants`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('restaurants status', restRes.status);
    console.log('restaurants body', await restRes.text());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
