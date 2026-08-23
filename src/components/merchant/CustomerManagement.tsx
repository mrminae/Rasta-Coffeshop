import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { formatCurrency, formatPersianDateTime } from "../../lib/utils";
import { Users, Award, Gift, Search, Phone, Mail, Star, ShieldCheck } from "lucide-react";

export const CustomerManagement: React.FC = () => {
  const { orders } = useTenant();
  const [searchTerm, setSearchTerm] = useState("");

  // Build customers aggregate list from orders
  const mockCustomers = [
    { id: "c-1", name: "مبینا سلیمانی", phone: "09123456789", email: "mobina@example.com", totalOrders: 14, totalSpent: 2850000, points: 340, tier: "gold" },
    { id: "c-2", name: "علی رضایی", phone: "09121112233", email: "ali.rezaei@example.com", totalOrders: 8, totalSpent: 1620000, points: 210, tier: "silver" },
    { id: "c-3", name: "مهسا احمدی", phone: "09359998877", email: "mahsa@example.com", totalOrders: 22, totalSpent: 4900000, points: 620, tier: "platinum" },
    { id: "c-4", name: "پرهام علیزاده", phone: "09194443322", email: "parham@example.com", totalOrders: 3, totalSpent: 540000, points: 80, tier: "bronze" },
    { id: "c-5", name: "سارا ابراهیمی", phone: "09307776655", email: "sara.e@example.com", totalOrders: 19, totalSpent: 3950000, points: 510, tier: "gold" },
  ];

  const filtered = mockCustomers.filter((c) => {
    const term = (searchTerm || "").trim();
    if (term) {
      const q = term.toLowerCase();
      return (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.email || "").toLowerCase().includes(q);
    }
    return true;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold">پلاتینیوم 👑</span>;
      case "gold":
        return <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-bold">طلایی ⭐</span>;
      case "silver":
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">نقره‌ای 🥈</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 text-[11px]">برنزی 🥉</span>;
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">
            باشگاه مشتریان و مدیریت ارتباط (CRM)
          </h2>
          <p className="text-xs text-stone-400">
            فهرست مشتریان وفادار، رتبه‌بندی اعضا، حجم خرید و امتیازات
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی مشتری با نام، موبایل..."
            className="w-full bg-stone-800 border border-stone-700 rounded-xl py-2 pr-8 pl-3 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
              <tr>
                <th className="p-4">نام مشتری</th>
                <th className="p-4">اطلاعات تماس</th>
                <th className="p-4">سطح وفاداری</th>
                <th className="p-4">تعداد سفارش‌ها</th>
                <th className="p-4">مجموع خرید (LTV)</th>
                <th className="p-4">امتیازات فعال</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-stone-800 text-amber-400 font-bold flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-bold text-stone-200">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-stone-200" dir="ltr">{c.phone}</div>
                    <div className="text-[10px] text-stone-400 font-sans">{c.email}</div>
                  </td>
                  <td className="p-4">
                    {getTierBadge(c.tier)}
                  </td>
                  <td className="p-4 font-bold text-stone-200">
                    {c.totalOrders} سفارش
                  </td>
                  <td className="p-4 font-black text-amber-400">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="p-4 font-black text-emerald-400">
                    {c.points} امتیاز
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        alert(`۵۰ امتیاز هدیه با موفقیت به حساب ${c.name} افزوده شد.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                    >
                      + اعطای امتیاز هدیه
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
