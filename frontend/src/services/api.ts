import type { Product, Category } from '../types';
import { mockProducts, mockCategories } from '../data/mockCatalog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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
  async createCheckout(payload: { items: any[]; shippingAddress: any }) {
    try {
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
