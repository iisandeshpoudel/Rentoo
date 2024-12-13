import { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Menu } from '@headlessui/react';

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-white hover:bg-primary-600/50 rounded-full transition-colors duration-200 focus:outline-none">
        <span className="sr-only">View notifications</span>
        <svg
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-gold text-white text-xs font-medium flex items-center justify-center shadow-premium-sm">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-80 rounded-lg shadow-premium-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
        <div className="bg-gradient-premium px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-primary-200 hover:text-white text-sm transition-colors duration-200"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="mt-4 text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-primary-50 transition-colors duration-200 ${
                    !notification.read ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        notification.type === 'success'
                          ? 'bg-green-100 text-green-600'
                          : notification.type === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : notification.type === 'error'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-primary-100 text-primary-600'
                      }`}>
                        {notification.type === 'success' && (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {notification.type === 'warning' && (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {notification.type === 'error' && (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {notification.type === 'info' && (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                      <div className="mt-2 text-xs text-gray-400 flex justify-between items-center">
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default NotificationCenter;
