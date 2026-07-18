import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres.giuvtlxvcunuzxsfnlhi:Ratnam23242526@aws-1-ap-south-1.pooler.supabase.com:5432/postgres",
});

await client.connect();
const res = await client.query('SELECT id, email, role, "isActive" FROM "User" WHERE email = $1', ['admin@hospital.com']);
console.log(res.rows);
await client.end();
