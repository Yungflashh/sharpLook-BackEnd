
# API Server Setup - `server.ts`

## Overview

This file contains the configuration of the Express.js server and the routes for the API. It integrates the required middleware, sets up routes for various resources (such as users, products, bookings, payments, etc.), and starts the server on a specific port.

## 1. Middleware Setup

### **CORS (Cross-Origin Resource Sharing)**
- Configured using the `cors` package.
- Allows all origins (`*`) to make requests to the API.
- Credentials such as cookies and authorization headers are allowed.
- Supported HTTP Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Allowed Headers: `Content-Type`, `Authorization`.

### **Content-Type Middleware**
- Ensures requests with a `Content-Type` of `application/json` are processed correctly.
- Uses `express.json()` to parse the JSON body.

### **URL Encoding**
- The application supports URL-encoded bodies for forms.

## 2. API Routes

### **Admin Routes**:
- `/api/v1/admin` - Routes for admin-related actions.

### **Auth Routes**:
- `/api/v1/auth` - Routes for user authentication (login, register, etc.).

### **User Routes**:
- `/api/v1/user` - Routes for user-related actions (profile, settings, etc.).

### **Vendor Routes**:
- `/api/v1/vendor` - Routes for vendor-specific actions (profile, services, etc.).

### **Booking Routes**:
- `/api/v1/bookings` - Routes for managing bookings (create, list, etc.).

### **Product Routes**:
- `/api/v1/products` - Routes for product-related actions (add, view, edit, etc.).

### **Earnings Routes**:
- `/api/v1/earnings` - Routes for managing vendor earnings and statistics.

### **Notification Routes**:
- `/api/v1/notifications` - Routes for fetching and managing notifications.

### **Review Routes**:
- `/api/v1/reviews` - Routes for adding and fetching reviews for vendors and services.

### **Promotion Routes**:
- `/api/v1/promotions` - Routes for managing promotional offers.

### **Message Routes**:
- `/api/v1/messages` - Routes for managing messages between clients and vendors.

### **Vendor Service Routes**:
- `/api/v1/vendorServices` - Routes for managing vendor services.

### **Wallet Routes**:
- `/api/v1/wallet` - Routes for managing wallet-related actions (funding, transactions, etc.).

### **Referral Routes**:
- `/api/v1/referrals` - Routes for managing referral programs.

### **Dispute Routes**:
- `/api/v1/disputes` - Routes for managing disputes between vendors and clients.

### **Distance Routes**:
- `/api/v1/distance` - Routes for calculating and managing distances.

### **Payment Routes**:
- `/api/v1/payment` - Routes for payment-related actions (Paystack, etc.).

### **Withdrawal Routes**:
- `/api/v1/withdrawals` - Routes for managing withdrawals.

### **Service Category Routes**:
- `/api/v1/serviceCategory` - Routes for managing service categories.

### **Offer Routes**:
- `/api/v1/offers` - Routes for creating and managing offers.

### **Client Routes**:
- `/api/v1/client` - Routes for client-related actions (services, cart, history, etc.).

### **Cart Routes**:
- `/api/v1/cart` - Routes for managing the user's cart.

### **History Routes**:
- `/api/v1/history` - Routes for managing the user's service and order history.

### **Product Order Routes**:
- `/api/v1/orders` - Routes for handling product orders.

### **Push Notification Routes**:
- `/api/v1` - Routes for handling push notifications.

### **Virtual Account Routes**:
- `/api/v1` - Routes for creating virtual accounts.

## 3. Environment Variables

- **`PORT`**: Defines the port number the server will listen on (default is `4000`).
  
The environment variables are loaded using the `dotenv` package.

## 4. Start the Server

- **Production**: The server will run on the specified port in the `.env` file.
- **Development**: Typically, the server can be run using `node` or `ts-node` for testing and development.

### Example:

