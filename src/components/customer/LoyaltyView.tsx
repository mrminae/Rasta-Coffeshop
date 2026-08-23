import React from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useTenant } from "../../features/tenant/TenantContext";
import { formatCurrency } from "../../lib/utils";
import { 
  X, 
  Award, 
  Gift, 
  Star, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  Coffee,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoyaltyViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReward?: (code: string) => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({
  isOpen,
  onClose,
  onSelectReward,
}) => {
  const { profile } = useAuth();
  const { activeShop, coupons } = useTenant();

  if (!isOpen) return null;

  const currentPoints = profile?.loyaltyPoints || 340;
  const currentTier = profile?.loyaltyTier || "gold";

  const tierDetails: Record<string, { label: string; minPoints: number; perk: string; color: string }> = {
    bronze: { label: "برنزی (Bronze)", minPoints: 0, perk: "۳٪ کش‌بک در هر سفارش", color: "from-amber-800 to-amber-950" },
    silver: { label: "نقره‌ای (Silver)", minPoints: 200, perk: "۵٪ کش‌بک + کوپن تولد", color: "from-slate-400 to-slate-700" },
    gold: { label: "طلایی (Gold)", minPoints: 500, perk: "۸٪ کش‌بک + ارسال رایگان", color: "from-amber-400 to-amber-600" },
    platinum: { label: "پلاتینیوم (Platinum)", minPoints: 1000, perk: "۱۲٪ کش‌بک + تست قهوه‌های ویژه رایگان", color: "from-indigo-400 to-purple-600" },
  };

  const rewards = [
    { id: "rw-1", pointsRequired: 150, title: "یک شات اسپرسو یا سیروپ رایگان", code: "FREESHOT", desc: "قابل اعمال روی سفارش بعدی شما" },
    { id: "rw-2", pointsRequired: 300, title: "کوپن تخفیف ۲۰ درصدی کل فاکتور", code: "LOYALTY20", desc: "حداکثر سقف تخفیف ۵۰,۰۰۰ تومان" },
    { id: "rw-3", pointsRequired: 600, title: "یک فنجان لاته یا کاپوچینو رایگان", code: "FREELATTE", desc: "به انتخاب شما در تمامی شعب" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-base sm:text-lg">باشگاه مشتریان و جوایز</h3>
                <p className="text-xs text-stone-400">{activeShop.nameFa}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Tier VIP Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 p-5 text-stone-950 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 opacity-90">
                    عضویت باشگاه وفاداری
                  </span>
                  <h4 className="text-2xl font-black text-white mt-1">
                    سطح {tierDetails[currentTier]?.label.split(" ")[0] || "طلایی"}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Award className="w-7 h-7" />
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-white/20 pt-4">
                <div>
                  <div className="text-[11px] text-amber-100">موجودی امتیازات فعال:</div>
                  <div className="text-2xl font-black text-white">{currentPoints} امتیاز</div>
                </div>
                <div className="text-left text-xs font-semibold text-amber-100">
                  {tierDetails[currentTier]?.perk}
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-stone-800/50 border border-stone-800 space-y-1">
                <Coffee className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-stone-200">۱. سفارش بده</div>
                <div className="text-[10px] text-stone-400">به ازای هر ۱۰ هزار تومان، ۱ امتیاز</div>
              </div>
              <div className="p-3 rounded-2xl bg-stone-800/50 border border-stone-800 space-y-1">
                <Star className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-stone-200">۲. امتیاز جمع کن</div>
                <div className="text-[10px] text-stone-400">ارتقای سطح به نقره‌ای و پلاتینیوم</div>
              </div>
              <div className="p-3 rounded-2xl bg-stone-800/50 border border-stone-800 space-y-1">
                <Gift className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-stone-200">۳. هدیه بگیر</div>
                <div className="text-[10px] text-stone-400">تبدیل به قهوه رایگان و تخفیف</div>
              </div>
            </div>

            {/* Available Rewards Conversion */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>جوایز قابل دریافت با امتیازات:</span>
              </h4>

              <div className="space-y-2.5">
                {rewards.map((rw) => {
                  const canRedeem = currentPoints >= rw.pointsRequired;
                  return (
                    <div
                      key={rw.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        canRedeem
                          ? "bg-stone-800/80 border-stone-700 text-stone-100"
                          : "bg-stone-900/40 border-stone-800/60 text-stone-500 opacity-70"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm">{rw.title}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{rw.desc}</div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                          {rw.pointsRequired} امتیاز لازم
                        </div>
                      </div>

                      <button
                        disabled={!canRedeem}
                        onClick={() => {
                          navigator.clipboard?.writeText(rw.code);
                          alert(`کد تخفیف ${rw.code} کپی شد! می‌توانید در سبد خرید اعمال نمایید.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          canRedeem
                            ? "bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md shadow-amber-600/20 cursor-pointer"
                            : "bg-stone-800 text-stone-600 cursor-not-allowed"
                        }`}
                      >
                        {canRedeem ? "دریافت کد" : "امتیاز ناکافی"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="p-4 bg-stone-950 border-t border-stone-800 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
            >
              بستن
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
