import React, { useMemo } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Award, 
  ArrowUpRight, 
  Coffee, 
  Users, 
  Sparkles,
  ChevronLeft
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface MerchantDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onNavigateTab }) => {
  const { orders, products, activeShop, activeBranch } = useTenant();

  // Compute analytics
  const { todaySales, todayOrderCount, avgOrderValue, pendingCount } = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + (o.paymentStatus === "paid" ? o.total : o.total), 0);
    const count = orders.length;
    const avg = count > 0 ? Math.round(totalRev / count) : 0;
    const pending = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed" || o.orderStatus === "preparing").length;

    return {
      todaySales: totalRev,
      todayOrderCount: count,
      avgOrderValue: avg,
      pendingCount: pending,
    };
  }, [orders]);

  // Chart data: 7-day revenue
  const weeklySalesData = [
    { day: "شنبه", sales: 1850000, orders: 18 },
    { day: "یکشنبه", sales: 2450000, orders: 24 },
    { day: "دوشنبه", sales: 2100000, orders: 20 },
    { day: "سه‌شنبه", sales: 2900000, orders: 29 },
    { day: "چهارشنبه", sales: 3400000, orders: 35 },
    { day: "پنج‌شنبه", sales: 4800000, orders: 48 },
    { day: "جمعه", sales: 5600000, orders: 54 },
  ];

  // Category distribution
  const categoryData = [
    { name: "اسپرسو و قهوه گرم", value: 45, color: "#d97706" },
    { name: "آیس کافی و بارهای سرد", value: 30, color: "#f59e0b" },
    { name: "کیک و دسر تازه", value: 15, color: "#10b981" },
    { name: "سایر نوشیدنی‌ها", value: 10, color: "#6366f1" },
  ];

  return (
    <div className="space-y-8 text-right">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-l from-stone-900 via-stone-900 to-amber-950/40 p-6 rounded-3xl border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-100">
              داشبورد عملکرد تجاری {activeShop.nameFa}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              شعبه {activeBranch?.nameFa || "مرکزی"}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            آمار بلادرنگ فروش، وضعیت سفارش‌های فعال کیچن و تحلیل خودکار
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab("kds")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            <span>ورود به نمایشگر آشپزخانه (KDS)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">فروش ثبت‌شده</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {formatCurrency(todaySales)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>۱۸.۴٪ رشد نسبت به دیروز</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">تعداد سفارش‌ها</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {todayOrderCount} سفارش
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
              <span>میانگین آماده‌سازی: ۶.۵ دقیقه</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">سفارش‌های در حال پردازش</span>
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {pendingCount} سفارش
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-1">
              <span>در صف کیچن و بار</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">میانگین ارزش فاکتور (AOV)</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {formatCurrency(avgOrderValue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-indigo-400 mt-1">
              <span>۲.۸ قلم در هر سفارش</span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-100 text-base">روند درآمد هفتگی (تومان)</h3>
              <p className="text-xs text-stone-400">نمودار مقایسه‌ای فروش روزانه شعبه</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                فروش خالص
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="day" stroke="#78716c" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#78716c"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderColor: "#44403c",
                    borderRadius: "12px",
                    color: "#f5f5f4",
                    fontSize: "12px",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                  formatter={(val: any) => [`${formatCurrency(Number(val))}`, "درآمد"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#d97706"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution Donut */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-100 text-base">سهم دسته‌بندی‌ها در فروش</h3>
            <p className="text-xs text-stone-400">تفکیک اقلام سفارش داده شده</p>
          </div>

          <div className="h-44 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    borderColor: "#44403c",
                    borderRadius: "12px",
                    color: "#f5f5f4",
                    fontSize: "12px",
                    direction: "rtl",
                  }}
                  formatter={(val: any) => [`${val}٪`, "سهم"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs text-stone-300">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </span>
                <span className="font-bold text-stone-200">{cat.value}٪</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Bestsellers */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-100 text-base">پرفروش‌ترین آیتم‌های منو</h3>
            <button
              onClick={() => onNavigateTab("products")}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>مدیریت محصولات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 5).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/50 border border-stone-800/80"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-stone-800 font-bold text-amber-400 text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <img src={p.image} alt={p.nameFa} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-stone-200 text-xs">{p.nameFa}</div>
                    <div className="text-[10px] text-stone-400 font-sans">{p.name}</div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-amber-400 text-xs">{formatCurrency(p.basePrice)}</div>
                  <div className="text-[10px] text-emerald-400">موجودی فعال</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders mini list */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-100 text-base">آخرین سفارش‌های ورودی</h3>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه سفارش‌ها</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/50 border border-stone-800/80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-200 text-xs">#{o.orderNumber}</span>
                    <span className="text-[11px] text-stone-400">({o.customerName})</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {o.items.length} قلم • {formatPersianDateTime(o.timestamps.created)}
                  </div>
                </div>

                <div className="text-left flex items-center gap-2">
                  <span className="font-bold text-amber-400 text-xs">{formatCurrency(o.total)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.orderStatus === "completed"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : o.orderStatus === "preparing"
                        ? "bg-amber-950 text-amber-400 border border-amber-800 animate-pulse"
                        : "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}
                  >
                    {o.orderStatus === "completed" ? "تحویل شد" : o.orderStatus === "preparing" ? "در حال آماده‌سازی" : "تأیید شد"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
