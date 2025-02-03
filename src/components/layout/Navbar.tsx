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
    <nav className="bg-primary-600 shadow-lg border-b border-primary-700 relative z-40">
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
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-primary-500 text-white placeholder-primary-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search for rentals..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right side navigation items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Center */}
                <div className="relative z-50">
                  <NotificationCenter />
                </div>

                {/* User Menu */}
                <Menu as="div" className="relative inline-block text-left z-40">
                  <Menu.Button className="flex items-center space-x-3 text-white hover:text-primary-100 focus:outline-none">
                    <span className="hidden md:block text-sm">{user.name}</span>
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {getInitial()}
                    </div>
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs font-medium text-primary-600 mt-1">{getRoleName()}</p>
                      </div>

                      <hr className="my-1" />

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;