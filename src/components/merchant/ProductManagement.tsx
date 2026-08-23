import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Product } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { generateProductImage } from "../../features/ai/aiService";
import { 
  Coffee, 
  Plus, 
  Search, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Wand2,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ProductManagement: React.FC = () => {
  const { products, categories, saveProduct, activeShop } = useTenant();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);

  // AI Image generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiAspectRatio, setAiAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9">("1:1");
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);
  const [aiImageError, setAiImageError] = useState<string | null>(null);

  // Form state for creating/editing product
  const [formNameFa, setFormNameFa] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || "cat-hot-coffee");
  const [formBasePrice, setFormBasePrice] = useState(68000);
  const [formDescFa, setFormDescFa] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formCalories, setFormCalories] = useState(150);
  const [formPrepTime, setFormPrepTime] = useState(5);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPopular, setFormPopular] = useState(false);
  const [formAvailable, setFormAvailable] = useState(true);

  const openCreateModal = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      coffeeShopId: activeShop.id,
      categoryId: categories[0]?.id || "cat-hot-coffee",
      name: "",
      nameFa: "",
      description: "",
      descriptionFa: "",
      basePrice: 75000,
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      available: true,
      active: true,
      featured: false,
      popular: false,
      isNew: true,
      preparationTime: 5,
      calories: 140,
    });
    setFormNameFa("");
    setFormNameEn("");
    setFormCategoryId(categories[0]?.id || "cat-hot-coffee");
    setFormBasePrice(75000);
    setFormDescFa("");
    setFormImage("https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80");
    setFormCalories(140);
    setFormPrepTime(5);
    setFormFeatured(false);
    setFormPopular(false);
    setFormAvailable(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormNameFa(prod.nameFa);
    setFormNameEn(prod.name);
    setFormCategoryId(prod.categoryId);
    setFormBasePrice(prod.basePrice);
    setFormDescFa(prod.descriptionFa);
    setFormImage(prod.image);
    setFormCalories(prod.calories || 120);
    setFormPrepTime(prod.preparationTime || 5);
    setFormFeatured(!!prod.featured);
    setFormPopular(!!prod.popular);
    setFormAvailable(prod.available);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProd: Product = {
      ...editingProduct,
      nameFa: formNameFa,
      name: formNameEn || formNameFa,
      categoryId: formCategoryId,
      basePrice: Number(formBasePrice),
      descriptionFa: formDescFa,
      description: formDescFa,
      image: formImage || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      calories: Number(formCalories),
      preparationTime: Number(formPrepTime),
      featured: formFeatured,
      popular: formPopular,
      available: formAvailable,
    };

    await saveProduct(updatedProd);
    setEditingProduct(null);
  };

  const handleGenerateAiImage = async () => {
    const promptText = (aiPrompt || "").trim();
    if (!promptText) return;
    setIsGeneratingAiImage(true);
    setAiImageError(null);

    try {
      const result = await generateProductImage(promptText, aiAspectRatio);
      setGeneratedAiImageUrl(result.imageUrl);
      setFormImage(result.imageUrl);
    } catch (err: any) {
      setAiImageError(err.message || "خطا در ساخت تصویر هوش مصنوعی");
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== "all" && p.categoryId !== selectedCat) return false;
    const term = (searchTerm || "").trim();
    if (term) {
      const q = term.toLowerCase();
      return (p.nameFa || "").toLowerCase().includes(q) || (p.name || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 p-5 rounded-3xl border border-stone-800">
        <div>
          <h2 className="font-black text-stone-100 text-lg sm:text-xl">
            مدیریت منو و محصولات کافه
          </h2>
          <p className="text-xs text-stone-400">
            تعریف آیتم‌ها، قیمت‌گذاری، متغیرها و استودیوی ساخت عکس با هوش مصنوعی
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAiPrompt("یک فنجان لاته آرتیستیک با فوم شیر ابریشمی و گل زعفران روی میز چوبی کافه تاریک");
              setIsAiImageModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>استودیوی تولید عکس هوش مصنوعی (gemini-3.1-flash-image)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن محصول جدید</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedCat === "all" ? "bg-amber-600 text-stone-950 font-bold" : "bg-stone-900 text-stone-400 border border-stone-800"
            }`}
          >
            همه ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedCat === c.id ? "bg-amber-600 text-stone-950 font-bold" : "bg-stone-900 text-stone-400 border border-stone-800"
              }`}
            >
              {c.nameFa}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی محصول..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl py-2 pr-8 pl-3 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-stone-950">
              <img src={p.image} alt={p.nameFa} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-1">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 rounded-xl bg-stone-950/70 hover:bg-stone-950 text-stone-200 backdrop-blur-md border border-stone-700/50"
                  title="ویرایش"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1">
                {p.featured && (
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-bold">
                    ویژه
                  </span>
                )}
                {p.popular && (
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                    محبوب
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-100 text-sm">{p.nameFa}</h4>
                <p className="text-[11px] text-stone-400 font-sans truncate">{p.name}</p>
                <p className="text-xs text-stone-400 mt-1 line-clamp-2">{p.descriptionFa}</p>
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <div>
                  <div className="font-black text-amber-400 text-sm">
                    {formatCurrency(p.basePrice)}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    زمان: {p.preparationTime} دقیقه
                  </div>
                </div>

                <button
                  onClick={() => {
                    saveProduct({ ...p, available: !p.available });
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    p.available
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : "bg-stone-800 text-stone-400 border-stone-700"
                  }`}
                >
                  {p.available ? "موجود در بار" : "ناموجود"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right p-6 space-y-5 max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
              <h3 className="font-black text-stone-100 text-base sm:text-lg">
                {formNameFa ? `ویرایش «${formNameFa}»` : "تعریف محصول جدید"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    نام فارسی محصول:
                  </label>
                  <input
                    type="text"
                    value={formNameFa}
                    onChange={(e) => setFormNameFa(e.target.value)}
                    required
                    placeholder="مثال: لاته کارامل نمکی"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    نام انگلیسی (English Name):
                  </label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="Salted Caramel Latte"
                    dir="ltr"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    دسته‌بندی:
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    قیمت پایه (تومان):
                  </label>
                  <input
                    type="number"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    required
                    min={0}
                    step={1000}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  توضیحات و رسپی کوتاه:
                </label>
                <textarea
                  value={formDescFa}
                  onChange={(e) => setFormDescFa(e.target.value)}
                  rows={2}
                  placeholder="توضیح طعم‌یادها، دانه قهوه و نحوه سرو..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-300">
                    آدرس تصویر محصول (Image URL):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(`یک فنجان ${formNameFa || "قهوه اسپشیالتی لذیذ"} با نورپردازی گرم کافه استودیویی`);
                      setIsAiImageModalOpen(true);
                    }}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ساخت با هوش مصنوعی</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  dir="ltr"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:border-amber-500 text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    زمان آماده‌سازی (دقیقه):
                  </label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    min={1}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    میزان کالری (کیلوکالری):
                  </label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(Number(e.target.value))}
                    min={0}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-stone-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
                  />
                  <span>پیشنهاد ویژه باریستا (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
                  />
                  <span>محبوب‌ترین (Popular)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-500"
                  />
                  <span>موجود در انبار و بار کافه</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-600/20"
                >
                  ذخیره محصول
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI Image Generation Studio Modal */}
      {isAiImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-100 text-base">
                    استودیوی تولید عکس محصول هوش مصنوعی
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    مدل: <span className="font-mono text-amber-400">gemini-3.1-flash-image</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiImageModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1.5">
                  پرامپت و توصیف ظاهر محصول برای هوش مصنوعی:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  placeholder="مثال: عکس حرفه‌ای تبلیغاتی از آیس لاته وانیلی در لیوان شیشه‌ای با یخ‌های شفاف..."
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1.5">
                  نسبت ابعاد تصویر (Aspect Ratio):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["1:1", "4:3", "3:4", "16:9"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAiAspectRatio(ratio)}
                      className={`py-2 rounded-xl border text-center font-mono text-xs transition-all ${
                        aiAspectRatio === ratio
                          ? "bg-amber-600 text-stone-950 font-bold border-amber-500"
                          : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {aiImageError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
                  {aiImageError}
                </div>
              )}

              {generatedAiImageUrl && (
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-2">
                  <div className="text-stone-300 font-semibold text-xs">تصویر تولید شده:</div>
                  <img
                    src={generatedAiImageUrl}
                    alt="AI Generated"
                    className="max-h-56 mx-auto rounded-xl object-contain border border-stone-700"
                  />
                  <p className="text-[10px] text-emerald-400">تصویر برای فرم محصول تنظیم گردید ✓</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiImageModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                بستن
              </button>
              <button
                type="button"
                onClick={handleGenerateAiImage}
                disabled={!(aiPrompt || "").trim() || isGeneratingAiImage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 text-xs font-black shadow-lg shadow-amber-600/20"
              >
                {isGeneratingAiImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال خلق تصویر هوش مصنوعی...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تولید تصویر با Gemini</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
