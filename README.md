# Campus Closet System Architecture
# CPTS 489

## Project Overview
Campus Closet is a peer to peer marketplace for collegiate apparel and memorabilia. The system architecture is designed to provide a high end user experience through a decoupled client server model. The application focuses on performance, secure data handling and real time communication between university students and alumni.

## Tech Stack
The project is built entirely within the JavaScript and TypeScript ecosystem to ensure end to end type safety.

* Frontend: React.js with TypeScript
* Styling: Tailwind CSS and Framer Motion
* Backend: Node.js with Express
* Database: MongoDB with Mongoose
* Communication: Socket.io for real time messaging
* Storage: Cloudinary for high resolution image hosting

## System Design
The application utilizes a monolithic backend architecture to manage business logic and data persistence. The React frontend operates as a thick client that manages complex UI states and animations while communicating with the server via a RESTful API.

## User Role Management
The system implements a strict Role Based Access Control (RBAC) model to satisfy project requirements and ensure platform security.

* Buyer: Access to search, filtering, wishlist management and peer to peer messaging.
* Seller: Access to a dedicated dashboard for listing creation, inventory management and sales analytics.
* Admin: High level access to moderation tools, user management and system health metrics.

Role enforcement occurs at the middleware layer on the server. The backend validates the user role stored within the JSON Web Token (JWT) before allowing access to restricted endpoints.

## Data Persistence and Flow
The database schema is optimized for a marketplace environment where listing attributes may vary by category.

* Users: Stores authentication credentials, university affiliation and role permissions.
* Listings: Contains product metadata, university tags, price and status. Each listing references a specific Seller ID.
* Conversations: Manages the relationship between buyers and sellers to facilitate real time communication through persistent message logs.

## Real Time Messaging and Notifications
To facilitate meetups and shipping coordination, the system uses a WebSocket implementation. This allows for low latency communication without constant polling. Messages are persisted in the database to ensure a continuous history for both parties.

## UI Standards and Performance
The frontend is built with a component driven approach to achieve a polished and modern aesthetic. Framer Motion is used for declarative layout transitions and skeleton loaders are implemented to manage perceived latency during data fetching operations. This architecture ensures the shopping experience remains fluid and professional.
