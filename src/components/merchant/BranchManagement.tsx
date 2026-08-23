import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Branch } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { Plus, MapPin, Phone, Clock, Truck, Edit3, X } from "lucide-react";
import { motion } from "motion/react";

export const BranchManagement: React.FC = () => {
  const { branches, saveBranch, activeShop } = useTenant();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [addressFa, setAddressFa] = useState("");
  const [phone, setPhone] = useState("");
  const [openingHours, setOpeningHours] = useState("۷:۳۰ صبح الی ۲۳:۳۰ شب");
  const [deliveryFee, setDeliveryFee] = useState(25000);
  const [active, setActive] = useState(true);

  const openCreate = () => {
    setEditingBranch({
      id: `br-${Date.now()}`,
      coffeeShopId: activeShop.id,
      name: "",
      nameFa: "",
      address: "",
      addressFa: "",
      phone: "021-",
      openingHours: "۷:۳۰ صبح الی ۲۳:۳۰ شب",
      deliveryFee: 25000,
      active: true,
    });
    setNameFa("");
    setNameEn("");
    setAddressFa("");
    setPhone("021-22401234");
    setOpeningHours("۷:۳۰ صبح الی ۲۳:۳۰ شب");
    setDeliveryFee(25000);
    setActive(true);
  };

  const openEdit = (br: Branch) => {
    setEditingBranch(br);
    setNameFa(br.nameFa);
    setNameEn(br.name);
    setAddressFa(br.addressFa);
    setPhone(br.phone);
    setOpeningHours(br.openingHours);
    setDeliveryFee(br.deliveryFee);
    setActive(br.active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    await saveBranch({
      ...editingBranch,
      nameFa,
      name: nameEn || nameFa,
      addressFa,
      address: addressFa,
      phone,
      openingHours,
      deliveryFee: Number(deliveryFee),
      active,
    });
    setEditingBranch(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">
            مدیریت شعب و محدوده تحویل
          </h2>
          <p className="text-xs text-stone-400">
            شعب فعال، ساعات کاری، شماره تماس و هزینه پیک اختصاصی هر شعبه
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن شعبه جدید</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {branches.map((br) => (
          <div
            key={br.id}
            className="p-5 rounded-3xl bg-stone-900 border border-stone-800 hover:border-stone-700 space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-100 text-base">{br.nameFa}</h3>
                  <p className="text-xs text-stone-400 font-sans">{br.name}</p>
                </div>
              </div>

              <button
                onClick={() => openEdit(br)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed pr-2">
              {br.addressFa}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-400 border-t border-stone-800/80 pt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{br.openingHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span dir="ltr">{br.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>پیک: {formatCurrency(br.deliveryFee)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${br.active ? "bg-emerald-950 text-emerald-400" : "bg-stone-800 text-stone-500"}`}>
                  {br.active ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-base">
                {nameFa ? `ویرایش «${nameFa}»` : "شعبه جدید"}
              </h3>
              <button
                onClick={() => setEditingBranch(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    نام فارسی شعبه:
                  </label>
                  <input
                    type="text"
                    value={nameFa}
                    onChange={(e) => setNameFa(e.target.value)}
                    required
                    placeholder="شعبه زعفرانیه"
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
                    placeholder="Zafaraniyeh Branch"
                    dir="ltr"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  آدرس دقیق شعبه:
                </label>
                <textarea
                  value={addressFa}
                  onChange={(e) => setAddressFa(e.target.value)}
                  rows={2}
                  required
                  placeholder="تهران، خیابان..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    شماره تماس شعبه:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    dir="ltr"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    هزینه ارسال پیک (تومان):
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    min={0}
                    step={5000}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  ساعات کاری و پذیرش سفارش:
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="۷:۳۰ صبح الی ۲۳:۳۰ شب"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
                >
                  ذخیره شعبه
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
