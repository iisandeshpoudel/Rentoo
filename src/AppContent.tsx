import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CustomerDashboard from './components/dashboard/CustomerDashboard';
import VendorDashboard from './components/dashboard/VendorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductDetail from './components/products/ProductDetail';
import ProductEditForm from './components/products/ProductEditForm';
import ProductForm from './components/products/ProductForm';
import Profile from './components/profile/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public Route Component - redirects to appropriate page if authenticated
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/home" />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect admin to dashboard if trying to access home page
  const handleHomeAccess = () => {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Home searchQuery={searchQuery} />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />}
      <div className={isAuthenticated ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor']}>
                {handleHomeAccess()}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/customer" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/vendor" 
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/new" 
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/:id" 
            element={<ProductDetail />} 
          />
          <Route 
            path="/products/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <ProductEditForm />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

export default AppContent;
