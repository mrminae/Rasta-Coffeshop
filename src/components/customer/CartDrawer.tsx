import React, { useState } from "react";
import { useCart } from "../../features/cart/CartContext";
import { useTenant } from "../../features/tenant/TenantContext";
import { formatCurrency } from "../../lib/utils";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingBag, 
  MapPin, 
  Store, 
  ArrowLeft, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onOpenBranchModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onOpenBranchModal,
}) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    fulfillmentType,
    setFulfillmentType,
    appliedCoupon,
    couponError,
    updateQuantity,
    removeItem,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { activeBranch } = useTenant();
  const [couponInput, setCouponInput] = useState("");

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (couponInput || "").trim();
    if (!input) return;
    const ok = applyCouponCode(input);
    if (ok) setCouponInput("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 left-0 max-w-full flex">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-black/60 backdrop-blur-3xl border-r border-white/15 shadow-2xl flex flex-col h-full text-right"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-white/10 text-indigo-300 border border-white/10">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">سبد خرید شما</h2>
                  <p className="text-xs text-white/40 font-light">{itemCount} آیتم انتخاب‌شده</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-2 rounded-xl text-white/50 hover:text-rose-400 hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
                    title="خالی کردن سبد"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">حذف همه</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branch & Fulfillment Toggle */}
            <div className="p-4 bg-white/5 border-b border-white/10 space-y-3 shrink-0">
              {/* Pickup vs Delivery Toggle */}
              <div className="grid grid-cols-2 p-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("pickup")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-all ${
                    fulfillmentType === "pickup"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>تحویل حضوری در کافه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType("delivery")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-all ${
                    fulfillmentType === "delivery"
                      ? "bg-white text-black font-bold shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>ارسال با پیک</span>
                </button>
              </div>

              {/* Selected Branch Notice */}
              <div className="flex items-center justify-between text-xs text-white/80 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{activeBranch?.nameFa || "انتخاب شعبه"}</span>
                </div>
                <button
                  onClick={onOpenBranchModal}
                  className="text-amber-300 hover:underline text-[11px] font-medium shrink-0 mr-2"
                >
                  تغییر شعبه
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-white/50">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-2">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-white text-base">سبد خرید شما خالی است</h3>
                  <p className="text-xs text-white/50 max-w-xs">
                    نوشیدنی‌ها، کیک‌ها و دسرهای لذیذ منو را مرور کرده و به سبد خرید اضافه کنید.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/15 text-xs font-bold transition-all"
                  >
                    مشاهده منوی کافه
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2.5 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.nameFa}
                        className="w-14 h-14 rounded-xl object-cover bg-black/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                            {item.nameFa}
                          </h4>
                          <span className="font-bold text-amber-300 text-xs whitespace-nowrap">
                            {formatCurrency(item.itemTotal)}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40 font-sans truncate">
                          {item.name}
                        </div>

                        {/* Modifiers Chips */}
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.selectedModifiers.map((mod, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] text-white/80"
                              >
                                {mod.optionNameFa}
                                {mod.priceDelta > 0 && ` (+${formatCurrency(mod.priceDelta, "", false)})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="mt-1 text-[10px] text-amber-300/80 italic">
                            یادداشت: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/40 hover:text-rose-400 transition-colors p-1"
                        title="حذف آیتم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-white text-xs px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer (Summary & Checkout CTA) */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 bg-black/40 backdrop-blur-2xl border-t border-white/10 space-y-4 shrink-0">
                
                {/* Coupon Code Box */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>کد تخفیف <strong>{appliedCoupon.code}</strong> اعمال شد</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] text-rose-400 hover:underline mr-2"
                      >
                        حذف
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="کد تخفیف (مثال: WELCOME20)"
                          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pr-8 pl-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 backdrop-blur-md"
                        />
                        <Tag className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors"
                      >
                        اعمال
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <div className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-white/60 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span>جمع اقلام:</span>
                    <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>تخفیف:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  {fulfillmentType === "delivery" && (
                    <div className="flex items-center justify-between">
                      <span>هزینه پیک کافه:</span>
                      <span className="font-medium text-white">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>مالیات و عوارض ارزش افزوده (۹٪):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm sm:text-base font-black text-white border-t border-white/10 pt-2">
                    <span>مبلغ قابل پرداخت:</span>
                    <span className="text-amber-300">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-white text-black hover:bg-white/90 font-black text-sm shadow-xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>تکمیل سفارش و پرداخت</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
