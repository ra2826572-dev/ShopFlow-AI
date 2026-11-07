import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Sun, 
  Moon, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Mail, 
  UserCheck, 
  Store,
  Upload,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignInProps {
  initialMode?: 'signin' | 'signup';
}

type AuthStep = 'signin' | 'register-personal' | 'register-shop';

export const SignIn: React.FC<SignInProps> = ({ initialMode = 'signin' }) => {
  const { signIn, signUp, setAuthView } = useAuth();

  // Screen Step: 'signin' | 'register-personal' | 'register-shop'
  const [step, setStep] = useState<AuthStep>(initialMode === 'signup' ? 'register-personal' : 'signin');

  useEffect(() => {
    if (initialMode === 'signup') {
      setStep('register-personal');
    } else {
      setStep('signin');
    }
  }, [initialMode]);

  // Sign In inputs (Email & Password)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Step 1: Register Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Step 2: Register Shop Details
  const [shopName, setShopName] = useState('');
  const [shopLogoUrl, setShopLogoUrl] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [currency, setCurrency] = useState('PKR');

  const [rememberMe, setRememberMe] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [activeTaglineIndex, setActiveTaglineIndex] = useState(0);

  // Mouse Parallax coordinates for 3D depth effect (desktop)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const taglines = [
    'Track Every Sale in Real Time',
    'AI-Powered Inventory Forecasts',
    'Multi-Store Management Made Simple',
    'Smart Analytics to Grow Faster'
  ];

  // Preset quick logos for fast onboarding
  const presetLogos = [
    { label: 'Purple Gem', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120' },
    { label: 'Tech Cart', url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=120' },
    { label: 'Modern Store', url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=120' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo image must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. SIGN IN: Direct login for merchants and super admin (ra2826572@gmail.com)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = loginEmail.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      triggerShake();
      return;
    }

    setLoading(true);
    const res = await signIn(trimmedEmail, loginPassword);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      triggerShake();
    }
  };

  // 2. STEP 1 VALIDATION: Personal Details -> Proceed to Shop Details
  const handlePersonalStepNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = registerEmail.trim().toLowerCase();

    if (!trimmedFirst) {
      setError('First name is required.');
      triggerShake();
      return;
    }
    if (!trimmedLast) {
      setError('Last name is required.');
      triggerShake();
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Valid email address is required.');
      triggerShake();
      return;
    }
    if (!registerPassword || registerPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      triggerShake();
      return;
    }

    // Default shop name guess if empty
    if (!shopName) {
      setShopName(`${trimmedFirst}'s Store`);
    }

    // Proceed to Step 2: Shop Details
    setStep('register-shop');
  };

  // 3. STEP 2 SUBMISSION: Shop Details -> Register & Open Dashboard
  const handleFinalRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedShop = shopName.trim();
    if (!trimmedShop) {
      setError('Shop Name is required.');
      triggerShake();
      return;
    }

    setLoading(true);
    const regRes = await signUp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: registerEmail.trim().toLowerCase(),
      password: registerPassword,
      shopName: trimmedShop,
      logoUrl: shopLogoUrl,
      description: shopDescription.trim(),
      currency
    });
    setLoading(false);

    if (regRes.error) {
      setError(regRes.error);
      triggerShake();
    }
  };

  // Sparkline SVG Points for Sales Growth Chart
  const sparklinePoints = "10,75 40,65 75,70 110,48 145,55 180,38 215,42 250,22 285,30 320,12";
  const sparklineArea = "10,75 40,65 75,70 110,48 145,55 180,38 215,42 250,22 285,30 320,12 320,95 10,95";

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden transition-colors duration-500 font-sans ${
        isDarkMode 
          ? 'bg-[#0B1020] text-slate-100' 
          : 'bg-gradient-to-br from-[#E6EEF8] via-[#EDF3FA] to-[#DFE9F5] text-slate-900'
      }`}
    >
      {/* Dynamic Background Glowing Mesh Blobs */}
      <motion.div 
        animate={{ 
          x: [0, 30, -20, 0], 
          y: [0, -40, 20, 0], 
          scale: [1, 1.15, 0.95, 1] 
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-purple-600/25 blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -35, 25, 0], 
          y: [0, 35, -30, 0], 
          scale: [1, 1.1, 0.9, 1] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 -right-32 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, 25, -25, 0], 
          y: [0, -20, 30, 0] 
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none"
      />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ============================================================== */}
      {/* LEFT PANEL: 52% ANIMATED BRAND SHOWCASE                        */}
      {/* ============================================================== */}
      <div className="relative w-full lg:w-[52%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10">
        
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Store className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ShopFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                POS & Inventory
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Manage Your Business · Track Every Sale · Grow Smarter
            </p>
          </div>
        </motion.div>

        {/* Center Showcase */}
        <div className="my-8 lg:my-auto max-w-xl">
          <div className="mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-purple-600 dark:text-purple-300 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Cloud POS & Real-Time Analytics</span>
            </motion.div>

            <div className="h-16 flex items-center">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeTaglineIndex}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {taglines[activeTaglineIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-lg leading-relaxed">
              Complete inventory control, barcode point of sale, customer billing, and live business forecasts in one unified system.
            </p>
          </div>

          {/* Interactive Parallax Cards */}
          <motion.div 
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative"
          >
            {/* Card 1: Live Sales Chart */}
            <div className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-xl ${
              isDarkMode 
                ? 'bg-slate-900/60 border-white/10' 
                : 'bg-white/80 border-white/90'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sales Overview</div>
                    <div className="text-base font-extrabold tracking-tight tabular-nums">$12,580.00</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  +28.4%
                </span>
              </div>
              <div className="h-14 w-full relative overflow-hidden rounded-lg">
                <svg viewBox="0 0 330 100" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon points={sparklineArea} fill="url(#chartGrad)" />
                  <polyline
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                  />
                  <circle cx="320" cy="12" r="4.5" fill="#7C3AED" className="animate-pulse" />
                </svg>
              </div>
            </div>

            {/* Card 2: Live Order Alert */}
            <div className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-xl ${
              isDarkMode 
                ? 'bg-slate-900/60 border-white/10' 
                : 'bg-white/80 border-white/90'
            }`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Order #ORD-1024</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">Just now</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Ahmed Khan · 1x iPhone 15 Pro</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">$299.00 USD</span>
                    <span className="text-[10px] font-semibold text-slate-400">Card Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>256-bit Secure TLS Data Isolation</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">© 2026 ShopFlow AI Platform</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: 48% AUTHENTICATION / ONBOARDING CARDS             */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
          }}
          transition={{ 
            x: { duration: 0.5 },
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 }
          }}
          className={`w-full max-w-[460px] rounded-[36px] p-7 sm:p-9 relative transition-all duration-500 ${
            isDarkMode 
              ? 'bg-[#12182E]/95 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.55)] text-white' 
              : 'bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(79,70,229,0.12),0_8px_20px_rgba(0,0,0,0.04)] text-slate-800'
          }`}
        >
          {/* Top Row: Theme Toggle */}
          <div className="flex justify-end mb-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isDarkMode 
                  ? 'bg-white/10 text-amber-300 hover:bg-white/15 border border-white/10 shadow-inner' 
                  : 'bg-[#EBF0F7] text-slate-700 hover:bg-[#E2E8F0] shadow-xs'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Centered Logo Badge */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className={`w-20 h-20 rounded-[22px] mb-3 flex items-center justify-center relative p-3 transition-all ${
              isDarkMode 
                ? 'bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-xl' 
                : 'bg-gradient-to-b from-[#F2F6FC] to-[#E5ECF6] shadow-lg border border-white'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Dynamic Step Header */}
            {step === 'signin' && (
              <>
                <h1 className={`text-2xl font-black tracking-tight mb-1 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Sign In to Store
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your store dashboard
                </p>
              </>
            )}

            {step === 'register-personal' && (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 mb-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Step 1 of 2 · Personal Details</span>
                </div>
                <h1 className={`text-2xl font-black tracking-tight mb-1 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Create Your Account
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Enter your name, email, and password to start
                </p>
              </>
            )}

            {step === 'register-shop' && (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>Step 2 of 2 · Shop Details</span>
                </div>
                <h1 className={`text-2xl font-black tracking-tight mb-1 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Set Up Your Shop
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Enter shop name, upload logo, and launch your dashboard
                </p>
              </>
            )}
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 overflow-hidden"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* SCREEN 1: SIGN IN FORM                                         */}
          {/* ============================================================== */}
          {step === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Mail className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                  {loginEmail.includes('@') && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                  Password
                </label>
                <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Remember Me & Help Row */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span className="font-medium text-slate-600 dark:text-slate-300">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setAuthView('forgot')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{loading ? 'Signing In...' : 'Sign In to Store'}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
              </motion.button>

              {/* Switch to Register Form */}
              <div className="text-center pt-3 border-t border-slate-100 dark:border-white/5 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('register-personal');
                      setError('');
                    }}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Register new store →
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* SCREEN 2: PERSONAL REGISTRATION FORM (Step 1 of 2)             */}
          {/* ============================================================== */}
          {step === 'register-personal' && (
            <form onSubmit={handlePersonalStepNext} className="space-y-3.5">
              {/* Row: First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center rounded-2xl px-3.5 py-3 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                      : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                  }`}>
                    <User className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g. Tariq"
                      className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center rounded-2xl px-3.5 py-3 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                      : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                  }`}>
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g. Khan"
                      className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className={`flex items-center rounded-2xl px-3.5 py-3 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                  {registerEmail.includes('@') && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className={`flex items-center rounded-2xl px-3.5 py-3 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Create password"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Next Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-2 cursor-pointer"
              >
                <span>Continue to Shop Details</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </motion.button>

              {/* Return to Sign In */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('signin');
                    setError('');
                  }}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Already have an account? <span className="font-bold">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* SCREEN 3: SHOP DETAILS & LOGO FORM (Step 2 of 2)               */}
          {/* ============================================================== */}
          {step === 'register-shop' && (
            <form onSubmit={handleFinalRegisterSubmit} className="space-y-3.5">
              {/* Field 1: Shop Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <div className={`flex items-center rounded-2xl px-3.5 py-3 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Store className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => {
                      setShopName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Khan Mobile & Gadgets"
                    className="w-full bg-transparent text-sm font-semibold focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Field 2: Upload Shop Logo */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Shop Logo <span className="text-slate-400 font-normal lowercase">(upload or choose)</span>
                </label>
                
                <div className="flex items-center gap-2.5 mb-2">
                  {/* Logo Preview */}
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {shopLogoUrl ? (
                      <img src={shopLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  {/* Upload Button */}
                  <label className="flex-1 cursor-pointer py-2.5 px-3.5 rounded-xl bg-[#F0F4FA] dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Choices */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Or pick:</span>
                  {presetLogos.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setShopLogoUrl(p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                        shopLogoUrl === p.url 
                          ? 'bg-purple-600 border-purple-500 text-white font-bold' 
                          : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Shop Details / Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Shop Details / Tagline <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className={`flex items-start rounded-2xl px-3.5 py-2.5 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08]' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mr-2 mt-1" />
                  <input
                    type="text"
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    placeholder="e.g. Premium smartphones & repair center"
                    className="w-full bg-transparent text-xs font-medium focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Field 4: Currency Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Operating Currency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { code: 'PKR', symbol: '₨' },
                    { code: 'USD', symbol: '$' },
                    { code: 'AED', symbol: 'د.إ' },
                    { code: 'EUR', symbol: '€' }
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                        currency === c.code
                          ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                          : 'bg-[#F0F4FA] dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="block text-[10px] opacity-75">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{loading ? 'Setting up Shop...' : 'Launch Store Dashboard'}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
              </motion.button>

              {/* Back to Step 1 */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register-personal');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Personal Details</span>
                </button>
              </div>
            </form>
          )}

          {/* Clean Subtitle Footer */}
          <div className="mt-6 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
              MANAGE · TRACK · GROW TOGETHER
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
