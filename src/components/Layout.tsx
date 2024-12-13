import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShoppingBag, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick: () => void;
}

export default function Layout({ children, onAuthClick }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold">RentMarket</span>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button 
                  onClick={onAuthClick}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Login
                </button>
                <button 
                  onClick={onAuthClick}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}