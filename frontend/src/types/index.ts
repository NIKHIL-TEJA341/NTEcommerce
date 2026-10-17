export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  attributes: Record<string, string>; // e.g. { size: 'M', color: 'Midnight Black' }
  priceOverride?: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stockQuantity: number;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  isFeatured: boolean;
  variants?: ProductVariant[];
  features?: string[];
  specs?: Record<string, string>;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  priceAtAddition: number;
}

export interface Address {
  id?: string;
  recipientName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed'
  | 'refund_pending'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productNameSnapshot: string;
  skuSnapshot?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail?: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddressSnapshot: Address;
  items: OrderItem[];
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider: 'google';
  emailVerified: boolean;
}

export const APP_NAME = 'NEXUS';

