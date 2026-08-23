import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { getMerchantInsights } from "../../features/ai/aiService";
import { 
  Sparkles, 
  TrendingUp, 
  Coffee, 
  Send, 
  Loader2, 
  Lightbulb, 
  Target, 
  CheckCircle2, 
  DollarSign,
  BarChart2
} from "lucide-react";
import { motion } from "motion/react";

export const MerchantAiAdvisor: React.FC = () => {
  const { activeShop, activeBranch, orders, products } = useTenant();
  const [selectedFocus, setSelectedFocus] = useState<"sales" | "menu" | "marketing" | "general">("sales");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const focusOptions = [
    {
      id: "sales" as const,
      title: "تحلیل روند فروش و افزایش سودآوری",
      desc: "تحلیل فاکتورهای صادره، ساعات شلوغی و پتانسیل افزایش میانگین سبد خرید (AOV)",
      icon: TrendingUp,
    },
    {
      id: "menu" as const,
      title: "مهندسی منو و پیشنهاد آیتم‌های جدید",
      desc: "بهینه‌سازی حاشیه سود نوشیدنی‌ها و پیشنهاد محصولات ترند کافه‌های نسل سوم",
      icon: Coffee,
    },
    {
      id: "marketing" as const,
      title: "طراحی کمپین تخفیفی و وفاداری هوشمند",
      desc: "استراتژی جذب مجدد مشتریان کم‌تکرار و افزایش امتیازات باشگاه وفاداری",
      icon: Target,
    },
  ];

  const handleGenerateAdvice = async (focusType: typeof selectedFocus, promptText?: string) => {
    setIsLoading(true);
    setAiReport(null);

    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const contextData = {
      shopName: activeShop.nameFa,
      branchName: activeBranch?.nameFa || "مرکزی",
      orderCount: orders.length,
      totalSalesToman: totalSales,
      productCount: products.length,
      sampleTopProducts: products.slice(0, 5).map((p) => ({ name: p.nameFa, price: p.basePrice })),
      userCustomQuestion: promptText || customPrompt || "لطفاً استراتژی‌های اجرایی برای رشد ارائه بده.",
    };

    try {
      const res = await getMerchantInsights(focusType, contextData);
      setAiReport(res.insights);
    } catch (err: any) {
      setAiReport(`⚠️ متأسفانه در ارتباط با موتور تحلیل هوش مصنوعی خطایی رخ داد: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="bg-gradient-to-l from-stone-900 via-stone-900 to-amber-950/40 p-6 rounded-3xl border border-stone-800 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-stone-100 text-lg sm:text-xl">
              مشاور استراتژیک مدیریت با هوش مصنوعی (Gemini 3.7 Flash)
            </h2>
            <p className="text-xs text-stone-400">
              تحلیل عمیق داده‌های زنده کافه، مهندسی منو و راهکارهای افزایش نرخ بازگشت مشتری
            </p>
          </div>
        </div>
      </div>

      {/* Focus Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {focusOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedFocus === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => {
                setSelectedFocus(opt.id);
                handleGenerateAdvice(opt.id);
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30"
                  : "bg-stone-900 border-stone-800 hover:border-stone-700"
              }`}
            >
              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSelected ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-amber-400"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-100 text-sm">{opt.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{opt.desc}</p>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected ? "bg-amber-600 text-stone-950" : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                تولید گزارش تحلیلی ➔
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Prompt Box */}
      <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-3xl space-y-3">
        <label className="block text-xs font-bold text-stone-200">
          یا سؤال و چالش مدیریتی خاص خود را بپرسید:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerateAdvice("general", customPrompt);
            }}
            placeholder="مثال: برای افزایش فروش در ساعات بعدازظهر (۱۶ الی ۱۹) چه باندل‌های ترکیبی پیشنهاد می‌دهی؟"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleGenerateAdvice("general", customPrompt)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>تحلیل</span>
          </button>
        </div>
      </div>

      {/* AI Advice Output Display */}
      {isLoading && (
        <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <h4 className="font-bold text-stone-200 text-base">در حال پردازش داده‌های کافه و تدوین پیشنهادات...</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            مدل هوش مصنوعی Gemini 3.7 در حال مقایسه ساختار منو، قیمت‌ها و رفتار خرید مشتریان است.
          </p>
        </div>
      )}

      {aiReport && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 bg-stone-900 border border-amber-500/40 rounded-3xl space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-stone-100 text-lg">گزارش و استراتژی هوش مصنوعی کافه</h3>
                <p className="text-xs text-stone-400">تدوین شده اختصاصی برای {activeShop.nameFa}</p>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(aiReport);
                alert("گزارش کپی شد.");
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
            >
              کپی متن گزارش
            </button>
          </div>

          <div className="text-stone-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {aiReport}
          </div>
        </motion.div>
      )}

    </div>
  );
};
