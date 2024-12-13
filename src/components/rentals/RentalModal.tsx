import React, { useState } from 'react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRentals } from '../../context/RentalContext';
import { useAuth } from '../../contexts/AuthContext';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function RentalModal({ isOpen, onClose, product }: RentalModalProps) {
  const { createRental } = useRentals();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = Math.ceil(
      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    
    createRental({
      productId: product.id,
      customerId: user.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice: product.price * days,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Rent {product.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            type="date"
            label="End Date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate}
            required
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Rental
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}