```bash
node server.ts
# or
ts-node server.ts



ADMIN

1. Authentication Middleware:

verifyToken: Ensures that every request passing through the router is authenticated (i.e., the user has a valid token).

2. Super Admin Routes:

Super Admin has the highest level of control and can manage users, services, admins, commissions, etc.

Users Management:

DELETE /users/:userId: Delete a user (Super Admin only).

PATCH /users/:userId/promote: Promote a user to Admin role.

GET /stats: Fetch platform stats (Super Admin only).

Admin Management:

POST /createAdmin: Create a new admin user.

GET /getAllAdmins: Fetch all admins.

DELETE /deleteAdmin/:id: Delete an admin.

PATCH /editAdmin/:id: Edit admin details.

PUT /editAdmin/:id: Update admin details.

Service Categories:

POST /addServiceCategory: Add a new service category.

GET /getAllServiceCategory: Fetch all service categories.

DELETE /deleteServiceCategory/:id: Delete a service category.

Broadcasts:

GET /getAllBroadcast: Get all broadcast messages.

POST /broadcasts: Create a new broadcast.

Vendor Commission:

POST /vendor-commission: Set commission rate for a vendor.

GET /vendor-commission/:userId: Get commission rate for a vendor.

DELETE /vendor-commission/:userId: Delete commission setting for a vendor.

POST /vendor-commission/all: Set commission rate for all vendors.

3. Admin and Super Admin Routes:

These routes are accessible to both Admin and Super Admin roles.

User Management:

GET /users: Get all users.

GET /users/role: Get users filtered by role.

GET /users/new: Get new users within a specified range.

GET /users/active: Get daily active users.

GET /users/:userId: Get details of a specific user.

PUT /users/:userId/ban: Ban a user.

PUT /users/:userId/unban: Unban a user.

GET /users/notifications: Get all notifications for users.

Services:

GET /services: Get all services.

DELETE /deleteVendorService/:serviceId: Delete a service offered by a vendor.

Reviews:

GET /reviews: Get all reviews with content.

DELETE /reviews/:reviewId: Delete a review.

Messages:

GET /messages: Get all messages.

Referrals:

GET /referrals: Get the referral history.

4. Finance Admin Routes:

These routes are for Finance Admins and Super Admins.

Payments and Wallets:

GET /payments: Get all payments.

PATCH /wallets/:userId/adjust: Adjust wallet balance for a user.

5. Analyst Routes:

These routes are for Analysts and Super Admins.

Bookings and Orders:

GET /bookings: Get all bookings.

GET /bookings/details: Get detailed booking information.

GET /orders: Get all orders.

6. Content Manager Routes:

These routes are for Content Managers and Super Admins.

Product Management:

GET /products: Get all products.

GET /products/sold: Get sold products.

GET /products/:productId: Get details of a specific product.

DELETE /products/:productId: Delete a product.

PATCH /products/:productId/approve: Approve a product.

PATCH /products/:productId/suspend: Suspend a product.

PATCH /products/:productId/reject: Reject a product.

Promotions:

GET /promotions: Get all promotions.

PATCH /promotions/:promotionId/suspend: Suspend a promotion.

7. Support Admin Routes:

These routes are for Support Admins and Super Admins.

Dispute Resolution:

GET /disputes: Get all disputes.

PATCH /disputes/:disputeId/resolve: Resolve a specific dispute.

General Structure of Each Route:

Middleware: Most routes use requireAdminRole() middleware to ensure the user has the necessary permissions for that specific route.

Role.SUPERADMIN, Role.ADMIN, Role.FINANCE_ADMIN, etc., define the specific access levels required for each route.

verifyToken checks for valid user authentication.

Controllers:

Functions like AdminController.deleteUser, AdminController.createAdminUser, etc., are imported from controller files and handle the logic for each route.

Uploads: For routes like PUT /products/:productId, the uploadSingle2 middleware is used to handle file uploads.



# Authentication & Vendor Onboarding Routes

## 1. Authentication Routes

### **GET /me**
- **Description**: Fetches the current authenticated user's details.
- **Middleware**: `authenticate` (ensures the user is logged in)
- **Controller**: `getCurrentUser`

### **POST /register**
- **Description**: Registers a new user.
- **Controller**: `register`

### **POST /login**
- **Description**: Logs in a user.
- **Controller**: `login`

### **POST /send-otp**
- **Description**: Sends a One-Time Password (OTP) to a user's registered contact.
- **Controller**: `sendOtp`

### **POST /verify-otp**
- **Description**: Verifies the OTP sent to the user.
- **Controller**: `verifyOtp`

### **POST /request-password-reset**
- **Description**: Initiates the password reset process for a user.
- **Controller**: `requestReset`

### **POST /reset-password**
- **Description**: Resets the user's password.
- **Controller**: `reset`

---

## 2. Vendor Onboarding Routes

### **POST /register-vendor**
- **Description**: Registers a new vendor.
- **Middleware**: `uploadSingle` (handles file upload)
- **Controller**: `registerVendor`

### **POST /savePushToken**
- **Description**: Saves the push notification token for a user.
- **Controller**: `saveFcmToken`

---

## 3. Middleware

### **authenticate**
- **Purpose**: Ensures that the user is authenticated before accessing protected routes.

### **uploadSingle**
- **Purpose**: Middleware to handle single file uploads.

### **validate**
- **Purpose**: Middleware for validating request data.

---

## 4. Validation Schemas

### **registerSchema**
- **Purpose**: Defines the validation rules for user registration.


# Booking Routes

## 1. Booking Management Routes

### **POST /bookVendor**
- **Description**: Books a vendor for a service.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `bookVendor`

### **GET /getBookings**
- **Description**: Retrieves the authenticated user's bookings.
- **Middleware**: `verifyToken`
- **Controller**: `getMyBookings`

### **PATCH /status**
- **Description**: Change the status of a booking (e.g., from pending to completed).
- **Middleware**: `verifyToken`
- **Controller**: `changeBookingStatus`

---

## 2. New Booking Completion Routes

### **PATCH /complete/client**
- **Description**: Marks the booking as completed by the client.
- **Middleware**: `verifyToken`
- **Controller**: `markBookingCompletedByClient`

### **PATCH /complete/vendor**
- **Description**: Marks the booking as completed by the vendor.
- **Middleware**: `verifyToken`
- **Controller**: `markBookingCompletedByVendor`

---

## 3. Home Service Booking Routes

### **POST /createHomeServiceBooking**
- **Description**: Creates a home service booking for a vendor.
- **Middleware**: `verifyToken`, `uploadReferencePhoto` (handles file upload)
- **Controller**: `createHomeServiceBooking`

### **PATCH /:bookingId/accept**
- **Description**: Accepts a booking by the vendor.
- **Middleware**: `verifyToken`
- **Controller**: `acceptBookingHandler`

### **PATCH /:bookingId/pay**
- **Description**: Client pays for the booking after vendor acceptance.
- **Middleware**: `verifyToken`
- **Controller**: `payForBookingHandler`

---

## 4. Middleware

### **verifyToken**
- **Purpose**: Ensures the user is authenticated before accessing protected routes.

### **uploadReferencePhoto**
- **Purpose**: Middleware to handle photo uploads for bookings.


# Cart Routes

## 1. Cart Management Routes

### **POST /addProductTocart**
- **Description**: Adds a product to the authenticated user's cart.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `addProductToCart`

### **GET /getMycart**
- **Description**: Retrieves the authenticated user's cart.
- **Middleware**: `verifyToken`
- **Controller**: `getMyCart`

### **DELETE /removeProduct/:productId**
- **Description**: Removes a specific product from the authenticated user's cart.
- **Middleware**: `verifyToken`
- **Controller**: `removeProductFromCart`

### **PUT /updateCartQty**
- **Description**: Updates the quantity of multiple items in the cart.
- **Middleware**: `verifyToken`
- **Controller**: `updateMultipleCartItems`

---

## 2. Middleware

### **verifyToken**
- **Purpose**: Ensures the user is authenticated before accessing the cart routes.


# Service Category Routes

## 1. Service Category Management Routes

### **POST /addAService**
- **Description**: Adds a new service category. Accessible only by authenticated users with Admin or Super Admin roles.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireAdminRole` (ensures the user has Admin or Super Admin role)
- **Controller**: `handleCreateServiceCategory`

