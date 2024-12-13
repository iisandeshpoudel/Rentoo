# # Rentoo
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
cd rental-marketplace
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
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
MONGODB_URI=mongodb://localhost:27017/rental-marketplace
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
```

4. Start Development Servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

### Default Users

#### Admin User
- Email: admin@example.com
- Password: admin123

#### Test Vendor
- Email: vendor@example.com
- Password: vendor123

#### Test Customer
- Email: customer@example.com
- Password: customer123

## Recent Updates

### 1. Enhanced Admin Dashboard
- Added comprehensive statistics cards
- Improved user management interface
- Enhanced table layouts and styling
- Added role-based color coding
- Improved search functionality
- Added data visualization
- Enhanced user experience

### 2. Enhanced Search Functionality
- Added global search in navigation bar
- Implemented real-time filtering
- Added search across multiple fields
- Role-specific search interfaces

### 3. UI Improvements
- Professional navigation bar design
- Centered search with icon
- Improved responsive design
- Enhanced loading states

### 4. Dashboard Enhancements
- Added search capabilities to all dashboards
- Improved data filtering
- Enhanced user experience

### 5. Notification System
- Real-time notification updates
- Unread count badge
- Mark as read functionality
- Notification types:
  - Rental requests
  - Request approvals/rejections
  - Return notifications
- Paginated notification list
- Notification center in navigation bar
