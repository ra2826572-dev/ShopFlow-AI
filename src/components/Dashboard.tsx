import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Rocket, 
  ArrowRight, 
  Plus, 
  Store, 
  Sparkles, 
  Edit3, 
  X, 
  Save, 
  Loader2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Coins 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { data, setActiveTab, fetchAIInsights, updateSettings } = useApp();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | '1Y'>('30D');

  // Shop details modal state
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [savingShop, setSavingShop] = useState<boolean>(false);
  const [shopSaveSuccess, setShopSaveSuccess] = useState<boolean>(false);

  const business = data?.business || data?.shop;
  const [shopForm, setShopForm] = useState({
    name: business?.name || user?.shopName || 'My Store',
    tagline: business?.description || (business as any)?.tagline || '',
    currency: business?.currency || 'PKR',
    currencySymbol: business?.currencySymbol || '₨',
    taxRate: business?.taxRate || 5,
    email: business?.email || user?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
  });

  // Sync form when data changes
  useEffect(() => {
    if (data?.business || data?.shop) {
      const b = data?.business || data?.shop;
      setShopForm({
        name: b?.name || user?.shopName || 'My Store',
        tagline: b?.description || (b as any)?.tagline || '',
        currency: b?.currency || 'PKR',
        currencySymbol: b?.currencySymbol || '₨',
        taxRate: b?.taxRate || 5,
        email: b?.email || user?.email || '',
        phone: b?.phone || '',
        address: b?.address || '',
      });
    }
  }, [data?.business, data?.shop, user?.shopName, user?.email]);

  const displayName = user?.first_name || user?.name?.split(' ')[0] || 'Owner';
  const shopName = data?.shop?.name || data?.business?.name || user?.shopName || 'Your Shop';
  const currencySymbol = data?.shop?.currencySymbol || data?.business?.currencySymbol || '₨';

  // Strictly Real Data - No hardcoded demo statistics or fallback numbers
  const totalRevenue = data?.orders && data.orders.length > 0 
    ? data.orders.reduce((acc, o) => acc + (Number(o.grandTotal) || Number(o.total) || 0), 0) 
    : 0;

  const totalOrders = data?.orders ? data.orders.length : 0;
  const totalCustomers = data?.customers ? data.customers.length : 0;
  const totalProducts = data?.products ? data.products.length : 0;
  const lowStockCount = data?.products ? data.products.filter(p => p.stock <= p.minStock).length : 0;

  const topProducts = data?.products ? data.products.slice(0, 4) : [];
  const recentOrders = data?.orders ? data.orders.slice(0, 5) : [];
  const notifications = data?.notifications ? data.notifications.slice(0, 4) : [];

  // Generate real sales chart points from actual orders or flatline zero
  const generateChartData = () => {
    if (!data?.orders || data.orders.length === 0) {
      return [
        { date: 'Mon', sales: 0 },
        { date: 'Tue', sales: 0 },
        { date: 'Wed', sales: 0 },
        { date: 'Thu', sales: 0 },
        { date: 'Fri', sales: 0 },
        { date: 'Sat', sales: 0 },
        { date: 'Sun', sales: 0 },
      ];
    }

    // Group actual orders by date
    const dateMap = new Map<string, number>();
    data.orders.forEach(o => {
      const d = o.date ? o.date.split('T')[0] : 'Today';
      dateMap.set(d, (dateMap.get(d) || 0) + (o.grandTotal || o.total || 0));
    });

    const entries = Array.from(dateMap.entries()).map(([date, sales]) => ({
      date: date.slice(5), // MM-DD
      sales
    }));

    return entries.length >= 2 ? entries : [{ date: 'Start', sales: 0 }, ...entries];
  };

  const chartData = generateChartData();

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    await updateSettings(shopForm);
    setSavingShop(false);
    setShopSaveSuccess(true);
    setTimeout(() => {
      setShopSaveSuccess(false);
      setShowShopModal(false);
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 pb-16 font-sans">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#5022E5] via-[#6C3BFF] to-[#8B5CF6] text-white p-7 sm:p-8 overflow-hidden shadow-xl shadow-purple-600/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Dashboard Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome, {displayName}! 👋
          </h2>
          <p className="text-purple-100 text-sm md:text-base leading-relaxed">
            Managing <strong className="text-white font-bold">{shopName}</strong>. You can customize your store details, track sales, and manage inventory right here.
          </p>

          {/* Quick Shop Details CTA Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowShopModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs shadow-md hover:bg-purple-50 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Shop Details</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <span>Store Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <Store className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Shop Identity & Details Strip */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-600/30 shrink-0">
            {shopName ? shopName.slice(0, 2).toUpperCase() : 'SF'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">{shopName}</h3>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                {shopForm.currency} ({currencySymbol})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {shopForm.tagline || 'Manage your business, inventory, and point of sale'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 hidden sm:block text-right">
            <div><strong className="text-slate-700">Owner:</strong> {user?.name || displayName}</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
          <button
            onClick={() => setShowShopModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/70 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      {/* Shop Details Edit Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Your Shop Details</h3>
                  <p className="text-xs text-slate-500">Customize your shop identity and business info</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShopModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shopSaveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shop details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveShop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="e.g. Khan Mobile & Electronics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Shop Tagline / Description
                </label>
                <input
                  type="text"
                  value={shopForm.tagline}
                  onChange={(e) => setShopForm({ ...shopForm, tagline: e.target.value })}
                  placeholder="e.g. Best smartphones, accessories, and repairs"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={shopForm.currency}
                    onChange={(e) => {
                      const curr = e.target.value;
                      const sym = curr === 'PKR' ? '₨' : curr === 'USD' ? '$' : curr === 'AED' ? 'د.إ' : curr === 'EUR' ? '€' : '£';
                      setShopForm({ ...shopForm, currency: curr, currencySymbol: sym });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={shopForm.taxRate}
                    onChange={(e) => setShopForm({ ...shopForm, taxRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={shopForm.email}
                    onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                    placeholder="shop@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Shop Physical Address
                </label>
                <input
                  type="text"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="e.g. Shop #12, Commercial Plaza, Karachi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShop}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {savingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Shop Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fresh Shop Onboarding Callout (Shows when shop has 0 products) */}
      {totalProducts === 0 && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Fresh Shop is Ready!</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Your environment starts completely clean with 0 products, 0 orders, and {currencySymbol} 0 revenue. Add your first item to build your inventory.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </button>
        </div>
      )}

      {/* 4 Stat KPI Cards (Every new user starts with 0 for all metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Revenue
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tabular-nums">
            {currencySymbol} {totalRevenue.toLocaleString()}
          </h3>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Sales Volume
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tabular-nums">
            {totalOrders}
          </h3>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Registered
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tabular-nums">
            {totalCustomers.toLocaleString()}
          </h3>
        </div>

        {/* Card 4: Low Stock Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {lowStockCount > 0 ? `${lowStockCount} items` : 'Nominal'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Products</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tabular-nums">
            {lowStockCount}
          </h3>
        </div>
      </div>

      {/* Main Grid: Sales Overview & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Overview Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Sales Overview</h3>
              <p className="text-xs text-slate-500">
                {totalOrders > 0 ? 'Live sales revenue performance over time' : 'Revenue chart will plot live transactions as orders are created'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['7D', '30D', '3M', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C3BFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C3BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${currencySymbol}${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11152D', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`${currencySymbol} ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6C3BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications & AI Insights */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Shop Notifications</h3>
              <button 
                onClick={() => setActiveTab('notifications')}
                className="text-xs text-purple-600 font-semibold hover:underline"
              >
                View All →
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active notifications for this shop.
              </div>
            ) : (
              <div className="space-y-3.5">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{n.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Advisor Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#11152D] via-[#1E2240] to-[#2D2B60] text-white p-6 relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3">
                <Rocket className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base mb-1">AI Shop Advisor</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Analyze inventory health and predict customer sales demand using Gemini AI.
              </p>
              <button
                onClick={fetchAIInsights}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-purple-600/40 flex items-center gap-2 hover:opacity-95 transition-all"
              >
                <span>Run Shop Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                🏆
              </div>
              <h3 className="text-base font-bold text-slate-800">Your Catalog</h3>
            </div>
            <button 
              onClick={() => setActiveTab('products')}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              Manage Products →
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No products added yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Add items to your catalog with prices and stock levels to start selling.
              </p>
              <button
                onClick={() => setActiveTab('products')}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                      <p className="text-xs text-slate-400">{p.category} · Stock: {p.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block tabular-nums">
                      {currencySymbol} {p.sellingPrice.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'Low Stock' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Recent Orders</h3>
            </div>
            <button 
              onClick={() => setActiveTab('orders')}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              View Orders →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No orders placed yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Orders created through your POS or catalog will appear here in real time.
              </p>
              <button
                onClick={() => setActiveTab('orders')}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Order</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-purple-600 font-mono">{o.orderNumber || o.id}</td>
                      <td className="py-3 font-medium text-slate-800">{o.customerName}</td>
                      <td className="py-3 font-bold text-slate-900 tabular-nums">{currencySymbol} {o.grandTotal.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                          o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                          o.status === 'Processing' ? 'bg-indigo-50 text-indigo-600' :
                          o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                          o.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono">{o.date ? o.date.split('T')[0] : 'Today'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
