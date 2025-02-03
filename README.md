# Rentoo
### Rental Marketplace

A modern web application for renting and listing items, built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication & Authorization
- Secure user authentication with JWT
- Role-based access control (Admin, Vendor, Customer)
- Protected routes based on user roles
- Persistent login state
- Token-based session management
- Auto-logout on token expiration
- Secure password hashing with bcrypt
- Cross-site request forgery (CSRF) protection

### User Management
- User registration with role selection
- Profile management
- Admin dashboard for user oversight
- User role management
- User deletion with cascade handling
- User statistics and analytics
- Role-specific permissions
- User activity tracking

### Product Management
- Product listing with detailed information
- Image upload support (multiple images)
- Product categorization
- Condition and availability status
- Location-based listings
- Pricing management (daily rates)
- Product availability toggle
- Product deletion protection
- Image optimization and resizing
- Product history tracking
- Vendor-specific product management
- Product snapshots for rentals

### Search & Filter Functionality
- Global search in navigation bar
- Real-time search filtering
- Search across multiple fields:
  - Product names
  - Categories
  - Vendor names
  - Locations
  - Descriptions
  - Price ranges
  - Availability status
- Role-specific search interfaces:
  - Customer: Products and rentals
  - Vendor: Products and rental requests
  - Admin: Users, products, and rentals
- Category-based filtering
- Price range filtering
- Location-based filtering
- Availability filtering
- Date range filtering
- Sort options:
  - Price (low to high/high to low)
  - Date added
  - Rating

### Rental System
- Rental request management
- Date-based availability
- Pricing calculation
- Status tracking (pending, approved, rejected, completed, cancelled)
- Rental history
- Automatic availability updates
- Rental request validation
- Date conflict prevention
- Rental duration limits
- Price calculation based on duration
- Multiple rental statuses:
  - Pending
  - Approved
  - Rejected
  - Completed
  - Cancelled
  - Overdue
- Rental request notifications
- Rental analytics
- Rental history export

### Dashboard Interfaces
1. Admin Dashboard:
   - User management
     - View all users
     - Delete users
     - Update user roles
     - User statistics
   - Product oversight
     - View all products
     - Delete products
     - Product statistics
   - Rental monitoring
     - View all rentals
     - Rental statistics
   - Statistical overview
     - Total users by role
     - Active rentals
     - Total products
     - System metrics
   - Search and filter capabilities
     - User search
     - Product search
     - Rental search
   - Data visualization
     - User growth charts
     - Rental trends
     - Product statistics

2. Vendor Dashboard:
   - Product management
     - Add products
     - Edit products
     - Delete products
     - Product statistics
   - Rental request handling
     - View requests
     - Approve/reject requests
     - Complete rentals
     - Request history
   - Availability toggle
     - Quick status updates
     - Batch updates
   - Search functionality
     - Product search
     - Request search
   - Analytics
     - Product performance
     - Rental statistics
   - Notification center

3. Customer Dashboard:
   - Rental request tracking
     - Active rentals
     - Request history
     - Request status
   - Search functionality
     - Product search
     - Rental history search
   - Rental history
   - Notification preferences

### UI/UX Features
- Responsive design
- Modern, clean interface
- Real-time updates
- Loading states
- Error handling
- Toast notifications
- Modal confirmations
- Professional search interface
- Intuitive navigation
- Smooth transitions
- Skeleton loading
- Infinite scroll
- Lazy loading
- Image optimization
- Form validation
- Error messages
- Success feedback
- Interactive elements
- Accessibility features
- Mobile-first design
- Dark mode support
- Custom scrollbars
- Responsive tables
- Animated components
- Context menus
- Tooltips
- Progress indicators
- Breadcrumb navigation
- Quick actions

### Notification System
- Real-time notification updates
- Unread count badge
- Mark as read functionality
- Notification types:
  - Rental requests
  - Request approvals/rejections
  - Return notifications
  - System updates
  - Product updates
- Notification preferences
- Notification history
- Filter options
- Sort options
- Search functionality
- Notification categories
- Priority levels
- Read/Unread status
- Clear all option
- Paginated notification list
- Notification center in navigation bar
- Quick actions from notifications
- Time-based filtering
- Category-based filtering
- Notification settings

