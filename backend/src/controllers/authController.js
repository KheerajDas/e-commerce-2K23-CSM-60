const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError(400, 'VALIDATION_ERROR', 'email and password are required');

  const [rows] = await db.execute('SELECT id, email, password_hash, role, active_status FROM admins WHERE email = ?', [email]);
  const admin = rows[0];
  if (!admin || !admin.active_status || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = jwt.sign({ sub: admin.id, email: admin.email, role: admin.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ data: { token, tokenType: 'Bearer', expiresIn: env.jwtExpiresIn } });
}

module.exports = { login };
