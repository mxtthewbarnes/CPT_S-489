import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Listing, User } from '../models/index.js';
import { serializeListing, serializeUser } from '../utils/serializers.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

async function hideListingsForAccount(userId) {
  await Listing.update(
    { status: 'hidden', hiddenByAccountStatus: true },
    {
      where: { sellerId: userId, status: 'active' },
    },
  );
}

async function restoreListingsForAccount(userId) {
  await Listing.update(
    { status: 'active', hiddenByAccountStatus: false },
    {
      where: { sellerId: userId, status: 'hidden', hiddenByAccountStatus: true },
    },
  );
}

router.use(requireAuth, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ users: users.map(serializeUser) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const status = req.body.status;
    const reason = String(req.body.reason || '').trim();
    const note = String(req.body.note || '').trim() || null;
    const durationDays = Number(req.body.durationDays || 0);

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active, suspended, or banned.' });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (status !== 'active' && user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be banned or suspended through this interface.' });
    }

    if (status === 'suspended' && (![1, 7, 30].includes(durationDays) || !reason)) {
      return res.status(400).json({ message: 'Suspensions require a reason and a duration of 1, 7, or 30 days.' });
    }

    if (status === 'banned' && !reason) {
      return res.status(400).json({ message: 'Bans require a reason.' });
    }

    user.status = status;
    user.statusReason = status === 'active' ? null : reason;
    user.statusNote = status === 'active' ? null : note;
    user.suspensionEndsAt =
      status === 'suspended' ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;
    await user.save();

    if (status === 'active') {
      await restoreListingsForAccount(user.id);
      await createNotification({
        userId: user.id,
        type: 'account',
        title: 'Account restored',
        message: 'An admin restored your account access.',
        link: user.role === 'seller' ? '/seller' : '/dashboard',
      });
    } else {
      await hideListingsForAccount(user.id);
      await createNotification({
        userId: user.id,
        type: 'account',
        title: status === 'banned' ? 'Account banned' : 'Account suspended',
        message:
          status === 'banned'
            ? `Your account was banned for: ${reason}.`
            : `Your account was suspended for ${durationDays} day(s). Reason: ${reason}.`,
        link: '/',
      });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/listings', async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      include: [{ model: User, as: 'seller' }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ listings: listings.map(serializeListing) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/listings/:id/status', async (req, res, next) => {
  try {
    const status = req.body.status;
    const reason = String(req.body.reason || '').trim();
    const note = String(req.body.note || '').trim() || null;

    if (!['active', 'hidden', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active, hidden, or removed.' });
    }

    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller' }],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (listing.status === 'sold') {
      return res.status(400).json({ message: 'Sold listings cannot be moderated.' });
    }

    if (status === 'removed' && !reason) {
      return res.status(400).json({ message: 'Removing a listing requires a reason.' });
    }

    if (status === 'active' && listing.hiddenByAccountStatus) {
      return res
        .status(400)
        .json({ message: 'This listing is hidden because the seller account is restricted.' });
    }

    const hadAdminModeration = Boolean(listing.adminReason || listing.adminNote || listing.status === 'removed');

    listing.status = status;
    listing.adminReason = status === 'removed' ? reason : null;
    listing.adminNote = status === 'removed' ? note : null;
    await listing.save();

    if (status === 'removed') {
      await createNotification({
        userId: listing.sellerId,
        type: 'listing',
        title: 'Listing removed by admin',
        message: `Your listing "${listing.title}" was removed. Reason: ${reason}.`,
        link: '/seller',
      });
    }

    if (status === 'hidden') {
      await createNotification({
        userId: listing.sellerId,
        type: 'listing',
        title: 'Listing hidden by admin',
        message: `Your listing "${listing.title}" was hidden from the marketplace.`,
        link: '/seller',
      });
    }

    if (status === 'active' && hadAdminModeration) {
      await createNotification({
        userId: listing.sellerId,
        type: 'listing',
        title: 'Listing restored',
        message: `Your listing "${listing.title}" is active again.`,
        link: '/seller',
      });
    }

    return res.json({ listing: serializeListing(listing) });
  } catch (error) {
    return next(error);
  }
});

export default router;
