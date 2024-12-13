export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  vendorId: string;
  category: string;
  available: boolean;
}

export interface RentalRequest {
  id: string;
  productId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  totalPrice: number;
}