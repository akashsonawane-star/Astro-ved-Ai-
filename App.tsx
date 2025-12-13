import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Star, Heart, MessageCircle, Settings, 
  ChevronRight, ArrowLeft, Send, User, MapPin, Calendar, Clock,
  Search, Bell, BellOff, X, Save, Check, Scroll, Bot, HeartHandshake, Loader2, Edit2, Shield, ChevronDown, Camera, Brain, LogOut, Mail, Lock, Hash
} from 'lucide-react';
import { TRANSLATIONS, ZODIAC_SIGNS } from './constants';
import { AppView, Language, ChatMessage, HoroscopeTimeframe } from './types';
import * as Gemini from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- SEO Management ---

const updateSeo = (view: AppView, language: Language, dynamicData?: string) => {
  let title = "Astro Ved AI - Vedic Astrology";
  let description = "Your personal AI astrologer for Horoscopes, Kundli, and Compatibility.";

  const t = TRANSLATIONS[language];

  switch (view) {
    case AppView.HOME:
      title = `Astro Ved AI - ${t.home}`;
      break;
    case AppView.HOROSCOPE:
      title = `${dynamicData || 'Horoscope'} - ${t.horoscope} | Astro Ved AI`;
      description = `Read your daily horoscope for ${dynamicData}. Accurate vedic predictions.`;
      break;
    case AppView.KUNDLI:
      title = `${t.kundli} - Vedic Birth Chart | Astro Ved AI`;
      description = "Generate your detailed Vedic Kundli birth chart instantly with AI.";
      break;
    case AppView.COMPATIBILITY:
      title = `${t.compatibility} - Love Match | Astro Ved AI`;
      description = "Check your relationship compatibility score using Vedic Astrology.";
      break;
    case AppView.CHAT:
      title = `${t.chat} - Ask AI Astrologer`;
      break;
    case AppView.FIND_RASHI:
      title = `${t.findRashi} - Calculator | Astro Ved AI`;
      break;
    default:
      break;
  }

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }
};

// --- Animation Variants ---

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.05, filter: "blur(4px)", transition: { duration: 0.3 } }
};

// --- Helper Functions ---

const getColorHex = (colorName: string): string => {
    if (!colorName) return '#F8D447';
    const c = colorName.toLowerCase();
    if (c.includes('gold') || c.includes('yellow')) return '#F8D447';
    if (c.includes('red') || c.includes('crimson') || c.includes('maroon') || c.includes('vermilion')) return '#EF4444';
    if (c.includes('blue') || c.includes('azure') || c.includes('navy') || c.includes('teal')) return '#3B82F6';
    if (c.includes('green') || c.includes('emerald') || c.includes('olive')) return '#10B981';
    if (c.includes('purple') || c.includes('violet') || c.includes('indigo') || c.includes('lavender')) return '#A855F7';
    if (c.includes('orange') || c.includes('amber')) return '#F97316';
    if (c.includes('pink') || c.includes('magenta')) return '#EC4899';
    if (c.includes('white') || c.includes('cream') || c.includes('pearl')) return '#FFFFFF';
    if (c.includes('black') || c.includes('charcoal')) return '#1a1a1a';
    if (c.includes('silver') || c.includes('grey') || c.includes('gray')) return '#C0C0C0';
    if (c.includes('brown') || c.includes('beige')) return '#A52A2A';
    return colorName; 
};

const detectRashiFromDate = (dateStr: string) => {
    if(!dateStr) return null;
    const date = new Date(dateStr);
    if(isNaN(date.getTime())) return null; 
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return 'Aries';
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return 'Taurus';
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return 'Gemini';
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return 'Cancer';
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return 'Leo';
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return 'Virgo';
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return 'Libra';
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return 'Scorpio';
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return 'Sagittarius';
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return 'Capricorn';
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return 'Aquarius';
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return 'Pisces';
    return 'Aries';
};

// --- Premium UI Components ---

const CosmicBackground = () => {
  return (
    <>
      <div className="fixed inset-0 bg-[#050110] z-[-2]" />
      <div className="nebula-bg" />
      <div className="stars-layer stars-1" />
      <div className="stars-layer stars-2" />
      {/* Interactive Twinkling Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full z-[-1]"
          initial={{ 
            opacity: Math.random() * 0.5 + 0.1, 
            scale: Math.random() * 0.5 + 0.5,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)
          }}
          animate={{ 
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 2 
          }}
          style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1 }}
        />
      ))}
    </>
  );
};

const AnimatedLogo = ({ size = "large" }: { size?: "small" | "large" }) => {
  const isLarge = size === "large";
  const containerSize = isLarge ? 'w-56 h-56' : 'w-12 h-12';
  const radius = isLarge ? 90 : 0; 

  return (
    <div className={`relative flex items-center justify-center ${containerSize}`}>
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gold-400/10 blur-xl rounded-full ${isLarge ? 'scale-100' : 'scale-150'}`} />

      {/* Rotating Zodiac Ring - Only visible on Large */}
      {isLarge && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Ring Border */}
          <div className="absolute inset-0 rounded-full border-2 border-gold-400/20" />
          <div className="absolute inset-2 rounded-full border border-gold-400/10" />

          {/* Zodiac Signs */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const angle = (i * 360) / 12;
            return (
              <div
                key={sign.name}
                className="absolute top-1/2 left-1/2 text-gold-400 flex items-center justify-center font-serif"
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '-10px',
                  marginLeft: '-10px',
                  transform: `rotate(${angle}deg) translateY(-${radius}px)`
                }}
              >
                <span className="text-lg drop-shadow-md">{sign.symbol}</span>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Inner Decorative Rings */}
      <motion.div
        className={`absolute ${isLarge ? 'inset-20' : 'inset-1'} rounded-full border border-gold-400/40 border-dashed`}
        animate={{ rotate: -360 }}
        transition={{ duration: isLarge ? 40 : 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center Brain Icon */}
      <motion.div
        className="relative z-10 text-gold-400 drop-shadow-[0_0_15px_rgba(248,212,71,0.6)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
         <div className="relative">
            <Brain 
                size={isLarge ? 48 : 24} 
                strokeWidth={1.5} 
                className="relative z-10 text-gold-100"
                fill="rgba(248, 212, 71, 0.2)"
            />
         </div>
      </motion.div>
    </div>
  );
};

