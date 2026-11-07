import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, AlertTriangle, Info, User, Settings, Lock, LogOut, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, data, markNotificationRead, setActiveTab } = useApp();
  const { user, signOut, setAuthView } = useAuth();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOutConfirm = async () => {
    setShowSignOutConfirm(false);
    await signOut();
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, orders... (Ctrl + K)"
          className="w-full pl-10 pr-12 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-600 transition-all"
        />
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-mono bg-slate-200/60 px-1.5 my-2 rounded">
          ⌘K
        </span>
      </div>

      {/* Right User & Notifications */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs text-purple-600 font-semibold cursor-pointer hover:underline" onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }}>
                  View All
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-purple-50/40' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 border-l border-slate-200 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs border-2 border-purple-600/30 group-hover:border-purple-600 transition-colors">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SF'}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Store Owner'}</h4>
              <p className="text-xs text-slate-500 font-medium">
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'business_owner' ? 'Business Owner' : (user?.role || 'Merchant')}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 divide-y divide-slate-100">
              <div className="px-4 py-3">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user?.email || 'user@shopflow.ai'}</p>
                <p className="text-xs text-purple-600 font-medium truncate mt-0.5">{user?.shopName || user?.businessName || data?.business?.name || 'Active Shop'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2.5 transition-colors"
                >
                  <Lock className="w-4 h-4" /> Change Password
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); setShowSignOutConfirm(true); }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign Out Confirmation</h3>
            <p className="text-sm text-slate-500">Are you sure you want to sign out of ShopFlow AI?</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-md hover:bg-rose-700 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
