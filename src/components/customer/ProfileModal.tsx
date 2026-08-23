import React, { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useTenant } from "../../features/tenant/TenantContext";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  Award, 
  Shield 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const { activeShop } = useTenant();

  const [name, setName] = useState(profile?.displayName || "مبینا سلیمانی");
  const [phone, setPhone] = useState(profile?.phoneNumber || "۰۹۱۲۳۴۵۶۷۸۹");
  const [address, setAddress] = useState("تهران، زعفرانیه، خیابان مقدس اردبیلی، پلاک ۲۴");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: name,
      phoneNumber: phone,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto text-right p-6 space-y-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {profile?.displayName?.charAt(0) || "ک"}
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">پروفایل کاربری</h3>
              <p className="text-xs text-white/50">{profile?.email || "کاربر گرامی"}</p>
            </div>
          </div>

          {/* User Tier and Role */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-[10px] text-white/40">امتیازات وفاداری</div>
                <div className="font-bold text-white">{profile?.loyaltyPoints || 340} امتیاز</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-md">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-white/40">نقش سیستم</div>
                <div className="font-bold text-white">{profile?.role}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                نام و نام‌خانوادگی:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 backdrop-blur-md"
                  required
                />
                <User className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                شماره موبایل جهت تماس:
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 text-left backdrop-blur-md"
                  dir="ltr"
                  required
                />
                <Phone className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                آدرس پیش‌فرض جهت ارسال سفارش:
              </label>
              <div className="relative">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 text-xs text-white focus:outline-none focus:border-white/30 resize-none backdrop-blur-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
                isSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-black hover:bg-white/90 shadow-white/10"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? "اطلاعات با موفقیت ذخیره شد ✓" : "ذخیره تغییرات"}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
