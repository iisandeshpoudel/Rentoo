import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = 'http://localhost:5000';

// Base64 placeholder image (light gray square)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAAN0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgx1lAABqFDyOQAAAABJRU5ErkJggg==';

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
  vendor: {
    _id: string;
    name: string;
    email: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    preferredMethod: 'phone' | 'email' | 'both';
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleRentalRequest = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return;
    }

    if (!product?.availability) {
      setError('This product is not available for rent');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/rental-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rental request');
      }

      const data = await response.json();
      navigate('/dashboard');
    } catch (err) {
      console.error('Rental request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is the vendor of this product
  const isVendor = product?.vendor._id === user?._id;
  // Check if user can rent (must be customer and not the vendor)
  const canRent = userRole === 'customer' && !isVendor && product?.availability;

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

  if (!product) {
    return (
      <div className="text-center text-gray-600 p-4">
        Product not found
      </div>
    );
  }

  const totalDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = totalDays * product.dailyRate;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={getImageUrl(product.images?.[0])}
              alt={product.name}
              className="rounded-lg object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== PLACEHOLDER_IMAGE) {
                  console.log('Failed to load image:', target.src);
                  target.src = PLACEHOLDER_IMAGE;
                  target.onerror = null;
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((image, index) => (
              <img
                key={index}
                src={getImageUrl(image)}
                alt={`${product.name} - ${index + 2}`}
                className="rounded-lg object-cover w-full h-24"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== PLACEHOLDER_IMAGE) {
                    console.log('Failed to load image:', target.src);
                    target.src = PLACEHOLDER_IMAGE;
                    target.onerror = null;
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xl text-indigo-600 font-semibold">
                ${product.dailyRate}/day
              </p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.availability 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.availability ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Category</h3>
              <p className="text-gray-600">{product.category}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Condition</h3>
              <p className="text-gray-600">{product.condition}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Location</h3>
              <p className="text-gray-600">{product.location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vendor</h3>
              <p className="text-gray-600">{product.vendor.name}</p>
            </div>
          </div>


          {/* Contact Details */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <dl className="mt-4 space-y-3">
              {(product.contactDetails.preferredMethod === 'both' || product.contactDetails.preferredMethod === 'phone') && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.contactDetails.phone}</dd>
                </div>
              )}
              
              {(product.contactDetails.preferredMethod === 'both' || product.contactDetails.preferredMethod === 'email') && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.contactDetails.email}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Preferred Contact Method</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.contactDetails.preferredMethod === 'both' ? 'Email or Phone' :
                   product.contactDetails.preferredMethod === 'phone' ? 'Phone Only' : 'Email Only'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Rental Request Form - Only show for customers who aren't the vendor */}
          {canRent ? (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold">Make a Rental Request</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="bg-white p-4 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Daily Rate:</span>
                    <span>${product.dailyRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of Days:</span>
                    <span>{totalDays}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                    <span>Total Price:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleRentalRequest}
                disabled={isSubmitting || !startDate || !endDate}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (isSubmitting || !startDate || !endDate) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rental Request'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-center text-gray-600">
                {isVendor 
                  ? "You can't rent your own product" 
                  : !product.availability 
                    ? "This product is currently not available for rent"
                    : "Only customers can make rental requests"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;