## Technical Stack

### Frontend Libraries and Dependencies

#### Core Libraries
- **React (^18.2.0)**
  - Core library for building user interfaces
  - Component-based architecture
  - Virtual DOM for efficient rendering
  - Hooks for state management and side effects

- **TypeScript (^5.0.0)**
  - Static typing for JavaScript
  - Enhanced IDE support and code completion
  - Early error detection
  - Better code documentation

- **React Router DOM (^6.4.0)**
  - Client-side routing
  - Navigation management
  - Route protection
  - Dynamic route parameters
  - History management

#### UI and Styling
- **Tailwind CSS (^3.3.0)**
  - Utility-first CSS framework
  - Responsive design utilities
  - Custom design system
  - JIT (Just-In-Time) compilation
  - Dark mode support

- **@headlessui/react (^1.7.0)**
  - Unstyled, accessible UI components
  - Dropdowns
  - Modals
  - Menus
  - Transitions
  - ARIA compliance

- **@heroicons/react (^2.0.0)**
  - SVG icon components
  - Multiple styles (outline, solid)
  - Customizable sizes and colors
  - Optimized for React

#### Form and Data Handling
- **react-hook-form (^7.45.0)**
  - Form state management
  - Form validation
  - Error handling
  - Performance optimization
  - TypeScript support

- **yup (^1.2.0)**
  - Schema validation
  - Form validation rules
  - Type coercion
  - Custom validation messages

#### Date and Time
- **date-fns (^2.30.0)**
  - Date manipulation
  - Date formatting
  - Time zone handling
  - Relative time calculations

#### HTTP Client
- **axios (^1.4.0)**
  - Promise-based HTTP client
  - Request/response interceptors
  - Automatic transforms for JSON data
  - Client-side request cancellation
  - Progress monitoring for uploads

### Backend Libraries and Dependencies

#### Core Framework
- **Node.js (^16.0.0)**
  - JavaScript runtime
  - Event-driven architecture
  - Non-blocking I/O
  - NPM package management

- **Express (^4.18.0)**
  - Web application framework
  - Routing
  - Middleware support
  - Static file serving
  - Error handling

#### Database
- **MongoDB (^6.0.0)**
  - NoSQL database
  - Document-oriented storage
  - Scalable architecture
  - Rich query language

- **Mongoose (^7.4.0)**
  - MongoDB object modeling
  - Schema definition
  - Data validation
  - Query building
  - Middleware support
  - TypeScript support

#### Authentication and Security
- **jsonwebtoken (^9.0.0)**
  - JWT token generation
  - Token verification
  - Payload encryption
  - Expiration handling

- **bcryptjs (^2.4.3)**
  - Password hashing
  - Salt generation
  - Secure password comparison

- **cors (^2.8.5)**
  - Cross-Origin Resource Sharing
  - Preflight request handling
  - Security headers
  - Origin whitelisting

#### File Upload and Processing
- **Multer (^1.4.5)**
  - Multipart form data handling
  - File upload middleware
  - File filtering
  - Storage engine customization

- **Sharp (^0.32.0)**
  - Image processing
  - Resize and crop
  - Format conversion
  - Metadata handling

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile
- POST `/api/auth/logout` - User logout
- POST `/api/auth/refresh-token` - Refresh JWT token

### Products
- GET `/api/products` - Get all products with filters
- GET `/api/products/:id` - Get product details
- GET `/api/vendor/products` - Get vendor's products
- POST `/api/products` - Create new product (Vendor)
- PATCH `/api/products/:id` - Update product (Vendor)
- DELETE `/api/products/:id` - Delete product (Vendor/Admin)
- GET `/api/products/:id/snapshot` - Get product snapshot
- POST `/api/products/:id/images` - Upload product images
- DELETE `/api/products/:id/images/:imageId` - Delete product image
- PATCH `/api/products/:id/availability` - Toggle availability
- GET `/api/products/categories` - Get product categories
- GET `/api/products/search` - Search products
- GET `/api/products/trending` - Get trending products
- GET `/api/products/recent` - Get recently added products
- GET `/api/products/nearby` - Get nearby products

