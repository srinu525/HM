import pg from 'pg';
import 'dotenv/config';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();
const res = await client.query(`SELECT id, email, role, "isActive" FROM "User" WHERE email = $1`, ['admin@hospital.com']);
console.log(JSON.stringify(res.rows));
await client.end();
