const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function main() {
  const connection = await mysql.createConnection({ host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password, multipleStatements: true });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.database.replace(/`/g, '')}\``);
  await connection.changeUser({ database: env.db.database });
  await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  const files = fs.readdirSync(path.join(__dirname, '../migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const [applied] = await connection.query('SELECT id FROM schema_migrations WHERE id = ?', [file]);
    if (applied.length) continue;
    const sql = fs.readFileSync(path.join(__dirname, '../migrations', file), 'utf8');
    await connection.query(sql);
    await connection.query('INSERT INTO schema_migrations (id) VALUES (?)', [file]);
    console.log(`Applied ${file}`);
  }
  await connection.end();
}

main().catch(err => { console.error(err); process.exit(1); });