### **GET /getAllServices**
- **Description**: Retrieves all service categories.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleGetServiceCategories`

---

## 2. Middleware

### **verifyToken**
- **Purpose**: Ensures the user is authenticated before accessing the routes.

### **requireAdminRole**
- **Purpose**: Ensures that only users with the Admin or Super Admin role can access specific routes.

### **Role**
- **Roles**: `ADMIN`, `SUPERADMIN` (used to define the access control for the routes).


# Client Service Routes

## 1. Service Fetching Routes

### **GET /services**
- **Description**: Retrieves all available services.
- **Controller**: `fetchAllServices`

### **GET /services/:vendorId**
- **Description**: Retrieves all services offered by a specific vendor, identified by `vendorId`.
- **Controller**: `fetchVendorServices`


# Dispute Routes

## 1. Dispute Management Routes

### **POST /raiseDispute**
- **Description**: Allows a user to raise a dispute. Requires a reference photo upload.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `uploadReferencePhoto` (handles file upload)
- **Controller**: `raiseDispute`

### **GET /getAllDisputes**
- **Description**: Fetches all disputes. Accessible only by users with Admin or Super Admin roles.
- **Middleware**: `verifyToken`, `requireRole` (ensures the user has the "ADMIN" or "SUPERADMIN" role)
- **Controller**: `getDisputes`

### **PATCH /resolveDispute**
- **Description**: Resolves a dispute. Accessible only by Admin or Super Admin.
- **Middleware**: `verifyToken`, `requireRole` (ensures the user has the "ADMIN" or "SUPERADMIN" role)
- **Controller**: `resolveDispute`

---

## 2. Vendor Order Dispute Routes

### **POST /createOrderdispute**
- **Description**: Creates a new vendor order dispute, with an image upload.
- **Middleware**: `verifyToken`, `uploadDisputeImage` (handles file upload)
- **Controller**: `createVendorOrderDisputeHandler`

### **GET /getOrderDisputes**
- **Description**: Fetches all vendor order disputes. Accessible only by users with Admin or Super Admin roles.
- **Middleware**: `verifyToken`, `requireRole` (ensures the user has the "ADMIN" or "SUPERADMIN" role)
- **Controller**: `getAllVendorOrderDisputesHandler`

### **PATCH /updateDispute**
- **Description**: Updates the dispute status (e.g., RESOLVED, REJECTED).
- **Middleware**: `verifyToken`, `requireRole` (ensures the user has the "ADMIN" or "SUPERADMIN" role)
- **Controller**: `updateVendorOrderDisputeStatusHandler`

---

## 3. Middleware

### **verifyToken**
- **Purpose**: Ensures the user is authenticated before accessing the routes.

### **requireRole**
- **Purpose**: Ensures the user has the required role (e.g., "ADMIN" or "SUPERADMIN") to access specific routes.

### **uploadDisputeImage**
- **Purpose**: Handles file uploads for dispute images.

### **uploadReferencePhoto**
- **Purpose**: Handles file uploads for reference photos.


# Earnings Routes

## 1. Vendor Earnings Routes

### **GET /getVendorEarnings**
- **Description**: Retrieves the earnings for a specific vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole` (ensures the user has the "VENDOR" role)
- **Controller**: `getVendorEarnings`


