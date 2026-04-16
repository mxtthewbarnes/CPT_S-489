import { User } from '../models/index.js';
import { verifyToken } from '../utils/auth.js';
import { buildStatusMessage, refreshUserStatus } from '../utils/user-status.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = verifyToken(match[1]);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid session.' });
    }

    await refreshUserStatus(user);

    if (user.status !== 'active') {
      return res.status(403).json({ message: buildStatusMessage(user) });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource.' });
    }

    return next();
  };
}
