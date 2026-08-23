import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Save, Store, Palette, ShieldCheck, CheckCircle2, Percent } from "lucide-react";

export const SettingsManagement: React.FC = () => {
  const { activeShop, saveCoffeeShop } = useTenant();

  const [nameFa, setNameFa] = useState(activeShop.nameFa);
  const [nameEn, setNameEn] = useState(activeShop.name);
  const [currency, setCurrency] = useState(activeShop.settings.currency || "IRT");
  const [taxRate, setTaxRate] = useState(activeShop.settings.taxRate || 0.1);
  const [loyaltyRate, setLoyaltyRate] = useState(activeShop.settings.loyaltyRate || 0.05);
  const [allowPickup, setAllowPickup] = useState(activeShop.settings.allowPickup ?? true);
  const [allowDelivery, setAllowDelivery] = useState(activeShop.settings.allowDelivery ?? true);
  const [primaryColor, setPrimaryColor] = useState(activeShop.branding.primaryColor || "#d97706");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCoffeeShop({
      ...activeShop,
      nameFa,
      name: nameEn,
      settings: {
        ...activeShop.settings,
        taxRate: Number(taxRate),
        loyaltyRate: Number(loyaltyRate),
        allowPickup,
        allowDelivery,
      },
      branding: {
        ...activeShop.branding,
        primaryColor,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-right max-w-3xl">
      
      {/* Header */}
      <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <h2 className="font-black text-stone-100 text-lg sm:text-xl">
          تنظیمات عمومی کافه و برندینگ
        </h2>
        <p className="text-xs text-stone-400">
          پیکربندی هویت بصری، نرخ مالیات ارزش افزوده، باشگاه مشتریان و روش‌های سفارش
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Basic Info */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>اطلاعات پایه کافه</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                نام فارسی کافه:
              </label>
              <input
                type="text"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                required
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                نام انگلیسی (English Name):
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                dir="ltr"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
              />
            </div>
          </div>
        </div>

        {/* Financial & Loyalty */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-500" />
            <span>مالیات و امتیاز باشگاه وفاداری</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                نرخ مالیات ارزش افزوده (VAT):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                  min={0}
                  max={25}
                  step={1}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">درصد (٪)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                درصد بازگشت امتیاز وفاداری (Cashback):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={loyaltyRate * 100}
                  onChange={(e) => setLoyaltyRate(Number(e.target.value) / 100)}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">درصد (٪)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-stone-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={allowPickup}
                onChange={(e) => setAllowPickup(e.target.checked)}
                className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
              />
              <span>پذیرش سفارش‌های تحویل حضوری در کافه (Pickup)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={allowDelivery}
                onChange={(e) => setAllowDelivery(e.target.checked)}
                className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
              />
              <span>پذیرش سفارش‌های ارسال با پیک (Delivery)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-amber-600/20"
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "تنظیمات با موفقیت ذخیره شد ✓" : "ذخیره تغییرات تنظیمات"}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