# History Routes

## 1. History Management Routes

### **GET /past**
- **Description**: Fetches the user's past history.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchPastHistory`

### **GET /upcoming**
- **Description**: Fetches the user's upcoming history.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchUpcomingHistory`


# Message Routes

## 1. Message Management Routes

### **GET /:roomId**
- **Description**: Fetches all messages for a specific room, identified by `roomId`.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchMessages`

### **PATCH /:roomId/read**
- **Description**: Marks all messages in a specific room as read.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `markAsRead`

### **PATCH /:messageId/like**
- **Description**: Likes a specific message.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `likeMessage`

### **GET /unread/count**
- **Description**: Retrieves the count of unread messages for the authenticated user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getUnreadMessageCount`

---

## 2. Chat List and Previews

### **GET /user/getClientChatsList**
- **Description**: Retrieves the chat list for clients.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getClientChatListController`

### **GET /user/getVendorChats**
- **Description**: Retrieves the chat list for vendors.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getVendorChatListController`

### **GET /client/previews**
- **Description**: Retrieves previews of the last messages in client chats.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getClientChatPreviewsController`

### **GET /vendor/previews**
- **Description**: Retrieves previews of the last messages in vendor chats.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getVendorChatPreviewsController`

---

## 3. Message Editing and Deletion

