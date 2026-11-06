import React, { useState } from 'react';
import { Boxes, AlertTriangle, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InventoryView: React.FC = () => {
  const { data, updateProduct, searchQuery } = useApp();
  const products = data?.products || [];
  const currencySymbol = data?.business?.currencySymbol || '₨';

  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [adjustmentQty, setAdjustmentQty] = useState<number>(5);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const lowStockItems = products.filter(p => p.stock <= p.minStock);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;

    const newStock = adjustmentType === 'add' ? prod.stock + adjustmentQty : Math.max(0, prod.stock - adjustmentQty);
    await updateProduct(prod.id, { stock: newStock });
    alert(`Successfully adjusted stock for ${prod.name}. New stock: ${newStock}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Inventory Management</h2>
        <p className="text-sm text-slate-500">Real-time stock valuation, low-stock alerts, and stock adjustments.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inventory Valuation</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{currencySymbol} {totalInventoryValue.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">Based on purchase cost</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SKU Items</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{products.length} Products</h3>
          <p className="text-xs text-blue-600 font-medium mt-1">Across {data?.categories.length || 4} categories</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">{lowStockItems.length} Items</h3>
          <p className="text-xs text-rose-500 font-medium mt-1">Require immediate reordering</p>
        </div>
      </div>

      {/* Stock Adjustment Tool */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-4">Quick Stock Adjustment</h3>
        <form onSubmit={handleStockAdjustment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500/20"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Action Type</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="add">Stock In (Add)</option>
              <option value="subtract">Stock Out (Subtract)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Apply Adjustment</span>
          </button>
        </form>
      </div>

      {/* Inventory Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Current Stock Levels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-xs">
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-4 font-semibold">SKU</th>
                <th className="py-4 px-4 font-semibold">Current Stock</th>
                <th className="py-4 px-4 font-semibold">Min Level</th>
                <th className="py-4 px-4 font-semibold">Unit Cost</th>
                <th className="py-4 px-4 font-semibold">Total Stock Value</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800">{p.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-500">{p.sku}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">{p.stock} units</td>
                  <td className="py-4 px-4 text-slate-500">{p.minStock} units</td>
                  <td className="py-4 px-4">{currencySymbol} {p.purchasePrice.toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-purple-600">{currencySymbol} {(p.stock * p.purchasePrice).toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.stock <= p.minStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.stock <= p.minStock ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
