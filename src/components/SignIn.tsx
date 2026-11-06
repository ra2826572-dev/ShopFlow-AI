import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Check, 
  Sun, 
  Moon, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard, 
  ShieldCheck, 
  Shield,
  Loader2,
  Sparkles,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignIn: React.FC = () => {
  const { signIn, signUp, setAuthView } = useAuth();

  // Mode: strictly 'admin' or 'user' as requested
  const [roleMode, setRoleMode] = useState<'admin' | 'user'>('admin');

  // Admin credentials (email visible, password strictly hidden & never prefilled)
  const [adminEmail, setAdminEmail] = useState('ra2826572@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');

  // User credentials (First Name, Last Name, Email, Password)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

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

  // ADMIN LOGIN: Only password '59115911' is allowed
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = adminEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Admin email is required.');
      triggerShake();
      return;
    }

    if (!adminPassword) {
      setError('Admin password is required.');
      triggerShake();
      return;
    }

    // Strict requirement: Admin password MUST be 59115911
    if (adminPassword !== '59115911') {
      setError('Ghalat password! Admin ka password srif "59115911" hai.');
      triggerShake();
      return;
    }

    setLoading(true);
    const res = await signIn(trimmedEmail, adminPassword);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      triggerShake();
    }
  };

  // USER REGISTRATION & SIGN IN: Requires First Name, Last Name, Email, Password
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = userEmail.trim().toLowerCase();

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
    if (!userPassword || userPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      // 1. Check if user already exists
      const checkRes = await fetch(`/api/auth/profile?email=${encodeURIComponent(trimmedEmail)}`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.user) {
        // User exists -> sign in
        const res = await signIn(trimmedEmail, userPassword);
        setLoading(false);
        if (res.error) {
          setError(res.error);
          triggerShake();
        }
      } else {
        // New user -> register profile in database, then redirect to Shop Setup
        const regRes = await signUp({
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          password: userPassword
        });
        setLoading(false);

        if (regRes.error) {
          setError(regRes.error);
          triggerShake();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error. Please try again.');
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
      {/* LEFT PANEL: 55% ANIMATED BRAND SHOWCASE (Desktop)              */}
      {/* ============================================================== */}
      <div className="relative w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10">
        
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white drop-shadow">
              <path d="M16 2C16 2 10 9 10 15C10 18.3 12.7 21 16 21C19.3 21 22 18.3 22 15C22 9 16 2 16 2Z" fill="url(#logoG1)" />
              <path d="M12 12C12 12 7 17 7 21.5C7 25.1 9.9 28 13.5 28C17.1 28 20 25.1 20 21.5C20 18.5 17 15 17 15C17 15 15.5 18 13.5 18C12.4 18 11.5 17.1 11.5 16C11.5 14.5 12 12 12 12Z" fill="url(#logoG2)" />
              <defs>
                <linearGradient id="logoG1" x1="10" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#C4B5FD" />
                </linearGradient>
                <linearGradient id="logoG2" x1="7" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93C5FD" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ShopFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                SaaS v2.4
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Manage Your Business · Track Every Sale · Grow Smarter
            </p>
          </div>
        </motion.div>

        {/* Center Showcase with Floating Retail Glass Cards */}
        <div className="my-8 lg:my-auto max-w-xl">
          <div className="mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-purple-600 dark:text-purple-300 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Operating System for Retailers</span>
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
              Empowering mobile stores, supermarkets, boutiques, and omnichannel brands with live POS sync, inventory alerts, and role-governed workflows.
            </p>
          </div>

          {/* Interactive 3D Parallax Glass Cards Stage */}
          <motion.div 
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative"
          >
            {/* Card 1: Live Sales Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.3 },
                scale: { duration: 0.6, delay: 0.3 },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/10 hover:border-purple-500/30' 
                  : 'bg-white/80 border-white/90 hover:border-purple-200'
              }`}
            >
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
                <svg viewBox="0 0 330 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
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
            </motion.div>

            {/* Card 2: Live Order Notification */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0, 6, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.4 },
                scale: { duration: 0.6, delay: 0.4 },
                y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }
              }}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/10 hover:border-emerald-500/30' 
                  : 'bg-white/80 border-white/90 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">New Order #ORD-1024</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">Just now</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Ahmed Khan · 1x iPhone 15 Pro</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">$299.00 USD</span>
                    <span className="text-[10px] font-semibold text-slate-400">Card Payment</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Low-Stock Real-time Alert */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.5 },
                scale: { duration: 0.6, delay: 0.5 },
                y: { repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1.5 }
              }}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/10 hover:border-amber-500/30' 
                  : 'bg-white/80 border-white/90 hover:border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Low Stock Alert</span>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">3 left</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">iPhone 15 Pro (Natural Titanium)</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    <Package className="w-3.5 h-3.5" />
                    <span>Auto-reorder suggested</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Quick POS Terminal Status */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0, 5, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.6 },
                scale: { duration: 0.6, delay: 0.6 },
                y: { repeat: Infinity, duration: 5.8, ease: "easeInOut", delay: 0.5 }
              }}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/10 hover:border-indigo-500/30' 
                  : 'bg-white/80 border-white/90 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">ShopFlow POS Active</span>
                    <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Terminal #04 · Karachi Main</p>
                  <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    Today: <span className="font-extrabold text-slate-900 dark:text-white">248 items sold</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Metrics & Security Assurance */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Bank-grade 256-bit TLS Encryption</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Supabase PostgreSQL Backed</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">© 2026 ShopFlow AI Platform</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: 45% PREMIER SIGN-IN FORM                          */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20">
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
          className={`w-full max-w-[440px] rounded-[36px] p-7 sm:p-9 relative transition-all duration-500 ${
            isDarkMode 
              ? 'bg-[#12182E]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.55)] text-white' 
              : 'bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(79,70,229,0.12),0_8px_20px_rgba(0,0,0,0.04)] text-slate-800'
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
                  : 'bg-[#EBF0F7] text-slate-700 hover:bg-[#E2E8F0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_4px_rgba(255,255,255,0.8)]'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Centered 3D Glossy Swirl Logo Badge */}
          <div className="flex flex-col items-center text-center">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className={`w-24 h-24 rounded-[26px] mb-3 flex items-center justify-center relative p-3 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]' 
                  : 'bg-gradient-to-b from-[#F2F6FC] to-[#E5ECF6] shadow-[0_18px_38px_rgba(99,102,241,0.15),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.05)] border border-white'
              }`}
            >
              <div className="absolute inset-2 rounded-[22px] bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-md pointer-events-none"></div>

              <svg viewBox="0 0 100 100" className="w-14 h-14 drop-shadow-xl z-10">
                <defs>
                  <linearGradient id="crestG1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#C8DDF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="crestG2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                  <linearGradient id="crestG3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="60%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#4338CA" />
                  </linearGradient>
                </defs>

                <path
                  d="M50 12 C 55 25, 42 35, 36 48 C 30 60, 34 72, 42 78 C 30 74, 25 60, 29 48 C 33 34, 45 22, 50 12 Z"
                  fill="url(#crestG2)"
                />
                <path
                  d="M58 18 C 65 32, 52 46, 46 62 C 40 76, 48 86, 56 88 C 44 85, 38 72, 42 58 C 47 42, 60 30, 58 18 Z"
                  fill="url(#crestG3)"
                />
                <path
                  d="M66 26 C 74 40, 64 52, 60 66 C 56 78, 62 84, 68 85 C 57 83, 52 72, 55 60 C 58 48, 68 38, 66 26 Z"
                  fill="url(#crestG1)"
                />
              </svg>
            </motion.div>

            <h1 className={`text-2xl font-black tracking-tight mb-1 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {roleMode === 'admin' ? 'Admin Portal' : 'User Access'}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
              {roleMode === 'admin' 
                ? 'Authorized super admin sign in' 
                : 'Enter details to access your store'}
            </p>
          </div>

          {/* ========================================================== */}
          {/* 2 OPTIONS ONLY: ADMIN VS USER (Segmented Tab Bar)          */}
          {/* ========================================================== */}
          <div className="flex p-1 mb-5 rounded-2xl bg-[#E8EEF7] dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setRoleMode('admin');
                setError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                roleMode === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode('user');
                setError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                roleMode === 'user'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>User</span>
            </button>
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

          {/* ========================================================== */}
          {/* TAB 1: ADMIN LOGIN FORM                                   */}
          {/* ========================================================== */}
          {roleMode === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              
              {/* Admin Email: ra2826572@gmail.com */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                  Admin Email
                </label>
                <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-purple-500/20' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <User className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="ra2826572@gmail.com"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                  {adminEmail.includes('@') && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Admin Password: Strictly type="password" (never shown, required 59115911) */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
                  Admin Password
                </label>
                <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 focus-within:border-purple-500/80 focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-purple-500/20' 
                    : 'bg-[#F0F4FA] border border-slate-200/80 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}>
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter password (59115911)"
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
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying Admin...' : 'Login as Admin'}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
              </motion.button>
            </form>
          ) : (
            /* ========================================================== */
            /* TAB 2: USER LOGIN / REGISTRATION (First, Last, Email, Pass) */
            /* ========================================================== */
            <form onSubmit={handleUserSubmit} className="space-y-3.5">
              
              {/* Row: First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    First Name
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
                      placeholder="First Name"
                      className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Last Name
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
                      placeholder="Last Name"
                      className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* User Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Email Address
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
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="user@example.com"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                  {userEmail.includes('@') && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* User Password: type="password" (hidden) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Password
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
                    value={userPassword}
                    onChange={(e) => {
                      setUserPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_12px_28px_rgba(79,70,229,0.35)] flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Processing...' : 'Continue as User'}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
              </motion.button>
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