### **DELETE /:messageId**
- **Description**: Deletes a specific message identified by `messageId`.
- **Controller**: `deleteMessageController`

### **PATCH /edit/:messageId**
- **Description**: Edits a specific message identified by `messageId`.
- **Controller**: `editMessageController`

# Notification Routes

## 1. Notification Management Routes

### **GET /getNotifications**
- **Description**: Retrieves all notifications for the authenticated user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getNotifications`

### **DELETE /delete/:notificationId**
- **Description**: Deletes a specific notification, identified by `notificationId`.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `deleteNotificationController`


# Offer Routes

## 1. Offer Management Routes

### **POST /createOffer**
- **Description**: Creates a new offer. Requires image upload.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `uploadSingle2` (handles file upload)
- **Controller**: `handleCreateOffer`

### **POST /accept**
- **Description**: Accepts an offer.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleVendorAccept`

### **POST /vendors**
- **Description**: Retrieves the list of vendors available for a specific offer.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleGetVendorsForOffer`

### **POST /select-vendor**
- **Description**: Allows a user to select a vendor for the offer. Requires image upload.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `uploadSingle2` (handles file upload)
- **Controller**: `selectVendorController`

### **GET /nearbyOffers**
- **Description**: Retrieves offers available nearby to the user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getNearbyOffersHandler`

### **GET /allOffers**
- **Description**: Retrieves all available offers.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getAllAvailableOffersHandler`

### **GET /myOffers**
- **Description**: Retrieves all offers created by the authenticated user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getMyOffers`

### **PATCH /tip**
- **Description**: Allows a user to tip an offer.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `tipOffer`

### **POST /cancel**
- **Description**: Cancels a specific offer.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleCancelOffer`


# Payment Routes

## 1. Paystack Payment Routes

### **POST /paystack/initiate**
- **Description**: Initiates a payment via Paystack.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `createPaystackPayment`

### **GET /paystack/verify/:reference**
- **Description**: Verifies a Paystack payment using a payment reference.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `verifyPaystackPayment`


# Product Routes

## 1. Product Management Routes

### **POST /vendor/addProducts**
- **Description**: Allows a vendor to add a new product. Requires product image upload.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor), `upload.single("picture")` (handles image upload)
- **Controller**: `addProduct`

### **GET /getVendorProducts**
- **Description**: Fetches all products for the authenticated vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `fetchVendorProducts`

### **GET /getAllProducts**
- **Description**: Retrieves all products in the system.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchAllProducts`

### **PUT /edit/:productId**
- **Description**: Allows a vendor to edit a product, including uploading a new product image.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor), `upload.single("picture")` (handles image upload)
- **Controller**: `editProduct`

### **DELETE /delete/:productId**
- **Description**: Deletes a specific product identified by `productId`.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `removeProduct`


# Product Order Routes

## 1. Product Order Management Routes

### **POST /checkout**
- **Description**: Initiates the checkout process for the user's cart.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `checkoutCart`

### **GET /getMyOrders**
- **Description**: Retrieves all orders made by the authenticated user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getMyOrders`

### **GET /getVendorOrders**
- **Description**: Retrieves all orders for the authenticated vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getVendorOrders`

### **POST /complete**
- **Description**: Marks the vendor's order as complete.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `completeVendorOrderController`


# Referral Routes

## 1. Referral Management Routes

