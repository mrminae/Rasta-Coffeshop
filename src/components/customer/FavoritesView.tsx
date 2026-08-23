import React from "react";
import { Product } from "../../types";
import { useTenant } from "../../features/tenant/TenantContext";
import { useCart } from "../../features/cart/CartContext";
import { formatCurrency } from "../../lib/utils";
import { X, Heart, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FavoritesViewProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onSelectProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectProduct,
  onToggleFavorite,
}) => {
  const { products } = useTenant();
  const { addItem } = useCart();

  if (!isOpen) return null;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <Heart className="w-5 h-5 fill-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-base sm:text-lg">علاقه‌مندی‌های من</h3>
                <p className="text-xs text-stone-400">{favoriteProducts.length} آیتم نشان‌شده</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
            {favoriteProducts.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-3">
                <Heart className="w-12 h-12 text-stone-600 mx-auto" />
                <h4 className="font-bold text-stone-200 text-base">لیست علاقه‌مندی‌های شما خالی است</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  با کلیک روی آیکون قلب در کنار هر محصول در منو، آن را به لیست علاقه‌مندی‌ها اضافه کنید.
                </p>
              </div>
            ) : (
              favoriteProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/60 border border-stone-800 hover:border-amber-600/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.nameFa}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-stone-100 text-xs sm:text-sm group-hover:text-amber-400 transition-colors">
                        {prod.nameFa}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-sans">{prod.name}</p>
                      <span className="font-bold text-amber-400 text-xs mt-1 block">
                        {formatCurrency(prod.basePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(prod.id);
                      }}
                      className="p-2 rounded-xl text-rose-400 hover:bg-stone-700 transition-colors"
                      title="حذف از علاقه‌مندی‌ها"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(prod, [], 1);
                        alert(`«${prod.nameFa}» به سبد خرید افزوده شد.`);
                      }}
                      className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all shadow-md"
                      title="افزودن به سبد خرید"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
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
