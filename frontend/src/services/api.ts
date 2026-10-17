import type { Product, Category } from '../types';
import { mockProducts, mockCategories } from '../data/mockCatalog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ntecommerce-1.onrender.com/api/v1';

export const api = {
  // Health check
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return { status: 'offline', localFallback: true };
    }
  },

  // Fetch products
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE_URL}/products?${query}`);
      if (!res.ok) throw new Error('Failed to fetch from backend');
      const data = await res.json();
      return data.products || mockProducts;
    } catch {
      return mockProducts;
    }
  },

  // Fetch categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.categories || mockCategories;
    } catch {
      return mockCategories;
    }
  },

  // Create checkout session / order
  async createCheckout(
    payload: { items: any[]; shippingAddress: any; userId?: string; customerEmail?: string },
    token?: string | null
  ) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Checkout initiation failed');
      }
      return await res.json();
    } catch (e: any) {
      throw new Error(e.message || 'Network error during checkout');
    }
  },

  // Fetch customer orders (isolated per account)
  async getOrders(params?: { token?: string | null; email?: string; userId?: string }) {
    try {
      const headers: Record<string, string> = {};
      if (params?.token) {
        headers['Authorization'] = `Bearer ${params.token}`;
      }

      const queryParams = new URLSearchParams();
      if (params?.email) queryParams.set('email', params.email);
      if (params?.userId) queryParams.set('userId', params.userId);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await fetch(`${API_BASE_URL}/orders${qs}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      return data.orders || [];
    } catch (e) {
      console.warn('Orders fetch warning:', e);
      return [];
    }
  },

  // Fetch single order details
  async getOrderById(orderId: string, token?: string | null) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return data.order || null;
    } catch {
      return null;
    }
  },

  // Verify payment
  async verifyPayment(payload: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Admin analytics
  async getAdminAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch {
      return null;
    }
  },
};

