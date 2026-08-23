import React, { useState } from "react";
import { useCart } from "../../features/cart/CartContext";
import { useTenant } from "../../features/tenant/TenantContext";
import { useAuth } from "../../features/auth/AuthContext";
import { formatCurrency } from "../../lib/utils";
import { Order, PaymentMethod } from "../../types";
import { 
  X, 
  Store, 
  MapPin, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Phone,
  User,
  Clock
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    items,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    fulfillmentType,
    appliedCoupon,
    clearCart,
  } = useCart();

  const { activeShop, activeBranch, saveOrder } = useTenant();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState(profile?.displayName || "مبینا سلیمانی");
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || "۰۹۱۲۳۴۵۶۷۸۹");
  const [deliveryAddress, setDeliveryAddress] = useState("تهران، زعفرانیه، خیابان مقدس اردبیلی، برج پارس، واحد ۱۴");
  const [pickupTime, setPickupTime] = useState("۱۵ الی ۲۰ دقیقه دیگر");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Validate authoritative pricing with server
      const valRes = await fetch("/api/orders/validate-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          coupon: appliedCoupon,
          fulfillmentType,
          branchDeliveryFee: activeBranch?.deliveryFee || 25000,
        }),
      });

      let validatedTotal = total;
      if (valRes.ok) {
        const valData = await valRes.json();
        validatedTotal = valData.total;
      }

      // Generate order number
      const orderNumber = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();

      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderNumber,
        coffeeShopId: activeShop.id,
        branchId: activeBranch?.id || "default-branch",
        branchName: activeBranch?.name,
        branchNameFa: activeBranch?.nameFa,
        customerId: user?.uid || profile?.id || "guest-customer",
        customerName,
        customerPhone,
        items,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        deliveryFee,
        tax,
        total: validatedTotal,
        paymentStatus: paymentMethod === "online" ? "paid" : "pending",
        paymentMethod,
        orderStatus: "confirmed",
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? {
          title: "آدرس تحویل",
          fullAddress: deliveryAddress,
          phone: customerPhone,
        } : undefined,
        pickupTime: fulfillmentType === "pickup" ? pickupTime : undefined,
        customerNotes: notes || undefined,
        timestamps: {
          created: now,
          confirmed: now,
        },
      };

      await saveOrder(newOrder);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#d97706", "#f59e0b", "#10b981", "#ffffff"],
        });
      } catch (e) {
        // Safe confetti fallback
      }

      clearCart();
      setIsProcessing(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error("Order placement error:", err);
      setErrorMsg("متأسفانه در ثبت سفارش خطایی رخ داد. لطفاً مجدداً تلاش نمایید.");
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
            <div>
              <h3 className="font-bold text-white text-lg">تکمیل سفارش و پرداخت</h3>
              <p className="text-xs text-white/40">
                {activeShop.nameFa} • {activeBranch?.nameFa}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-white font-bold" : "text-white/40"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-white text-black font-black" : "bg-white/10"}`}>۱</span>
              <span>مشخصات و تحویل</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-white/10" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-white font-bold" : "text-white/40"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-white text-black font-black" : "bg-white/10"}`}>۲</span>
              <span>روش پرداخت</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2 backdrop-blur-md">
                  <Store className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    روش دریافت انتخابی شما: <strong>{fulfillmentType === "pickup" ? "تحویل حضوری در کافه" : "ارسال با پیک به آدرس"}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      نام و نام‌خانوادگی:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 backdrop-blur-md"
                        placeholder="نام شما"
                        required
                      />
                      <User className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      شماره تماس جهت پیگیری:
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 text-left backdrop-blur-md"
                        dir="ltr"
                        placeholder="0912..."
                        required
                      />
                      <Phone className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {fulfillmentType === "delivery" ? (
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      آدرس کامل پستی تحویل سفارش:
                    </label>
                    <div className="relative">
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-white/30 resize-none backdrop-blur-md"
                        placeholder="تهران، خیابان، پلاک، زنگ..."
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      زمان تخمینی مراجعه به شعبه جهت تحویل:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-white/30 backdrop-blur-md"
                        placeholder="مثال: ۱۵ الی ۲۰ دقیقه دیگر"
                      />
                      <Clock className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    یادداشت و هماهنگی خاص (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: تحویل به لابی، همراه با فاکتور رسمی..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 backdrop-blur-md"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-white/90">
                  انتخاب درگاه پرداخت امن:
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-right transition-all cursor-pointer backdrop-blur-md ${
                      paymentMethod === "online"
                        ? "bg-white/15 border-white/30 text-white shadow-md"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/10 text-indigo-300">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white">پرداخت آنلاین با کلیه کارت‌های شتاب</div>
                        <div className="text-[11px] text-white/40">درگاه شاپرک امن با رمز دوم و پیامک</div>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center p-0.5">
                      {paymentMethod === "online" && <div className="w-full h-full bg-white rounded-full" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_pickup")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-right transition-all cursor-pointer backdrop-blur-md ${
                      paymentMethod === "cash_on_pickup"
                        ? "bg-white/15 border-white/30 text-white shadow-md"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white">
                          {fulfillmentType === "pickup" ? "پرداخت حضوری با کارتخوان در کافه" : "پرداخت در محل هنگام تحویل"}
                        </div>
                        <div className="text-[11px] text-white/40">تسویه در هنگام تحویل سفارش</div>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center p-0.5">
                      {paymentMethod === "cash_on_pickup" && <div className="w-full h-full bg-white rounded-full" />}
                    </div>
                  </button>
                </div>

                {/* Security Badge */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-[11px] text-white/60 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تراکنش‌های کافه پلاس بر بستر امن SSL و زیرساخت شاپرک انجام می‌پذیرد.</span>
                </div>

                {/* Final Order Summary Box */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs backdrop-blur-md">
                  <div className="flex justify-between text-white/50">
                    <span>تعداد اقلام:</span>
                    <span>{items.length} نوع محصول</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>تخفیف کوپن:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-white pt-1.5 border-t border-white/10">
                    <span>مبلغ نهایی قابل پرداخت:</span>
                    <span className="text-amber-300">{formatCurrency(total)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
                    {errorMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-5 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customerName || !customerPhone) {
                      alert("لطفاً نام و شماره تماس خود را وارد نمایید.");
                      return;
                    }
                    setStep(2);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-white text-black hover:bg-white/90 font-black text-xs sm:text-sm shadow-lg shadow-white/10"
                >
                  <span>مرحله بعد: انتخاب درگاه پرداخت</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>بازگشت</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>در حال برقراری ارتباط و ثبت سفارش...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>تأیید و پرداخت نهایی ({formatCurrency(total)})</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
