export interface Shop {
  id: string;
  name: string;
  owner_id: string;
  logo_url: string;
  description: string;
  category: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Suspended';
  status_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// Backwards-compatible alias for existing views
export type Business = Shop;

export interface Category {
  id: string;
  shop_id?: string;
  name: string;
  description: string;
  count?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  shop_id?: string;
  category_id?: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface Order {
  id: string;
  shop_id?: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  items: OrderItem[];
  total: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash';
  date: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  shop_id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  shop_id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  suppliedCategory: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  shop_id?: string;
  title: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  paymentMethod: string;
  description: string;
  created_at?: string;
}

export interface StaffMember {
  id: string;
  shop_id?: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Shop Owner' | 'Manager' | 'Staff' | 'Cashier';
  status: 'Active' | 'Inactive';
  phone: string;
  joinedDate: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  shop_id?: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  time: string;
  read: boolean;
  created_at?: string;
}

export interface AppData {
  shop: Shop;
  business: Business; // Alias for seamless backwards compatibility
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  staff: StaffMember[];
  notifications: NotificationItem[];
}
