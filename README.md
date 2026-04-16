# Campus Closet

Campus Closet is a local-first marketplace demo for CPTS 489. It supports three roles:

- `buyer`: browse listings, save liked items, set a university preference, add items to cart, checkout into a persisted order, and review purchase history
- `seller`: keep buyer privileges, create/edit/draft listings, upload a listing photo, mark items as sold, and review incoming order line items
- `admin`: review users, suspend or ban accounts with reasons, moderate listings, remove listings with notes, and review platform notifications

## Tech Stack

- Frontend: `React + Vite + React Router + Bootstrap + custom CSS`
- Backend: `Node.js + Express`
- Database: `SQLite` via `Sequelize`
- Auth: `JWT` with `bcryptjs`
- Language: `JavaScript only`

## Project Structure

- `code/frontend`: React application
- `code/backend`: Express API and Sequelize models
- `code/database/campus_closet.sqlite`: seeded SQLite database artifact for the submission

## Local Setup

1. Install dependencies from the repo root:
   `npm install`
2. Copy the env template:
   `cp .env.example .env`
3. Reset the demo database and seed accounts:
   `npm run seed`
4. Start the frontend and backend together:
   `npm run dev`
5. Open the frontend:
   `http://localhost:5173`

The backend runs on `http://localhost:3001` and the frontend proxies `/api` requests to it during development.

## Database Restore

This project uses SQLite, so the database artifact is the file itself:

- Included database file: `code/database/campus_closet.sqlite`
- To restore a clean demo state, run:
  `npm run seed`

That command recreates the SQLite database file with seeded users, active listings, a draft listing, a removed listing, a starter cart, wishlist items, notifications, and a sample historical order.

## Demo Accounts

- Buyer: `buyer@campuscloset.test` / `password123`
- Seller: `seller@campuscloset.test` / `password123`
- Admin: `admin@campuscloset.test` / `password123`

## Available Scripts

- `npm run dev`: start frontend and backend together
- `npm run dev:frontend`: start only the React app
- `npm run dev:backend`: start only the Express API
- `npm run build`: create the production frontend build
- `npm run seed`: rebuild the SQLite database with demo data
- `npm run start`: run the backend without the Vite dev server

## API Summary

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Profile: `PATCH /api/profile`
- Listings: `GET /api/listings`, `GET /api/listings/:id`
- Wishlist: `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/:listingId`
- Cart: `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/:itemId`, `DELETE /api/cart/:itemId`
- Orders: `POST /api/orders/checkout`, `GET /api/orders/:id`, `GET /api/orders/mine`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- Seller: `GET /api/seller/listings`, `POST /api/seller/listings`, `PUT /api/seller/listings/:id`, `PATCH /api/seller/listings/:id/status`, `GET /api/seller/orders`
- Admin: `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `GET /api/admin/listings`, `PATCH /api/admin/listings/:id/status`

## Known Limitations

These are intentional scope choices for the class project and should be called out in the final report:

- Buyer/seller messaging is not implemented.
- Notifications are stored in-app only; no real email is sent.
- Photo upload is stored as a base64 data URL on the listing record, not via a cloud image service.
- Moderation prompts (suspend, ban, remove) use lightweight browser prompts instead of a full modal workflow.
- Checkout is simulated end-to-end in the database and does not call a real payment processor.

## Notes

- The graded flow is fully local and does not depend on Firebase or other hosted services.
- If you want a clean submission state before zipping the repo, run `npm run seed` one last time.
