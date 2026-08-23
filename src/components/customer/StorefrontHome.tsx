import React, { useState, useMemo } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { useCart } from "../../features/cart/CartContext";
import { Product, Order } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { 
  Coffee, 
  Sparkles, 
  Flame, 
  Clock, 
  Search, 
  Plus, 
  ChevronLeft, 
  Award, 
  Heart, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Phone,
  PackageCheck,
  ChefHat
} from "lucide-react";
import { motion } from "motion/react";

interface StorefrontHomeProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAiBarista?: () => void;
  onOpenLoyalty?: () => void;
  onOpenActiveOrder?: (order: Order) => void;
  onOpenBranchModal?: () => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: string[];
}

export const StorefrontHome: React.FC<StorefrontHomeProps> = ({
  searchTerm = "",
  setSearchTerm,
  onSelectProduct,
  onOpenAiBarista,
  onOpenLoyalty,
  onOpenActiveOrder,
  onOpenBranchModal,
  onToggleFavorite,
  favorites = [],
}) => {
  const { activeShop, activeBranch, categories, products, orders } = useTenant();
  const { addItem } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<"all" | "featured" | "popular" | "isNew">("all");

  // Find active live order for customer (e.g. pending, confirmed, preparing, ready)
  const activeLiveOrder = useMemo(() => {
    return orders.find(
      (o) =>
        o.orderStatus === "pending" ||
        o.orderStatus === "confirmed" ||
        o.orderStatus === "preparing" ||
        o.orderStatus === "ready" ||
        o.orderStatus === "out_for_delivery"
    );
  }, [orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod.active || !prod.available) return false;

      // Category filter
      if (selectedCategoryId !== "all" && prod.categoryId !== selectedCategoryId) {
        return false;
      }

      // Tag filter
      if (filterTag === "featured" && !prod.featured) return false;
      if (filterTag === "popular" && !prod.popular) return false;
      if (filterTag === "isNew" && !prod.isNew) return false;

      // Search term
      const term = (searchTerm || "").trim();
      if (term) {
        const q = term.toLowerCase();
        const matchFa = (prod.nameFa || "").toLowerCase().includes(q);
        const matchEn = (prod.name || "").toLowerCase().includes(q);
        const matchDesc = (prod.descriptionFa || "").toLowerCase().includes(q);
        const matchTag = prod.tags?.some((t) => (t || "").toLowerCase().includes(q));
        if (!matchFa && !matchEn && !matchDesc && !matchTag) return false;
      }

      return true;
    });
  }, [products, selectedCategoryId, filterTag, searchTerm]);

  // Featured Spotlight products
  const featuredSpotlights = useMemo(() => {
    return products.filter((p) => p.featured && p.active).slice(0, 3);
  }, [products]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // If product has required modifier groups, open customization modal
    if (product.modifierGroups && product.modifierGroups.some((g) => g.required)) {
      onSelectProduct(product);
    } else {
      addItem(product, [], 1);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Active Live Order Alert Banner (if exists) */}
      {activeLiveOrder && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onOpenActiveOrder(activeLiveOrder)}
            className="p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-amber-400/30 shadow-2xl flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-amber-400/60 hover:bg-white/10 transition-all text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                {activeLiveOrder.orderStatus === "preparing" ? (
                  <ChefHat className="w-5 h-5 animate-bounce" />
                ) : (
                  <PackageCheck className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">
                    سفارش #{activeLiveOrder.orderNumber} در حال پردازش است
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-sm">
                    {activeLiveOrder.orderStatus === "preparing"
                      ? "در حال آماده‌سازی"
                      : activeLiveOrder.orderStatus === "ready"
                      ? "آماده تحویل"
                      : "تأیید شد"}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  شعبه {activeLiveOrder.branchNameFa} • {activeLiveOrder.items.length} قلم کالا • کلیک برای مشاهده وضعیت زنده
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mr-auto">
              <span>مشاهده رهگیری</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-4 text-right">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>برشته‌کاری تخصصی و سفارش آنلاین مستقیم</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  طعم اصیل قهوه تخصصی، <br />
                  <span className="bg-gradient-to-l from-indigo-300 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                    دست‌ساز و تازه با {activeShop.nameFa}
                  </span>
                </h1>

                <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                  {activeShop.descriptionFa} دانه‌های ۱۰۰٪ عربیکا دست‌چین، باریستاهای حرفه‌ای، آماده‌سازی فوری و تحویل گرم در کافه یا ارسال با پیک اختصاصی.
                </p>

                {/* Branch quick info & AI Trigger */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onOpenAiBarista}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>مشاوره با باریستای هوشمند (AI)</span>
                  </button>

                  <button
                    onClick={onOpenLoyalty}
                    className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>امتیازات و کش‌بک وفاداری</span>
                  </button>
                </div>

                {/* Branch badge */}
                {activeBranch && (
                  <div className="pt-2 flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeBranch.addressFa}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>{activeBranch.openingHours}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Hero Visual Spotlight Cards */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <div className="rounded-3xl bg-black/30 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-3">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Star className="w-4 h-4 fill-amber-300" />
                        <span>پیشنهادات ویژه این هفته</span>
                      </span>
                      <span className="text-white/40 font-sans tracking-wider text-[10px]">SPECIAL SELECTION</span>
                    </div>

                    <div className="space-y-2.5">
                      {featuredSpotlights.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onSelectProduct(item)}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.nameFa}
                              className="w-13 h-13 rounded-xl object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="text-right">
                              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                                {item.nameFa}
                              </div>
                              <div className="text-[11px] text-white/40">
                                {item.tags?.slice(0, 2).join(" • ") || "اسپشیالتی"}
                              </div>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="font-black text-amber-300 text-xs sm:text-sm">
                              {formatCurrency(item.basePrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Categories Carousel */}
        <section aria-label="دسته‌بندی‌ها" className="space-y-3 text-right">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              دسته‌بندی‌های منو
            </h2>
            <span className="text-xs text-white/40">
              {categories.length} دسته‌بندی
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer backdrop-blur-md ${
                selectedCategoryId === "all"
                  ? "bg-white text-black shadow-lg shadow-white/20 font-black"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>همه آیتم‌ها ({products.length})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const count = products.filter((p) => p.categoryId === cat.id && p.active).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? "bg-white text-black shadow-lg shadow-white/20 font-black"
                      : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                  }`}
                >
                  <span>{cat.nameFa}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-black text-white" : "bg-white/10 text-white/70"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter Pills & Search Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/40">فیلتر سریع:</span>
            <button
              onClick={() => setFilterTag("all")}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all backdrop-blur-md ${
                filterTag === "all" ? "bg-white/20 text-white border border-white/30" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterTag("popular")}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all backdrop-blur-md ${
                filterTag === "popular" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
            >
              🔥 محبوب‌ترین‌ها
            </button>
            <button
              onClick={() => setFilterTag("featured")}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all backdrop-blur-md ${
                filterTag === "featured" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
            >
              ✨ ویژه باریستا
            </button>
            <button
              onClick={() => setFilterTag("isNew")}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all backdrop-blur-md ${
                filterTag === "isNew" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
            >
              🌿 آیتم‌های جدید
            </button>
          </div>

          <div className="text-white/40">
            نمایش <strong className="text-white">{filteredProducts.length}</strong> محصول
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 space-y-3">
            <Coffee className="w-12 h-12 text-white/30 mx-auto" />
            <h3 className="font-bold text-white text-base">محصولی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              لطفاً فیلترها یا عبارت جستجو را تغییر دهید یا از باریستای هوش مصنوعی کمک بگیرید.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId("all");
                setFilterTag("all");
                setSearchTerm("");
              }}
              className="mt-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 border border-white/15"
            >
              نمایش کل منو
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectProduct(product)}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col cursor-pointer text-right"
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-52 w-full bg-black/40 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.nameFa}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent opacity-90" />

                    {/* Favorite button */}
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product.id);
                        }}
                        aria-label="افزودن به علاقه‌مندی‌ها"
                        className="absolute top-3 left-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 backdrop-blur-md border border-white/10 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    )}

                    {/* Tags on Card */}
                    <div className="absolute bottom-3 right-3 flex flex-wrap gap-1.5">
                      {product.featured && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow">
                          ویژه
                        </span>
                      )}
                      {product.popular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-semibold border border-rose-400/30">
                          محبوب
                        </span>
                      )}
                      {product.isNew && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-semibold border border-emerald-400/30">
                          جدید
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                        {product.nameFa}
                      </h3>
                      <p className="text-[11px] text-white/40 font-sans tracking-wide truncate">
                        {product.name}
                      </p>
                      <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {product.descriptionFa}
                      </p>
                    </div>

                    {/* Prep Time & Calories info */}
                    <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{product.preparationTime} دقیقه</span>
                      </span>
                      {product.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>{product.calories} کالری</span>
                        </span>
                      )}
                    </div>

                    {/* Price & Action button */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="font-black text-amber-300 text-sm sm:text-base">
                          {formatCurrency(product.basePrice)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                          <div className="text-[10px] text-white/30 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs shadow-md shadow-white/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>سفارش</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>

      {/* Brand Value Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 text-right space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">دانه‌های تخصصی ۱۰۰٪ عربیکا</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              روست تخصصی هفتگی در کارگاه مرکزی با کنترل دقیق پروفایل برشته‌کاری جهت استخراج حداکثر عطر و طعم.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 text-right space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">تحویل داغ و سریع</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              آماده‌سازی سفارش به محض تأیید کیچن و ارسال در بسته‌بندی‌های ایزوله حرارتی محافظ عطر قهوه.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 text-right space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">باشگاه مشتریان و کش‌بک</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              با هر سفارش امتیاز کسب کنید و در خریدهای بعدی از تخفیف‌های مستقیم و جوایز دوره‌ای بهره‌مند شوید.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
