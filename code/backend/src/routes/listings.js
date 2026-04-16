import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Listing, User } from '../models/index.js';
import { serializeListing } from '../utils/serializers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const where = { status: 'active' };

    if (req.query.school) {
      where.school = req.query.school;
    }

    const listings = await Listing.findAll({
      where,
      include: [{ model: User, as: 'seller' }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ listings: listings.map(serializeListing) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller' }],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const canViewHidden = req.user.role === 'admin' || req.user.id === listing.sellerId;

    if (listing.status !== 'active' && !canViewHidden) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    return res.json({ listing: serializeListing(listing) });
  } catch (error) {
    return next(error);
  }
});

export default router;
