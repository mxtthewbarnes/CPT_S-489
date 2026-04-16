import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import listingsRoutes from './routes/listings.js';
import notificationsRoutes from './routes/notifications.js';
import ordersRoutes from './routes/orders.js';
import profileRoutes from './routes/profile.js';
import sellerRoutes from './routes/seller.js';
import wishlistRoutes from './routes/wishlist.js';

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
  }),
);
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

export default app;
