'use strict';
const jwt = require('jsonwebtoken');
const { createError } = require('./errorMiddleware');

// Fail fast at startup if secret is missing — never silently degrade to a weak default
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required but not set');
}

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header'));
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    next(createError(401, 'INVALID_TOKEN', 'Token is invalid or expired'));
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    next(createError(403, 'FORBIDDEN', 'Requires admin privileges'));
  }
};

module.exports = { authMiddleware, adminMiddleware };
