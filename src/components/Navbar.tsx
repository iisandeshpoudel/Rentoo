import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useState, useEffect } from 'react';
import NotificationCenter from './notifications/NotificationCenter';

interface NavbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, onSearch }) => {
  const { user, userRole, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const getInitial = () => {
    return user?.name ? user.name[0].toUpperCase() : '?';
  };

  const getRoleName = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin';
      case 'vendor':
        return 'Vendor';
      case 'customer':
        return 'Customer';
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-primary-600 shadow-lg border-b border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex-shrink-0">
            <Link to="/home" className="text-white font-bold text-xl">
              Rental Marketplace
            </Link>
          </div>

          {/* Center section - Search Bar */}
          {userRole !== 'admin' && (
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-primary-300" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search products, vendors, categories..."
                  className="block w-full pl-10 pr-3 py-2 border border-primary-400/30 rounded-md leading-5 
                  bg-white/10 text-white placeholder-primary-200 
                  focus:outline-none focus:bg-white/20 
                  focus:border-primary-300 focus:placeholder-primary-300
                  focus:ring-1 focus:ring-primary-300 
                  sm:text-sm transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Right section - Navigation Links & Profile */}
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <Link
              to={userRole === 'vendor' ? '/vendor/dashboard' : userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none hover:bg-primary-700 rounded-lg px-2 py-1 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center font-semibold text-lg shadow-lg">
                  {getInitial()}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{user?.name}</div>
                  <div className="text-primary-200 text-sm">Type: {getRoleName()}</div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 