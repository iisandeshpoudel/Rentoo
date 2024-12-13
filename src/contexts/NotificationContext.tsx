import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedRental?: any;
  relatedProduct?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isNotificationSystemAvailable, setIsNotificationSystemAvailable] = useState(true);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !isNotificationSystemAvailable) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setIsNotificationSystemAvailable(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async (page: number = 1) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 404) {
        // If the endpoint doesn't exist yet, just set empty notifications
        setNotifications([]);
        setTotalPages(0);
        setCurrentPage(1);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setTotalPages(0);
      setCurrentPage(1);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated || !isNotificationSystemAvailable) return;

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setIsNotificationSystemAvailable(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update the notifications list
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !isNotificationSystemAvailable) return;

    try {
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setIsNotificationSystemAvailable(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update all notifications to read
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );

      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isNotificationSystemAvailable) {
      fetchNotifications(1);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, isNotificationSystemAvailable]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        currentPage,
        totalPages,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
