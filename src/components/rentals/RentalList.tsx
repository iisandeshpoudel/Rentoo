import React from 'react';
import { useRentals } from '../../context/RentalContext';
import { useProducts } from '../../context/ProductContext';
import { RentalRequest } from '../../types';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import ChatButton from '../chat/ChatButton';

interface RentalListProps {
  isVendor?: boolean;
  productIds?: string[];
  customerId?: string;
}

export function RentalList({ isVendor, productIds, customerId }: RentalListProps) {
  const { rentals, updateRentalStatus, getCustomerRentals, getVendorRentals } = useRentals();
  const { products } = useProducts();

  const displayedRentals = isVendor && productIds
    ? getVendorRentals(productIds)
    : customerId
    ? getCustomerRentals(customerId)
    : [];

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getStatusIcon = (status: RentalRequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {displayedRentals.map(rental => {
        const product = getProduct(rental.productId);
        if (!product) return null;

        return (
          <div key={rental.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-sm text-gray-500">
                  {rental.startDate} - {rental.endDate}
                </p>
                <p className="text-sm font-medium">
                  Total: NPR {rental.totalPrice}
                </p>
                {/* Add chat button for communication */}
                <div className="mt-2">
                  <ChatButton 
                    otherUserId={isVendor ? rental.customer.id : product.vendor.id} 
                    otherUserName={isVendor ? rental.customer.name : product.vendor.name} 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(rental.status)}
                <span className="text-sm font-medium capitalize">
                  {rental.status}
                </span>
              </div>
            </div>
            
            {isVendor && rental.status === 'pending' && (
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => updateRentalStatus(rental.id, 'rejected')}
                  className="text-red-600"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => updateRentalStatus(rental.id, 'approved')}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}