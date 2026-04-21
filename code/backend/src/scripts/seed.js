import bcrypt from 'bcryptjs';
import {
  CartItem,
  Listing,
  Notification,
  Order,
  OrderItem,
  User,
  WishlistItem,
  syncDatabase,
} from '../models/index.js';

function makeImage(label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="40">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function seedDatabase() {
  await syncDatabase({ force: true });

  const passwordHash = await bcrypt.hash('password123', 10);

  const [buyer, seller, admin] = await Promise.all([
    User.create({
      email: 'buyer@campuscloset.test',
      passwordHash,
      role: 'buyer',
      status: 'active',
      university: 'WSU',
    }),
    User.create({
      email: 'seller@campuscloset.test',
      passwordHash,
      role: 'seller',
      status: 'active',
      university: 'UW',
    }),
    User.create({
      email: 'admin@campuscloset.test',
      passwordHash,
      role: 'admin',
      status: 'active',
    }),
  ]);

  const listings = await Listing.bulkCreate([
    {
      sellerId: seller.id,
      title: 'Vintage WSU Crewneck',
      category: 'Sweatshirt',
      school: 'WSU',
      price: 24.0,
      size: 'L',
      condition: 'Good',
      description: 'Classic crimson crewneck with light wear and a broken-in feel.',
      imageUrl: '/images/WSU-crew.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'UW Game Day Hoodie',
      category: 'Hoodie',
      school: 'UW',
      price: 32.0,
      size: 'M',
      condition: 'Excellent',
      description: 'Warm hoodie in great shape for rivalry week.',
      imageUrl: '/images/UW-hoodie.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Oregon Nike Jacket',
      category: 'Jacket',
      school: 'Oregon',
      price: 48.0,
      size: 'XL',
      condition: 'Good',
      description: 'Heavyweight jacket with stitched details and bright green trim.',
      imageUrl: '/images/OR-jacket.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'UCLA Champion Tee',
      category: 'T-Shirt',
      school: 'UCLA',
      price: 18.0,
      size: 'S',
      condition: 'Very Good',
      description: 'Soft cotton tee with a subtle vintage wash.',
      imageUrl: '/images/UCLA-shirt.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Arizona State Windbreaker',
      category: 'Jacket',
      school: 'Arizona State',
      price: 27.5,
      size: 'M',
      condition: 'Good',
      description: 'Lightweight windbreaker with retro maroon panels.',
      imageUrl: makeImage('ASU Windbreaker', '#8c1d40'),
      status: 'hidden',
    },
    {
      sellerId: seller.id,
      title: 'Notre Dame Zip',
      category: 'Pullover',
      school: 'Notre Dame',
      price: 36.0,
      size: 'L',
      condition: 'Excellent',
      description: 'Quarter zip fleece with clean embroidery and no noticeable flaws.',
      imageUrl: '/images/ND-zip2.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Michigan Snapback',
      category: 'Hat',
      school: 'Michigan',
      price: 20.0,
      size: 'One Size',
      condition: 'Good',
      description: 'Structured snapback with bold maize lettering.',
      imageUrl: '/images/UM-hat.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Draft Stanford Tee',
      category: 'T-Shirt',
      school: 'Stanford',
      price: null,
      size: null,
      condition: null,
      description: null,
      imageUrl: null,
      status: 'draft',
    },
    {
      sellerId: seller.id,
      title: 'Removed Cal Pennant',
      category: 'Memorabilia',
      school: 'Cal',
      price: 16.0,
      size: 'One Size',
      condition: 'Good',
      description: 'Vintage felt pennant that was archived after moderation review.',
      imageUrl: makeImage('Cal Pennant', '#003262'),
      status: 'removed',
      adminReason: 'Counterfeit',
      adminNote: 'Archived after review.',
    },
    {
      sellerId: seller.id,
      title: 'Wazzu Hat',
      category: 'Hat',
      school: 'WSU',
      price: 18.00,
      size: 'One Size',
      condition: 'Like New',
      description: 'Classic WSU snapback in crimson and gray. Barely worn, no stains or damage.',
      imageUrl: '/images/WSU-hat.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Ohio State Football Helmet',
      category: 'Memorabilia',
      school: 'Ohio State',
      price: 200.00,
      size: 'One Size',
      condition: 'Good',
      description: 'Ohio State replica football helmet in scarlet and gray. Great display piece for any Buckeyes fan.',
      imageUrl: '/images/OSU-helmet.jpeg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Alabama #13 jersey',
      category: 'Jersey',
      school: 'Alabama',
      price: 55.00,
      size: 'L',
      condition: 'Good',
      description: 'Alabama Crimson Tide football jersey in classic crimson and white. Great condition, perfect for game day.',
      imageUrl: '/images/alabama-jersey.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'USC jacket',
      category: 'Jacket',
      school: 'USC',
      price: 65.00,
      size: 'L',
      condition: 'Good',
      description: 'USC Trojans jacket in cardinal and gold. Stylish and warm, perfect for game day or everyday wear.',
      imageUrl: '/images/USC-jacket.jpg',
      status: 'active',
    },
    {
      sellerId: seller.id,
      title: 'Oregon State Beavers Jersey',
      category: 'Jersey',
      school: 'Oregon State',
      price: 45.00,
      size: 'L',
      condition: 'Good',
      description: 'Oregon State Beavers football jersey in classic orange and black. Great condition, perfect for game day.',
      imageUrl: '/images/beav-jersey.jpg',
      status: 'active',
    },
    
  ]);

  await CartItem.bulkCreate([
    {
      userId: buyer.id,
      listingId: listings[0].id,
      quantity: 1,
    },
    {
      userId: buyer.id,
      listingId: listings[1].id,
      quantity: 1,
    },
  ]);

  await WishlistItem.bulkCreate([
    {
      userId: buyer.id,
      listingId: listings[2].id,
    },
    {
      userId: buyer.id,
      listingId: listings[5].id,
    },
  ]);

  const order = await Order.create({
    buyerId: buyer.id,
    total: 20.0,
    status: 'placed',
  });

  await OrderItem.create({
    orderId: order.id,
    listingId: listings[6].id,
    sellerId: seller.id,
    quantity: 1,
    titleSnapshot: listings[6].title,
    priceSnapshot: listings[6].price,
  });

  listings[6].status = 'sold';
  await listings[6].save();

  await Notification.bulkCreate([
    {
      userId: seller.id,
      type: 'order',
      title: 'Item sold',
      message: 'Order #1 includes your Michigan Snapback.',
      link: '/seller',
    },
    {
      userId: seller.id,
      type: 'listing',
      title: 'Listing removed by admin',
      message: 'Your Cal Pennant was removed after moderation review.',
      link: '/seller',
    },
    {
      userId: buyer.id,
      type: 'wishlist',
      title: 'Wishlist ready',
      message: 'Two listings were added to your liked items so you can demo the dashboard quickly.',
      link: '/dashboard',
    },
  ]);

  console.log('Seed complete.');
  console.log('Buyer: buyer@campuscloset.test / password123');
  console.log('Seller: seller@campuscloset.test / password123');
  console.log('Admin: admin@campuscloset.test / password123');
}

seedDatabase().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
