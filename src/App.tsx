import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { StaffView } from './components/StaffView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { ForgotPassword } from './components/ForgotPassword';
import { AdminPanel } from './components/AdminPanel';
import { ShopSetup } from './components/ShopSetup';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F7F8FC] h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading ShopFlow AI...</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsView />;
      case 'inventory': return <InventoryView />;
      case 'orders': return <OrdersView />;
      case 'customers': return <CustomersView />;
      case 'suppliers': return <SuppliersView />;
      case 'expenses': return <ExpensesView />;
      case 'reports': return <ReportsView />;
      case 'staff': return <StaffView />;
      case 'notifications': return <NotificationsView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F7F8FC]">
      <Header />
      <main className="flex-1">
        {renderTab()}
      </main>
      <AIAdvisorModal />
    </div>
  );
};

const AppShell: React.FC = () => {
  const { user, authView } = useAuth();

  if (!user || authView === 'signin') {
    return <SignIn />;
  }
  if (authView === 'signup') {
    return <SignUp />;
  }
  if (authView === 'forgot') {
    return <ForgotPassword />;
  }
  if (authView === 'shop-setup' || (user && user.needsShopSetup)) {
    return <ShopSetup />;
  }

  // If user is super_admin and authView is admin
  if (user.role === 'super_admin' && authView === 'admin') {
    return <AdminPanel />;
  }

  // If normal user tries to access admin, fallback to app
  return (
    <div className="flex h-screen bg-[#11152D] overflow-hidden font-sans">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}
