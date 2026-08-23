import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Category } from "../../types";
import { Plus, Edit3, Trash2, X, Coffee, Layers } from "lucide-react";
import { motion } from "motion/react";

export const CategoryManagement: React.FC = () => {
  const { categories, products, saveCategory, deleteCategory, activeShop } = useTenant();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionFa, setDescriptionFa] = useState("");
  const [icon, setIcon] = useState("Coffee");

  const openCreate = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      coffeeShopId: activeShop.id,
      name: "",
      nameFa: "",
      icon: "Coffee",
      sortOrder: categories.length + 1,
      active: true,
    });
    setNameFa("");
    setNameEn("");
    setDescriptionFa("");
    setIcon("Coffee");
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameFa(cat.nameFa);
    setNameEn(cat.name);
    setDescriptionFa(cat.descriptionFa || "");
    setIcon(cat.icon || "Coffee");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    await saveCategory({
      ...editingCategory,
      nameFa,
      name: nameEn || nameFa,
      descriptionFa,
      icon,
    });
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">
            مدیریت دسته‌بندی‌های منو
          </h2>
          <p className="text-xs text-stone-400">
            دسته‌بندی‌ها، ترتیب نمایش در فروشگاه و تفکیک آیتم‌های بار و آشپزخانه
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-5 rounded-3xl bg-stone-900 border border-stone-800 hover:border-stone-700 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-100 text-sm sm:text-base">{cat.nameFa}</h3>
                    <p className="text-[11px] text-stone-400 font-sans">{cat.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف دسته‌بندی «${cat.nameFa}» اطمینان دارید؟`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cat.descriptionFa && (
                <p className="text-xs text-stone-300">{cat.descriptionFa}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-stone-800/80 text-xs text-stone-400">
                <span>تعداد محصولات متصل:</span>
                <span className="font-bold text-amber-400">{productCount} محصول</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-base">
                {nameFa ? `ویرایش «${nameFa}»` : "دسته‌بندی جدید"}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  نام فارسی دسته‌بندی:
                </label>
                <input
                  type="text"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  required
                  placeholder="مثال: قهوه‌های دمی و فیلتری"
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
                  placeholder="Filter & Drip Coffee"
                  dir="ltr"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  توضیحات کوتاه:
                </label>
                <input
                  type="text"
                  value={descriptionFa}
                  onChange={(e) => setDescriptionFa(e.target.value)}
                  placeholder="توضیح کوتاه در منو..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
