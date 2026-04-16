import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(user) {
  return jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
