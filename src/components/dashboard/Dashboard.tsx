import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { RentalList } from '../rentals/RentalList';

export function Dashboard() {
  const { user } = useAuth();
  const { getVendorProducts } = useProducts();

  if (!user) return null;

  const vendorProducts = user.role === 'vendor' ? getVendorProducts(user.id) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {user.role === 'vendor' ? 'Rental Requests' : 'My Rentals'}
      </h2>
      <RentalList
        isVendor={user.role === 'vendor'}
        productIds={vendorProducts.map(p => p.id)}
        customerId={user.role === 'customer' ? user.id : undefined}
      />
    </div>
  );
}