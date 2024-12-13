import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  dailyRate: number;
  images: string[];
  location: string;
  condition: string;
  availability: boolean;
  contactDetails: {
    phone: string;
    email: string;
    preferredMethod: 'phone' | 'email' | 'both';
  };
}

interface RentalRequest {
  _id: string;
  product: Product;
  customer: {
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

interface ApiRentalRequest extends Omit<RentalRequest, 'product'> {
  product?: Product;
}

const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'requests'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const navigate = useNavigate();

  const handleEdit = (productId: string) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove the deleted product from state
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, requestsRes] = await Promise.all([
          fetch('http://localhost:5000/api/vendor/products', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('http://localhost:5000/api/vendor/rental-requests', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (!productsRes.ok || !requestsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [productsData, requestsData] = await Promise.all([
          productsRes.json(),
          requestsRes.json()
        ]);

        // Filter out any invalid rental requests
        const validRequestsData = (requestsData as ApiRentalRequest[]).filter((request): request is RentalRequest => 
          request !== null &&
          request.product !== undefined &&
          request.customer !== undefined &&
          request.status !== undefined
        );

        setProducts(productsData);
        setRentalRequests(validRequestsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RentalRequest['status']) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Update local state
      setRentalRequests(prev =>
        prev.map(request =>
          request._id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
    }
  };

  const handleToggleProductAvailability = async (productId: string, newAvailability: boolean) => {
    try {
      // Find the current product
      const currentProduct = products.find(p => p._id === productId);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productData: JSON.stringify({
            name: currentProduct.name,
            description: currentProduct.description,
            category: currentProduct.category,
            dailyRate: currentProduct.dailyRate,
            location: currentProduct.location,
            condition: currentProduct.condition,
            contactDetails: currentProduct.contactDetails,
            availability: newAvailability
          })
        })
      });

      if (!response.ok) {
        // Try to parse error message from JSON response
        let errorMessage = 'Failed to update product availability';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product._id === productId
            ? { ...product, availability: data.availability }
            : product
        )
      );
    } catch (err) {
      console.error('Error updating product availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product availability');
      
      // Revert the UI state since the update failed
      setProducts(prev =>
        prev.map(product =>
          product._id === productId
            ? { ...product, availability: !newAvailability }
            : product
        )
      );
    }
  };

  // Filter functions
  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product?.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product?.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product?.location?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredRequests = rentalRequests.filter(request => {
    if (!request?.product || !request?.customer) return false;
    
    const searchTerm = requestSearch.toLowerCase();
    return (
      request.product.name.toLowerCase().includes(searchTerm) ||
      request.customer.name.toLowerCase().includes(searchTerm) ||
      request.status.toLowerCase().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-100 border-t-purple-600"></div>
        <p className="text-gray-500 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full max-w-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-400 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to safely get image URL
  const getProductImage = (product: Product | null | undefined) => {
    if (!product?.images?.length) return '/placeholder.jpg';
    return product.images[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <Link
          to="/products/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Add New Product
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors duration-200`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`${
              activeTab === 'requests'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors duration-200`}
          >
            Rental Requests
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {productSearch ? `No products match "${productSearch}"` : 'Get started by adding your first product'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/products/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Product
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.images[0] || '/placeholder.jpg'}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.dailyRate}/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleProductAvailability(product._id, !product.availability)}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                              product.availability ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                product.availability ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-sm font-medium ${product.availability ? 'text-purple-600' : 'text-gray-500'}`}>
                            {product.availability ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEdit(product._id)}
                          className="text-purple-600 hover:text-purple-900 focus:outline-none focus:underline transition-colors duration-150"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none focus:underline transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Rental Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No rental requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {requestSearch ? `No requests match "${requestSearch}"` : 'You have no rental requests at the moment'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr 
                      key={request._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getProductImage(request.product)}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.product?.name || 'Product Unavailable'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.customer?.name || 'Unknown Customer'}</div>
                        <div className="text-sm text-gray-500">{request.customer?.email || 'No email available'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.startDate).toLocaleDateString()} -
                          {new Date(request.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${request.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : request.status === 'approved'
                            ? 'bg-purple-100 text-purple-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : request.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestStatus(request._id, 'approved')}
                              className="text-purple-600 hover:text-purple-900 focus:outline-none focus:underline transition-colors duration-150"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(request._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 focus:outline-none focus:underline transition-colors duration-150"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(request._id, 'completed')}
                            className="text-amber-600 hover:text-amber-900 focus:outline-none focus:underline transition-colors duration-150"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;