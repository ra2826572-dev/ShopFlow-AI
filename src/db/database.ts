import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../shopflow_production.db');

export interface ProfileRecord {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  role: 'super_admin' | 'shop_owner' | 'manager' | 'staff';
  status: 'Active' | 'Inactive' | 'Suspended';
  status_reason?: string | null;
  shop_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  last_active: string;
}

export interface ShopRecord {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string;
  description: string;
  category: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  status: 'Active' | 'Suspended';
  status_reason?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

class ShopFlowDatabase {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(dbPath);
    this.initTables();
    this.seedAdminAccount();
  }

  private initTables() {
    // 1. Profiles Table (UUID primary key)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'shop_owner',
        status TEXT NOT NULL DEFAULT 'Active',
        status_reason TEXT,
        shop_id TEXT,
        phone TEXT,
        avatar_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_active TEXT NOT NULL
      );
    `);

    // 2. Shops Table (Multi-tenant shops, owner_id references profiles(id))
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shops (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
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
        status TEXT NOT NULL DEFAULT 'Active',
        status_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES profiles(id)
      );
    `);

    // 3. Categories Table (Shop-isolated)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 4. Products Table (Shop-isolated)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        category_id TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        barcode TEXT DEFAULT '',
        purchase_price REAL NOT NULL DEFAULT 0,
        selling_price REAL NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 5,
        status TEXT DEFAULT 'In Stock',
        image_url TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 5. Customers Table (Shop-isolated)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        total_spent REAL DEFAULT 0,
        orders_count INTEGER DEFAULT 0,
        last_order_date TEXT DEFAULT 'Never',
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 6. Orders Table (Shop-isolated)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        order_number TEXT NOT NULL,
        customer_id TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT DEFAULT '',
        total REAL NOT NULL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        grand_total REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'Processing',
        payment_method TEXT DEFAULT 'Cash',
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 7. Order Items Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        product_id TEXT,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      );
    `);

    // 8. Suppliers Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        supplied_category TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 9. Expenses Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 10. Staff Members Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Staff',
        status TEXT NOT NULL DEFAULT 'Active',
        phone TEXT,
        joined_date TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 11. Notifications Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        shop_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        time TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shop_id) REFERENCES shops(id)
      );
    `);

    // 12. Admin Activity Logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id TEXT PRIMARY KEY,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Ensure shop_id column exists on all tenant tables (handles databases created before migration)
    const tablesToMigrate = ['profiles', 'products', 'categories', 'orders', 'order_items', 'customers', 'suppliers', 'expenses', 'staff', 'notifications'];
    for (const t of tablesToMigrate) {
      try {
        this.db.exec(`ALTER TABLE ${t} ADD COLUMN shop_id TEXT;`);
      } catch {
        // column already exists
      }
    }

    try { this.db.exec('ALTER TABLE products ADD COLUMN category_id TEXT;'); } catch {}
    try { this.db.exec('ALTER TABLE orders ADD COLUMN customer_id TEXT;'); } catch {}

    // Migrate between 'businesses' and 'shops' tables seamlessly
    try {
      const hasBusinesses = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='businesses'").get();
      if (hasBusinesses) {
        this.db.exec(`
          INSERT OR IGNORE INTO shops (id, owner_id, name, logo_url, description, category, currency, currency_symbol, tax_rate, status, status_reason, created_at, updated_at)
          SELECT id, owner_id, name, '', 'Retail Shop', category, currency, currency_symbol, tax_rate, status, status_reason, created_at, updated_at
          FROM businesses;
          INSERT OR IGNORE INTO businesses (id, owner_id, name, category, currency, currency_symbol, status, created_at, updated_at)
          SELECT id, owner_id, name, category, currency, currency_symbol, status, created_at, updated_at
          FROM shops;
        `);
      }
    } catch (e) {
      // ignore
    }
  }

  // Seed default Super Admin account if not present
  private seedAdminAccount() {
    const adminEmail = 'ra2826572@gmail.com';
    const existing = this.getProfileByEmail(adminEmail);
    if (!existing) {
      const adminId = 'a0000000-0000-4000-8000-000000000001';
      const shopId = 'b0000000-0000-4000-8000-000000000001';
      const now = new Date().toISOString();

      this.db.prepare(`
        INSERT INTO profiles (id, first_name, last_name, name, email, role, status, shop_id, created_at, updated_at, last_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        adminId,
        'Rizwan',
        'Ahmad',
        'Rizwan Ahmad',
        adminEmail,
        'super_admin',
        'Active',
        shopId,
        now,
        now,
        now
      );

      this.db.prepare(`
        INSERT INTO shops (id, owner_id, name, logo_url, description, category, currency, currency_symbol, tax_rate, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shopId,
        adminId,
        'ShopFlow Tech & Retail (Admin HQ)',
        '',
        'Platform Administration and Global Testing Shop',
        'Electronics & Software',
        'PKR',
        '₨',
        5.0,
        'Active',
        now,
        now
      );
    }
  }

  // --- Profile Queries ---
  public getProfileByEmail(email: string): ProfileRecord | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE lower(email) = lower(?)').get(email) as any;
    if (!row) return null;
    return row as ProfileRecord;
  }

  public getProfileById(id: string): ProfileRecord | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as ProfileRecord;
  }

  public getAllProfiles(): ProfileRecord[] {
    return this.db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all() as any[];
  }

  // --- Shop Queries ---
  public getShopById(id: string): ShopRecord | null {
    const row = this.db.prepare('SELECT * FROM shops WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as ShopRecord;
  }

  public getShopByOwnerId(ownerId: string): ShopRecord | null {
    const row = this.db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(ownerId) as any;
    if (!row) return null;
    return row as ShopRecord;
  }

  public getAllShops(): (ShopRecord & { owner_name?: string; owner_email?: string; products_count?: number; orders_count?: number })[] {
    const shops = this.db.prepare(`
      SELECT s.*, p.name as owner_name, p.email as owner_email
      FROM shops s
      LEFT JOIN profiles p ON s.owner_id = p.id
      ORDER BY s.created_at DESC
    `).all() as any[];

    return shops.map(s => {
      const prodCount = (this.db.prepare('SELECT count(*) as count FROM products WHERE shop_id = ?').get(s.id) as any)?.count || 0;
      const ordCount = (this.db.prepare('SELECT count(*) as count FROM orders WHERE shop_id = ?').get(s.id) as any)?.count || 0;
      return {
        ...s,
        products_count: prodCount,
        orders_count: ordCount
      };
    });
  }

  // --- 1. USER REGISTRATION (Personal Details + Custom Shop Creation) ---
  public registerNewUser(params: {
    firstName: string;
    lastName: string;
    email: string;
    userId?: string;
    shopName?: string;
    logoUrl?: string;
    description?: string;
    currency?: string;
    phone?: string;
    address?: string;
  }) {
    const { firstName, lastName, email, userId, shopName, logoUrl = '', description = '', currency = 'PKR', phone = '', address = '' } = params;
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = this.getProfileByEmail(normalizedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    const now = new Date().toISOString();
    const finalUserId = userId || crypto.randomUUID();
    const fullName = `${trimmedFirst} ${trimmedLast}`;

    const role: 'shop_owner' | 'super_admin' = normalizedEmail === 'ra2826572@gmail.com' ? 'super_admin' : 'shop_owner';
    const shopId = crypto.randomUUID();
    const finalShopName = shopName && shopName.trim() ? shopName.trim() : `${trimmedFirst}'s Shop`;
    const currencySymbol = currency === 'USD' ? '$' : currency === 'AED' ? 'د.إ' : currency === 'EUR' ? '€' : '₨';

    try {
      this.db.prepare(`
        INSERT INTO profiles (id, first_name, last_name, name, email, role, status, shop_id, phone, created_at, updated_at, last_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        finalUserId,
        trimmedFirst,
        trimmedLast,
        fullName,
        normalizedEmail,
        role,
        'Active',
        shopId,
        phone.trim() || null,
        now,
        now,
        now
      );

      // Create initial tenant shop with user provided details & logo
      this.db.prepare(`
        INSERT INTO shops (id, owner_id, name, logo_url, description, category, currency, currency_symbol, tax_rate, phone, address, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?, ?, 'Active', ?, ?)
      `).run(
        shopId,
        finalUserId,
        finalShopName,
        logoUrl.trim(),
        description.trim(),
        'Retail Store',
        currency,
        currencySymbol,
        phone.trim() || null,
        address.trim() || null,
        now,
        now
      );

      // Initial welcome notification
      this.db.prepare(`
        INSERT INTO notifications (id, shop_id, title, message, type, time, read, created_at)
        VALUES (?, ?, 'Shop Activated', ?, 'success', 'Just now', 0, ?)
      `).run(
        'notif_' + Date.now(),
        shopId,
        `Welcome to ${finalShopName}! Your shop is now active and ready for business.`,
        now
      );

      const createdUser = this.getProfileById(finalUserId)!;

      this.logAdminAction(
        'System',
        'USER_REGISTERED',
        normalizedEmail,
        `User ${fullName} (${normalizedEmail}) registered. Shop "${finalShopName}" provisioned.`
      );

      return {
        success: true,
        user: {
          id: createdUser.id,
          first_name: createdUser.first_name,
          last_name: createdUser.last_name,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          shop_id: shopId,
          shopName: finalShopName,
          needsShopSetup: false
        }
      };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  // --- 2. SHOP SETUP (Creates Unique Isolated Shop for Registered User) ---
  public createShopForUser(params: {
    userId: string;
    shopName: string;
    logoUrl?: string;
    description?: string;
    currency?: string;
  }) {
    const { userId, shopName, logoUrl = '', description = '', currency = 'PKR' } = params;
    const trimmedName = shopName.trim();

    if (!trimmedName) {
      return { success: false, error: 'Shop Name is required.' };
    }

    const profile = this.getProfileById(userId);
    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    const shopId = crypto.randomUUID();
    const now = new Date().toISOString();
    const currencySymbol = currency === 'USD' ? '$' : currency === 'AED' ? 'د.إ' : '₨';

    try {
      // 1. Create the new Shop
      this.db.prepare(`
        INSERT INTO shops (id, owner_id, name, logo_url, description, category, currency, currency_symbol, tax_rate, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shopId,
        userId,
        trimmedName,
        logoUrl,
        description,
        'Retail Store',
        currency,
        currencySymbol,
        5.0,
        'Active',
        now,
        now
      );

      // 2. Link shop_id to user profile
      this.db.prepare('UPDATE profiles SET shop_id = ?, updated_at = ? WHERE id = ?').run(shopId, now, userId);

      // Keep legacy businesses row in sync for backward-compatible FKs
      try {
        this.db.prepare(`
          INSERT OR IGNORE INTO businesses (id, owner_id, name, category, currency, currency_symbol, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(shopId, userId, trimmedName, 'Retail Store', currency, currencySymbol, 'Active', now, now);
        this.db.prepare('UPDATE profiles SET business_id = ? WHERE id = ?').run(shopId, userId);
      } catch {}

      // 3. Insert fresh Welcome Notification
      this.db.prepare(`
        INSERT INTO notifications (id, shop_id, title, message, type, time, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'notif_' + Date.now(),
        shopId,
        'Shop Initialized',
        `Welcome to ShopFlow! Your shop "${trimmedName}" has been successfully created and is ready for products.`,
        'success',
        'Just now',
        0,
        now
      );

      this.logAdminAction(
        profile.email,
        'SHOP_CREATED',
        trimmedName,
        `Shop "${trimmedName}" (ID: ${shopId}) provisioned for owner ${profile.name}`
      );

      const createdShop = this.getShopById(shopId)!;
      return {
        success: true,
        shop: createdShop
      };
    } catch (err: any) {
      console.error('Shop creation error:', err);
      return { success: false, error: err.message || 'Failed to create shop.' };
    }
  }

  // --- 3. FETCH ISOLATED STORE DATA (Strictly bounded by shopId) ---
  public getStoreDataForShop(shopId: string) {
    const shop = this.getShopById(shopId);
    if (!shop) return null;

    const products = this.db.prepare('SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const categories = this.db.prepare('SELECT * FROM categories WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const orders = this.db.prepare('SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const customers = this.db.prepare('SELECT * FROM customers WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const suppliers = this.db.prepare('SELECT * FROM suppliers WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const expenses = this.db.prepare('SELECT * FROM expenses WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];
    const staff = this.db.prepare('SELECT * FROM staff WHERE shop_id = ? ORDER BY joined_date DESC').all(shopId) as any[];
    const notifications = this.db.prepare('SELECT * FROM notifications WHERE shop_id = ? ORDER BY created_at DESC').all(shopId) as any[];

    // Extract order items for each order
    const ordersWithItems = orders.map(o => {
      const items = this.db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as any[];
      return {
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerId: o.customer_id,
        items: items.map(it => ({
          productId: it.product_id,
          productName: it.product_name,
          quantity: it.quantity,
          price: it.price,
          total: it.total
        })),
        total: o.total,
        discount: o.discount,
        tax: o.tax,
        grandTotal: o.grand_total,
        status: o.status,
        paymentMethod: o.payment_method,
        date: o.created_at
      };
    });

    const formattedShop = {
      id: shop.id,
      name: shop.name,
      owner_id: shop.owner_id,
      logo_url: shop.logo_url,
      description: shop.description,
      category: shop.category,
      currency: shop.currency,
      currencySymbol: shop.currency_symbol,
      taxRate: shop.tax_rate,
      email: shop.email || '',
      phone: shop.phone || '',
      address: shop.address || '',
      status: shop.status,
      created_at: shop.created_at,
      updated_at: shop.updated_at
    };

    return {
      shop: formattedShop,
      business: formattedShop, // backwards compatibility alias
      products: products.map(p => ({
        id: p.id,
        shop_id: p.shop_id,
        category_id: p.category_id,
        category: p.category,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        purchasePrice: p.purchase_price,
        sellingPrice: p.selling_price,
        stock: p.stock,
        minStock: p.min_stock,
        status: p.status,
        image: p.image_url,
        created_at: p.created_at
      })),
      categories: categories.map(c => ({
        id: c.id,
        shop_id: c.shop_id,
        name: c.name,
        description: c.description
      })),
      orders: ordersWithItems,
      customers: customers.map(c => ({
        id: c.id,
        shop_id: c.shop_id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        totalSpent: c.total_spent,
        ordersCount: c.orders_count,
        lastOrderDate: c.last_order_date
      })),
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contact_person,
        email: s.email,
        phone: s.phone,
        address: s.address,
        suppliedCategory: s.supplied_category
      })),
      expenses: expenses.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        paymentMethod: e.payment_method,
        description: e.description
      })),
      staff: staff.map(st => ({
        id: st.id,
        name: st.name,
        email: st.email,
        role: st.role,
        status: st.status,
        phone: st.phone,
        joinedDate: st.joined_date
      })),
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        time: n.time,
        read: Boolean(n.read)
      }))
    };
  }

  // --- CRUD OPERATIONS (Tenant Authorized) ---

  // Product CRUD
  public addProduct(shopId: string, product: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stock = Number(product.stock) || 0;
    const minStock = Number(product.minStock) || 5;
    const status = stock === 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';

    this.db.prepare(`
      INSERT INTO products (id, shop_id, business_id, category_id, category, name, sku, barcode, purchase_price, selling_price, stock, min_stock, status, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      shopId,
      shopId,
      product.category_id || null,
      product.category || 'General',
      product.name.trim(),
      product.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      product.barcode?.trim() || '',
      Number(product.purchasePrice) || 0,
      Number(product.sellingPrice) || 0,
      stock,
      minStock,
      status,
      product.image || '',
      now,
      now
    );

    return (this.db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any);
  }

  public updateProduct(shopId: string, productId: string, product: any) {
    const current = this.db.prepare('SELECT * FROM products WHERE id = ? AND shop_id = ?').get(productId, shopId) as any;
    if (!current) return null;

    const stock = product.stock !== undefined ? Number(product.stock) : current.stock;
    const minStock = product.minStock !== undefined ? Number(product.minStock) : current.min_stock;
    const status = stock === 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        barcode = COALESCE(?, barcode),
        category = COALESCE(?, category),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        stock = ?,
        min_stock = ?,
        status = ?,
        image_url = COALESCE(?, image_url),
        updated_at = ?
      WHERE id = ? AND shop_id = ?
    `).run(
      product.name?.trim(),
      product.sku?.trim(),
      product.barcode?.trim(),
      product.category?.trim(),
      product.purchasePrice !== undefined ? Number(product.purchasePrice) : null,
      product.sellingPrice !== undefined ? Number(product.sellingPrice) : null,
      stock,
      minStock,
      status,
      product.image,
      now,
      productId,
      shopId
    );

    return (this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any);
  }

  public deleteProduct(shopId: string, productId: string) {
    const res = this.db.prepare('DELETE FROM products WHERE id = ? AND shop_id = ?').run(productId, shopId);
    return res.changes > 0;
  }

  // Orders CRUD
  public createOrder(shopId: string, orderData: any) {
    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const total = Number(orderData.total) || 0;
    const discount = Number(orderData.discount) || 0;
    const tax = Number(orderData.tax) || 0;
    const grandTotal = Number(orderData.grandTotal) || (total - discount + tax);

    this.db.prepare(`
      INSERT INTO orders (id, shop_id, business_id, order_number, customer_id, customer_name, customer_phone, total, discount, tax, grand_total, status, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      shopId,
      shopId,
      orderNumber,
      orderData.customerId || null,
      orderData.customerName || 'Walk-in Customer',
      orderData.customerPhone || '',
      total,
      discount,
      tax,
      grandTotal,
      orderData.status || 'Processing',
      orderData.paymentMethod || 'Cash',
      now
    );

    // Insert order items and deduct inventory stock
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const itemId = crypto.randomUUID();
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * quantity;

        this.db.prepare(`
          INSERT INTO order_items (id, shop_id, order_id, product_id, product_name, quantity, price, total, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          shopId,
          orderId,
          item.productId || null,
          item.productName || 'Product Item',
          quantity,
          price,
          itemTotal,
          now
        );

        // Deduct stock for the product in this shop
        if (item.productId) {
          const prod = this.db.prepare('SELECT stock, min_stock FROM products WHERE id = ? AND shop_id = ?').get(item.productId, shopId) as any;
          if (prod) {
            const newStock = Math.max(0, prod.stock - quantity);
            const newStatus = newStock === 0 ? 'Out of Stock' : newStock <= prod.min_stock ? 'Low Stock' : 'In Stock';
            this.db.prepare('UPDATE products SET stock = ?, status = ?, updated_at = ? WHERE id = ?').run(newStock, newStatus, now, item.productId);
          }
        }
      }
    }

    // Update customer stats if customer exists
    if (orderData.customerId) {
      this.db.prepare(`
        UPDATE customers 
        SET total_spent = total_spent + ?, orders_count = orders_count + 1, last_order_date = ?
        WHERE id = ? AND shop_id = ?
      `).run(grandTotal, now.split('T')[0], orderData.customerId, shopId);
    }

    return {
      id: orderId,
      orderNumber,
      customerName: orderData.customerName,
      grandTotal,
      status: orderData.status || 'Processing',
      date: now
    };
  }

  public updateOrderStatus(shopId: string, orderId: string, status: string) {
    this.db.prepare('UPDATE orders SET status = ? WHERE id = ? AND shop_id = ?').run(status, orderId, shopId);
  }

  // Customers CRUD
  public addCustomer(shopId: string, customerData: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO customers (id, shop_id, business_id, name, email, phone, address, total_spent, orders_count, last_order_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      shopId,
      shopId,
      customerData.name.trim(),
      customerData.email?.trim() || '',
      customerData.phone?.trim() || '',
      customerData.address?.trim() || '',
      0,
      0,
      'Never',
      now
    );

    return (this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as any);
  }

  // Categories CRUD
  public addCategory(shopId: string, name: string, description: string = '') {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.db.prepare('INSERT INTO categories (id, shop_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)').run(
      id,
      shopId,
      name.trim(),
      description.trim(),
      now
    );
    return (this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any);
  }

  // Settings Update
  public updateShopSettings(shopId: string, settings: any) {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE shops SET
        name = COALESCE(?, name),
        logo_url = COALESCE(?, logo_url),
        description = COALESCE(?, description),
        currency = COALESCE(?, currency),
        currency_symbol = COALESCE(?, currency_symbol),
        tax_rate = COALESCE(?, tax_rate),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        updated_at = ?
      WHERE id = ?
    `).run(
      settings.name?.trim(),
      settings.logo_url || settings.logo,
      settings.description || settings.tagline,
      settings.currency,
      settings.currencySymbol,
      settings.taxRate !== undefined ? Number(settings.taxRate) : null,
      settings.email,
      settings.phone,
      settings.address,
      now,
      shopId
    );

    return this.getShopById(shopId);
  }

  // --- Platform Admin Operations ---
  public updateShopStatus(shopId: string, status: 'Active' | 'Suspended', reason?: string) {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE shops SET status = ?, status_reason = ?, updated_at = ? WHERE id = ?')
      .run(status, reason || null, now, shopId);
  }

  public getAllProductsAcrossShops() {
    return this.db.prepare(`
      SELECT p.*, s.name as shop_name, s.owner_id, prof.name as owner_name, prof.email as owner_email
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      JOIN profiles prof ON s.owner_id = prof.id
      ORDER BY p.created_at DESC
    `).all() as any[];
  }

  public getPlatformStats() {
    const totalUsers = (this.db.prepare('SELECT count(*) as count FROM profiles').get() as any)?.count || 0;
    const totalShops = (this.db.prepare('SELECT count(*) as count FROM shops').get() as any)?.count || 0;
    const activeShops = (this.db.prepare("SELECT count(*) as count FROM shops WHERE status = 'Active'").get() as any)?.count || 0;
    const suspendedShops = (this.db.prepare("SELECT count(*) as count FROM shops WHERE status = 'Suspended'").get() as any)?.count || 0;
    const totalProducts = (this.db.prepare('SELECT count(*) as count FROM products').get() as any)?.count || 0;
    const totalOrders = (this.db.prepare('SELECT count(*) as count FROM orders').get() as any)?.count || 0;
    const totalRevenue = (this.db.prepare('SELECT sum(grand_total) as total FROM orders').get() as any)?.total || 0;

    return {
      totalUsers,
      totalShops,
      activeShops,
      suspendedShops,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue || 0
    };
  }

  public logAdminAction(adminEmail: string, action: string, target: string, details: string) {
    this.db.prepare(`
      INSERT INTO admin_activity_logs (id, admin_email, action, target, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'log_' + Date.now(),
      adminEmail,
      action,
      target,
      details,
      new Date().toISOString()
    );
  }

  public getAdminLogs() {
    return this.db.prepare('SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 50').all() as any[];
  }

  public resetPlatformData() {
    const adminEmail = 'ra2826572@gmail.com';
    const adminProfile = this.getProfileByEmail(adminEmail);
    const adminShopId = adminProfile?.shop_id || 'b0000000-0000-4000-8000-000000000001';

    this.db.exec("PRAGMA foreign_keys = OFF;");

    // Delete all dependent records where shop_id != adminShopId
    this.db.prepare("DELETE FROM order_items WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM orders WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM products WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM categories WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM customers WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM suppliers WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM expenses WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM staff WHERE shop_id != ?").run(adminShopId);
    this.db.prepare("DELETE FROM notifications WHERE shop_id != ?").run(adminShopId);

    // Delete all shops and businesses except admin
    this.db.prepare("DELETE FROM shops WHERE id != ?").run(adminShopId);
    try { this.db.prepare("DELETE FROM businesses WHERE id != ?").run(adminShopId); } catch {}

    // Delete all non-admin profiles
    this.db.prepare("DELETE FROM profiles WHERE lower(email) != lower(?)").run(adminEmail);

    this.db.exec("PRAGMA foreign_keys = ON;");

    this.logAdminAction(adminEmail, 'PLATFORM_RESET', 'All Users & Shops', 'Deleted all non-admin users, shops, products, orders, and test data.');
  }
}

export const shopflowDb = new ShopFlowDatabase();
