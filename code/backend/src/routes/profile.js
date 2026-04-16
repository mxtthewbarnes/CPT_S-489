import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { serializeUser } from '../utils/serializers.js';

const router = express.Router();

router.use(requireAuth);

router.patch('/', async (req, res, next) => {
  try {
    req.user.university = String(req.body.university || '').trim() || null;
    await req.user.save();

    return res.json({ user: serializeUser(req.user) });
  } catch (error) {
    return next(error);
  }
});

export default router;
