import React from "react";
import { Order, OrderStatus } from "../../types";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  Truck, 
  MapPin, 
  Phone, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
  onReorder?: (order: Order) => void;
}

const statusStages: { key: OrderStatus; label: string; icon: any; desc: string }[] = [
  { key: "pending", label: "ثبت سفارش", icon: Clock, desc: "سفارش شما در سیستم ثبت شد و در انتظار تأیید کافه است." },
  { key: "confirmed", label: "تأیید شد", icon: CheckCircle2, desc: "کافه سفارش شما را دریافت و تأیید نمود." },
  { key: "preparing", label: "در حال آماده‌سازی", icon: ChefHat, desc: "باریستا و تیم آشپزخانه در حال آماده‌سازی باکیفیت سفارش هستند." },
  { key: "ready", label: "آماده تحویل", icon: PackageCheck, desc: "سفارش آماده است؛ می‌توانید به باجه تحویل مراجعه نمایید." },
  { key: "out_for_delivery", label: "تحویل به پیک", icon: Truck, desc: "سفارش به سفیر کافه جهت تحویل در محل شما تحویل داده شد." },
  { key: "completed", label: "تحویل داده شد", icon: CheckCircle2, desc: "سفارش با موفقیت تحویل گردید. نوش جان!" },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onReorder,
}) => {
  if (!order) return null;

  const currentStatusIndex = statusStages.findIndex((s) => s.key === order.orderStatus);
  const activeIdx = currentStatusIndex >= 0 ? currentStatusIndex : 1;

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
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-white text-base sm:text-lg">
                  رهگیری زنده سفارش #{order.orderNumber}
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {formatPersianDateTime(order.timestamps.created)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Live Progress Timeline */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white/80">مراحل آماده‌سازی و تحویل:</h4>
              <div className="space-y-3">
                {statusStages
                  .filter((s) => order.fulfillmentType === "pickup" ? s.key !== "out_for_delivery" : true)
                  .map((stage, idx) => {
                    const isPassed = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;
                    const Icon = stage.icon;

                    return (
                      <div key={stage.key} className="flex items-start gap-3 relative">
                        {/* Status Icon */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isCurrent
                              ? "bg-white text-black border-white ring-4 ring-white/20 shadow-md"
                              : isPassed
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                              : "bg-white/5 border-white/10 text-white/30"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Status Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isCurrent ? "text-white" : isPassed ? "text-white/90" : "text-white/40"
                              }`}
                            >
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold animate-pulse border border-white/20">
                                وضعیت کنونی
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Branch Details */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5 backdrop-blur-md">
              <div className="font-bold text-white/90 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>شعبه ارائه‌دهنده: {order.branchNameFa || "شعبه مرکزی"}</span>
              </div>
              {order.deliveryAddress && (
                <div className="text-white/60 text-[11px]">
                  آدرس تحویل: {order.deliveryAddress.fullAddress}
                </div>
              )}
              {order.pickupTime && (
                <div className="text-white/60 text-[11px]">
                  زمان تحویل حضوری: {order.pickupTime}
                </div>
              )}
            </div>

            {/* Items Summary in Receipt */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/80">اقلام سفارش داده‌شده:</h4>
              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-[11px]">
                        {item.quantity}×
                      </span>
                      <div>
                        <span className="text-white font-medium">{item.nameFa}</span>
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-[10px] text-white/40">
                            {item.selectedModifiers.map((m) => m.optionNameFa).join("، ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-amber-300">
                      {formatCurrency(item.itemTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-white/60 backdrop-blur-md">
              <div className="flex justify-between">
                <span>جمع اقلام:</span>
                <span className="text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>تخفیف کوپن:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>هزینه پیک:</span>
                  <span className="text-white">{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>مالیات ارزش افزوده (۹٪):</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-white border-t border-white/10 pt-2">
                <span>مبلغ پرداخت‌شده ({order.paymentMethod === "online" ? "پرداخت آنلاین" : "حضوری"}):</span>
                <span className="text-amber-300">{formatCurrency(order.total)}</span>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center gap-3 shrink-0">
            {onReorder && (
              <button
                onClick={() => {
                  onReorder(order);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>سفارش مجدد همین اقلام (Reorder)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              بستن
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
