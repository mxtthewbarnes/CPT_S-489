import { Notification } from '../models/index.js';

export async function createNotification({ userId, type = 'system', title, message, link = null }) {
  if (!userId || !title || !message) {
    return null;
  }

  return Notification.create({
    userId,
    type,
    title,
    message,
    link,
  });
}
