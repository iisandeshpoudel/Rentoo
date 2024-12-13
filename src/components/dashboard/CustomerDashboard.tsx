import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

// Base64 placeholder image (light gray square)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAAN0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgx1lAABqFDyOQAAAABJRU5ErkJggg==';

interface RentalRequest {
  _id: string;
  product?: {
    _id: string;
    name: string;
    description: string;
    images: string[];
    vendor?: {
      name: string;
      email: string;
    };
  };
  productDeleted?: boolean;
  productSnapshot?: {
    name: string;
    description: string;
    category: string;
    dailyRate: number;
  };
  vendor?: {
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  createdAt: string;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRentalRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/customer/rental-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          console.log('Token expired or invalid, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch rental requests');
        }

        const data = await response.json();
        // Log the first request's product data for debugging
        if (data.length > 0) {
          console.log('First rental request:', {
            id: data[0]._id,
            product: data[0].product ? {
              id: data[0].product._id,
              name: data[0].product.name,
              images: data[0].product.images
            } : 'No product',
            status: data[0].status
          });
        }
        setRentalRequests(data);
      } catch (err) {
        console.error('Error fetching rental requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rental requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequests();
  }, [navigate]);

  const handleCancelRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      // Update the local state
      setRentalRequests(prev =>
        prev.map(request =>
          request._id === requestId
            ? { ...request, status: 'cancelled' as const }
            : request
        )
      );
    } catch (err) {
      console.error('Error canceling request:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const handleDeleteRental = async (rentalId: string) => {
    if (!window.confirm('Are you sure you want to delete this rental history?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rental-requests/${rentalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete rental history');
      }

      // Remove the deleted rental from state
      setRentalRequests(prev => prev.filter(rental => rental._id !== rentalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rental history');
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    // If it's already a full URL or data URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    // If the path already starts with /uploads, prepend only the API_URL
    if (imagePath.startsWith('/uploads')) {
      return `${API_URL}${imagePath}`;
    }
    
    // Otherwise, construct the full path
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  const getStatusBadgeColor = (status: RentalRequest['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  // Filter rental requests based on search query
  const filteredRentalRequests = rentalRequests.filter(request =>
    (request.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (request.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Rental Requests</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rentals..."
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {filteredRentalRequests.length === 0 ? (
        <div className="text-center text-gray-600 p-4">
          {searchQuery ? 'No matching rental requests found.' : "You haven't made any rental requests yet."}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRentalRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="md:flex md:justify-between md:items-center">
                  <div className="flex items-center space-x-4">
                    {request.product ? (
                      <>
                        <img
                          src={getImageUrl(request.product.images?.[0])}
                          alt={request.product.name || 'Product Image'}
                          className="h-20 w-20 object-cover rounded bg-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== PLACEHOLDER_IMAGE) {
                              console.log('Failed to load image:', target.src);
                              target.src = PLACEHOLDER_IMAGE;
                              target.onerror = null;
                            }
                          }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold">{request.product.name}</h3>
                          <p className="text-gray-600">
                            {request.product.vendor?.name || 'Unknown Vendor'}
                          </p>
                        </div>
                      </>
                    ) : request.productSnapshot ? (
                      <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs text-center">Product No Longer Available</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">{request.productSnapshot.name}</h3>
                          <p className="text-sm text-gray-600">Product has been removed</p>
                          <p className="text-xs text-gray-500">
                            Original price: ${request.productSnapshot.dailyRate}/day
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-500">Product Unavailable</h3>
                          <p className="text-sm text-gray-600">This product may have been removed</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <div>
                      <p className="text-sm text-gray-600">Rental Period</p>
                      <p className="font-medium">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="font-medium">${request.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium capitalize">{request.status}</p>
                    </div>
                  </div>

                  <div className="ml-4">
                    {(request.status === 'completed' || request.status === 'rejected' || request.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteRental(request._id)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      >
                        Delete History
                      </button>
                    )}
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request._id)}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>

                {request.message && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="text-gray-800">{request.message}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;