### **GET /referralHistory**
- **Description**: Retrieves the referral history for the authenticated user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getReferralHistory`

### **GET /analytics**
- **Description**: Retrieves referral analytics data.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleReferralAnalytics`


# Review Routes

## 1. Review Management Routes

### **POST /postReview**
- **Description**: Allows a user to post a review for a service or product.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `postReview`

### **POST /getAllReviews**
- **Description**: Fetches all reviews for a specific vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchVendorReviews`

### **POST /service**
- **Description**: Fetches all reviews for a service provided by a vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleGetServiceReviewsByVendor`

### **POST /product**
- **Description**: Fetches all reviews for a product provided by a vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleGetProductReviewsByVendor`


# User Routes

## 1. User Profile and Account Management Routes

### **GET /me**
- **Description**: Fetches the authenticated user's profile details.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getMyProfile`

### **PUT /updateProfile**
- **Description**: Allows the authenticated user to update their profile.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `updateMyProfile`

### **PUT /location**
- **Description**: Updates location preferences for a client.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["CLIENT"])` (ensures the user is a client)
- **Controller**: `setClientLocationPreferences`

### **GET /nearby-vendors**
- **Description**: Fetches a list of vendors near the authenticated user's location.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getNearbyVendors`

### **GET /topVendors**
- **Description**: Retrieves a list of top vendors.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchTopVendors`

### **GET /getVendorDetails**
- **Description**: Fetches detailed information about a specific vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `getAVendorDetails`

### **GET /products/top-selling**
- **Description**: Fetches the top-selling products.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchTopSellingProducts`

### **PUT /avatar**
- **Description**: Allows the user to update their avatar/profile picture.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `uploadSingle3` (handles image upload)
- **Controller**: `updateAvatar`

### **PUT /updateFcmToken**
- **Description**: Updates the Firebase Cloud Messaging (FCM) token for the user.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `updateFcmToken`

### **DELETE /delete**
- **Description**: Deletes the authenticated user's account.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `handleDeleteAccount`


# Vendor Routes

## 1. Vendor Profile and Account Management Routes

### **GET /dashboard**
- **Description**: Returns a welcome message for the authenticated vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user has the vendor role)
- **Controller**: Inline response with `message: "Welcome, Vendor!"`

### **PUT /complete-profile**
- **Description**: Allows the vendor to complete their profile by uploading multiple images (portfolio).
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `completeVendorProfile`

### **POST /upload**
- **Description**: Uploads portfolio images for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `uploadPortfolioImages`

### **GET /fetchPortfolioImage**
- **Description**: Fetches the vendor's uploaded portfolio images.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `fetchPortfolioImages`

### **GET /getVendorPricing**
- **Description**: Fetches the pricing details for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `fetchVendorPricing`

### **POST /setVendorPricing**
- **Description**: Sets the pricing for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `setVendorPricing`

### **GET /getCategories**
- **Description**: Fetches the service categories.
- **Controller**: `fetchServiceCategories`

### **GET /filter-by-service**
- **Description**: Filters vendors by the service they provide.
- **Controller**: `filterVendorsByService`

### **POST /setVendorAvailability**
- **Description**: Sets the vendor's availability.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `updateAvailability`

### **GET /getVendorAvailability**
- **Description**: Fetches the vendor's availability status.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `fetchAvailability`

### **PUT /update-service-radius**
- **Description**: Updates the service radius for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `updateServiceRadius`

### **GET /analytics/:vendorId**
- **Description**: Fetches analytics for the given vendor ID.
- **Middleware**: `verifyToken` (ensures the user is authenticated)
- **Controller**: `fetchVendorAnalytics`

### **GET /earnings-graph**
- **Description**: Fetches the earnings graph for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `fetchVendorEarningsGraph`

### **POST /mark-vendor-paid**
- **Description**: Marks the vendor as paid.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `markVendorAsPaidController`

### **GET /getMySub**
- **Description**: Fetches the subscription details for the vendor.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `getVendorSubscriptionController`

### **PUT /profile/edit**
- **Description**: Allows the vendor to edit their profile by uploading multiple images.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor), `uploadMultiple` (handles image uploads)
- **Controller**: `editVendorProfile`

