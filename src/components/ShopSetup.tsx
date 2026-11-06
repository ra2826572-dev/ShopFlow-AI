import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Coins, 
  ArrowRight, 
  Loader2, 
  AlertTriangle, 
  Check, 
  ShieldCheck, 
  Package, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ShopSetup: React.FC = () => {
  const { user, completeShopSetup, signOut } = useAuth();

  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample preset logos to choose with 1 click
  const presetLogos = [
    { label: 'Purple Gem', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120' },
    { label: 'Tech Cart', url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=120' },
    { label: 'Modern Store', url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=120' },
    { label: 'Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = shopName.trim();
    if (!trimmedName) {
      setError('Please provide a Shop Name to initialize your store.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/shops/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          shopName: trimmedName,
          logoUrl: logoUrl.trim(),
          description: description.trim(),
          currency
        })
      });

      const json = await res.json();
      setLoading(false);

      if (!json.success || !json.shop) {
        setError(json.error || 'Failed to setup shop. Please try again.');
        return;
      }

      // Complete setup and launch fresh dashboard
      completeShopSetup(json.shop);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error while provisioning your shop.');
    }
  };

  const currencySymbol = currency === 'USD' ? '$' : currency === 'AED' ? 'د.إ' : '₨';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0F1424] via-[#151D36] to-[#0A0D18] text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              ShopFlow <span className="text-purple-400">Multi-Tenant</span>
            </span>
            <span className="block text-[11px] text-slate-400 font-medium">Tenant Onboarding</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out and return to login"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Details (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-[#151C33]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-7 sm:p-9 shadow-2xl"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 2 of 2 · Shop Environment Setup</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create Your New Shop
              </h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Your shop will be provisioned in an isolated database workspace. You start with a completely clean environment: 0 products, 0 orders, 0 customers, and 0 revenue.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Field 1: Shop Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Shop Name <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center rounded-2xl px-4 py-3.5 bg-white/5 border border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                  <Store className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => {
                      setShopName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Apex Mobile & Gadgets"
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Field 2: Optional Shop Logo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Shop Logo <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="flex-1 flex items-center rounded-2xl px-4 py-3 bg-white/5 border border-white/10 focus-within:border-purple-500 transition-all">
                    <ImageIcon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500"
                    />
                  </div>

                  <label className="cursor-pointer py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all shrink-0">
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Choices */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Or pick preset:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {presetLogos.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setLogoUrl(p.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          logoUrl === p.url 
                            ? 'bg-purple-600 border-purple-500 text-white' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Optional Shop Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Shop Description <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="flex items-start rounded-2xl px-4 py-3 bg-white/5 border border-white/10 focus-within:border-purple-500 transition-all">
                  <FileText className="w-4 h-4 text-slate-400 mr-2.5 mt-1 shrink-0" />
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what your shop sells..."
                    className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 resize-none"
                  />
                </div>
              </div>

              {/* Field 4: Currency Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Operating Currency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
                    { code: 'USD', symbol: '$', label: 'US Dollar' },
                    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' }
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        currency === c.code
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-600/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{c.code}</span>
                        <span className="text-purple-400">{c.symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Provisioning Shop...' : 'Launch My Shop'}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
              </motion.button>
            </form>
          </motion.div>

          {/* Right Column: Live Shop Preview & Tenant Isolation Guarantees (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Storefront Identity Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Live Shop Preview</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    shopName ? shopName.charAt(0).toUpperCase() : 'S'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {shopName || 'Your Shop Name'}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {description || 'Your custom store description will appear here.'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span>Owner: {user?.name}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {/* Clean 0-State Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Products</div>
                  <div className="text-base font-extrabold text-white tabular-nums">0</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Orders</div>
                  <div className="text-base font-extrabold text-white tabular-nums">0</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Revenue</div>
                  <div className="text-base font-extrabold text-emerald-400 tabular-nums">{currencySymbol} 0</div>
                </div>
              </div>
            </motion.div>

            {/* Strict Multi-Tenant Isolation Highlights */}
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tenant Architecture Guarantees</span>
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white block">Completely Empty Environment</strong>
                    No demo products, sample sales, or mock customers from any other account.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white block">Strict Row Level Security (RLS)</strong>
                    All queries are hard-bound to your unique shop UUID. Cross-tenant data access is blocked.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white block">Independent Product Management</strong>
                    Add your own catalog, prices, categories, and inventory without external interference.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-500 pt-4 border-t border-white/5">
        ShopFlow AI · Multi-Tenant SaaS Shop Management Platform © 2026
      </footer>

    </div>
  );
};
