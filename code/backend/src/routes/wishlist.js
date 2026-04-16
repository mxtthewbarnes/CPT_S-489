import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Listing, User, WishlistItem } from '../models/index.js';
import { serializeListing } from '../utils/serializers.js';

const router = express.Router();

async function loadWishlist(userId) {
  const items = await WishlistItem.findAll({
    where: { userId },
    include: [
      {
        model: Listing,
        as: 'listing',
        include: [{ model: User, as: 'seller' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return items
    .map((item) => item.listing)
    .filter(Boolean)
    .map(serializeListing);
}

router.use(requireAuth, requireRole('buyer', 'seller'));

router.get('/', async (req, res, next) => {
  try {
    return res.json({ listings: await loadWishlist(req.user.id) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const listingId = Number(req.body.listingId);

    if (!listingId) {
      return res.status(400).json({ message: 'A listing is required.' });
    }

    const listing = await Listing.findByPk(listingId);

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ message: 'That listing is not available.' });
    }

    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ message: 'You cannot save your own listing.' });
    }

    await WishlistItem.findOrCreate({
      where: { userId: req.user.id, listingId },
      defaults: { userId: req.user.id, listingId },
    });

    return res.status(201).json({ listings: await loadWishlist(req.user.id) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:listingId', async (req, res, next) => {
  try {
    await WishlistItem.destroy({
      where: {
        userId: req.user.id,
        listingId: req.params.listingId,
      },
    });

    return res.json({ listings: await loadWishlist(req.user.id) });
  } catch (error) {
    return next(error);
  }
});

export default router;
