import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { CartItem, Listing, User } from '../models/index.js';
import { serializeCartItem } from '../utils/serializers.js';

const router = express.Router();

async function loadCartItems(userId) {
  return CartItem.findAll({
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
}

router.use(requireAuth, requireRole('buyer', 'seller'));

router.get('/', async (req, res, next) => {
  try {
    const items = await loadCartItems(req.user.id);
    return res.json({ items: items.map(serializeCartItem) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const listingId = Number(req.body.listingId);
    const quantity = Number(req.body.quantity || 1);

    if (!listingId || quantity < 1) {
      return res.status(400).json({ message: 'A valid listing and quantity are required.' });
    }

    const listing = await Listing.findByPk(listingId);

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ message: 'That listing is not available.' });
    }

    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ message: 'You cannot add your own listing to the cart.' });
    }

    const existing = await CartItem.findOne({
      where: { userId: req.user.id, listingId },
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await CartItem.create({ userId: req.user.id, listingId, quantity });
    }

    const items = await loadCartItems(req.user.id);
    return res.status(201).json({ items: items.map(serializeCartItem) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:itemId', async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const item = await CartItem.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    item.quantity = quantity;
    await item.save();

    const items = await loadCartItems(req.user.id);
    return res.json({ items: items.map(serializeCartItem) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:itemId', async (req, res, next) => {
  try {
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, userId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await item.destroy();

    const items = await loadCartItems(req.user.id);
    return res.json({ items: items.map(serializeCartItem) });
  } catch (error) {
    return next(error);
  }
});

export default router;
