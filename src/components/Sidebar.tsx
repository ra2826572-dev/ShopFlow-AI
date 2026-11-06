import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Boxes, 
  BarChart3, 
  Settings, 
  UserCheck, 
  Bell, 
  Rocket, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, data, fetchAIInsights } = useApp();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const unreadCount = data?.notifications ? data.notifications.filter(n => !n.read).length : 0;
  const lowStockCount = data?.products ? data.products.filter(p => p.stock <= p.minStock).length : 0;
  const ordersCount = data?.orders ? data.orders.length : 0;
  const currentShopName = user?.shopName || data?.business?.name || 'ShopFlow AI';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: data?.products?.length ? data.products.length : undefined },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: ordersCount > 0 ? ordersCount : undefined },
    { id: 'customers', label: 'Customers', icon: Users, badge: data?.customers?.length ? data.customers.length : undefined },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: 'bg-rose-500' },
  ];

  return (
    <aside className="w-64 bg-[#11152D] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0 font-extrabold text-sm uppercase">
          {currentShopName.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-bold text-sm tracking-wide truncate">{currentShopName}</h1>
          <p className="text-[11px] text-purple-400 font-medium truncate">{user?.email || 'Multi-Tenant Shop'}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full text-white font-semibold ${item.badgeColor || 'bg-purple-600'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card */}
      <div className="p-4 mx-4 my-3 rounded-2xl bg-gradient-to-b from-[#1E2240] to-[#161A36] border border-purple-500/20 text-center relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-2">
          <Rocket className="w-4 h-4" />
        </div>
        <h4 className="text-white font-semibold text-sm mb-1">Upgrade to Pro</h4>
        <p className="text-xs text-slate-400 mb-3">Get AI sales forecasting & advanced analytics.</p>
        <button
          onClick={fetchAIInsights}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-purple-600/30 hover:opacity-95 transition-all"
        >
          Upgrade Plan
        </button>
      </div>

      {/* Footer / Theme Switcher */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-5 rounded-full bg-slate-800 p-0.5 flex items-center transition-colors relative"
          >
            <div className={`w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}>
              {darkMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
            </div>
          </button>
        </div>
        <span>© 2026 ShopFlow AI</span>
      </div>
    </aside>
  );
};
