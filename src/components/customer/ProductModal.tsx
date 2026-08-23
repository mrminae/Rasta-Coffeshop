import React, { useState, useMemo } from "react";
import { Product, SelectedModifier } from "../../types";
import { useCart } from "../../features/cart/CartContext";
import { formatCurrency } from "../../lib/utils";
import { 
  X, 
  Clock, 
  Flame, 
  Plus, 
  Minus, 
  Check, 
  ShoppingBag, 
  Info, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  // Selected modifiers state mapped by group ID
  const [selectedModifiersByGroup, setSelectedModifiersByGroup] = useState<Record<string, string[]>>(() => {
    if (!product || !product.modifierGroups) return {};
    const defaults: Record<string, string[]> = {};
    product.modifierGroups.forEach((group) => {
      const defaultOpt = group.options.find((o) => o.isDefault) || group.options[0];
      if (defaultOpt && group.required) {
        defaults[group.id] = [defaultOpt.id];
      } else {
        defaults[group.id] = [];
      }
    });
    return defaults;
  });

  // Calculate dynamic price
  const { calculatedPrice, selectedModifiersList } = useMemo(() => {
    if (!product) return { calculatedPrice: 0, selectedModifiersList: [] };

    let totalModifierDelta = 0;
    const list: SelectedModifier[] = [];

    if (product.modifierGroups) {
      product.modifierGroups.forEach((group) => {
        const selectedOptIds = selectedModifiersByGroup[group.id] || [];
        group.options.forEach((opt) => {
          if (selectedOptIds.includes(opt.id)) {
            totalModifierDelta += opt.priceDelta;
            list.push({
              groupId: group.id,
              groupName: group.name,
              groupNameFa: group.nameFa,
              optionId: opt.id,
              optionName: opt.name,
              optionNameFa: opt.nameFa,
              priceDelta: opt.priceDelta,
            });
          }
        });
      });
    }

    const unitPrice = product.basePrice + totalModifierDelta;
    return {
      calculatedPrice: unitPrice * quantity,
      unitPrice,
      selectedModifiersList: list,
    };
  }, [product, selectedModifiersByGroup, quantity]);

  if (!product) return null;

  const handleOptionToggle = (group: any, optionId: string) => {
    setSelectedModifiersByGroup((prev) => {
      const current = prev[group.id] || [];
      if (group.maxSelect === 1) {
        return { ...prev, [group.id]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
        } else {
          if (current.length < group.maxSelect) {
            return { ...prev, [group.id]: [...current, optionId] };
          }
          return prev;
        }
      }
    });
  };

  const handleAddToCart = () => {
    addItem(product, selectedModifiersList, quantity, (notes || "").trim() || undefined);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 450);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-xl bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Image Banner */}
          <div className="relative h-60 sm:h-72 w-full bg-black/60 shrink-0 overflow-hidden">
            <img
              src={product.image}
              alt={product.nameFa}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-black/30" />

            {/* Badges on image */}
            <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
              {product.featured && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-bold shadow-md">
                  پیشنهاد ویژه باریستا
                </span>
              )}
              {product.popular && (
                <span className="px-3 py-1 rounded-full bg-rose-500/80 text-white text-xs font-semibold backdrop-blur-md border border-rose-400/30">
                  محبوب‌ترین
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-semibold backdrop-blur-md border border-emerald-400/30">
                  آیتم جدید
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
            
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                    {product.nameFa}
                  </h2>
                  <p className="text-xs text-white/40 font-sans tracking-wide">
                    {product.name}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-lg sm:text-xl font-black text-amber-300">
                    {formatCurrency(product.basePrice)}
                  </div>
                  {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                    <div className="text-xs text-white/30 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed">
                {product.descriptionFa}
              </p>

              {/* Meta pills: Prep time & calories */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>زمان آماده‌سازی: {product.preparationTime} دقیقه</span>
                </div>
                {product.calories && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>کالری: {product.calories} کیلوکالری</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients & Allergens */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                <div className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-300" />
                  <span>ترکیبات و طعم‌یادها:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] text-white/80 border border-white/10"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
                {product.allergens && product.allergens.length > 0 && (
                  <div className="text-[11px] text-amber-300 flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>اطلاعات حساسیت‌زا: {product.allergens.join("، ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Modifier Groups Customization */}
            {product.modifierGroups && product.modifierGroups.length > 0 && (
              <div className="space-y-5 border-t border-white/10 pt-5">
                <h3 className="text-sm font-bold text-white">
                  شخصی‌سازی سفارش و افزودنی‌ها
                </h3>

                {product.modifierGroups.map((group) => {
                  const selectedIds = selectedModifiersByGroup[group.id] || [];
                  return (
                    <div key={group.id} className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white/90">
                          {group.nameFa}
                          {group.required && (
                            <span className="text-amber-400 text-[10px] mr-1.5 font-normal">(اجباری)</span>
                          )}
                        </span>
                        <span className="text-white/40 text-[11px]">
                          {group.maxSelect === 1 ? "یک مورد انتخاب کنید" : `حداکثر ${group.maxSelect} مورد`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.options.map((opt) => {
                          const isSelected = selectedIds.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleOptionToggle(group, opt.id)}
                              className={`flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer backdrop-blur-md ${
                                isSelected
                                  ? "bg-white/15 border-white/30 text-white shadow-sm"
                                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? "bg-white border-white text-black"
                                      : "border-white/30 bg-black/30"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-medium">{opt.nameFa}</span>
                              </div>

                              {opt.priceDelta > 0 ? (
                                <span className="text-[11px] font-semibold text-amber-300">
                                  +{formatCurrency(opt.priceDelta)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-white/40">رایگان</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Special Instructions Note */}
            <div className="border-t border-white/10 pt-4">
              <label htmlFor="customer-notes" className="block text-xs font-semibold text-white/80 mb-1.5">
                یادداشت یا توضیحات خاص به باریستا (اختیاری):
              </label>
              <textarea
                id="customer-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: کم‌حرارت باشد، فوم اضافه، بدون نی پلاستیکی..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none backdrop-blur-md"
              />
            </div>

          </div>

          {/* Modal Footer (Sticky Quantity + Add to Cart) */}
          <div className="p-4 sm:p-5 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between gap-4 shrink-0">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-white text-sm px-2 min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-between px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
                isAdded
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-white text-black hover:bg-white/90 shadow-white/10 active:scale-98"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{isAdded ? "به سبد خرید افزوده شد ✓" : "افزودن به سبد خرید"}</span>
              </div>
              <span className="font-black">
                {formatCurrency(calculatedPrice)}
              </span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
