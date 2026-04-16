import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { CartItem, Listing, Order, OrderItem, User, sequelize } from '../models/index.js';
import { createNotification } from '../utils/notifications.js';
import { serializeOrder } from '../utils/serializers.js';

const router = express.Router();

async function loadOrder(orderId) {
  return Order.findByPk(orderId, {
    include: [
      { model: User, as: 'buyer' },
      {
        model: OrderItem,
        as: 'items',
        include: [
          { model: User, as: 'seller' },
          {
            model: Listing,
            as: 'listing',
            include: [{ model: User, as: 'seller' }],
          },
        ],
      },
    ],
    order: [[{ model: OrderItem, as: 'items' }, 'createdAt', 'ASC']],
  });
}

router.use(requireAuth);

router.get('/mine', requireRole('buyer', 'seller'), async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [
        { model: User, as: 'buyer' },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: User, as: 'seller' },
            {
              model: Listing,
              as: 'listing',
              include: [{ model: User, as: 'seller' }],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    return next(error);
  }
});

router.post('/checkout', requireRole('buyer', 'seller'), async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Listing, as: 'listing' }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cartItems.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const unavailableItem = cartItems.find((item) => item.listing?.status !== 'active');

    if (unavailableItem) {
      await transaction.rollback();
      return res.status(400).json({ message: 'One or more items in your cart are no longer available.' });
    }

    const total = cartItems.reduce((sum, item) => sum + Number(item.listing.price) * item.quantity, 0);
    const order = await Order.create(
      {
        buyerId: req.user.id,
        total: total.toFixed(2),
        status: 'placed',
      },
      { transaction },
    );

    await OrderItem.bulkCreate(
      cartItems.map((item) => ({
        orderId: order.id,
        listingId: item.listingId,
        sellerId: item.listing.sellerId,
        quantity: item.quantity,
        titleSnapshot: item.listing.title,
        priceSnapshot: item.listing.price,
      })),
      { transaction },
    );

    await Listing.update(
      { status: 'sold' },
      {
        where: { id: cartItems.map((item) => item.listingId) },
        transaction,
      },
    );

    await CartItem.destroy({
      where: { userId: req.user.id },
      transaction,
    });

    await transaction.commit();

    const hydratedOrder = await loadOrder(order.id);

    await Promise.all(
      hydratedOrder.items.map((item) =>
        createNotification({
          userId: item.sellerId,
          type: 'order',
          title: 'Item sold',
          message: `Order #${hydratedOrder.id} includes "${item.titleSnapshot}".`,
          link: '/seller',
        }),
      ),
    );

    return res.status(201).json({ order: serializeOrder(hydratedOrder) });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await loadOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const isOwner = ['buyer', 'seller'].includes(req.user.role) && order.buyerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isSellerOnOrder = req.user.role === 'seller' && order.items.some((item) => item.sellerId === req.user.id);

    if (!isOwner && !isAdmin && !isSellerOnOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

export default router;
