import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  CreditCard, 
  BarChart3, 
  Settings, 
  History, 
  Power, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Store, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  FileText,
  Package,
  Database,
  Copy,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';

export const AdminPanel: React.FC = () => {
  const { user, signOut, setAuthView } = useAuth();
  
  // Tab State matching Super Admin sections
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'businesses' | 'accounts' | 'subscriptions' | 'revenue' | 'user-management' | 'business-control' | 'settings' | 'logs' | 'all-products' | 'sql-migration'
  >('overview');

  // Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [businessesList, setBusinessesList] = useState<any[]>([]);
  const [allProductsList, setAllProductsList] = useState<any[]>([]);
  const [subscriptionsData, setSubscriptionsData] = useState<{ plans: any[]; subscriptions: any[] }>({ plans: [], subscriptions: [] });
  const [revenueData, setRevenueData] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [statusModal, setStatusModal] = useState<{ type: 'user' | 'business'; targetId: string; targetName: string; currentStatus: string } | null>(null);
  const [statusReason, setStatusReason] = useState<string>('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('Active');

  const [roleModal, setRoleModal] = useState<{ userEmail: string; userName: string; currentRole: string } | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('business_owner');

  const [subAssignModal, setSubAssignModal] = useState<{ businessId: string; businessName: string; currentPlan: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('Professional');

  const [deleteBizModal, setDeleteBizModal] = useState<{ businessId: string; businessName: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-user-email': user?.email || 'ra2826572@gmail.com'
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, usersRes, bizRes, subsRes, revRes, logsRes, settingsRes, prodRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: adminHeaders }),
        fetch('/api/admin/users', { headers: adminHeaders }),
        fetch('/api/admin/businesses', { headers: adminHeaders }),
        fetch('/api/admin/subscriptions', { headers: adminHeaders }),
        fetch('/api/admin/revenue', { headers: adminHeaders }),
        fetch('/api/admin/logs', { headers: adminHeaders }),
        fetch('/api/admin/settings', { headers: adminHeaders }),
        fetch('/api/admin/products', { headers: adminHeaders })
      ]);

      const [metricsJson, usersJson, bizJson, subsJson, revJson, logsJson, settingsJson, prodJson] = await Promise.all([
        metricsRes.json(),
        usersRes.json(),
        bizRes.json(),
        subsRes.json(),
        revRes.json(),
        logsRes.json(),
        settingsRes.json(),
        prodRes.json()
      ]);

      if (metricsJson.success) setMetrics(metricsJson.metrics);
      if (usersJson.success) setUsersList(usersJson.users);
      if (bizJson.success) setBusinessesList(bizJson.businesses);
      if (subsJson.success) setSubscriptionsData({ plans: subsJson.plans, subscriptions: subsJson.subscriptions });
      if (revJson.success) setRevenueData(revJson);
      if (logsJson.success) setActivityLogs(logsJson.logs);
      if (settingsJson.success) setSystemSettings(settingsJson.settings);
      if (prodJson.success) setAllProductsList(prodJson.products || []);
    } catch (err: any) {
      console.error('Failed to load super admin data:', err);
      showToast('Error loading admin records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [user?.email]);

  // Action Handlers
  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setActionLoading(true);
    try {
      const endpoint = statusModal.type === 'user' 
        ? `/api/admin/users/${encodeURIComponent(statusModal.targetId)}/status`
        : `/api/admin/businesses/${statusModal.targetId}/status`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status: selectedNewStatus, reason: statusReason })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${statusModal.targetName} status updated to ${selectedNewStatus}`);
        setStatusModal(null);
        setStatusReason('');
        await fetchAllAdminData();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(roleModal.userEmail)}/role`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ role: selectedNewRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Role updated to ${selectedNewRole} for ${roleModal.userName}`);
        setRoleModal(null);
        await fetchAllAdminData();
      } else {
        showToast(data.error || 'Failed to update role', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignPlan = async () => {
    if (!subAssignModal) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions/assign', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          businessId: subAssignModal.businessId,
          planName: selectedPlan,
          paymentStatus: 'Paid'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Assigned ${selectedPlan} plan to ${subAssignModal.businessName}`);
        setSubAssignModal(null);
        await fetchAllAdminData();
      } else {
        showToast(data.error || 'Failed to assign plan', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!deleteBizModal) return;
    if (deleteConfirmText !== deleteBizModal.businessName) {
      showToast(`Please type "${deleteBizModal.businessName}" exactly to confirm`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${deleteBizModal.businessId}`, {
        method: 'DELETE',
        headers: adminHeaders,
        body: JSON.stringify({ confirmName: deleteConfirmText, permanent: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${deleteBizModal.businessName} permanently deleted.`);
        setDeleteBizModal(null);
        setDeleteConfirmText('');
        await fetchAllAdminData();
      } else {
        showToast(data.error || 'Failed to delete business', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(systemSettings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('System configuration saved successfully!');
        setSystemSettings(data.settings);
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const exportRevenueCSV = () => {
    if (!revenueData?.transactions) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Payment ID,Business,Email,Plan,Amount (PKR),Method,Status,Date",
       ...revenueData.transactions.map((t: any) => `${t.id},"${t.businessName}","${t.ownerEmail}",${t.plan},${t.amount},${t.paymentMethod},${t.status},${t.date}`)
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopflow_revenue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV revenue transactions report.');
  };

  const navItems = [
    { id: 'overview', label: '1. Overview Dashboard', icon: BarChart3 },
    { id: 'users', label: '2. All Registered Users', icon: Users },
    { id: 'businesses', label: '3. All Shops & Stores', icon: Building },
    { id: 'all-products', label: '4. Products Across Shops', icon: Package },
    { id: 'sql-migration', label: '5. Supabase SQL Migration', icon: Database },
    { id: 'accounts', label: '6. Account Management', icon: Power },
    { id: 'subscriptions', label: '7. Subscriptions', icon: CreditCard },
    { id: 'revenue', label: '8. Revenue Analytics', icon: DollarSign },
    { id: 'user-management', label: '9. User Management', icon: UserCheck },
    { id: 'business-control', label: '10. Business Control', icon: Trash2 },
    { id: 'settings', label: '11. System Settings', icon: Settings },
    { id: 'logs', label: '12. Activity Logs', icon: History }
  ];

  return (
    <div className="flex h-screen bg-[#11152D] text-slate-200 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2 border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950 text-emerald-200 border-emerald-800' 
            : 'bg-rose-950 text-rose-200 border-rose-800'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Super Admin Navigation Sidebar */}
      <aside className="w-72 bg-[#0C0F22] border-r border-slate-800/80 flex flex-col select-none shrink-0">
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-base tracking-wide">ShopFlow</h1>
              <p className="text-[11px] text-rose-400 font-bold uppercase tracking-wider">Super Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSearchQuery(''); setStatusFilter('All'); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-purple-700 text-white shadow-lg shadow-rose-600/25'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Store Dashboard Switch & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-[#090C1A]">
          <button
            onClick={() => setAuthView('app')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-semibold text-xs transition-all border border-purple-500/20"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>Merchant Store View</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-all border border-rose-500/20"
          >
            <Power className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F7F8FC] text-slate-900">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
              Super Admin Session Active
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {user?.id}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllAdminData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <h4 className="text-sm font-extrabold text-slate-900">{user?.name || 'Rizwan Ahmad'}</h4>
              <p className="text-xs text-rose-600 font-semibold">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm border-2 border-rose-500">
              RA
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="p-8 space-y-8 flex-1 pb-16">
          {/* SECTION 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Platform Overview Dashboard</h2>
                <p className="text-sm text-slate-500">Live platform metrics, database records, and growth analytics.</p>
              </div>

              {/* 8 Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalUsers ?? usersList.length}</h3>
                  <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">+100% Verified Profiles</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Businesses</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalBusinesses ?? businessesList.length}</h3>
                  <span className="text-xs text-indigo-600 font-bold mt-1 inline-block">Multi-Tenant Stores</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Businesses</p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics?.activeBusinesses ?? 3}</h3>
                  <span className="text-xs text-slate-500 mt-1 inline-block">Operating smoothly</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended Businesses</p>
                  <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{metrics?.suspendedBusinesses ?? 0}</h3>
                  <span className="text-xs text-rose-500 mt-1 inline-block">Access Restricted</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</p>
                  <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{metrics?.activeSubscriptions ?? 3}</h3>
                  <span className="text-xs text-purple-600 font-bold mt-1 inline-block">Starter / Pro / Enterprise</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired Subscriptions</p>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{metrics?.expiredSubscriptions ?? 0}</h3>
                  <span className="text-xs text-amber-600 font-medium mt-1 inline-block">Requiring renewal</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring (MRR)</p>
                  <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">₨ {(metrics?.mrr || 37000).toLocaleString()}</h3>
                  <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">Predictable revenue</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected Revenue</p>
                  <h3 className="text-2xl font-extrabold text-rose-600 mt-1">₨ {(metrics?.totalRevenue || 62000).toLocaleString()}</h3>
                  <span className="text-xs text-slate-500 mt-1 inline-block">Verified payments</span>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Monthly Revenue & Subscription Growth</h3>
                    <p className="text-xs text-slate-500">Platform billing trends across all merchant subscriptions</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                    Currency: PKR (₨)
                  </span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.revenueByMonth || []}>
                      <defs>
                        <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₨${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0B0E1E', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#E11D48" strokeWidth={3} fillOpacity={1} fill="url(#adminRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activities & Payments Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-sm">Recent Platform Payments</h4>
                    <button onClick={() => setActiveTab('revenue')} className="text-xs text-rose-600 font-bold hover:underline">View All →</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(metrics?.recentPayments || []).map((p: any) => (
                      <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{p.businessName}</p>
                          <span className="text-slate-400 font-mono">{p.paymentMethod} • {p.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-600 block">₨ {p.amount.toLocaleString()}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-sm">Recent Administrative Audit Logs</h4>
                    <button onClick={() => setActiveTab('logs')} className="text-xs text-rose-600 font-bold hover:underline">View Logs →</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(activityLogs.slice(0, 4) || []).map((l: any) => (
                      <div key={l.id} className="py-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-600">{l.action}</span>
                          <span className="text-slate-400 text-[10px]">{l.timestamp.split('T')[0]}</span>
                        </div>
                        <p className="text-slate-600 truncate">{l.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ALL REGISTERED USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">All Registered Users</h2>
                  <p className="text-sm text-slate-500">Search, inspect, and manage merchant and staff accounts across all businesses.</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or business..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Status:</span>
                  {['All', 'Active', 'Suspended'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        statusFilter === st ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">User Name</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Business</th>
                      <th className="py-4 px-4">Assigned Role</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Registered Date</th>
                      <th className="py-4 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList
                      .filter(u => {
                        const matchQ = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       u.business.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchS = statusFilter === 'All' || u.status === statusFilter;
                        return matchQ && matchS;
                      })
                      .map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">{u.name}</td>
                          <td className="py-4 px-4 font-mono text-slate-600">{u.email}</td>
                          <td className="py-4 px-4 text-purple-700 font-semibold">{u.business}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              u.role === 'super_admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              u.role === 'manager' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-400">{u.createdAt?.split('T')[0]}</td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => {
                                setStatusModal({ type: 'user', targetId: u.email, targetName: u.name, currentStatus: u.status });
                                setSelectedNewStatus(u.status === 'Active' ? 'Suspended' : 'Active');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => {
                                setRoleModal({ userEmail: u.email, userName: u.name, currentRole: u.role });
                                setSelectedNewRole(u.role);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px]"
                            >
                              Role
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: ALL BUSINESSES */}
          {activeTab === 'businesses' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">All Businesses Directory</h2>
                <p className="text-sm text-slate-500">Comprehensive overview of all merchant companies on ShopFlow AI.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">Business Name</th>
                      <th className="py-4 px-4">Owner</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Products</th>
                      <th className="py-4 px-4">Orders</th>
                      <th className="py-4 px-4">Subscription</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {businessesList.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{b.name}</p>
                          <span className="text-slate-400 text-[10px] font-mono">{b.email}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800">{b.ownerName}</td>
                        <td className="py-4 px-4 text-slate-600">{b.category}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{b.productCount || 6}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{b.orderCount || 5}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">
                            {b.plan}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setStatusModal({ type: 'business', targetId: b.id, targetName: b.name, currentStatus: b.status });
                              setSelectedNewStatus(b.status === 'Active' ? 'Suspended' : 'Active');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => {
                              setSubAssignModal({ businessId: b.id, businessName: b.name, currentPlan: b.plan });
                              setSelectedPlan(b.plan);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold"
                          >
                            Plan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: ACCOUNT MANAGEMENT (ACTIVATE / DEACTIVATE) */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Dedicated Account Status Management</h2>
                <p className="text-sm text-slate-500">Manage account lifecycle: Active, Inactive, Suspended, and Pending Verification with enforced security rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usersList.map(u => (
                  <div key={u.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{u.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-extrabold text-xs ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                      <div><strong>Associated Store:</strong> {u.business}</div>
                      <div><strong>Current Role:</strong> {u.role}</div>
                      {u.statusReason && <div><strong>Status Note:</strong> {u.statusReason}</div>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setStatusModal({ type: 'user', targetId: u.email, targetName: u.name, currentStatus: u.status });
                          setSelectedNewStatus('Active');
                        }}
                        disabled={u.status === 'Active'}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 disabled:opacity-30 text-white font-bold text-xs hover:bg-emerald-700 transition-all"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => {
                          setStatusModal({ type: 'user', targetId: u.email, targetName: u.name, currentStatus: u.status });
                          setSelectedNewStatus('Suspended');
                        }}
                        disabled={u.status === 'Suspended' || u.role === 'super_admin'}
                        className="flex-1 py-2 rounded-xl bg-rose-600 disabled:opacity-30 text-white font-bold text-xs hover:bg-rose-700 transition-all"
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Subscription & Plan Architecture</h2>
                <p className="text-sm text-slate-500">Manage tier pricing, active subscribers, expiry dates, and billing schedules.</p>
              </div>

              {/* 4 Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {(subscriptionsData.plans || []).map((plan: any) => (
                  <div key={plan.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-purple-700 text-sm uppercase tracking-wider">{plan.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{plan.billingCycle}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-3">₨ {plan.price.toLocaleString()}</h3>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {plan.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscriptions Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-base">Active Merchant Subscriptions</h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">Business</th>
                      <th className="py-4 px-4">Plan</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4">Start Date</th>
                      <th className="py-4 px-4">Expiry Date</th>
                      <th className="py-4 px-4">Payment</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(subscriptionsData.subscriptions || []).map((s: any) => (
                      <tr key={s.businessId} className="hover:bg-slate-50/80">
                        <td className="py-4 px-6 font-bold text-slate-900">{s.businessName}</td>
                        <td className="py-4 px-4 font-bold text-purple-700">{s.plan}</td>
                        <td className="py-4 px-4 font-extrabold text-slate-900">₨ {s.price.toLocaleString()}</td>
                        <td className="py-4 px-4 text-slate-500">{s.startDate}</td>
                        <td className="py-4 px-4 font-semibold text-slate-700">{s.expiryDate}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSubAssignModal({ businessId: s.businessId, businessName: s.businessName, currentPlan: s.plan });
                              setSelectedPlan(s.plan);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold"
                          >
                            Change Plan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: REVENUE ANALYTICS */}
          {activeTab === 'revenue' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Revenue Analytics & Financial Breakdown</h2>
                  <p className="text-sm text-slate-500">Real verified payment records, MRR, annual projections, and CSV export.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportRevenueCSV}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected Revenue</p>
                  <h3 className="text-2xl font-black text-rose-600 mt-1">₨ {(revenueData?.summary?.totalRevenue || 62000).toLocaleString()}</h3>
                  <span className="text-xs text-slate-500 mt-1 inline-block">100% verified transactions</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current MRR</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">₨ {(revenueData?.summary?.monthlyRecurringRevenue || 37000).toLocaleString()}</h3>
                  <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">Active subscriptions</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Annual Revenue</p>
                  <h3 className="text-2xl font-black text-indigo-600 mt-1">₨ {(revenueData?.summary?.annualRevenue || 444000).toLocaleString()}</h3>
                  <span className="text-xs text-slate-500 mt-1 inline-block">MRR x 12 months</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ARPU (Avg per Customer)</p>
                  <h3 className="text-2xl font-black text-purple-600 mt-1">₨ {(revenueData?.summary?.averageRevenuePerUser || 12333).toLocaleString()}</h3>
                  <span className="text-xs text-purple-600 font-bold mt-1 inline-block">High-tier enterprise mix</span>
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-base">Verified Transaction Log</h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">Payment ID</th>
                      <th className="py-4 px-4">Business</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Plan</th>
                      <th className="py-4 px-4">Payment Method</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(revenueData?.transactions || []).map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-6 font-mono font-bold text-purple-700">{t.id}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{t.businessName}</td>
                        <td className="py-4 px-4 font-black text-slate-900">₨ {t.amount.toLocaleString()}</td>
                        <td className="py-4 px-4">{t.plan}</td>
                        <td className="py-4 px-4 text-slate-600">{t.paymentMethod}</td>
                        <td className="py-4 px-4 text-slate-400">{t.date}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 7: USER MANAGEMENT (ROLES & PERMISSIONS) */}
          {activeTab === 'user-management' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">User Role & Privilege Management</h2>
                <p className="text-sm text-slate-500">Only Super Admins can alter user privileges. All role modifications generate secure audit trails.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-4">Store Association</th>
                      <th className="py-4 px-4">Current Role</th>
                      <th className="py-4 px-4">Account Status</th>
                      <th className="py-4 px-6 text-right">Role Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-700">{u.business}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full font-extrabold text-[10px] ${
                            u.role === 'super_admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            u.role === 'manager' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-600">{u.status}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setRoleModal({ userEmail: u.email, userName: u.name, currentRole: u.role });
                              setSelectedNewRole(u.role);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: BUSINESS CONTROL (SUSPEND / DELETE) */}
          {activeTab === 'business-control' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Business Control & Removal Protection</h2>
                <p className="text-sm text-slate-500">Safeguarded business suspension and permanent deletion workflows requiring explicit name confirmation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businessesList.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-base">{b.name}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div><strong>Owner:</strong> {b.ownerName} ({b.email})</div>
                      <div><strong>Active Plan:</strong> {b.plan}</div>
                      <div><strong>Products in Store:</strong> {b.productCount || 6}</div>
                      <div><strong>Total Orders:</strong> {b.orderCount || 5}</div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setStatusModal({ type: 'business', targetId: b.id, targetName: b.name, currentStatus: b.status });
                          setSelectedNewStatus(b.status === 'Active' ? 'Suspended' : 'Active');
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                          b.status === 'Active' 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {b.status === 'Active' ? 'Suspend Business' : 'Reactivate Business'}
                      </button>

                      {b.id !== 'biz_hq' && (
                        <button
                          onClick={() => {
                            setDeleteBizModal({ businessId: b.id, businessName: b.name });
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: SYSTEM SETTINGS */}
          {activeTab === 'settings' && systemSettings && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Global System Settings</h2>
                <p className="text-sm text-slate-500">Configure multi-tenant application defaults, security policies, and maintenance states.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">General Platform Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Application Name</label>
                      <input
                        type="text"
                        value={systemSettings.general.appName}
                        onChange={(e) => setSystemSettings({ ...systemSettings, general: { ...systemSettings.general, appName: e.target.value } })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={systemSettings.general.supportEmail}
                        onChange={(e) => setSystemSettings({ ...systemSettings, general: { ...systemSettings.general, supportEmail: e.target.value } })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Defaults */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Business Store Defaults</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Default Currency</label>
                      <input
                        type="text"
                        value={systemSettings.business.defaultCurrency}
                        onChange={(e) => setSystemSettings({ ...systemSettings, business: { ...systemSettings.business, defaultCurrency: e.target.value } })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={systemSettings.business.defaultCurrencySymbol}
                        onChange={(e) => setSystemSettings({ ...systemSettings, business: { ...systemSettings.business, defaultCurrencySymbol: e.target.value } })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Default Tax (%)</label>
                      <input
                        type="number"
                        value={systemSettings.business.defaultTaxRate}
                        onChange={(e) => setSystemSettings({ ...systemSettings, business: { ...systemSettings.business, defaultTaxRate: Number(e.target.value) } })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance & Security */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Security & Maintenance</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.security.enforceRLS}
                        onChange={(e) => setSystemSettings({ ...systemSettings, security: { ...systemSettings.security, enforceRLS: e.target.checked } })}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">Enforce Row Level Security (RLS) across all tenant database queries</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenance.maintenanceMode}
                        onChange={(e) => setSystemSettings({ ...systemSettings, maintenance: { ...systemSettings.maintenance, maintenanceMode: e.target.checked } })}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span className="text-xs font-semibold text-rose-600">Enable Platform Maintenance Mode</span>
                    </label>
                  </div>
                </div>

                {/* Reset Platform Data Card */}
                <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-rose-900 text-sm">Danger Zone: Complete Platform Reset</h3>
                  <p className="text-xs text-rose-700">
                    Permanently delete all test users, shops, products, and customer records across the platform, while preserving the Super Admin account (ra2826572@gmail.com).
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete all test users, shops, and products? This action cannot be undone.')) {
                          setActionLoading(true);
                          try {
                            const res = await fetch('/api/admin/reset-platform', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'x-user-email': user?.email || 'ra2826572@gmail.com'
                              }
                            });
                            const data = await res.json();
                            setActionLoading(false);
                            if (data.success) {
                              showToast('Platform successfully reset. All test data deleted.', 'success');
                              // Refresh data
                              const metricsRes = await fetch('/api/admin/metrics', { headers: { 'x-user-email': user?.email || 'ra2826572@gmail.com' } });
                              const metricsData = await metricsRes.json();
                              if (metricsData.success) setMetrics(metricsData.metrics);
                            } else {
                              showToast(data.error || 'Failed to reset platform', 'error');
                            }
                          } catch (err: any) {
                            setActionLoading(false);
                            showToast(err.message || 'Error resetting platform', 'error');
                          }
                        }
                      }}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      {actionLoading ? 'Resetting...' : 'Delete All Test Users & Products'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
                  >
                    {actionLoading ? 'Saving Settings...' : 'Save Global System Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 10: ACTIVITY AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Administrative Audit Trails</h2>
                <p className="text-sm text-slate-500">Immutable chronological records of all privilege changes, status modifications, and security events.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-4">Admin Email</th>
                      <th className="py-4 px-4">Action</th>
                      <th className="py-4 px-4">Target</th>
                      <th className="py-4 px-6">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {activityLogs.map((l: any) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-4 px-6 text-slate-500">{l.timestamp}</td>
                        <td className="py-4 px-4 font-bold text-slate-800">{l.adminEmail}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                            {l.action}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-700">{l.target}</td>
                        <td className="py-4 px-6 text-slate-600">{l.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 11: ALL PRODUCTS ACROSS SHOPS */}
          {activeTab === 'all-products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Products Across All Shops</h2>
                  <p className="text-sm text-slate-500">Global tenant inventory inspection. View products belonging to each individual merchant shop.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                    Total Products: {allProductsList.length}
                  </span>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter products by product name, shop name, or merchant email..."
                  className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {allProductsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Package className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No products created in any shop yet.</p>
                    <p className="text-xs">When merchants add items to their catalogs, they will appear here under platform admin monitoring.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-4">Shop Name</th>
                        <th className="py-4 px-4">Owner Email</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Selling Price</th>
                        <th className="py-4 px-4">Stock</th>
                        <th className="py-4 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allProductsList
                        .filter(p => 
                          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.shop_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.owner_email || '').toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <span className="text-slate-400 font-mono text-[10px]">{p.sku}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                                {p.shop_name || 'Shop'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-600">{p.owner_email}</td>
                            <td className="py-4 px-4 text-slate-600">{p.category}</td>
                            <td className="py-4 px-4 font-bold text-slate-900">₨ {Number(p.selling_price).toLocaleString()}</td>
                            <td className="py-4 px-4 font-bold text-slate-700">{p.stock}</td>
                            <td className="py-4 px-6 text-right">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                p.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                                p.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SECTION 12: SUPABASE SQL MIGRATION SCRIPT */}
          {activeTab === 'sql-migration' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Supabase Multi-Tenant SQL Migration</h2>
                  <p className="text-sm text-slate-500">
                    Production-ready idempotent PostgreSQL schema with Row Level Security (RLS) for Supabase SQL Editor.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const fullSql = `-- ==============================================================================
-- SHOPFLOW MULTI-TENANT SAAS SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Fully Idempotent - Fixes "type user_role already exists" error
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums (Safe Idempotent Creation)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'shop_owner', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('Active', 'Inactive', 'Suspended', 'Pending Verification');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'shop_owner' NOT NULL,
  status public.account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  shop_id UUID,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_active TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Shops Table (Each user gets a separate shop)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Retail Store',
  currency TEXT DEFAULT 'PKR',
  currency_symbol TEXT DEFAULT '₨',
  tax_rate REAL DEFAULT 5.0,
  email TEXT,
  phone TEXT,
  address TEXT,
  status public.account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'General' NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT DEFAULT '',
  purchase_price REAL DEFAULT 0 NOT NULL,
  selling_price REAL DEFAULT 0 NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 5 NOT NULL,
  status TEXT DEFAULT 'In Stock' NOT NULL,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  total_spent REAL DEFAULT 0 NOT NULL,
  orders_count INTEGER DEFAULT 0 NOT NULL,
  last_order_date TEXT DEFAULT 'Never',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  total REAL DEFAULT 0 NOT NULL,
  discount REAL DEFAULT 0 NOT NULL,
  tax REAL DEFAULT 0 NOT NULL,
  grand_total REAL DEFAULT 0 NOT NULL,
  status public.order_status DEFAULT 'Processing' NOT NULL,
  payment_method TEXT DEFAULT 'Cash' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price REAL DEFAULT 0 NOT NULL,
  total REAL DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_shop ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_shop ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.user_has_shop_access(target_shop_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = target_shop_id AND (owner_id = auth.uid() OR public.is_super_admin())
  );
$$;

-- RLS Policies
DROP POLICY IF EXISTS "Shops access policy" ON public.shops;
CREATE POLICY "Shops access policy" ON public.shops FOR ALL
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Products access policy" ON public.products;
CREATE POLICY "Products access policy" ON public.products FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

DROP POLICY IF EXISTS "Customers access policy" ON public.customers;
CREATE POLICY "Customers access policy" ON public.customers FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

DROP POLICY IF EXISTS "Orders access policy" ON public.orders;
CREATE POLICY "Orders access policy" ON public.orders FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

DROP POLICY IF EXISTS "Order items access policy" ON public.order_items;
CREATE POLICY "Order items access policy" ON public.order_items FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true) ON CONFLICT (id) DO UPDATE SET public = true;`;
                    navigator.clipboard.writeText(fullSql);
                    setSqlCopied(true);
                    showToast('Full Supabase SQL Migration copied to clipboard!');
                    setTimeout(() => setSqlCopied(false), 3000);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {sqlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{sqlCopied ? 'SQL Copied!' : 'Copy Full SQL Script'}</span>
                </button>
              </div>

              {/* Notice Card for user_role error */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fixed: "ERROR: 42710: type 'user_role' already exists"</span>
                </p>
                <p className="text-emerald-700">
                  This migration uses safe <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold">DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ... END $$;</code> blocks for all types and enums, ensuring seamless execution in the Supabase SQL editor without crashing on rerun.
                </p>
              </div>

              {/* Code viewer */}
              <div className="bg-[#0C0F22] rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden font-mono text-[11px] text-slate-300 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre">
{`-- ==============================================================================
-- SHOPFLOW MULTI-TENANT SAAS SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Fully Idempotent - Fixes "type user_role already exists" error
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums (Safe Idempotent Creation)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'shop_owner', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('Active', 'Inactive', 'Suspended', 'Pending Verification');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'shop_owner' NOT NULL,
  status public.account_status DEFAULT 'Active' NOT NULL,
  shop_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Shops Table (Each user gets a separate shop)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  currency TEXT DEFAULT 'PKR',
  status public.account_status DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  selling_price REAL DEFAULT 0 NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'In Stock' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  grand_total REAL DEFAULT 0 NOT NULL,
  status public.order_status DEFAULT 'Processing' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price REAL DEFAULT 0 NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: STATUS UPDATE WITH REASON */}
      {statusModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Update Status: {statusModal.targetName}</h3>
              <button onClick={() => setStatusModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select New Status</label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended (Restricted)</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Reason / Notes (Required for suspension)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Terms of service violation, billing overdue..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStatusModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
              >
                {actionLoading ? 'Saving...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USER ROLE CHANGE */}
      {roleModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Change Role: {roleModal.userName}</h3>
              <button onClick={() => setRoleModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">Authorized Role</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
              >
                <option value="business_owner">Business Owner (Merchant)</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff Associate</option>
                <option value="super_admin">Super Admin (Privileged)</option>
              </select>
              <p className="text-[11px] text-slate-500">Assigning Super Admin grants complete administrative control over the platform.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setRoleModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleUpdateRole} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md">
                {actionLoading ? 'Updating...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN SUBSCRIPTION PLAN */}
      {subAssignModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Assign Subscription: {subAssignModal.businessName}</h3>
              <button onClick={() => setSubAssignModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Tier Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
              >
                <option value="Free">Free (₨ 0 / mo)</option>
                <option value="Starter">Starter (₨ 3,500 / mo)</option>
                <option value="Professional">Professional (₨ 8,500 / mo)</option>
                <option value="Enterprise">Enterprise (₨ 25,000 / mo)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setSubAssignModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleAssignPlan} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md">
                {actionLoading ? 'Updating...' : 'Save Subscription Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PERMANENT BUSINESS DELETION CONFIRMATION */}
      {deleteBizModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Permanently Delete Business?</h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">Warning: This action is irreversible and purges all inventory, order history, and customer records.</p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs text-slate-600">To confirm, type <strong className="text-slate-900">{deleteBizModal.businessName}</strong> below:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deleteBizModal.businessName}
                className="w-full px-3 py-2 border border-rose-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteBizModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={handleDeleteBusiness}
                disabled={actionLoading || deleteConfirmText !== deleteBizModal.businessName}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 disabled:opacity-30 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
              >
                {actionLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