// --- Ad Banner Component (AdSense Ready) ---
interface AdBannerProps {
  className?: string;
  adSlot?: string; // Optional: For passing specific Ad Unit ID
}

const AdBanner = ({ className = "", adSlot }: AdBannerProps) => {
  return (
    <div className={`w-full min-h-[60px] mx-auto bg-black/20 backdrop-blur-md border border-white/5 flex flex-col items-center justify-center relative overflow-hidden rounded-lg my-4 group ${className}`}>
      <div className="absolute inset-0 bg-gold-400/5 group-hover:bg-gold-400/10 transition-colors pointer-events-none" />
      <span className="text-[9px] text-gray-600 uppercase tracking-widest relative z-10 font-bold border px-1 rounded border-gray-700">Ad</span>
      <span className="text-[10px] text-gray-500 relative z-10 mt-1">Advertisement Space</span>
      
      {/* Simulate Ad Loading shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine pointer-events-none" />
    </div>
  );
};

const CosmicLoader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative w-24 h-24">
         {/* Galaxy Swirl */}
         <motion.div 
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold-400/80 shadow-[0_0_15px_rgba(248,212,71,0.3)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
         />
         <motion.div 
            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-neon-purple/80 shadow-[0_0_15px_rgba(176,38,255,0.3)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
         />
         {/* Center Pulse */}
         <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="w-4 h-4 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
         </div>
         {/* Particles */}
         <motion.div className="absolute -top-4 left-1/2 w-1 h-1 bg-gold-400 rounded-full" animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
         <motion.div className="absolute -bottom-4 left-1/2 w-1 h-1 bg-neon-purple rounded-full" animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      </div>
      <motion.p 
        className="mt-8 text-gold-200 font-serif text-center max-w-xs leading-relaxed tracking-wider text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {text}
      </motion.p>
    </div>
  );
};

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noHover?: boolean;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  onClick, 
  noHover = false,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={!noHover && onClick ? { 
        scale: 1.02, 
        borderColor: "rgba(248, 212, 71, 0.4)",
        boxShadow: "0 0 20px rgba(248, 212, 71, 0.15)"
      } : {}}
      whileTap={!noHover && onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`glass-card-premium rounded-2xl p-5 relative overflow-hidden group ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:animate-shine" />
      {children}
    </motion.div>
  );
};

const AnimatedIcon = ({ icon: Icon, type, className = "" }: { icon: any, type: 'rotate' | 'pulse' | 'bounce' | 'wiggle', className?: string }) => {
  const variants = {
    rotate: { rotate: [0, -15, 15, 0], transition: { duration: 0.5 } },
    pulse: { scale: [1, 1.2, 1], transition: { duration: 0.4 } },
    bounce: { y: [0, -4, 0], transition: { duration: 0.4 } },
    wiggle: { x: [0, -2, 2, -2, 2, 0], transition: { duration: 0.4 } }
  };
  
  return (
    <motion.div whileHover={variants[type]} whileTap={variants[type]}>
      <Icon className={className} strokeWidth={1.5} />
    </motion.div>
  );
};

const NavButton = ({ active, icon: Icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 relative group`}
  >
    {active && (
      <motion.div 
        layoutId="navGlow"
        className="absolute -top-6 w-12 h-12 bg-gold-400/20 blur-xl rounded-full" 
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    )}
    <motion.div
      animate={active ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative z-10 ${active ? 'text-gold-400 drop-shadow-[0_0_8px_rgba(248,212,71,0.6)]' : 'text-gray-500 group-hover:text-gray-300'}`}
    >
      <Icon size={24} strokeWidth={active ? 2 : 1.5} />
    </motion.div>
    <motion.span 
      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0.7, scale: 0.9 }}
      className={`text-[10px] mt-1 font-medium tracking-wide ${active ? 'text-gold-100 font-bold' : 'text-gray-500'}`}
    >
      {label}
    </motion.span>
  </button>
);


// --- Auth View ---

const AuthView: React.FC<{ language: Language, onLogin: (user: any) => void }> = ({ language, onLogin }) => {
  const t = TRANSLATIONS[language];
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (error) throw error;
        alert('Account created! Please check your email to verify.');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <AnimatedLogo size="small" />
      <h2 className="text-3xl font-serif text-white font-bold mt-6 mb-2">{isLogin ? t.welcomeBack : t.createAccount}</h2>
      <p className="text-gray-400 text-sm mb-8 text-center">{isLogin ? "Sign in to align with the stars" : "Begin your cosmic journey today"}</p>

      <GlassCard className="w-full max-w-sm space-y-5 backdrop-blur-3xl">
         <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold tracking-wider">{t.name}</label>
                <div className="flex items-center space-x-3 bg-black/40 p-3.5 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
                  <User size={18} className="text-gold-400" />
                  <input 
                    type="text" 
                    name="name"
                    required={!isLogin}
                    autoComplete="name"
                    placeholder="Your Name"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="bg-transparent w-full outline-none text-white text-sm" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold tracking-wider">{t.email}</label>
              <div className="flex items-center space-x-3 bg-black/40 p-3.5 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
                <Mail size={18} className="text-gold-400" />
                <input 
                  type="email" 
                  name="email"
                  required
                  autoComplete="email" 
                  placeholder="name@example.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="bg-transparent w-full outline-none text-white text-sm" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold tracking-wider">{t.password}</label>
              <div className="flex items-center space-x-3 bg-black/40 p-3.5 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
                <Lock size={18} className="text-gold-400" />
                <input 
                  type="password" 
                  name="password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"} 
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="bg-transparent w-full outline-none text-white text-sm" 
                />
              </div>
            </div>

            {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">{t.forgotPassword}</button>
              </div>
            )}

            <motion.button 
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-orange-500 rounded-xl font-bold text-black shadow-lg shadow-gold-900/20 flex items-center justify-center relative overflow-hidden"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? t.login : t.signup)}
            </motion.button>
         </form>

         <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
         </div>

         <div className="text-center pt-2">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-white transition-colors">
               {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount} <span className="text-gold-400 font-bold ml-1">{isLogin ? t.signup : t.login}</span>
            </button>
         </div>
      </GlassCard>
    </motion.div>
  );
};


// --- Feature Views ---

const WelcomeView = ({ onComplete }: { onComplete: (lang: Language) => void }) => {
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLang(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cosmic-black text-white p-6 overflow-hidden"
    >
      <CosmicBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-10 w-full max-w-md">
        <AnimatedLogo size="large" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-gradient drop-shadow-lg tracking-wider">
            Astro Ved AI
          </h1>
          <p className="text-gray-400 font-sans tracking-[0.3em] text-xs uppercase animate-pulse-slow">
            Ancient Wisdom • Cosmic Intelligence
          </p>
        </motion.div>

        <AnimatePresence>
          {showLang && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
            >
              <p className="text-xs text-gold-400 uppercase tracking-widest font-bold mb-4 flex items-center justify-center">
                <Sparkles size={12} className="mr-2" /> Select Language
              </p>
              <motion.div 
                className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto no-scrollbar"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {Object.values(Language).map((lang) => (
                  <motion.button
                    key={lang}
                    variants={slideUp}
                    whileHover={{ scale: 1.05, borderColor: "rgba(248, 212, 71, 0.5)", backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComplete(lang)}
                    className="px-4 py-3 rounded-xl border border-white/5 bg-white/5 transition-all text-left text-sm font-medium text-gray-200 hover:text-white flex items-center justify-between group"
                  >
                    <span>{lang}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-400" />
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const HomeView: React.FC<{ 
    language: Language, 
    setView: (v: AppView) => void, 
    prefs: any,
    setSelectedSign: (sign: string) => void 
}> = ({ language, setView, prefs, setSelectedSign }) => {
  const t = TRANSLATIONS[language];
  const [signData, setSignData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<HoroscopeTimeframe>(HoroscopeTimeframe.TODAY);

  const activeSign = prefs.sign ? ZODIAC_SIGNS.find(z => z.name === prefs.sign) || ZODIAC_SIGNS[0] : ZODIAC_SIGNS[0];
  const userName = prefs.userProfile?.name ? prefs.userProfile.name.split(' ')[0] : null;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await Gemini.getDailyHoroscope(activeSign.name, language, timeframe);
      setSignData(data);
      setLoading(false);
    };
    fetch();
  }, [timeframe, activeSign, language]);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-28 space-y-6">
      <header className="flex justify-between items-center px-1">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center">
           <AnimatedLogo size="small" />
           <div className="ml-3">
             <h1 className="text-xl font-serif font-bold text-white">
               {userName ? `Hi, ${userName}` : 'Astro Ved'}
             </h1>
             <p className="text-[10px] text-gold-400 uppercase tracking-[0.2em]">{t.home}</p>
           </div>
        </motion.div>
        <motion.button 
          whileTap={{ rotate: 90 }}
          onClick={() => setView(AppView.SETTINGS)} 
          className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 border border-white/10"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </motion.button>
      </header>

      {/* Horoscope Card */}
      <div className="space-y-4">
         <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {Object.values(HoroscopeTimeframe).map((tf) => (
              <button 
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${timeframe === tf ? 'text-black' : 'text-gray-400 hover:text-white'}`}
              >
                {timeframe === tf && (
                  <motion.div 
                    layoutId="tabBg" 
                    className="absolute inset-0 bg-gold-500 rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t.timeframes[tf.toLowerCase() as keyof typeof t.timeframes]}</span>
              </button>
            ))}
         </div>

         <GlassCard className="relative overflow-hidden group border-gold-400/20" noHover>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="block text-9xl font-serif">{activeSign.symbol}</motion.span>
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center space-x-4 mb-5">
                 <motion.div 
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-orange-500 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_25px_rgba(248,212,71,0.3)]"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                 >
                   {activeSign.symbol}
                 </motion.div>
                 <div>
                   <h2 className="text-xl font-serif text-white">{t.zodiac[activeSign.name.toLowerCase() as keyof typeof t.zodiac]}</h2>
                   <p className="text-xs text-gold-300">{activeSign.dates}</p>
                 </div>
               </div>

               {loading ? (
                 <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-gold-400" /></div>
               ) : signData ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                   <p className="text-sm text-gray-200 leading-relaxed italic border-l-2 border-gold-500 pl-4 py-1">
                     "{signData.prediction}"
                   </p>
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t.luckyNumber}</span>
                        <span className="text-gold-400 font-bold text-lg">{signData.luckyNumber}</span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t.luckyColor}</span>
                        <div className="flex flex-col items-center justify-center space-y-1">
                           <div 
                              className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg" 
                              style={{ 
                                  backgroundColor: getColorHex(signData.luckyColor),
                                  boxShadow: `0 0 10px ${getColorHex(signData.luckyColor)}80`
                              }} 
                           />
                           <span className="text-white font-bold text-[10px] leading-tight" style={{color: getColorHex(signData.luckyColor)}}>{signData.luckyColor}</span>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t.mood}</span>
                        <span className="text-neon-purple font-bold text-xs">{signData.mood}</span>
                      </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="text-center text-sm text-gray-500">Failed to load horoscope.</div>
               )}
            </div>
         </GlassCard>
      </div>

      {/* Feature Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
         {[
           { icon: Search, label: t.findRashi, view: AppView.FIND_RASHI, type: 'rotate' },
           { icon: Scroll, label: t.kundli, view: AppView.KUNDLI, type: 'bounce' },
           { icon: HeartHandshake, label: t.compatibility, view: AppView.COMPATIBILITY, type: 'pulse' },
           { icon: Hash, label: t.numerology, view: AppView.NUMEROLOGY, type: 'pulse' },
           { icon: Bot, label: t.askAstro, view: AppView.CHAT, type: 'wiggle' }
         ].map((feature, idx) => (
           <GlassCard 
             key={idx} 
             onClick={() => setView(feature.view)} 
             className={`flex flex-col items-center justify-center py-6 space-y-3 border border-white/5 bg-white/5 hover:bg-white/10 ${idx === 4 ? 'col-span-2' : ''}`}
             delay={idx}
           >
              <div className="p-3 bg-gradient-to-br from-purple-900 to-black rounded-xl border border-white/10 shadow-inner">
                <AnimatedIcon icon={feature.icon} type={feature.type as any} className="text-gold-400 w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-200">{feature.label}</span>
           </GlassCard>
         ))}
      </motion.div>

      {/* Ad Banner on Home Screen */}
      <AdBanner />
      
      {/* Zodiac Wheel - Side Scrollable */}
      <div>
         <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.features.zodiacSigns}</h3>
           <ChevronRight size={16} className="text-gray-500" />
         </div>
         <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar snap-x snap-mandatory">
           {ZODIAC_SIGNS.map((sign, i) => (
             <motion.button
               key={sign.name}
               onClick={() => {
                 setSelectedSign(sign.name);
               }}
               whileTap={{ scale: 0.9 }}
               className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 p-2 rounded-xl border snap-center ${activeSign.name === sign.name ? 'border-gold-400 bg-gold-400/10' : 'border-white/5 bg-white/5'}`}
             >
                <span className="text-3xl mb-2">{sign.symbol}</span>
                <span className="text-[10px] text-gray-400">{t.zodiac[sign.name.toLowerCase() as keyof typeof t.zodiac]}</span>
             </motion.button>
           ))}
         </div>
      </div>
    </motion.div>
  );
};

const HoroscopeDetailView: React.FC<{ 
    signName: string, 
    language: Language, 
    onBack: () => void 
}> = ({ signName, language, onBack }) => {
  const t = TRANSLATIONS[language];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState(HoroscopeTimeframe.TODAY);
  const sign = ZODIAC_SIGNS.find(s => s.name === signName) || ZODIAC_SIGNS[0];

  useEffect(() => {
    const fetch = async () => {
        setLoading(true);
        const res = await Gemini.getDailyHoroscope(signName, language, timeframe);
        setData(res);
        setLoading(false);
    }
    fetch();
  }, [signName, language, timeframe]);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-24 h-screen overflow-y-auto">
        <header className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-serif font-bold">{t.zodiac[signName.toLowerCase() as keyof typeof t.zodiac]}</h2>
        </header>

        <div className="flex justify-center mb-8">
             <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-orange-500 flex items-center justify-center text-black text-5xl font-bold shadow-[0_0_30px_rgba(248,212,71,0.4)]"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
             >
                 {sign.symbol}
             </motion.div>
        </div>

         <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-6">
            {Object.values(HoroscopeTimeframe).map((tf) => (
              <button 
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${timeframe === tf ? 'text-black' : 'text-gray-400 hover:text-white'}`}
              >
                {timeframe === tf && (
                  <motion.div 
                    layoutId="detailTab" 
                    className="absolute inset-0 bg-gold-500 rounded-xl shadow-lg"
                  />
                )}
                <span className="relative z-10">{t.timeframes[tf.toLowerCase() as keyof typeof t.timeframes]}</span>
              </button>
            ))}
         </div>

        {loading ? <CosmicLoader text={t.loading} /> : data && (
            <>
              <GlassCard className="space-y-4">
                  <p className="text-gray-200 leading-relaxed text-center font-medium">"{data.prediction}"</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="text-center flex flex-col items-center">
                          <span className="text-xs text-gray-500 uppercase mb-1">{t.luckyColor}</span>
                          <div 
                              className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg mb-1" 
                              style={{ 
                                  backgroundColor: getColorHex(data.luckyColor),
                                  boxShadow: `0 0 15px ${getColorHex(data.luckyColor)}60`
                              }} 
                           />
                          <p className="text-gold-400 font-bold">{data.luckyColor}</p>
                      </div>
                      <div className="text-center flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-500 uppercase mb-1">{t.luckyNumber}</span>
                          <p className="text-gold-400 font-bold text-2xl">{data.luckyNumber}</p>
                      </div>
                  </div>
              </GlassCard>
              
              <AdBanner />
            </>
        )}
    </motion.div>
  );
}

