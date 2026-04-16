import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Listing, Order, OrderItem, User } from '../models/index.js';
import { serializeListing, serializeSellerOrderLine } from '../utils/serializers.js';

const router = express.Router();

function normalizeListingPayload(body) {
  const rawPrice = body.price === '' || body.price === null || body.price === undefined ? null : Number(body.price);

  return {
    title: String(body.title || '').trim() || null,
    category: String(body.category || '').trim() || null,
    school: String(body.school || '').trim() || null,
    price: Number.isNaN(rawPrice) ? null : rawPrice,
    size: String(body.size || '').trim() || null,
    condition: String(body.condition || '').trim() || null,
    description: String(body.description || '').trim() || null,
    imageUrl: String(body.imageUrl || '').trim() || null,
    status: body.status === 'draft' ? 'draft' : 'active',
  };
}

function validateListingPayload(payload, status = payload.status) {
  if (status === 'draft') {
    return null;
  }

  if (
    !payload.title ||
    !payload.category ||
    !payload.school ||
    !payload.size ||
    !payload.condition ||
    !payload.description ||
    !payload.imageUrl
  ) {
    return 'Active listings require a title, category, school, size, condition, description, and photo.';
  }

  if (payload.price === null || Number.isNaN(payload.price) || payload.price <= 0) {
    return 'Price must be greater than 0.';
  }

  return null;
}

async function findSellerListing(id, sellerId) {
  return Listing.findOne({
    where: { id, sellerId },
    include: [{ model: User, as: 'seller' }],
  });
}

router.use(requireAuth, requireRole('seller'));

router.get('/listings', async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      where: { sellerId: req.user.id },
      include: [{ model: User, as: 'seller' }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ listings: listings.map(serializeListing) });
  } catch (error) {
    return next(error);
  }
});

router.post('/listings', async (req, res, next) => {
  try {
    const payload = normalizeListingPayload(req.body);
    const error = validateListingPayload(payload);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const listing = await Listing.create({
      ...payload,
      price: payload.price === null ? null : payload.price.toFixed(2),
      status: payload.status,
      sellerId: req.user.id,
    });

    const hydrated = await findSellerListing(listing.id, req.user.id);
    return res.status(201).json({ listing: serializeListing(hydrated) });
  } catch (error) {
    return next(error);
  }
});

router.put('/listings/:id', async (req, res, next) => {
  try {
    const listing = await findSellerListing(req.params.id, req.user.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (listing.status === 'sold' || listing.status === 'removed') {
      return res.status(400).json({ message: 'That listing can no longer be edited.' });
    }

    const payload = normalizeListingPayload(req.body);
    const nextStatus = payload.status === 'draft' ? 'draft' : listing.status === 'draft' ? 'active' : listing.status;
    const error = validateListingPayload(payload, nextStatus);

    if (error) {
      return res.status(400).json({ message: error });
    }

    await listing.update({
      ...payload,
      price: payload.price === null ? null : payload.price.toFixed(2),
      status: nextStatus,
    });

    return res.json({ listing: serializeListing(listing) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/listings/:id/status', async (req, res, next) => {
  try {
    const listing = await findSellerListing(req.params.id, req.user.id);
    const status = req.body.status;

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (!['active', 'hidden', 'sold'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active, hidden, or sold.' });
    }

    if (listing.status === 'sold' || listing.status === 'removed') {
      return res.status(400).json({ message: 'Sold listings cannot change status.' });
    }

    if (status === 'active') {
      const validationError = validateListingPayload(listing.get({ plain: true }), 'active');

      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
    }

    listing.status = status;
    listing.hiddenByAccountStatus = false;
    await listing.save();

    return res.json({ listing: serializeListing(listing) });
  } catch (error) {
    return next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orderItems = await OrderItem.findAll({
      where: { sellerId: req.user.id },
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: User, as: 'buyer' }],
        },
        {
          model: Listing,
          as: 'listing',
          include: [{ model: User, as: 'seller' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const items = orderItems
      .map(serializeSellerOrderLine)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

export default router;
