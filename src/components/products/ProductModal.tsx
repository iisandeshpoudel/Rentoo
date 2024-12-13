import React from 'react';
import { Product } from '../../types';
import { ProductForm } from './ProductForm';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => void;
}

export function ProductModal({ isOpen, onClose, product, onSubmit }: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <ProductForm
          initialData={product}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}