### **DELETE /deleteMyVendorAcct**
- **Description**: Deletes the vendor's account.
- **Middleware**: `verifyToken` (ensures the user is authenticated), `requireRole(["VENDOR"])` (ensures the user is a vendor)
- **Controller**: `deleteVendorAccountController`


# Vendor Service Routes

## 1. Vendor Service Management Routes

### **POST /addService**
- **Description**: Allows vendors to add a new service with an image upload.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
  - `requireRole(["VENDOR"])` (ensures the user has the "VENDOR" role)
  - `uploadSingle2` (handles image upload)
- **Controller**: `createVendorService`

### **GET /my-services**
- **Description**: Fetches all services listed by the authenticated vendor.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
  - `requireRole(["VENDOR"])` (ensures the user has the "VENDOR" role)
- **Controller**: `fetchVendorServices`

### **GET /allServices**
- **Description**: Fetches all services across vendors.
- **Controller**: `fetchAllVendorServices`

### **PUT /edit/:serviceId**
- **Description**: Allows vendors to update a specific service by service ID, with an optional image upload.
- **Middleware**:
  - `verifyToken` (ensures the user is authenticated)
  - `requireRole(["VENDOR"])` (ensures the user has the "VENDOR" role)
  - `uploadSingle2` (handles image upload)
- **Controller**: `updateVendorService`

### **DELETE /delete/:serviceId**
- **Description**: Deletes a specific service by service ID.
- **Middleware**:
  - `verifyToken` (ensures the user is authenticated)
  - `requireRole(["VENDOR"])` (ensures the user has the "VENDOR" role)
- **Controller**: `deleteAVendorService`

# Wallet Routes

## 1. Wallet Management Routes

### **GET /walletDetails**
- **Description**: Fetches the details of the user's wallet (balance, wallet status, etc.).
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `getWalletDetails`

### **GET /transactions**
- **Description**: Fetches the list of wallet transactions made by the authenticated user.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `walletTransactions`

### **POST /fund**
- **Description**: Allows the authenticated user to fund their wallet.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `fundWallet`

### **POST /verify**
- **Description**: Verifies the wallet funding transaction.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `verifyWalletFunding`


# Wishlist Routes

## 1. Wishlist Management Routes

### **POST /addProduct**
- **Description**: Adds a product to the user's wishlist.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `addProductToWishlist`

### **GET /getMyWish**
- **Description**: Fetches the list of products in the authenticated user's wishlist.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `getMyWishlist`

### **DELETE /removeProduct/:productId**
- **Description**: Removes a product from the user's wishlist by `productId`.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `removeProductFromWishlist`


# Withdrawal Routes

## 1. Withdrawal Management Routes

### **POST /requestWithdrawals**
- **Description**: Requests a withdrawal for the authenticated user.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `requestWithdrawal`

### **POST /verifyAcct**
- **Description**: Verifies the account associated with the withdrawal request.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `resolveAccountController`

### **GET /myWithdrawals**
- **Description**: Fetches the list of all withdrawal requests made by the authenticated user.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `getUserWithdrawals`

## 2. Admin-Only Routes

### **GET /all**
- **Description**: Fetches all withdrawal requests for admins and super admins.
- **Middleware**: 
  - `requireAdminRole(Role.ADMIN, Role.SUPERADMIN)` (ensures the user has the appropriate admin role)
- **Controller**: `getAllWithdrawals`

### **PATCH /:id/status**
- **Description**: Updates the status of a specific withdrawal request by `id`. Admin only.
- **Middleware**: 
  - `requireAdminRole(Role.ADMIN, Role.SUPERADMIN)` (ensures the user has the appropriate admin role)
- **Controller**: `updateWithdrawalStatus`

## 3. Bank Management Routes

### **GET /getBanksList**
- **Description**: Fetches the list of available banks for withdrawals.
- **Middleware**: 
  - `verifyToken` (ensures the user is authenticated)
- **Controller**: `getAllBanks`
