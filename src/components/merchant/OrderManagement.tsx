import React, { useState, useMemo } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Order, OrderStatus } from "../../types";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChefHat,
  PackageCheck,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, activeBranch } = useTenant();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== "all" && o.orderStatus !== selectedStatus) {
        return false;
      }
      const term = (searchTerm || "").trim();
      if (term) {
        const q = term.toLowerCase();
        const numMatch = (o.orderNumber || "").toLowerCase().includes(q);
        const nameMatch = (o.customerName || "").toLowerCase().includes(q);
        const phoneMatch = (o.customerPhone || "").includes(q);
        if (!numMatch && !nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px] border border-stone-700">در انتظار</span>;
      case "confirmed":
        return <span className="px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 text-[11px] border border-blue-700">تأیید شد</span>;
      case "preparing":
        return <span className="px-2.5 py-1 rounded-full bg-amber-900/60 text-amber-300 text-[11px] border border-amber-600 animate-pulse">آماده‌سازی</span>;
      case "ready":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-[11px] border border-emerald-600">آماده تحویل</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] border border-emerald-800">تحویل شده ✓</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 text-[11px] border border-rose-800">لغو شده</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">مدیریت سفارش‌ها</h2>
          <p className="text-xs text-stone-400">
            مشاهده، تغییر وضعیت فاکتور و صدور رسید چاپی
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با شماره سفارش، نام، موبایل..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl py-2 pr-8 pl-3 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {[
          { id: "all", label: "همه سفارش‌ها", count: orders.length },
          { id: "pending", label: "در انتظار", count: orders.filter((o) => o.orderStatus === "pending").length },
          { id: "confirmed", label: "تأیید شده", count: orders.filter((o) => o.orderStatus === "confirmed").length },
          { id: "preparing", label: "در حال آماده‌سازی", count: orders.filter((o) => o.orderStatus === "preparing").length },
          { id: "ready", label: "آماده تحویل", count: orders.filter((o) => o.orderStatus === "ready").length },
          { id: "completed", label: "تحویل شده", count: orders.filter((o) => o.orderStatus === "completed").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedStatus === tab.id
                ? "bg-amber-600 text-stone-950 font-bold shadow-md"
                : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedStatus === tab.id ? "bg-stone-950 text-amber-400" : "bg-stone-800"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
              <tr>
                <th className="p-4">شماره سفارش</th>
                <th className="p-4">مشتری</th>
                <th className="p-4">اقلام</th>
                <th className="p-4">نحوه تحویل</th>
                <th className="p-4">مبلغ کل</th>
                <th className="p-4">وضعیت پرداخت</th>
                <th className="p-4">وضعیت فاکتور</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-500">
                    سفارشی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-stone-800/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-black text-amber-400 font-sans">
                      #{order.orderNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-200">{order.customerName}</div>
                      <div className="text-[10px] text-stone-400" dir="ltr">{order.customerPhone}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {order.items.map((i) => `${i.quantity}× ${i.nameFa}`).join("، ")}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px]">
                        {order.fulfillmentType === "pickup" ? "تحویل حضوری" : "ارسال با پیک"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-stone-100">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {order.paymentStatus === "paid" ? "پرداخت شده" : "در انتظار تسویه"}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                      >
                        مشاهده جزئیات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70 shrink-0">
              <div>
                <h3 className="font-bold text-stone-100 text-lg">
                  جزئیات سفارش #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  {formatPersianDateTime(selectedOrder.timestamps.created)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Customer & Branch */}
              <div className="p-3.5 rounded-2xl bg-stone-800/50 border border-stone-800 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-stone-200">
                  <span>مشتری: {selectedOrder.customerName}</span>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="text-amber-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="text-stone-400 text-[11px] pt-1">
                    📍 آدرس تحویل: {selectedOrder.deliveryAddress.fullAddress}
                  </div>
                )}
                {selectedOrder.pickupTime && (
                  <div className="text-stone-400 text-[11px]">
                    ⏱ زمان تحویل در کافه: {selectedOrder.pickupTime}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-300">اقلام فاکتور:</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-800/70 border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-200">{item.quantity}× {item.nameFa}</span>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {item.selectedModifiers.map((m) => m.optionNameFa).join("، ")}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-amber-400">{formatCurrency(item.itemTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Price calculation */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs space-y-1 text-stone-400">
                <div className="flex justify-between">
                  <span>جمع اقلام:</span>
                  <span className="text-stone-200">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>تخفیف:</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>هزینه پیک:</span>
                    <span className="text-stone-200">{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-stone-100 border-t border-stone-800 pt-2">
                  <span>مبلغ کل:</span>
                  <span className="text-amber-400">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-stone-300">تغییر وضعیت این سفارش:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}
                    className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold"
                  >
                    تأیید سفارش
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "preparing")}
                    className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold"
                  >
                    آماده‌سازی
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "ready")}
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold"
                  >
                    آماده تحویل
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "completed")}
                    className="p-2.5 rounded-xl bg-emerald-600 text-stone-950 font-bold"
                  >
                    تحویل نهایی ✓
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                    className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold"
                  >
                    لغو سفارش
                  </button>
                </div>
              </div>

            </div>

            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  window.print?.();
                }}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فیش فاکتور</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
