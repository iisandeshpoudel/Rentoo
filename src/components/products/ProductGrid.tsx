import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isVendor?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onRent?: (product: Product) => void;
}

export function ProductGrid({ 
  products,
  isVendor,
  onEdit,
  onDelete,
  onRent
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          isVendor={isVendor}
          onEdit={onEdit}
          onDelete={onDelete}
          onRent={onRent}
        />
      ))}
    </div>
  );
}