import React from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { useCart } from "../../features/cart/CartContext";
import { Order } from "../../types";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { 
  X, 
  History, 
  RotateCcw, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrderHistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { orders } = useTenant();
  const { reorderPastOrder } = useCart();

  if (!isOpen) return null;

  const handleReorder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const ok = reorderPastOrder(order);
    if (ok) {
      alert("اقلام سفارش پیشین با آخرین قیمت‌های معتبر به سبد خرید افزوده شدند!");
      onClose();
    } else {
      alert("متأسفانه برخی از اقلام این سفارش در حال حاضر در منو موجود نمی‌باشند.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px] border border-stone-700">در انتظار تأیید</span>;
      case "confirmed":
        return <span className="px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 text-[11px] border border-blue-700">تأیید شد</span>;
      case "preparing":
        return <span className="px-2.5 py-1 rounded-full bg-amber-900/60 text-amber-300 text-[11px] border border-amber-600 animate-pulse">در حال آماده‌سازی</span>;
      case "ready":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-[11px] border border-emerald-600">آماده تحویل</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] border border-emerald-800">تحویل داده شد ✓</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 text-[11px] border border-rose-800">لغو شده</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px]">{status}</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-base sm:text-lg">تاریخچه سفارش‌های من</h3>
                <p className="text-xs text-stone-400">{orders.length} سفارش ثبت‌شده</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orders List */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
                <h4 className="font-bold text-stone-200 text-base">هنوز سفارشی ثبت نکرده‌اید</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  با ثبت اولین سفارش، جزئیات و امکان سفارش مجدد در این بخش نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 rounded-2xl bg-stone-800/60 border border-stone-800 hover:border-amber-600/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-100 text-sm group-hover:text-amber-400 transition-colors">
                        سفارش #{order.orderNumber}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({order.branchNameFa || "شعبه مرکزی"})
                      </span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  <div className="text-xs text-stone-300 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}× ${i.nameFa}`).join(" • ")}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2.5">
                    <span>{formatPersianDateTime(order.timestamps.created)}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-400 text-sm">
                        {formatCurrency(order.total)}
                      </span>
                      <button
                        onClick={(e) => handleReorder(e, order)}
                        className="px-2.5 py-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>سفارش مجدد</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
