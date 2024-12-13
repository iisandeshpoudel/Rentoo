import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../lib/storage';
import { RentalRequest } from '../types';
import { useAuth } from './AuthContext';

interface RentalContextType {
  rentals: RentalRequest[];
  createRental: (rental: Omit<RentalRequest, 'id' | 'status'>) => void;
  updateRentalStatus: (id: string, status: RentalRequest['status']) => void;
  getCustomerRentals: (customerId: string) => RentalRequest[];
  getVendorRentals: (productIds: string[]) => RentalRequest[];
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedRentals = storage.get('rentals') || [];
    setRentals(storedRentals);
  }, []);

  const createRental = (rental: Omit<RentalRequest, 'id' | 'status'>) => {
    const newRental: RentalRequest = {
      ...rental,
      id: Date.now().toString(),
      status: 'pending',
    };
    const updatedRentals = [...rentals, newRental];
    storage.set('rentals', updatedRentals);
    setRentals(updatedRentals);
  };

  const updateRentalStatus = (id: string, status: RentalRequest['status']) => {
    const updatedRentals = rentals.map(rental =>
      rental.id === id ? { ...rental, status } : rental
    );
    storage.set('rentals', updatedRentals);
    setRentals(updatedRentals);
  };

  const getCustomerRentals = (customerId: string) => {
    return rentals.filter(rental => rental.customerId === customerId);
  };

  const getVendorRentals = (productIds: string[]) => {
    return rentals.filter(rental => productIds.includes(rental.productId));
  };

  return (
    <RentalContext.Provider value={{
      rentals,
      createRental,
      updateRentalStatus,
      getCustomerRentals,
      getVendorRentals,
    }}>
      {children}
    </RentalContext.Provider>
  );
}

export const useRentals = () => {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRentals must be used within a RentalProvider');
  }
  return context;
};