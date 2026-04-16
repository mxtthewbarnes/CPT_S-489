import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/index.js';
import { serializeNotification } from '../utils/serializers.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({ notifications: notifications.map(serializeNotification) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    notification.readAt = new Date();
    await notification.save();

    return res.json({ notification: serializeNotification(notification) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.update(
      { readAt: new Date() },
      {
        where: { userId: req.user.id, readAt: null },
      },
    );

    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({ notifications: notifications.map(serializeNotification) });
  } catch (error) {
    return next(error);
  }
});

export default router;
