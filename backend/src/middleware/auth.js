const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication token is required'));
  try {
    req.user = jwt.verify(header.slice(7), env.jwtSecret);
    next();
  } catch (_err) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Invalid or expired authentication token'));
  }
}

function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') return next(new AppError(403, 'FORBIDDEN', 'Administrator access is required'));
  next();
}

module.exports = { authenticate, requireAdmin };
