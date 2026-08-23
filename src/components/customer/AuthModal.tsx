import React, { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    try {
      if (isRegister) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto text-right p-6 sm:p-7 space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-300 border border-white/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">
              {isRegister ? "ثبت‌نام در کافه پلاس" : "ورود به حساب کاربری"}
            </h3>
            <p className="text-xs text-white/50">
              {isRegister
                ? "برای ذخیره سفارش‌ها، کش‌بک وفاداری و آدرس‌های تحویل"
                : "خوش آمدید! لطفاً اطلاعات ورود خود را وارد نمایید."}
            </p>
          </div>

          {/* Google One-Click Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>ورود سریع با حساب کاربری Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-black/60 backdrop-blur-md px-3 text-[11px] text-white/40 absolute">
              یا با ایمیل و گذرواژه
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  نام و نام‌خانوادگی:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="مثال: سارا محمدی"
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 backdrop-blur-md"
                  />
                  <User className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                آدرس ایمیل:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 text-left backdrop-blur-md"
                />
                <Mail className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                گذرواژه:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 text-left backdrop-blur-md"
                />
                <Lock className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-white text-black hover:bg-white/90 font-black text-xs sm:text-sm shadow-lg shadow-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "در حال پردازش..." : isRegister ? "ایجاد حساب کاربری" : "ورود به حساب"}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-white/50">
            {isRegister ? (
              <span>
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-amber-300 hover:underline font-bold"
                >
                  ورود به حساب
                </button>
              </span>
            ) : (
              <span>
                حساب کاربری ندارید؟{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-amber-300 hover:underline font-bold"
                >
                  ثبت‌نام رایگان
                </button>
              </span>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
