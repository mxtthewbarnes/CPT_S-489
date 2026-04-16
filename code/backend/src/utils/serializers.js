import { signToken } from './auth.js';

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Number.parseFloat(value);
}

export function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    university: user.university,
    statusReason: user.statusReason,
    statusNote: user.statusNote,
    suspensionEndsAt: user.suspensionEndsAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializeListing(listing) {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    school: listing.school,
    price: toNumber(listing.price),
    size: listing.size,
    condition: listing.condition,
    description: listing.description,
    imageUrl: listing.imageUrl,
    status: listing.status,
    adminReason: listing.adminReason,
    adminNote: listing.adminNote,
    hiddenByAccountStatus: Boolean(listing.hiddenByAccountStatus),
    sellerId: listing.sellerId,
    seller: listing.seller ? serializeUser(listing.seller) : undefined,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export function serializeCartItem(item) {
  return {
    id: item.id,
    quantity: item.quantity,
    lineTotal: toNumber(item.listing?.price) * item.quantity,
    listing: item.listing ? serializeListing(item.listing) : undefined,
  };
}

export function serializeOrderItem(item) {
  return {
    id: item.id,
    orderId: item.orderId,
    listingId: item.listingId,
    quantity: item.quantity,
    titleSnapshot: item.titleSnapshot,
    priceSnapshot: toNumber(item.priceSnapshot),
    sellerId: item.sellerId,
    seller: item.seller ? serializeUser(item.seller) : undefined,
    listing: item.listing ? serializeListing(item.listing) : undefined,
  };
}

export function serializeOrder(order) {
  return {
    id: order.id,
    total: toNumber(order.total),
    status: order.status,
    buyerId: order.buyerId,
    buyer: order.buyer ? serializeUser(order.buyer) : undefined,
    items: order.items ? order.items.map(serializeOrderItem) : [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function serializeSellerOrderLine(item) {
  return {
    id: item.id,
    orderId: item.orderId,
    quantity: item.quantity,
    titleSnapshot: item.titleSnapshot,
    priceSnapshot: toNumber(item.priceSnapshot),
    orderStatus: item.order?.status,
    createdAt: item.order?.createdAt || item.createdAt,
    buyer: item.order?.buyer ? serializeUser(item.order.buyer) : undefined,
    listing: item.listing ? serializeListing(item.listing) : undefined,
  };
}

export function serializeNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export function buildSession(user) {
  return {
    token: signToken(user),
    user: serializeUser(user),
  };
}
