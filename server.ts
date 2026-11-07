import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { shopflowDb } from './src/db/database.ts';
import { performSupabaseBackendReset } from './src/db/supabaseAdmin.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // 1. Audit Logs Store
  interface AuditLog {
    id: string;
    timestamp: string;
    adminEmail: string;
    action: string;
    target: string;
    details: string;
  }

  const adminLogs: AuditLog[] = [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      adminEmail: 'ra2826572@gmail.com',
      action: 'SYSTEM_BOOTSTRAP',
      target: 'Platform Core',
      details: 'Super Admin account provisioned with full administrative privileges.'
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      adminEmail: 'ra2826572@gmail.com',
      action: 'SUBSCRIPTION_UPGRADED',
      target: 'ShopFlow Tech & Retail',
      details: 'Upgraded to Enterprise Pro plan with annual billing cycle.'
    },
    {
      id: 'log_3',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      adminEmail: 'ra2826572@gmail.com',
      action: 'SECURITY_AUDIT',
      target: 'Database RLS',
      details: 'Verified database Row Level Security policies across all tenant tables.'
    }
  ];

  const logAction = (adminEmail: string, action: string, target: string, details: string) => {
    adminLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      adminEmail: adminEmail || 'ra2826572@gmail.com',
      action,
      target,
      details
    });
  };

  // 2. Users Store (Server authoritative)
  interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'business_owner' | 'manager' | 'staff';
    businessId: string;
    businessName: string;
    status: 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';
    statusReason?: string;
    phone?: string;
    createdAt: string;
    lastActive: string;
  }

  const usersDb: Record<string, UserRecord> = {
    'ra2826572@gmail.com': {
      id: 'usr_admin_1',
      name: 'Rizwan Ahmad',
      email: 'ra2826572@gmail.com',
      role: 'super_admin',
      businessId: 'biz_hq',
      businessName: 'ShopFlow Tech & Retail',
      status: 'Active',
      phone: '+92 300 1234567',
      createdAt: '2025-01-01T00:00:00Z',
      lastActive: new Date().toISOString()
    },
    'merchant@shopflow.ai': {
      id: 'usr_merchant_1',
      name: 'Tariq Mehmood',
      email: 'merchant@shopflow.ai',
      role: 'business_owner',
      businessId: 'biz_mehmood',
      businessName: 'Mehmood Electronics & Mobile',
      status: 'Active',
      phone: '+92 321 4567890',
      createdAt: '2025-02-15T10:30:00Z',
      lastActive: new Date(Date.now() - 1800000).toISOString()
    },
    'hamza@shopflow.ai': {
      id: 'usr_mgr_1',
      name: 'Hamza Shah',
      email: 'hamza@shopflow.ai',
      role: 'manager',
      businessId: 'biz_hq',
      businessName: 'ShopFlow Tech & Retail',
      status: 'Active',
      phone: '+92 301 9876543',
      createdAt: '2025-03-15T09:00:00Z',
      lastActive: new Date(Date.now() - 7200000).toISOString()
    },
    'sana.malik@gmail.com': {
      id: 'usr_sana_1',
      name: 'Sana Malik',
      email: 'sana.malik@gmail.com',
      role: 'business_owner',
      businessId: 'biz_fashion',
      businessName: 'Karachi Fashion Hub',
      status: 'Active',
      phone: '+92 312 7890123',
      createdAt: '2025-04-10T14:20:00Z',
      lastActive: new Date(Date.now() - 14400000).toISOString()
    }
  };

  // 3. Subscription Plans Store
  const subscriptionPlans = [
    {
      id: 'plan_free',
      name: 'Free',
      price: 0,
      billingCycle: 'Monthly',
      maxProducts: 50,
      features: ['Basic Inventory', '1 Staff Account', 'Sales Reports'],
      status: 'Active'
    },
    {
      id: 'plan_starter',
      name: 'Starter',
      price: 3500,
      billingCycle: 'Monthly',
      maxProducts: 500,
      features: ['Unlimited Orders', '3 Staff Accounts', 'Export CSV', 'Email Alerts'],
      status: 'Active'
    },
    {
      id: 'plan_pro',
      name: 'Professional',
      price: 8500,
      billingCycle: 'Monthly',
      maxProducts: 5000,
      features: ['Multi-Branch Support', '10 Staff Accounts', 'AI Business Analyst', 'Priority Support'],
      status: 'Active'
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      price: 25000,
      billingCycle: 'Monthly',
      maxProducts: 50000,
      features: ['Unlimited Everything', 'Dedicated Account Manager', 'Custom API & Webhooks', 'Automated Daily Backups'],
      status: 'Active'
    }
  ];

  // 4. Businesses Metadata Store
  interface BusinessMeta {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    category: string;
    plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
    subscriptionStatus: 'Active' | 'Expired' | 'Trial';
    price: number;
    startDate: string;
    expiryDate: string;
    paymentStatus: 'Paid' | 'Pending' | 'Overdue';
    status: 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';
    statusReason?: string;
    isDeleted: boolean;
    createdAt: string;
  }

  const businessesMeta: Record<string, BusinessMeta> = {
    'biz_hq': {
      id: 'biz_hq',
      name: 'ShopFlow Tech & Retail',
      ownerName: 'Rizwan Ahmad',
      email: 'ra2826572@gmail.com',
      category: 'Electronics & Mobiles',
      plan: 'Enterprise',
      subscriptionStatus: 'Active',
      price: 25000,
      startDate: '2025-01-01',
      expiryDate: '2027-01-01',
      paymentStatus: 'Paid',
      status: 'Active',
      isDeleted: false,
      createdAt: '2025-01-01T00:00:00Z'
    },
    'biz_mehmood': {
      id: 'biz_mehmood',
      name: 'Mehmood Electronics & Mobile',
      ownerName: 'Tariq Mehmood',
      email: 'merchant@shopflow.ai',
      category: 'Consumer Electronics',
      plan: 'Professional',
      subscriptionStatus: 'Active',
      price: 8500,
      startDate: '2025-02-15',
      expiryDate: '2026-12-15',
      paymentStatus: 'Paid',
      status: 'Active',
      isDeleted: false,
      createdAt: '2025-02-15T10:30:00Z'
    },
    'biz_fashion': {
      id: 'biz_fashion',
      name: 'Karachi Fashion Hub',
      ownerName: 'Sana Malik',
      email: 'sana.malik@gmail.com',
      category: 'Clothing & Apparel',
      plan: 'Starter',
      subscriptionStatus: 'Active',
      price: 3500,
      startDate: '2025-04-10',
      expiryDate: '2026-11-10',
      paymentStatus: 'Paid',
      status: 'Active',
      isDeleted: false,
      createdAt: '2025-04-10T14:20:00Z'
    }
  };

  // 5. Real Platform Payments Records
  interface PaymentRecord {
    id: string;
    businessId: string;
    businessName: string;
    ownerEmail: string;
    amount: number;
    currency: string;
    plan: string;
    paymentMethod: string;
    status: 'Completed' | 'Pending' | 'Refunded';
    date: string;
  }

  const paymentsHistory: PaymentRecord[] = [
    {
      id: 'PAY-9042',
      businessId: 'biz_hq',
      businessName: 'ShopFlow Tech & Retail',
      ownerEmail: 'ra2826572@gmail.com',
      amount: 25000,
      currency: 'PKR',
      plan: 'Enterprise',
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      date: '2026-11-01'
    },
    {
      id: 'PAY-8921',
      businessId: 'biz_mehmood',
      businessName: 'Mehmood Electronics & Mobile',
      ownerEmail: 'merchant@shopflow.ai',
      amount: 8500,
      currency: 'PKR',
      plan: 'Professional',
      paymentMethod: 'JazzCash',
      status: 'Completed',
      date: '2026-10-15'
    },
    {
      id: 'PAY-8810',
      businessId: 'biz_fashion',
      businessName: 'Karachi Fashion Hub',
      ownerEmail: 'sana.malik@gmail.com',
      amount: 3500,
      currency: 'PKR',
      plan: 'Starter',
      paymentMethod: 'Card',
      status: 'Completed',
      date: '2026-10-10'
    },
    {
      id: 'PAY-8755',
      businessId: 'biz_hq',
      businessName: 'ShopFlow Tech & Retail',
      ownerEmail: 'ra2826572@gmail.com',
      amount: 25000,
      currency: 'PKR',
      plan: 'Enterprise',
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      date: '2026-10-01'
    }
  ];

  // 6. Global System Settings Store
  let systemSettings = {
    general: {
      appName: 'ShopFlow AI',
      appLogo: '',
      websiteUrl: 'https://shopflow.ai',
      supportEmail: 'support@shopflow.ai',
      contactPhone: '+92 300 1234567',
      address: 'Techno City Commercial Tower, Karachi'
    },
    business: {
      defaultCurrency: 'PKR',
      defaultCurrencySymbol: '₨',
      defaultTaxRate: 5,
      defaultTimezone: 'Asia/Karachi',
      allowPublicRegistration: true,
      requireEmailVerification: true
    },
    subscription: {
      defaultPlan: 'Starter',
      trialDurationDays: 14,
      allowGracePeriod: true,
      gracePeriodDays: 7,
      autoInvoiceGeneration: true
    },
    security: {
      enforceRLS: true,
      sessionTimeoutMinutes: 1440,
      maxFailedLogins: 5,
      requireTwoFactorForAdmin: false,
      auditAllAdminActions: true
    },
    notification: {
      emailOnNewUser: true,
      emailOnNewBusiness: true,
      emailOnSubscriptionExpiry: true,
      emailOnPaymentSuccess: true
    },
    maintenance: {
      maintenanceMode: false,
      systemStatus: 'Operational',
      announcementMessage: 'ShopFlow AI v2.5 Super Admin Panel is fully operational!'
    }
  };

  // Helper template for initial store data
  const createInitialStoreData = (businessName: string, email: string) => ({
    business: {
      name: businessName,
      tagline: "Manage Your Business. Track Every Sale. Grow Smarter.",
      currency: "PKR",
      currencySymbol: "₨",
      taxRate: 5,
      email: email,
      phone: "+92 300 1234567",
      address: "Main Commercial Market, Pakistan",
      logo: "",
    },
    products: [
      { id: "p1", name: "iPhone 15 Pro", sku: "APL-IP15P-128", barcode: "194253401234", category: "Mobiles", purchasePrice: 280000, sellingPrice: 320000, stock: 3, minStock: 5, status: "Low Stock", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300" },
      { id: "p2", name: "AirPods Pro (2nd Gen)", sku: "APL-APP-02", barcode: "194253405678", category: "Accessories", purchasePrice: 45000, sellingPrice: 55000, stock: 24, minStock: 8, status: "In Stock", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300" },
      { id: "p3", name: "Samsung Galaxy S24", sku: "SAM-S24-256", barcode: "880609401234", category: "Mobiles", purchasePrice: 240000, sellingPrice: 275000, stock: 12, minStock: 5, status: "In Stock", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300" },
      { id: "p4", name: "MacBook Air M2", sku: "APL-MBA-M2", barcode: "194253409012", category: "Laptops", purchasePrice: 310000, sellingPrice: 355000, stock: 8, minStock: 3, status: "In Stock", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300" },
      { id: "p5", name: "Sony WH-1000XM5", sku: "SNY-WH5-BLK", barcode: "027242923456", category: "Accessories", purchasePrice: 75000, sellingPrice: 92000, stock: 2, minStock: 4, status: "Low Stock", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
      { id: "p6", name: "Apple Watch Series 9", sku: "APL-W9-45", barcode: "194253412345", category: "Wearables", purchasePrice: 110000, sellingPrice: 135000, stock: 15, minStock: 5, status: "In Stock", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300" }
    ],
    categories: [
      { id: "c1", name: "Mobiles", description: "Smartphones and mobile devices", count: 2 },
      { id: "c2", name: "Accessories", description: "Audio, chargers, and cases", count: 2 },
      { id: "c3", name: "Laptops", description: "Computers and notebooks", count: 1 },
      { id: "c4", name: "Wearables", description: "Smartwatches and fitness bands", count: 1 }
    ],
    orders: [
      { id: "ORD-1024", customerName: "Ahmed Khan", customerPhone: "+92 321 9876543", items: [{ productId: "p1", productName: "iPhone 15 Pro", quantity: 1, price: 320000 }], total: 320000, discount: 0, tax: 16000, grandTotal: 336000, status: "Delivered", paymentMethod: "Card", date: "2026-11-01T14:20:00Z" },
      { id: "ORD-1023", customerName: "Fatima Ali", customerPhone: "+92 333 4567890", items: [{ productId: "p2", productName: "AirPods Pro (2nd Gen)", quantity: 2, price: 55000 }], total: 110000, discount: 5000, tax: 5250, grandTotal: 110250, status: "Processing", paymentMethod: "JazzCash", date: "2026-10-31T11:15:00Z" },
      { id: "ORD-1022", customerName: "Usman Tariq", customerPhone: "+92 300 5551234", items: [{ productId: "p4", productName: "MacBook Air M2", quantity: 1, price: 355000 }], total: 355000, discount: 10000, tax: 17250, grandTotal: 362250, status: "Shipped", paymentMethod: "Bank Transfer", date: "2026-10-30T16:45:00Z" }
    ],
    customers: [
      { id: "cust-1", name: "Ahmed Khan", email: "ahmed.khan@gmail.com", phone: "+92 321 9876543", address: "DHA Phase 6, Karachi", totalSpent: 336000, ordersCount: 1, lastOrderDate: "2026-11-01" },
      { id: "cust-2", name: "Fatima Ali", email: "fatima.ali@yahoo.com", phone: "+92 333 4567890", address: "Gulshan-e-Iqbal, Karachi", totalSpent: 110250, ordersCount: 1, lastOrderDate: "2026-10-31" }
    ],
    suppliers: [
      { id: "sup-1", name: "Apple Authorized Distributor PK", contactPerson: "Zubair Ahmed", email: "zubair@appledist.pk", phone: "+92 21 35876543", address: "Blue Area, Islamabad", suppliedCategory: "Mobiles & Laptops" }
    ],
    expenses: [
      { id: "exp-1", title: "Shop Rent - November", category: "Rent", amount: 120000, date: "2026-11-01", paymentMethod: "Bank Transfer", description: "Monthly commercial rent for shop." }
    ],
    staff: [
      { id: "st-1", name: "Store Manager", email: email, role: "Manager", status: "Active", phone: "+92 300 1234567", joinedDate: "2025-01-10" }
    ],
    notifications: [
      { id: "n1", title: "Welcome to ShopFlow AI", message: `Store initialized for ${businessName}. Ready to track sales!`, type: "success", time: "Just now", read: false }
    ]
  });

  // Isolated store databases for businesses
  const businessesStore: Record<string, any> = {
    'biz_hq': createInitialStoreData("ShopFlow Tech & Retail", "ra2826572@gmail.com"),
    'biz_mehmood': createInitialStoreData("Mehmood Electronics & Mobile", "merchant@shopflow.ai"),
    'biz_fashion': createInitialStoreData("Karachi Fashion Hub", "sana.malik@gmail.com")
  };

  // Helper to resolve the correct store data for an incoming request and check suspension status
  const resolveShopWithStatus = (req: express.Request) => {
    const userEmail = ((req.headers['x-user-email'] as string) || (req.query.email as string) || '').toLowerCase().trim();
    if (!userEmail) {
      return { isSuspended: false, hasShop: false, shop: null, profile: null };
    }
    const profile = shopflowDb.getProfileByEmail(userEmail);
    if (!profile) {
      return { isSuspended: false, hasShop: false, shop: null, profile: null };
    }

    if (profile.status === 'Suspended') {
      return {
        isSuspended: true,
        reason: profile.status_reason || 'Your user account is suspended by platform administration.',
        hasShop: false,
        shop: null,
        profile
      };
    }

    const shop = profile.shop_id 
      ? shopflowDb.getShopById(profile.shop_id) 
      : shopflowDb.getShopByOwnerId(profile.id);

    if (!shop) {
      return { isSuspended: false, hasShop: false, shop: null, profile };
    }

    if (shop.status === 'Suspended') {
      return {
        isSuspended: true,
        reason: shop.status_reason || `Your shop "${shop.name}" has been suspended by platform administration.`,
        hasShop: true,
        shop,
        profile
      };
    }

    return { isSuspended: false, hasShop: true, shop, profile };
  };

  // Helper middleware to verify Super Admin
  const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requesterEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
    const requester = shopflowDb.getProfileByEmail(requesterEmail);
    
    if (!requester || requester.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied: Requires Super Admin privileges' });
    }
    next();
  };

  // --- API ROUTES ---

  // 1. Auth Profile & Role Verification (Real database query)
  app.get('/api/auth/profile', (req, res) => {
    const email = (req.query.email as string || req.headers['x-user-email'] as string || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const profile = shopflowDb.getProfileByEmail(email);
    if (profile) {
      if (profile.status === 'Suspended') {
        return res.status(403).json({
          success: false,
          error: `Account Suspended: ${profile.status_reason || 'Your access is suspended by administration. Contact support@shopflow.ai'}`
        });
      }
      let shop = profile.shop_id 
        ? shopflowDb.getShopById(profile.shop_id) 
        : shopflowDb.getShopByOwnerId(profile.id);

      if (!shop) {
        const setupRes = shopflowDb.createShopForUser({
          userId: profile.id,
          shopName: `${profile.first_name || profile.name || 'My'}'s Shop`,
          currency: 'PKR'
        });
        if (setupRes.success && setupRes.shop) {
          shop = setupRes.shop;
        }
      }

      return res.json({
        success: true,
        user: {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          shop_id: shop ? shop.id : null,
          businessId: shop ? shop.id : null,
          shopName: shop ? shop.name : 'My Shop',
          businessName: shop ? shop.name : 'My Shop',
          status: profile.status,
          phone: profile.phone,
          needsShopSetup: false,
          createdAt: profile.created_at,
          lastActive: profile.last_active
        },
        shop: shop || null
      });
    }

    return res.status(404).json({
      success: false,
      error: 'User profile not found in database. Please register an account.'
    });
  });

  // 2. New User Registration (Personal Details + Custom Shop Setup)
  app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, userId, shopName, logoUrl, description, currency, phone, address } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'First Name, Last Name, and Email Address are all required.' 
      });
    }

    const regResult = shopflowDb.registerNewUser({
      firstName,
      lastName,
      email,
      userId,
      shopName,
      logoUrl,
      description,
      currency,
      phone,
      address
    });

    if (!regResult.success) {
      return res.status(400).json({ success: false, error: regResult.error });
    }

    return res.json({
      success: true,
      user: regResult.user
    });
  });

  // 3. Shop Setup Page API (Creates unique Shop ID and assigns registered user as owner)
  app.post('/api/shops/setup', (req, res) => {
    const { shopName, logoUrl, description, currency } = req.body;
    const userEmail = ((req.headers['x-user-email'] as string) || (req.body.email as string) || '').toLowerCase().trim();

    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ success: false, error: 'Shop Name is required.' });
    }

    const profile = shopflowDb.getProfileByEmail(userEmail);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'User profile not found. Please log in first.' });
    }

    const setupResult = shopflowDb.createShopForUser({
      userId: profile.id,
      shopName: shopName.trim(),
      logoUrl: logoUrl || '',
      description: description || '',
      currency: currency || 'PKR'
    });

    if (!setupResult.success) {
      return res.status(400).json({ success: false, error: setupResult.error });
    }

    return res.json({
      success: true,
      shop: setupResult.shop
    });
  });

  // 3. Database Verification Endpoint (Directly asserts DB state for Section 5)
  app.get('/api/database/verify-user', (req, res) => {
    const email = (req.query.email as string || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email parameter is required' });
    }

    const profile = shopflowDb.getProfileByEmail(email);
    if (!profile) {
      return res.status(404).json({ success: false, error: `Profile not found for email: ${email}` });
    }

    const shop = profile.shop_id ? shopflowDb.getShopById(profile.shop_id) : null;

    return res.json({
      success: true,
      profile: {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        shop_id: profile.shop_id,
        created_at: profile.created_at
      },
      shop: shop ? {
        id: shop.id,
        name: shop.name,
        owner_id: shop.owner_id,
        status: shop.status,
        created_at: shop.created_at
      } : null,
      business: shop ? {
        id: shop.id,
        name: shop.name,
        owner_id: shop.owner_id,
        status: shop.status,
        created_at: shop.created_at
      } : null
    });
  });

  // --- SUPER ADMIN ENDPOINTS (Protected) ---

  // Admin Metrics & Overview
  app.get('/api/admin/metrics', requireSuperAdmin, (req, res) => {
    const allProfiles = shopflowDb.getAllProfiles();
    const allShops = shopflowDb.getAllShops();
    const activeBusinesses = allShops.filter((b: any) => b.status === 'Active');
    const suspendedBusinesses = allShops.filter((b: any) => b.status === 'Suspended');
    const activeSubs = allShops.filter((b: any) => b.status === 'Active');
    const expiredSubs = allShops.filter((b: any) => b.status === 'Inactive');
    
    // Calculate Monthly Recurring Revenue (MRR)
    const mrr = activeSubs.reduce((acc: number, b: any) => acc + (b.price || 8500), 0);
    const totalCollectedRevenue = paymentsHistory.reduce((acc, p) => p.status === 'Completed' ? acc + p.amount : acc, 0);

    const revenueByMonth = [
      { month: 'Jun', revenue: 28500, subscriptions: 8 },
      { month: 'Jul', revenue: 35000, subscriptions: 11 },
      { month: 'Aug', revenue: 42000, subscriptions: 14 },
      { month: 'Sep', revenue: 53500, subscriptions: 19 },
      { month: 'Oct', revenue: 62000, subscriptions: 24 },
      { month: 'Nov', revenue: totalCollectedRevenue || 70500, subscriptions: activeSubs.length }
    ];

    res.json({
      success: true,
      metrics: {
        totalUsers: allProfiles.length,
        totalBusinesses: allShops.length,
        activeBusinesses: activeBusinesses.length,
        suspendedBusinesses: suspendedBusinesses.length,
        activeSubscriptions: activeSubs.length,
        expiredSubscriptions: expiredSubs.length,
        mrr,
        totalRevenue: totalCollectedRevenue,
        revenueByMonth,
        recentRegistrations: allProfiles.slice(0, 5),
        recentPayments: paymentsHistory.slice(0, 5),
        recentActivities: shopflowDb.getAdminLogs().slice(0, 5)
      }
    });
  });

  // Users List & Management
  app.get('/api/admin/users', requireSuperAdmin, (req, res) => {
    const profiles = shopflowDb.getAllProfiles();
    const shops = shopflowDb.getAllShops();
    const shopMap = new Map(shops.map((s: any) => [s.id, s.name]));

    const list = profiles.map(u => ({
      id: u.id,
      name: u.name,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
      business: u.shop_id ? (shopMap.get(u.shop_id) || 'Store') : 'N/A',
      status: u.status,
      statusReason: u.status_reason || '',
      phone: u.phone || '+92 300 0000000',
      createdAt: u.created_at,
      lastActive: u.last_active
    }));
    res.json({ success: true, users: list });
  });

  app.put('/api/admin/users/:email/status', requireSuperAdmin, (req, res) => {
    const targetEmail = req.params.email.toLowerCase().trim();
    const { status, reason } = req.body;
    const user = usersDb[targetEmail];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin' && status === 'Suspended') {
      return res.status(400).json({ error: 'Super Admin accounts cannot be suspended' });
    }

    const oldStatus = user.status;
    user.status = status;
    user.statusReason = reason || '';

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'USER_STATUS_UPDATE', targetEmail, `Changed status from ${oldStatus} to ${status}. Reason: ${reason || 'Admin action'}`);

    res.json({ success: true, user });
  });

  app.put('/api/admin/users/:email/role', requireSuperAdmin, (req, res) => {
    const targetEmail = req.params.email.toLowerCase().trim();
    const { role } = req.body;
    const user = usersDb[targetEmail];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'USER_ROLE_CHANGED', targetEmail, `Changed role from ${oldRole} to ${role}`);

    res.json({ success: true, user });
  });

  app.delete('/api/admin/users/:email', requireSuperAdmin, (req, res) => {
    const targetEmail = req.params.email.toLowerCase().trim();
    if (targetEmail === 'ra2826572@gmail.com') {
      return res.status(400).json({ error: 'Cannot delete the primary Super Admin account' });
    }

    const user = usersDb[targetEmail];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete usersDb[targetEmail];
    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'USER_DELETED', targetEmail, `User account permanently deleted.`);

    res.json({ success: true });
  });

  // Businesses / Shops List & Control
  app.get('/api/admin/businesses', requireSuperAdmin, (req, res) => {
    const shops = shopflowDb.getAllShops();
    const profiles = shopflowDb.getAllProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    const list = shops.map((b: any) => {
      const owner = profileMap.get(b.owner_id);
      const store = shopflowDb.getStoreDataForShop(b.id) || { products: [], orders: [] };
      const totalRev = store.orders ? store.orders.reduce((acc: number, o: any) => acc + (o.grandTotal || 0), 0) : 0;
      return {
        id: b.id,
        name: b.name,
        ownerName: owner?.name || 'Shop Owner',
        email: owner?.email || b.email || 'N/A',
        category: b.category || 'Retail Store',
        plan: b.plan || 'Professional',
        subscriptionStatus: b.subscription_status || 'Active',
        price: b.price || 8500,
        startDate: b.start_date || b.created_at?.split('T')[0],
        expiryDate: b.expiry_date || '2027-01-01',
        paymentStatus: b.payment_status || 'Paid',
        status: b.status,
        isDeleted: b.is_deleted === 1,
        createdAt: b.created_at,
        productCount: store.products ? store.products.length : 0,
        orderCount: store.orders ? store.orders.length : 0,
        revenue: `₨ ${totalRev.toLocaleString()}`
      };
    });

    res.json({ success: true, businesses: list });
  });

  // Shops List & Control for SaaS Admin
  app.get('/api/admin/shops', requireSuperAdmin, (req, res) => {
    const shops = shopflowDb.getAllShops();
    res.json({ success: true, shops });
  });

  app.put('/api/admin/shops/:id/status', requireSuperAdmin, (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    shopflowDb.updateShopStatus(id, status, reason);
    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    shopflowDb.logAdminAction(adminEmail, 'SHOP_STATUS_UPDATE', id, `Updated shop status to ${status}. Reason: ${reason || 'Admin action'}`);
    res.json({ success: true });
  });

  // Cross-Shop Products View for SaaS Admin
  app.get('/api/admin/products', requireSuperAdmin, (req, res) => {
    const products = shopflowDb.getAllProductsAcrossShops();
    res.json({ success: true, products });
  });

  app.put('/api/admin/businesses/:id/status', requireSuperAdmin, (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    shopflowDb.updateShopStatus(id, status, reason);

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    shopflowDb.logAdminAction(adminEmail, 'BUSINESS_STATUS_UPDATE', id, `Changed status to ${status}. Reason: ${reason || 'Admin action'}`);

    res.json({ success: true });
  });

  app.delete('/api/admin/businesses/:id', requireSuperAdmin, (req, res) => {
    const { id } = req.params;
    const { confirmName, permanent } = req.body;
    const biz = businessesMeta[id];

    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (confirmName !== biz.name) {
      return res.status(400).json({ error: `Confirmation mismatch: You must type "${biz.name}" exactly to confirm deletion.` });
    }

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';

    if (permanent) {
      delete businessesMeta[id];
      delete businessesStore[id];
      logAction(adminEmail, 'BUSINESS_PERMANENTLY_DELETED', biz.name, `Permanently deleted business and all associated inventory & order records.`);
    } else {
      biz.isDeleted = true;
      biz.status = 'Inactive';
      logAction(adminEmail, 'BUSINESS_SOFT_DELETED', biz.name, `Soft-deleted business.`);
    }

    res.json({ success: true });
  });

  // Subscriptions & Plans
  app.get('/api/admin/subscriptions', requireSuperAdmin, (req, res) => {
    const subs = Object.values(businessesMeta).filter(b => !b.isDeleted).map(b => ({
      businessId: b.id,
      businessName: b.name,
      ownerEmail: b.email,
      plan: b.plan,
      price: b.price,
      startDate: b.startDate,
      expiryDate: b.expiryDate,
      paymentStatus: b.paymentStatus,
      subscriptionStatus: b.subscriptionStatus
    }));

    res.json({
      success: true,
      plans: subscriptionPlans,
      subscriptions: subs
    });
  });

  app.post('/api/admin/subscriptions/assign', requireSuperAdmin, (req, res) => {
    const { businessId, planName, expiryDate, paymentStatus } = req.body;
    const biz = businessesMeta[businessId];

    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const planObj = subscriptionPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    const oldPlan = biz.plan;
    biz.plan = (planObj ? planObj.name : planName) as any;
    biz.price = planObj ? planObj.price : biz.price;
    if (expiryDate) biz.expiryDate = expiryDate;
    if (paymentStatus) biz.paymentStatus = paymentStatus;
    biz.subscriptionStatus = 'Active';

    // Record verified transaction if marked paid
    if (paymentStatus === 'Paid' && biz.price > 0) {
      paymentsHistory.unshift({
        id: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
        businessId: biz.id,
        businessName: biz.name,
        ownerEmail: biz.email,
        amount: biz.price,
        currency: 'PKR',
        plan: biz.plan,
        paymentMethod: 'Bank Transfer / Admin Provisioned',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0]
      });
    }

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'SUBSCRIPTION_PLAN_ASSIGNED', biz.name, `Plan changed from ${oldPlan} to ${biz.plan} (${biz.price} PKR). Status: ${biz.paymentStatus}`);

    res.json({ success: true, business: biz });
  });

  app.put('/api/admin/subscriptions/extend', requireSuperAdmin, (req, res) => {
    const { businessId, monthsToAdd } = req.body;
    const biz = businessesMeta[businessId];
    if (!biz) return res.status(404).json({ error: 'Business not found' });

    const currentExpiry = new Date(biz.expiryDate);
    currentExpiry.setMonth(currentExpiry.getMonth() + Number(monthsToAdd || 1));
    biz.expiryDate = currentExpiry.toISOString().split('T')[0];
    biz.subscriptionStatus = 'Active';

    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'SUBSCRIPTION_EXTENDED', biz.name, `Extended expiry by ${monthsToAdd} month(s) to ${biz.expiryDate}`);

    res.json({ success: true, business: biz });
  });

  // Revenue Analytics
  app.get('/api/admin/revenue', requireSuperAdmin, (req, res) => {
    const totalRevenue = paymentsHistory.reduce((acc, p) => p.status === 'Completed' ? acc + p.amount : acc, 0);
    const activeSubscribers = Object.values(businessesMeta).filter(b => !b.isDeleted && b.subscriptionStatus === 'Active');
    const mrr = activeSubscribers.reduce((acc, b) => acc + (b.price || 0), 0);
    const arpu = activeSubscribers.length > 0 ? Math.round(mrr / activeSubscribers.length) : 0;
    const pendingPayments = paymentsHistory.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
    const refunds = paymentsHistory.filter(p => p.status === 'Refunded').reduce((acc, p) => acc + p.amount, 0);

    const revenueByPlan = subscriptionPlans.map(plan => {
      const planPayments = paymentsHistory
        .filter(p => p.plan.toLowerCase() === plan.name.toLowerCase() && p.status === 'Completed')
        .reduce((acc, p) => acc + p.amount, 0);
      return {
        plan: plan.name,
        revenue: planPayments,
        price: plan.price
      };
    });

    res.json({
      success: true,
      summary: {
        totalRevenue,
        monthlyRecurringRevenue: mrr,
        annualRevenue: mrr * 12,
        activePayingCustomers: activeSubscribers.length,
        averageRevenuePerUser: arpu,
        pendingPayments,
        refunds
      },
      revenueByPlan,
      transactions: paymentsHistory
    });
  });

  // System Settings
  app.get('/api/admin/settings', requireSuperAdmin, (req, res) => {
    res.json({ success: true, settings: systemSettings });
  });

  app.put('/api/admin/settings', requireSuperAdmin, (req, res) => {
    systemSettings = {
      ...systemSettings,
      ...req.body
    };
    const adminEmail = (req.headers['x-user-email'] as string) || 'ra2826572@gmail.com';
    logAction(adminEmail, 'SYSTEM_SETTINGS_UPDATED', 'Global Configuration', `Super Admin updated system configuration parameters.`);
    res.json({ success: true, settings: systemSettings });
  });

  // Activity Logs
  app.get('/api/admin/logs', requireSuperAdmin, (req, res) => {
    res.json({ success: true, logs: adminLogs });
  });

  // Reset Platform Data (Deletes all non-admin users and shops from local SQLite and Supabase backend)
  app.post('/api/admin/reset-platform', requireSuperAdmin, async (req, res) => {
    try {
      shopflowDb.resetPlatformData();
      const supabaseRes = await performSupabaseBackendReset();
      res.json({ 
        success: true, 
        message: 'Platform successfully reset. All non-admin users and test data deleted from backend.',
        supabaseResult: supabaseRes
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to reset backend platform data' });
    }
  });

  // --- MULTI-TENANT SHOP APIS (Strictly Isolated by shop.id) ---

  app.get('/api/data', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) {
      return res.status(403).json({
        error: 'Account Suspended',
        isSuspended: true,
        reason: reason
      });
    }

    if (!hasShop || !shop) {
      return res.json({
        shop: null,
        business: null,
        products: [],
        categories: [],
        orders: [],
        customers: [],
        suppliers: [],
        expenses: [],
        staff: [],
        notifications: []
      });
    }

    const storeData = shopflowDb.getStoreDataForShop(shop.id);
    res.json(storeData);
  });

  app.post('/api/products', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found. Complete shop setup first.' });

    const product = shopflowDb.addProduct(shop.id, req.body);
    res.json({ success: true, product });
  });

  app.put('/api/products/:id', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const product = shopflowDb.updateProduct(shop.id, req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found or unauthorized' });
    res.json({ success: true, product });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const success = shopflowDb.deleteProduct(shop.id, req.params.id);
    res.json({ success });
  });

  app.post('/api/orders', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const order = shopflowDb.createOrder(shop.id, req.body);
    res.json({ success: true, order });
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    shopflowDb.updateOrderStatus(shop.id, req.params.id, req.body.status);
    res.json({ success: true });
  });

  app.post('/api/customers', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const customer = shopflowDb.addCustomer(shop.id, req.body);
    res.json({ success: true, customer });
  });

  app.post('/api/categories', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const category = shopflowDb.addCategory(shop.id, req.body.name, req.body.description);
    res.json({ success: true, category });
  });

  app.put('/api/settings', (req, res) => {
    const { isSuspended, reason, hasShop, shop } = resolveShopWithStatus(req);
    if (isSuspended) return res.status(403).json({ error: reason });
    if (!hasShop || !shop) return res.status(400).json({ error: 'No active shop found.' });

    const updatedShop = shopflowDb.updateShopSettings(shop.id, req.body);
    res.json({ success: true, shop: updatedShop, business: updatedShop });
  });

  app.post('/api/ai/insights', async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ error: 'Gemini API key is not configured.' });
      }

      const { hasShop, shop } = resolveShopWithStatus(req);
      if (!hasShop || !shop) return res.status(403).json({ error: 'Shop not found' });

      const store = shopflowDb.getStoreDataForShop(shop.id);
      if (!store) return res.status(403).json({ error: 'Shop data not found' });

      const prompt = `You are ShopFlow AI, an expert business analyst.
Business: ${store.business.name}
Total Products: ${store.products.length}
Low stock: ${store.products.filter((p: any) => p.stock <= p.minStock).map((p: any) => `${p.name} (${p.stock} left)`).join(', ') || 'None'}
Orders: ${store.orders.length}
Revenue: ${store.orders.reduce((acc: number, o: any) => acc + o.grandTotal, 0)} ${store.business.currency}
Expenses: ${store.expenses.reduce((acc: number, e: any) => acc + e.amount, 0)} ${store.business.currency}

Provide 3 high-impact strategic business growth recommendations and an inventory forecast.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ success: true, insights: response.text });
    } catch (error: any) {
      console.error('AI Insights Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate AI insights' });
    }
  });

  // Mount Vite development middlewares
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ShopFlow AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