// ... Compatibility ... 
interface InputCardProps {
  title: string;
  data: any;
  onChange: (field: string, value: any) => void;
  language: Language;
}

const CompatibilityInputCard: React.FC<InputCardProps> = ({ title, data, onChange, language }) => {
  const t = TRANSLATIONS[language];
  const genderOptions = [
    { value: 'Male', label: t.male },
    { value: 'Female', label: t.female },
    { value: 'Other', label: t.other }
  ];

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-gold-400 font-serif font-bold text-lg border-b border-white/10 pb-2 mb-2">{title}</h3>
      <div className="space-y-3">
         <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold">{t.name}</label>
            <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
               <User size={16} className="text-gold-400" />
               <input type="text" placeholder={t.name} value={data.name || ''} onChange={e => onChange('name', e.target.value)} className="bg-transparent w-full outline-none text-white text-sm" />
            </div>
         </div>
         <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold">{t.dob}</label>
            <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
               <Calendar size={16} className="text-gold-400" />
               <input type="date" value={data.dob || ''} onChange={e => onChange('dob', e.target.value)} className="bg-transparent w-full outline-none text-white text-sm" />
            </div>
         </div>
         <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold">{t.selectSign}</label>
            <div className="relative">
               <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-white/10 focus-within:border-gold-400/50 transition-colors">
                  <Star size={16} className="text-gold-400" />
                  <select value={data.rashi || ''} onChange={e => onChange('rashi', e.target.value)} className="bg-transparent w-full outline-none text-white text-sm appearance-none">
                    <option value="" className="bg-cosmic-900 text-gray-400">{t.selectSign}</option>
                    {ZODIAC_SIGNS.map(z => (
                        <option key={z.name} value={z.name} className="bg-cosmic-900 text-white">{t.zodiac[z.name.toLowerCase() as keyof typeof t.zodiac]}</option>
                    ))}
                  </select>
               </div>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown size={14} className="text-gray-500" /></div>
            </div>
         </div>
         <div className="space-y-1">
             <label className="text-[10px] text-gray-500 uppercase ml-1 font-bold">{t.gender}</label>
             <div className="flex space-x-2">
                 {genderOptions.map((opt) => (
                     <button key={opt.value} onClick={() => onChange('gender', opt.value)} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${data.gender === opt.value ? 'bg-gold-400 text-black border-gold-400 font-bold' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                        {opt.label}
                     </button>
                 ))}
             </div>
         </div>
      </div>
    </GlassCard>
  );
};

