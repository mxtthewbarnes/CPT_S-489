import fs from 'node:fs';
import path from 'node:path';
import { DataTypes, Sequelize } from 'sequelize';
import { config } from '../config.js';

const storageDirectory = path.dirname(config.dbStorage);

if (!fs.existsSync(storageDirectory)) {
  fs.mkdirSync(storageDirectory, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.dbStorage,
  logging: false,
});

export const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    allowNull: false,
    defaultValue: 'active',
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statusReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statusNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  suspensionEndsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export const Listing = sequelize.define('Listing', {
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'hidden', 'sold', 'removed'),
    allowNull: false,
    defaultValue: 'active',
  },
  adminReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hiddenByAccountStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export const CartItem = sequelize.define(
  'CartItem',
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'listingId'],
      },
    ],
  },
);

export const Order = sequelize.define('Order', {
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('placed'),
    allowNull: false,
    defaultValue: 'placed',
  },
});

export const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  titleSnapshot: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priceSnapshot: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
});

export const WishlistItem = sequelize.define(
  'WishlistItem',
  {},
  {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'listingId'],
      },
    ],
  },
);

export const Notification = sequelize.define('Notification', {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'system',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

User.hasMany(Listing, { as: 'sellerListings', foreignKey: 'sellerId' });
Listing.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

User.hasMany(CartItem, { as: 'cartItems', foreignKey: 'userId' });
CartItem.belongsTo(User, { as: 'buyer', foreignKey: 'userId' });
Listing.hasMany(CartItem, { as: 'cartItems', foreignKey: 'listingId' });
CartItem.belongsTo(Listing, { as: 'listing', foreignKey: 'listingId' });

User.hasMany(WishlistItem, { as: 'wishlistItems', foreignKey: 'userId' });
WishlistItem.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Listing.hasMany(WishlistItem, { as: 'wishlistItems', foreignKey: 'listingId' });
WishlistItem.belongsTo(Listing, { as: 'listing', foreignKey: 'listingId' });

User.hasMany(Order, { as: 'orders', foreignKey: 'buyerId' });
Order.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });

Listing.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'listingId' });
OrderItem.belongsTo(Listing, { as: 'listing', foreignKey: 'listingId' });

User.hasMany(OrderItem, { as: 'soldItems', foreignKey: 'sellerId' });
OrderItem.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export async function syncDatabase(options = {}) {
  await sequelize.sync(options);
}