### Rentals
- GET `/api/rental-requests` - Get user's rental requests
- GET `/api/rental-requests/vendor` - Get vendor's rental requests
- POST `/api/rental-requests` - Create rental request
- PATCH `/api/rental-requests/:id/status` - Update request status
- DELETE `/api/rental-requests/:id` - Cancel request
- GET `/api/rental-requests/deleted-products` - Get requests with deleted products
- GET `/api/rental-requests/:id/product-history` - Get product snapshot
- GET `/api/rental-requests/stats` - Get rental statistics
- GET `/api/rental-requests/calendar` - Get rental calendar

### Notifications
- GET `/api/notifications` - Get user's notifications
- GET `/api/notifications/unread-count` - Get unread count
- PATCH `/api/notifications/:id/read` - Mark as read
- PATCH `/api/notifications/mark-all-read` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification
- GET `/api/notifications/preferences` - Get notification preferences
- PUT `/api/notifications/preferences` - Update preferences
- GET `/api/notifications/categories` - Get notification categories
- GET `/api/notifications/history` - Get notification history

### Admin
- GET `/api/admin/users` - Get all users
- GET `/api/admin/stats` - Get system statistics
- PATCH `/api/admin/users/:id/role` - Update user role
- DELETE `/api/admin/users/:id` - Delete user
- GET `/api/admin/deleted-products` - Get deleted products
- GET `/api/admin/rental-stats` - Get rental statistics
- GET `/api/admin/logs` - Get system logs
- GET `/api/admin/activity` - Get user activity

## Recent Updates

### Review System Improvements
- Added complete CRUD operations for reviews
  - Create: Users can submit reviews with ratings (1-5) and comments
  - Read: View all reviews for a product with pagination
  - Update: Users can edit their own reviews
  - Delete: Users can delete their own reviews
- Added review statistics
  - Average rating calculation
  - Total reviews count
  - Real-time stats updates when reviews are modified
- Implemented authorization checks
  - Only authenticated users can submit reviews
  - Users can only edit/delete their own reviews
  - One review per user per product

### API Endpoint Improvements
- Fixed routing issues for better organization
  - Products: `/api/products`
  - Reviews: `/api/reviews`
  - Auth: `/api/auth`
  - Notifications: `/api/notifications`
- Added proper CORS configuration
  - Enabled credentials
  - Configured allowed methods and headers
  - Set proper origin handling

### Notification System
- Added notification endpoints
  - GET `/api/notifications`: Fetch notifications with pagination
  - PUT `/api/notifications/:id/read`: Mark single notification as read
  - PUT `/api/notifications/read-all`: Mark all notifications as read
- Notification features:
  - Pagination support
  - Real-time updates
  - Different notification types (rental requests, approvals, etc.)
  - Unread/read status tracking

### Authentication Improvements
- Enhanced user authentication
  - Added `/api/auth/me` endpoint for current user info
  - Improved token handling
  - Better error handling for auth failures

### UI/UX Improvements
- Review Section
  - Star rating display
  - Edit/Delete buttons for user's own reviews
  - Real-time updates after actions
  - Validation for review submissions
  - Error handling and user feedback
- Form Validations
  - Comment length restrictions (10-500 characters)
  - Rating validation (1-5 stars)
  - Required field handling

### Security Enhancements
- Added proper authorization middleware
- Implemented role-based access control
- Secured API endpoints with proper authentication checks
- Added input validation and sanitization

### Error Handling
- Improved error messages and handling
- Added proper HTTP status codes
- Better logging for debugging
- User-friendly error displays

## Getting Started

### Prerequisites
- Node.js (>= 16.0.0)
- npm (>= 8.0.0) or yarn (>= 1.22.0)
- MongoDB (>= 6.0.0)
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Rentoo
```

2. Install dependencies for both frontend and backend:
root directory --> frontend
server directory --> backend
   
```bash
# Install frontend dependencies (root directory)
npm install

# Install backend dependencies (server directory)
cd server
npm install
```

3. Environment Setup

#### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_UPLOAD_URL=http://localhost:5000/uploads
```

#### Backend Environment (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/Rentoo
JWT_SECRET=Rentoo
UPLOAD_DIR=uploads
```

4. Start Development Servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from root directory)
cd server
npm run dev
```

### Default Users

#### Admin User
- Email: admin@example.com
- Password: admin123
