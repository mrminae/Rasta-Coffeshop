import React, { useState, useEffect } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Order, OrderStatus } from "../../types";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Store, 
  MapPin, 
  RotateCw, 
  Volume2, 
  VolumeX,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const KitchenDisplaySystem: React.FC = () => {
  const { orders, updateOrderStatus, activeBranch } = useTenant();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "pickup" | "delivery">("all");

  // Play beep simulation on new orders
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context fallback
    }
  };

  const pendingOrders = orders.filter((o) => 
    (o.orderStatus === "pending" || o.orderStatus === "confirmed") &&
    (filterType === "all" || o.fulfillmentType === filterType)
  );

  const preparingOrders = orders.filter((o) => 
    o.orderStatus === "preparing" &&
    (filterType === "all" || o.fulfillmentType === filterType)
  );

  const readyOrders = orders.filter((o) => 
    (o.orderStatus === "ready" || o.orderStatus === "out_for_delivery") &&
    (filterType === "all" || o.fulfillmentType === filterType)
  );

  const handleBumpStatus = async (orderId: string, currentStatus: OrderStatus) => {
    playBeep();
    let nextStatus: OrderStatus = "confirmed";
    if (currentStatus === "pending" || currentStatus === "confirmed") {
      nextStatus = "preparing";
    } else if (currentStatus === "preparing") {
      nextStatus = "ready";
    } else if (currentStatus === "ready" || currentStatus === "out_for_delivery") {
      nextStatus = "completed";
    }
    await updateOrderStatus(orderId, nextStatus);
  };

  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    return isNaN(diff) || diff < 0 ? 0 : diff;
  };

  const renderOrderCard = (order: Order, colType: "pending" | "preparing" | "ready") => {
    const elapsed = getElapsedMinutes(order.timestamps.created);
    const isUrgent = elapsed >= 10 && colType !== "ready";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={order.id}
        className={`p-4 rounded-2xl border shadow-lg transition-all text-right space-y-3 ${
          isUrgent
            ? "bg-rose-950/40 border-rose-600 ring-2 ring-rose-500/30"
            : colType === "preparing"
            ? "bg-amber-950/30 border-amber-500/50"
            : colType === "ready"
            ? "bg-emerald-950/30 border-emerald-500/50"
            : "bg-stone-900 border-stone-800"
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-stone-100 text-base">
                #{order.orderNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  order.fulfillmentType === "pickup"
                    ? "bg-stone-800 text-amber-300 border border-stone-700"
                    : "bg-blue-900/60 text-blue-300 border border-blue-700"
                }`}
              >
                {order.fulfillmentType === "pickup" ? "تحویل حضوری" : "ارسال با پیک"}
              </span>
            </div>
            <div className="text-xs text-stone-400 font-medium mt-0.5">
              {order.customerName} • <span dir="ltr">{order.customerPhone}</span>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
              isUrgent
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-stone-800 text-amber-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed} دقیقه</span>
          </div>
        </div>

        {/* Items Checklist for Kitchen */}
        <div className="space-y-2 py-1">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-stone-950/50 border border-stone-800/80 text-xs flex items-start gap-2.5"
            >
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0 text-xs">
                {item.quantity}×
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-stone-100 text-xs sm:text-sm">
                  {item.nameFa}
                </div>
                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.selectedModifiers.map((mod, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700/60 text-[10px] text-amber-300 font-semibold"
                      >
                        {mod.optionNameFa}
                      </span>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="mt-1 text-[10px] text-rose-300 font-bold bg-rose-950/40 p-1 rounded">
                    ⚠️ {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {order.customerNotes && (
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
            <strong>یادداشت مشتری:</strong> {order.customerNotes}
          </div>
        )}

        {/* Quick Action Bump Button */}
        <button
          onClick={() => handleBumpStatus(order.id, order.orderStatus)}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
            colType === "pending"
              ? "bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-amber-600/20"
              : colType === "preparing"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              : "bg-stone-700 hover:bg-stone-600 text-stone-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {colType === "pending"
              ? "شروع آماده‌سازی (Start Prep) ➔"
              : colType === "preparing"
              ? "آماده شد (Mark Ready) ➔"
              : "تحویل نهایی به مشتری / پیک ✓"}
          </span>
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top KDS Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 p-4 rounded-3xl border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-600/20 text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-stone-100 text-lg sm:text-xl flex items-center gap-2">
              <span>سیستم نمایشگر آشپزخانه و بار (KDS)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold animate-pulse">
                زنده (Live Real-Time)
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              شعبه {activeBranch?.nameFa || "مرکزی"} • صف سفارش‌های فعال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fulfillment Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-800 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "all" ? "bg-amber-600 text-stone-950" : "text-stone-300"
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterType("pickup")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "pickup" ? "bg-amber-600 text-stone-950" : "text-stone-300"
              }`}
            >
              حضوری
            </button>
            <button
              onClick={() => setFilterType("delivery")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "delivery" ? "bg-amber-600 text-stone-950" : "text-stone-300"
              }`}
            >
              پیک
            </button>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
              soundEnabled
                ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                : "bg-stone-800 border-stone-700 text-stone-500"
            }`}
            title="صدای اعلان سفارش"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "صدا روشن" : "صدا خاموش"}</span>
          </button>
        </div>
      </div>

      {/* 3-Column KDS Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: New / Confirmed Orders */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <h3 className="font-bold text-stone-200 text-sm">در انتظار آماده‌سازی (جدید)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-xs font-black">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/60 text-stone-500 text-xs">
                سفارش جدیدی در انتظار نیست.
              </div>
            ) : (
              pendingOrders.map((order) => renderOrderCard(order, "pending"))
            )}
          </div>
        </div>

        {/* Column 2: In Kitchen Prep */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-500 animate-bounce" />
              <h3 className="font-bold text-amber-300 text-sm">در حال آماده‌سازی توسط باریستا</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 text-xs font-black">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/60 text-stone-500 text-xs">
                هیچ سفارشی در مرحله آماده‌سازی نیست.
              </div>
            ) : (
              preparingOrders.map((order) => renderOrderCard(order, "preparing"))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup / Delivery */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-emerald-300 text-sm">آماده تحویل در باجه / سفیر پیک</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-black">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/60 text-stone-500 text-xs">
                سفارشی در باجه تحویل معطل نمانده است.
              </div>
            ) : (
              readyOrders.map((order) => renderOrderCard(order, "ready"))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
