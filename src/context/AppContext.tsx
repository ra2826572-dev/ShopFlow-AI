import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Product, Order, Customer, Supplier, Expense, StaffMember, Business } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  data: AppData | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'lastOrderDate'>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addStaff: (staff: Omit<StaffMember, 'id' | 'joinedDate' | 'status'>) => Promise<void>;
  updateSettings: (settings: Partial<Business>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  refreshData: () => Promise<void>;
  aiInsightsOpen: boolean;
  setAIInsightsOpen: (open: boolean) => void;
  aiInsights: string;
  loadingAI: boolean;
  fetchAIInsights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiInsightsOpen, setAIInsightsOpen] = useState<boolean>(false);
  const [aiInsights, setAIInsights] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  const getHeaders = (extraHeaders?: Record<string, string>) => ({
    'Content-Type': 'application/json',
    'x-user-email': user?.email || '',
    ...extraHeaders
  });

  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data', {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.email]);

  const addProduct = async (product: Omit<Product, 'id' | 'status'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (res.ok) await refreshData();
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (res.ok) await refreshData();
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) await refreshData();
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'date'>): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    const json = await res.json();
    await refreshData();
    return json.order;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) await refreshData();
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'lastOrderDate'>) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customer),
    });
    if (res.ok) await refreshData();
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(supplier),
    });
    if (res.ok) await refreshData();
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense),
    });
    if (res.ok) await refreshData();
  };

  const addStaff = async (staff: Omit<StaffMember, 'id' | 'joinedDate' | 'status'>) => {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(staff),
    });
    if (res.ok) await refreshData();
  };

  const updateSettings = async (settings: Partial<Business>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (res.ok) await refreshData();
  };

  const markNotificationRead = (id: string) => {
    if (!data) return;
    const updated = data.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setData({ ...data, notifications: updated });
  };

  const fetchAIInsights = async () => {
    setLoadingAI(true);
    setAIInsightsOpen(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.error) {
        setAIInsights(`Error: ${json.error}`);
      } else {
        setAIInsights(json.insights);
      }
    } catch (err: any) {
      setAIInsights(`Failed to fetch AI insights: ${err.message}`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        addCustomer,
        addSupplier,
        addExpense,
        addStaff,
        updateSettings,
        markNotificationRead,
        refreshData,
        aiInsightsOpen,
        setAIInsightsOpen,
        aiInsights,
        loadingAI,
        fetchAIInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
