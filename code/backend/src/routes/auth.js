import bcrypt from 'bcryptjs';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { buildSession, serializeUser } from '../utils/serializers.js';
import { buildStatusMessage, refreshUserStatus } from '../utils/user-status.js';

const router = express.Router();

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

router.post('/register', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const role = req.body.role;
    const university = String(req.body.university || '').trim() || null;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Only buyer or seller accounts can be registered here.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, status: 'active', university });

    return res.status(201).json(buildSession(user));
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await refreshUserStatus(user);

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: buildStatusMessage(user) });
    }

    return res.json(buildSession(user));
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

export default router;
