import React, { useState } from 'react';
import { ShoppingCart, Plus, Printer, CheckCircle2, Clock, X, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const OrdersView: React.FC = () => {
  const { data, createOrder, updateOrderStatus, searchQuery, setActiveTab } = useApp();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(data?.products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<{ productId: string; productName: string; quantity: number; price: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'JazzCash'>('Cash');
  const [discount, setDiscount] = useState(0);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const orders = data?.orders || [];
  const products = data?.products || [];
  const currencySymbol = data?.business?.currencySymbol || '₨';
  const taxRate = data?.business?.taxRate || 5;

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = () => {
    setStockWarning(null);
    const prod = products.find(p => p.id === selectedProductId) || products[0];
    if (!prod) return;

    const existingIndex = cartItems.findIndex(item => item.productId === prod.id);
    const existingQty = existingIndex > -1 ? cartItems[existingIndex].quantity : 0;
    const requestedTotal = existingQty + quantity;

    if (requestedTotal > prod.stock) {
      setStockWarning(`Only ${prod.stock} units available in stock for "${prod.name}" (Cart has ${existingQty}).`);
      return;
    }

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity = requestedTotal;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { productId: prod.id, productName: prod.name, quantity, price: prod.sellingPrice }]);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round((subtotal - discount) * (taxRate / 100));
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Please add at least one product to the order.');
      return;
    }

    await createOrder({
      customerName,
      customerPhone,
      items: cartItems,
      total: subtotal,
      discount,
      tax,
      grandTotal,
      status: 'Processing',
      paymentMethod,
    });

    setIsCheckoutModalOpen(false);
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Order Management & POS</h2>
          <p className="text-sm text-slate-500">Create customer orders, process payments, and generate invoices.</p>
        </div>
        <button
          onClick={() => setIsCheckoutModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New POS Order</span>
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Orders in this Shop Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your shop has 0 orders. Process customer sales using the POS checkout system to create orders and track revenue.
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md hover:bg-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First POS Order</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-xs">
                  <th className="py-4 px-6 font-semibold">Order ID</th>
                  <th className="py-4 px-4 font-semibold">Customer</th>
                  <th className="py-4 px-4 font-semibold">Items</th>
                  <th className="py-4 px-4 font-semibold">Grand Total</th>
                  <th className="py-4 px-4 font-semibold">Payment</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-purple-600">{o.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{o.customerName}</div>
                      <div className="text-xs text-slate-400">{o.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900">{currencySymbol} {o.grandTotal.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-purple-500/20 ${
                          o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                          o.status === 'Processing' ? 'bg-indigo-50 text-indigo-700' :
                          o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                          o.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedInvoice(o)}
                        className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <FileText className="w-4 h-4" /> Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POS / Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">New POS Checkout Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Zeeshan Haider"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Phone</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Add item to cart */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Add Products</h4>
                  <span className="text-[11px] text-slate-500">{products.length} products available</span>
                </div>

                {products.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800">Your shop currently has 0 products.</p>
                    <p className="text-[11px] text-amber-700">Add products to your shop catalog before placing POS orders.</p>
                    <button
                      type="button"
                      onClick={() => { setIsCheckoutModalOpen(false); setActiveTab('products'); }}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700"
                    >
                      Go to Products
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <select
                          value={selectedProductId || products[0]?.id}
                          onChange={(e) => { setSelectedProductId(e.target.value); setStockWarning(null); }}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - {currencySymbol} {p.sellingPrice.toLocaleString()} (Stock: {p.stock})</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-20 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center"
                        />
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-xl font-semibold text-xs hover:bg-purple-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {stockWarning && (
                      <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {stockWarning}
                      </p>
                    )}
                  </>
                )}

                {/* Cart list */}
                {cartItems.length > 0 && (
                  <div className="mt-3 divide-y divide-slate-200">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{item.quantity}x {item.productName}</span>
                          <button
                            type="button"
                            onClick={() => setCartItems(cartItems.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
                          >
                            ×
                          </button>
                        </div>
                        <span className="font-bold text-slate-900">{currencySymbol} {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="JazzCash">JazzCash / EasyPaisa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Discount ({currencySymbol})</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{currencySymbol} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>- {currencySymbol} {discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxRate}%)</span>
                  <span>+ {currencySymbol} {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-base pt-2 border-t border-purple-200">
                  <span>Grand Total</span>
                  <span>{currencySymbol} {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-md hover:bg-purple-700"
                >
                  Complete Order & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{data?.business?.name || 'Active Shop'}</h3>
                <p className="text-xs text-slate-500">{data?.business?.address || ''}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Order ID:</span> <span className="font-bold text-purple-600">{selectedInvoice.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer:</span> <span className="font-semibold text-slate-800">{selectedInvoice.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="text-slate-800">{selectedInvoice.customerPhone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="text-slate-800">{selectedInvoice.date.split('T')[0]}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment:</span> <span className="font-medium text-slate-800">{selectedInvoice.paymentMethod}</span></div>
            </div>

            <table className="w-full text-left text-xs border-t border-b border-slate-200 py-2">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{currencySymbol} {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-xs text-right font-medium">
              <div>Subtotal: {currencySymbol} {selectedInvoice.total.toLocaleString()}</div>
              <div>Discount: - {currencySymbol} {selectedInvoice.discount.toLocaleString()}</div>
              <div>Tax: + {currencySymbol} {selectedInvoice.tax.toLocaleString()}</div>
              <div className="text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                Grand Total: {currencySymbol} {selectedInvoice.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
