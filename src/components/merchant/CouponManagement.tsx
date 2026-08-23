import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Coupon } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { Plus, Tag, Edit3, Trash2, X, Check, Percent, DollarSign } from "lucide-react";
import { motion } from "motion/react";

export const CouponManagement: React.FC = () => {
  const { coupons, saveCoupon, activeShop } = useTenant();
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderAmount, setMinOrderAmount] = useState(100000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(40000);
  const [active, setActive] = useState(true);

  const openCreate = () => {
    setEditingCoupon({
      id: `cpn-${Date.now()}`,
      coffeeShopId: activeShop.id,
      code: "",
      discountType: "percentage",
      discountValue: 15,
      minOrderAmount: 100000,
      active: true,
    });
    setCode("");
    setDiscountType("percentage");
    setDiscountValue(15);
    setMinOrderAmount(100000);
    setMaxDiscountAmount(35000);
    setActive(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount || 0);
    setMaxDiscountAmount(c.maxDiscountAmount || 0);
    setActive(c.active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    await saveCoupon({
      ...editingCoupon,
      code: (code || "").trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || undefined,
      maxDiscountAmount: discountType === "percentage" ? (Number(maxDiscountAmount) || undefined) : undefined,
      active,
    });
    setEditingCoupon(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">
            مدیریت کوپن‌ها و کدهای تخفیف
          </h2>
          <p className="text-xs text-stone-400">
            طراحی کمپین‌های تخفیفی درصدی و مبلغ ثابت با سقف فاکتور
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-stone-900 border border-stone-800 hover:border-stone-700 space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-100 text-base font-mono tracking-wider" dir="ltr">
                    {c.code}
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    {c.discountType === "percentage" ? `${c.discountValue}٪ تخفیف` : `${formatCurrency(c.discountValue)} تخفیف نقدی`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-stone-400 border-t border-stone-800/80 pt-3">
              {c.minOrderAmount && (
                <div className="flex justify-between">
                  <span>حداقل سفارش:</span>
                  <span className="text-stone-200 font-medium">{formatCurrency(c.minOrderAmount)}</span>
                </div>
              )}
              {c.maxDiscountAmount && (
                <div className="flex justify-between">
                  <span>سقف تخفیف:</span>
                  <span className="text-stone-200 font-medium">{formatCurrency(c.maxDiscountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span>وضعیت:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.active ? "bg-emerald-950 text-emerald-400" : "bg-stone-800 text-stone-500"}`}>
                  {c.active ? "فعال و قابل استفاده" : "غیرفعال"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-base">
                {code ? `ویرایش کد «${code}»` : "کد تخفیف جدید"}
              </h3>
              <button
                onClick={() => setEditingCoupon(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  کد تخفیف (Coupon Code):
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="مثال: WELCOME20"
                  dir="ltr"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    نوع تخفیف:
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  >
                    <option value="percentage">درصدی (٪)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    مقدار تخفیف:
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    حداقل خرید (تومان):
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    min={0}
                    step={10000}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      سقف تخفیف (تومان):
                    </label>
                    <input
                      type="number"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                      min={0}
                      step={5000}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
                  />
                  <span>کد تخفیف هم‌اکنون فعال باشد</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
                >
                  ذخیره کوپن
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
