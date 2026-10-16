import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { mockProducts } from '../data/mockCatalog';
import type { Order, Product, OrderStatus } from '../types';
import { formatPrice } from '../utils/format';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [notification, setNotification] = useState<string>('');

  // Load orders from localStorage
  const loadOrders = () => {
    const raw = localStorage.getItem('nexus_orders');
    if (raw) {
      try {
        setOrders(JSON.parse(raw));
      } catch {
        setOrders([]);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Status update handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem('nexus_orders', JSON.stringify(updated));
    showNotification(`Order status updated to ${newStatus}`);
  };

  // Stock update handler
  const handleSaveStock = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stockQuantity: Math.max(0, newStockVal) } : p
    );
    setProducts(updated);
    setEditingStockId(null);
    showNotification('Inventory level updated successfully');
  };

  // Toggle product active
  const handleToggleProductActive = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updated);
    showNotification('Product status toggled');
  };

  // Analytics metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;

  const filteredOrders = orders.filter((o) =>
    orderFilter === 'all' ? true : o.status === orderFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Management Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Store Administration & Fulfillment
          </h1>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-slate-500">From confirmed customer checkouts</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Orders Placed</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{orders.length}</div>
          <div className="text-[11px] text-slate-500">Pan-India fulfillment queue</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Catalog Stock</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalUnitsInStock} units</div>
          <div className="text-[11px] text-slate-500">Across {products.length} active SKUs</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{lowStockCount} items</div>
          <div className="text-[11px] text-slate-500">Units remaining &le; 5</div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'orders'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'inventory'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Inventory & Stock ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Order Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                  orderFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-white font-semibold text-sm">No orders matching "{orderFilter}"</div>
              <p className="text-xs text-slate-400">Customer checkout orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Order No.</th>
                      <th className="py-3.5 px-4 font-semibold">Customer / Location</th>
                      <th className="py-3.5 px-4 font-semibold">Items</th>
                      <th className="py-3.5 px-4 font-semibold">Total Paid</th>
                      <th className="py-3.5 px-4 font-semibold">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {order.orderNumber}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">
                            {order.shippingAddressSnapshot?.recipientName || 'Customer'}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {order.shippingAddressSnapshot?.city}, {order.shippingAddressSnapshot?.state}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-indigo-400">
                          {formatPrice(order.totalAmount, order.currency)}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="pending_payment">pending_payment</option>
                            <option value="paid">paid</option>
                            <option value="processing">processing</option>
                            <option value="shipped">shipped</option>
                            <option value="delivered">delivered</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Current Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock Quantity</th>
                  <th className="py-3.5 px-4 font-semibold">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                      <span className="font-semibold text-white line-clamp-1">{product.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {product.categoryName || 'General'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {editingStockId === product.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                            className="w-16 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-white font-mono text-xs"
                          />
                          <button
                            onClick={() => handleSaveStock(product.id)}
                            className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="px-2 py-1 text-slate-400 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            product.stockQuantity <= 5 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {product.stockQuantity} units
                          </span>
                          <button
                            onClick={() => {
                              setEditingStockId(product.id);
                              setNewStockVal(product.stockQuantity);
                            }}
                            className="text-[10px] text-slate-500 hover:text-indigo-400 underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleProductActive(product.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          product.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
