import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationCenter from '../notifications/NotificationCenter';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userRole = user?.role || 'customer';

  const getRoleName = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'vendor':
        return 'Vendor';
      default:
        return 'Customer';
    }
  };

  const getInitial = () => {
    return user?.name ? user.name[0].toUpperCase() : '?';
  };

  return (
    <nav className="bg-primary-600 shadow-lg border-b border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              Rental Marketplace
            </Link>
          </div>

          {/* Search Bar */}
          {userRole !== 'admin' && (
            <div className="flex-1 max-w-2xl mx-8 flex items-center">
              <div className="w-full">
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
                    placeholder="Search products, vendors, categories..."
                    className="block w-full pl-10 pr-3 py-2 border border-primary-500/50 rounded-md leading-5 
                    bg-primary-700/50 text-white placeholder-primary-300 focus:outline-none focus:bg-white 
                    focus:text-gray-900 focus:placeholder-gray-400 focus:border-primary-400 
                    focus:ring-2 focus:ring-primary-400 sm:text-sm transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            
            <Link
              to={userRole === 'vendor' ? '/vendor/dashboard' : userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>

            {/* Profile Menu */}
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex items-center space-x-3 focus:outline-none hover:bg-primary-700 rounded-lg px-2 py-1 transition-colors duration-200">
                <div className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center font-semibold text-lg shadow-lg">
                  {getInitial()}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{user?.name}</div>
                  <div className="text-primary-200 text-sm">{getRoleName()}</div>
                </div>
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={classNames(
                        active ? 'bg-primary-50' : '',
                        'block px-4 py-2 text-sm text-gray-700 hover:text-primary-900'
                      )}
                    >
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={classNames(
                        active ? 'bg-primary-50' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-primary-900'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;