const CompatibilityView: React.FC<{ language: Language, setView: (v: AppView) => void }> = ({ language, setView }) => {
    const t = TRANSLATIONS[language];
    const [p1, setP1] = useState<any>({});
    const [p2, setP2] = useState<any>({});
    const [relType, setRelType] = useState('Love');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (setter: any, prev: any, val: string) => {
        const rashi = detectRashiFromDate(val);
        setter({ ...prev, dob: val, rashi: rashi || prev.rashi });
    }

    const checkMatch = async () => {
        if (!p1.rashi || !p2.rashi) return;
        setLoading(true);
        const res = await Gemini.getCompatibility(p1, p2, relType, language);
        setResult(res);
        setLoading(false);
    };

    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-28 space-y-6 h-screen overflow-y-auto">
            <header className="flex items-center">
                <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <div><h2 className="text-xl font-serif font-bold text-gold-gradient">{t.matchTitle}</h2><p className="text-xs text-gray-400">{t.matchSubtitle}</p></div>
            </header>
            {!result ? (
                <div className="space-y-6">
                    <CompatibilityInputCard title={t.yourDetails} data={p1} language={language} onChange={(f, v) => f === 'dob' ? handleDateChange(setP1, p1, v) : setP1({...p1, [f]: v})} />
                    <div className="flex justify-center -my-3 relative z-10"><div className="bg-gold-500 text-black p-2 rounded-full border-4 border-[#050110] shadow-lg"><HeartHandshake size={24} /></div></div>
                    <CompatibilityInputCard title={t.partnerDetails} data={p2} language={language} onChange={(f, v) => f === 'dob' ? handleDateChange(setP2, p2, v) : setP2({...p2, [f]: v})} />
                    <GlassCard>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">{t.relType}</label>
                       <div className="flex flex-wrap gap-2">
                          {['Love', 'Marriage', 'Friendship'].map(type => (
                              <button key={type} onClick={() => setRelType(type)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${relType === type ? 'bg-gold-400 text-black border-gold-400' : 'border-white/20 text-gray-400'}`}>{t.relTypes[type.toLowerCase() as keyof typeof t.relTypes]}</button>
                          ))}
                       </div>
                    </GlassCard>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={checkMatch} disabled={loading || !p1.rashi || !p2.rashi} className="w-full py-4 bg-gradient-to-r from-gold-500 to-orange-500 rounded-xl font-bold text-black shadow-[0_0_20px_rgba(248,212,71,0.3)] disabled:opacity-50">{loading ? <Loader2 className="animate-spin mx-auto" /> : t.checkMatch}</motion.button>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex justify-center py-6">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                               <circle cx="80" cy="80" r="70" className="stroke-white/10" strokeWidth="10" fill="none" />
                               <motion.circle cx="80" cy="80" r="70" className="stroke-gold-400" strokeWidth="10" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * result.score) / 100} initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (440 * result.score) / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round"/>
                            </svg>
                            <div className="flex flex-col items-center"><span className="text-4xl font-bold text-white">{result.score}%</span><span className="text--[10px] uppercase text-gray-400">{t.matchScore}</span></div>
                        </div>
                    </div>
                    <AdBanner />
                    <GlassCard><h3 className="text-gold-400 font-bold mb-3 flex items-center"><Sparkles size={16} className="mr-2"/> {t.advice}</h3><p className="text-sm text-gray-200 leading-relaxed">{result.advice}</p></GlassCard>
                    <div className="grid grid-cols-1 gap-4">
                        <GlassCard className="border-l-4 border-green-500"><h4 className="text-green-400 font-bold text-sm mb-2">{t.strengths}</h4><ul className="list-disc list-inside text-xs text-gray-300 space-y-1">{result.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></GlassCard>
                        <GlassCard className="border-l-4 border-red-500"><h4 className="text-red-400 font-bold text-sm mb-2">{t.challenges}</h4><ul className="list-disc list-inside text-xs text-gray-300 space-y-1">{result.challenges?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></GlassCard>
                    </div>
                    <button onClick={() => setResult(null)} className="w-full py-3 bg-white/10 rounded-xl text-white font-bold">{t.continue}</button>
                </motion.div>
            )}
        </motion.div>
    );
};

// ... FindRashi ...
const FindRashiView: React.FC<{ language: Language, setView: (v: AppView) => void, onSignSelect: (sign: string) => void }> = ({ language, setView, onSignSelect }) => {
    const t = TRANSLATIONS[language];
    const [dob, setDob] = useState('');
    const [name, setName] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const calculate = (e: React.FormEvent) => {
        e.preventDefault();
        if(!dob) return;
        const foundSign = detectRashiFromDate(dob);
        setResult(foundSign);
    };

    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-28 h-screen overflow-y-auto">
             <header className="flex items-center mb-6">
                <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-serif font-bold text-gold-gradient">{t.findRashi}</h2>
            </header>
            
            {!result ? (
                <form onSubmit={calculate} className="space-y-6">
                    <div className="flex justify-center mb-6">
                         <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-gold-400/30">
                            <Search size={40} className="text-gold-400" />
                         </div>
                    </div>
                    <GlassCard className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.name}</label>
                            <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-400/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.dob}</label>
                            <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-400/50" />
                        </div>
                    </GlassCard>
                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-4 bg-gradient-to-r from-gold-500 to-orange-500 rounded-xl font-bold text-black shadow-lg">Calculate My Sign</motion.button>
                </form>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-8 py-8">
                    <h3 className="text-lg text-gray-300">Hello {name || 'Seeker'}, your sign is:</h3>
                    
                    <div className="relative">
                         <div className="absolute inset-0 bg-gold-400/20 blur-2xl rounded-full"></div>
                         <div className="relative w-40 h-40 rounded-full border-4 border-gold-400/50 bg-black/40 flex flex-col items-center justify-center backdrop-blur-md">
                            <span className="text-6xl mb-2">{ZODIAC_SIGNS.find(z => z.name === result)?.symbol}</span>
                         </div>
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-gold-400">{t.zodiac[result.toLowerCase() as keyof typeof t.zodiac]}</h2>
                        <p className="text-sm text-gray-400 mt-2">{ZODIAC_SIGNS.find(z => z.name === result)?.dates}</p>
                    </div>

                    <div className="w-full space-y-3">
                        <button onClick={() => onSignSelect(result)} className="w-full py-4 bg-gold-400 rounded-xl text-black font-bold shadow-lg shadow-gold-400/20">View Horoscope</button>
                        <button onClick={() => setResult(null)} className="w-full py-3 bg-white/5 rounded-xl text-white font-bold">Check Another Date</button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

// ... Kundli ...
const KundliView: React.FC<{ language: Language, setView: (v: AppView) => void }> = ({ language, setView }) => {
  const t = TRANSLATIONS[language];
  const [details, setDetails] = useState({ name: '', dob: '', tob: '', pob: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await Gemini.getKundliInsight(details, language);
    setResult(res);
    setLoading(false);
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-28 h-screen overflow-y-auto">
      <header className="flex items-center mb-6">
        <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-serif font-bold text-gold-gradient">{t.kundli}</h2>
      </header>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-5">
           <GlassCard className="space-y-4">
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.name}</label><input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-400/50 outline-none" value={details.name} onChange={e=>setDetails({...details, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.dob}</label><input type="date" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none" value={details.dob} onChange={e=>setDetails({...details, dob: e.target.value})} /></div>
                 <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.tob}</label><input type="time" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none" value={details.tob} onChange={e=>setDetails({...details, tob: e.target.value})} /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.pob}</label><input type="text" required placeholder="City, Country" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-400/50 outline-none" value={details.pob} onChange={e=>setDetails({...details, pob: e.target.value})} /></div>
           </GlassCard>
           <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-orange-500 rounded-xl font-bold text-black shadow-lg">{loading ? <Loader2 className="animate-spin mx-auto" /> : t.generate}</motion.button>
        </form>
      ) : (
        <div className="space-y-6">
           <CosmicLoader text={t.loadingSubtitle} /> 
           <GlassCard className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-xl font-serif font-bold text-gold-400 mb-4">{t.features.kundliDesc} for {details.name}</h3>
              <div className="space-y-3">
                 <div className="p-3 bg-white/5 rounded-xl border border-white/5"><h4 className="text-xs text-gold-300 font-bold uppercase mb-1">{t.bio} / Personality</h4><p className="text-sm text-gray-200">{result.personality}</p></div>
                 <div className="p-3 bg-white/5 rounded-xl border border-white/5"><h4 className="text-xs text-gold-300 font-bold uppercase mb-1">Career</h4><p className="text-sm text-gray-200">{result.career}</p></div>
                 <div className="p-3 bg-white/5 rounded-xl border border-white/5"><h4 className="text-xs text-gold-300 font-bold uppercase mb-1">Relationships</h4><p className="text-sm text-gray-200">{result.relationships}</p></div>
              </div>
              <AdBanner />
              <button onClick={() => setResult(null)} className="w-full mt-4 py-3 border border-white/20 rounded-xl text-white font-bold hover:bg-white/5">{t.continue}</button>
           </GlassCard>
        </div>
      )}
    </motion.div>
  );
};

// ... Chat ...
const ChatView: React.FC<{ language: Language, setView: (v: AppView) => void }> = ({ language, setView }) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await Gemini.getAstroChatResponse(
       messages.map(m => ({ role: m.role, text: m.text })), 
       userMsg.text, 
       language
    );

    const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-cosmic-black">
      <CosmicBackground />
      <header className="flex items-center p-4 bg-black/20 backdrop-blur-md border-b border-white/10 shrink-0">
        <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full mr-4"><ArrowLeft size={20} /></button>
        <h2 className="font-bold text-white flex items-center"><Bot className="mr-2 text-gold-400" /> {t.askAstro}</h2>
      </header>
      <AdBanner className="mx-4 my-2 h-[50px]" />
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
         {messages.length === 0 && (<div className="flex flex-col items-center justify-center h-full opacity-50"><Sparkles size={48} className="text-gold-400 mb-4" /><p className="text-sm">{t.chatPlaceholder}</p></div>)}
         {messages.map(msg => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               {msg.role === 'model' && (<span className="text-[10px] text-gold-400 font-bold mb-1 ml-2 tracking-wide uppercase">Astro Ved AI</span>)}
               <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gold-500 text-black rounded-tr-none' : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'}`}>{msg.text}</div>
            </motion.div>
         ))}
         {loading && <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-2xl rounded-tl-none"><Loader2 className="animate-spin w-5 h-5 text-gold-400"/></div></div>}
      </div>
      <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 shrink-0 mb-20">
         <div className="flex items-center bg-white/5 rounded-xl border border-white/10 px-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.chatPlaceholder} className="flex-1 bg-transparent p-3 text-sm text-white outline-none" onKeyPress={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} disabled={loading} className="p-2 bg-gold-400 rounded-lg text-black hover:bg-gold-300 transition-colors"><Send size={18} /></button>
         </div>
      </div>
    </div>
  );
};

const ProfileView: React.FC<{ 
    prefs: any, 
    setPrefs: (p: any) => void, 
    language: Language, 
    setView: (v: AppView) => void 
}> = ({ prefs, setPrefs, language, setView }) => {
    const t = TRANSLATIONS[language];
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(prefs.userProfile || { name: '', bio: '', dob: '', avatar: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
       const user = (await supabase.auth.getUser()).data.user;
       if (!user) return;

       // Optimistic update
       setPrefs({ ...prefs, userProfile: formData });
       setIsEditing(false);

       const { error } = await supabase.from('profiles').upsert({
         id: user.id,
         name: formData.name,
         bio: formData.bio,
         dob: formData.dob,
         avatar_url: formData.avatar,
         updated_at: new Date()
       });

       if (error) console.error('Error updating profile:', error);
       
       // Sync Zodiac Sign logic
       if (formData.dob) {
           const sign = detectRashiFromDate(formData.dob);
           if (sign && sign !== prefs.sign) {
                setPrefs((prev: any) => ({ ...prev, sign, userProfile: formData }));
                await supabase.from('profiles').upsert({ id: user.id, rashi: sign });
           }
       }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" className="pt-4 px-4 pb-28 space-y-6">
            <header className="flex items-center">
                <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-serif font-bold">{t.profile}</h2>
            </header>

            <div className="flex flex-col items-center">
                <div className="relative mb-4 group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-orange-500 p-1">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                           {formData.avatar ? (
                               <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                               <User size={40} className="text-gold-400" />
                           )}
                        </div>
                    </div>
                    {isEditing && (
                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg hover:bg-gray-200">
                            <Camera size={16} />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                {!isEditing && <h3 className="text-xl font-bold text-white">{formData.name || 'User'}</h3>}
            </div>

            <GlassCard className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-gold-400 font-bold">{t.birthDetails}</h3>
                    {!isEditing && <button onClick={() => setIsEditing(true)}><Edit2 size={16} className="text-gray-400" /></button>}
                </div>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase">{t.name}</label>{isEditing ? (<input className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />) : (<p className="text-white text-sm">{formData.name || '-'}</p>)}</div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase">{t.dob}</label>{isEditing ? (<input type="date" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />) : (<p className="text-white text-sm">{formData.dob || '-'}</p>)}</div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase">{t.bio}</label>{isEditing ? (<textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />) : (<p className="text-gray-300 text-sm italic">"{formData.bio || 'No bio yet.'}"</p>)}</div>
                </div>
                {isEditing && (<div className="flex space-x-3 pt-2"><button onClick={() => { setIsEditing(false); setFormData(prefs.userProfile); }} className="flex-1 py-2 rounded-lg border border-white/20 text-sm">{t.cancel}</button><button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-gold-400 text-black font-bold text-sm">{t.saveChanges}</button></div>)}
            </GlassCard>
        </motion.div>
    );
};

const SettingsView: React.FC<{ 
    prefs: any, 
    setPrefs: (p: any) => void, 
    language: Language, 
    setView: (v: AppView) => void 
}> = ({ prefs, setPrefs, language, setView }) => {
    const t = TRANSLATIONS[language];

    const updatePref = async (key: string, value: any) => {
        setPrefs({ ...prefs, [key]: value });
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, [key]: value });
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView(AppView.LOGIN);
    };

    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" className="pt-4 px-4 pb-28 space-y-6">
             <header className="flex items-center">
                <button onClick={() => setView(AppView.HOME)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-serif font-bold">{t.settings}</h2>
            </header>
            <GlassCard className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.enableAlerts}</span>
                    <button onClick={() => updatePref('notifications', !prefs.notifications)} className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.notifications ? 'bg-gold-400' : 'bg-white/10'}`}>
                        <motion.div layout className={`w-4 h-4 bg-white rounded-full ${prefs.notifications ? 'ml-auto' : ''}`} />
                    </button>
                </div>
                <div className="space-y-2">
                    <span className="text-sm font-medium block">{t.selectLanguage}</span>
                    <select value={language} onChange={(e) => updatePref('language', e.target.value as Language)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none">
                        {Object.values(Language).map(l => (
                            <option key={l} value={l} className="bg-cosmic-900">{l}</option>
                        ))}
                    </select>
                </div>
            </GlassCard>
             <GlassCard onClick={() => setView(AppView.PRIVACY)} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center"><Shield size={18} className="text-gold-400 mr-3" /><span className="text-sm">{t.privacyPolicy}</span></div><ChevronRight size={16} className="text-gray-500" />
            </GlassCard>
            <button onClick={handleLogout} className="w-full py-3 text-red-400 text-sm font-bold bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 flex items-center justify-center">
                <LogOut size={16} className="mr-2" /> {t.logout}
            </button>
        </motion.div>
    );
};

const PrivacyView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" className="pt-4 px-4 pb-28 space-y-6 h-screen overflow-y-auto">
             <header className="flex items-center">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-serif font-bold">Privacy Policy</h2>
            </header>
            <div className="prose prose-invert prose-sm max-w-none space-y-4 text-gray-300">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>Astro Ved AI operates a digital astrology and AI-based service...</p>
                <h3>1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1"><li>Personal Information</li><li>Device Information</li><li>AI Inputs</li></ul>
                <h3>2. How We Use Your Information</h3><p>To generate accurate reports, improve AI, and customize your experience.</p>
                <h3>3. Data Storage</h3><p>Stored securely on Firebase/Supabase with encryption.</p>
                <p className="italic text-xs mt-8">For full details, contact support@astrovedaai.com</p>
            </div>
        </motion.div>
    );
};

const NumerologyView: React.FC<{ onBack: () => void, language: Language }> = ({ onBack, language }) => {
    const t = TRANSLATIONS[language];
    return (
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="pt-4 px-4 pb-28 h-screen flex flex-col">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 mr-4"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-serif font-bold text-gold-gradient">{t.numerology}</h2>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative"><div className="absolute inset-0 bg-gold-400/20 blur-xl rounded-full animate-pulse-slow"></div><Hash size={80} className="text-gold-400 relative z-10" strokeWidth={1} /></div>
                <h3 className="text-2xl font-serif font-bold text-white">{t.comingSoon}</h3>
                <p className="text-gray-400 max-w-xs leading-relaxed">The universe is calculating the numbers. This feature will be available in the next cosmic update.</p>
            </div>
        </motion.div>
    );
}

// --- Main App ---

const App = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [prefs, setPrefs] = useState({ 
      language: Language.ENGLISH, 
      notifications: true, 
      sign: 'Aries', 
      userProfile: { name: '', bio: '', dob: '', avatar: '' }
  });
  const [selectedSign, setSelectedSign] = useState<string>('');
  const t = TRANSLATIONS[prefs.language];

  // Dynamic SEO Update based on view and data
  useEffect(() => {
    let dynamicData = undefined;
    if (view === AppView.HOROSCOPE) dynamicData = selectedSign || prefs.sign;
    updateSeo(view, prefs.language, dynamicData);
  }, [view, prefs.language, selectedSign, prefs.sign]);

  const fetchProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) {
            setPrefs({
                language: (data.language as Language) || Language.ENGLISH,
                notifications: data.notifications ?? true,
                sign: data.rashi || 'Aries',
                userProfile: {
                    name: data.name || '',
                    bio: data.bio || '',
                    dob: data.dob || '',
                    avatar: data.avatar_url || ''
                }
            });
        }
    } catch (e) {
        console.error("Profile fetch error", e);
    } finally {
        setIsInitializing(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
         setView(AppView.HOME);
         fetchProfile(session.user.id);
      } else {
         setIsInitializing(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          setView(AppView.HOME);
          setIsInitializing(true); // Re-fetch on login
          fetchProfile(session.user.id);
      } else {
          setView(AppView.LOGIN);
          setIsInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setPrefs(prev => ({ ...prev, language: lang }));
    setView(AppView.LOGIN);
  };

  const renderView = () => {
      if (isInitializing && session) {
          return (
             <div className="h-screen flex items-center justify-center">
                 <CosmicLoader text="Synchronizing Cosmic Profile..." />
             </div>
          );
      }

      switch(view) {
          case AppView.WELCOME: return <WelcomeView onComplete={handleLanguageSelect} />;
          case AppView.LOGIN: return <AuthView language={prefs.language} onLogin={() => {}} />;
          case AppView.HOME: return <HomeView language={prefs.language} setView={setView} prefs={prefs} setSelectedSign={(s) => { setSelectedSign(s); setView(AppView.HOROSCOPE); }} />;
          case AppView.HOROSCOPE: return <HoroscopeDetailView signName={selectedSign || prefs.sign} language={prefs.language} onBack={() => setView(AppView.HOME)} />;
          case AppView.KUNDLI: return <KundliView language={prefs.language} setView={setView} />;
          case AppView.COMPATIBILITY: return <CompatibilityView language={prefs.language} setView={setView} />;
          case AppView.CHAT: return <ChatView language={prefs.language} setView={setView} />;
          case AppView.PROFILE: return <ProfileView prefs={prefs} setPrefs={setPrefs} language={prefs.language} setView={setView} />;
          case AppView.SETTINGS: return <SettingsView prefs={prefs} setPrefs={setPrefs} language={prefs.language} setView={setView} />;
          case AppView.PRIVACY: return <PrivacyView onBack={() => setView(AppView.SETTINGS)} />;
          case AppView.FIND_RASHI: return <FindRashiView language={prefs.language} setView={setView} onSignSelect={(s) => { setSelectedSign(s); setView(AppView.HOROSCOPE); }} />;
          case AppView.NUMEROLOGY: return <NumerologyView language={prefs.language} onBack={() => setView(AppView.HOME)} />;
          default: return <WelcomeView onComplete={handleLanguageSelect} />;
      }
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden bg-[#050110]">
       <CosmicBackground />
       <AnimatePresence mode="wait">
          {renderView()}
       </AnimatePresence>

       {session && !isInitializing && [AppView.HOME, AppView.KUNDLI, AppView.COMPATIBILITY, AppView.CHAT, AppView.PROFILE].includes(view) && (
         <motion.nav 
            initial={{ y: 100 }} animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 pb-8 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
         >
            <div className="flex justify-between items-center max-w-md mx-auto">
               <NavButton active={view === AppView.HOME} icon={Star} label={t.home} onClick={() => setView(AppView.HOME)} />
               <NavButton active={view === AppView.KUNDLI} icon={Scroll} label={t.kundli} onClick={() => setView(AppView.KUNDLI)} />
               <NavButton active={view === AppView.COMPATIBILITY} icon={Heart} label={t.compatibility} onClick={() => setView(AppView.COMPATIBILITY)} />
               <NavButton active={view === AppView.CHAT} icon={MessageCircle} label={t.chat} onClick={() => setView(AppView.CHAT)} />
               <NavButton active={view === AppView.PROFILE} icon={User} label={t.profile} onClick={() => setView(AppView.PROFILE)} />
            </div>
         </motion.nav>
       )}
    </div>
  );
};

export default App;