import React from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { Branch } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose }) => {
  const { branches, activeBranchId, setActiveBranchId, activeShop } = useTenant();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto text-right flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">انتخاب شعبه کافه</h3>
              <p className="text-xs text-white/50">
                شعب فعال {activeShop.nameFa} جهت آماده‌سازی و ارسال سریع
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Branches List */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
            {branches.map((branch) => {
              const isSelected = branch.id === activeBranchId;
              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setActiveBranchId(branch.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-right space-y-2.5 backdrop-blur-md ${
                    isSelected
                      ? "bg-white/15 border-white/30 shadow-md ring-1 ring-white/20"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-white text-black" : "bg-white/10 text-white/80"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{branch.nameFa}</h4>
                        <span className="text-[10px] text-white/40 font-sans">{branch.name}</span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-black text-xs font-bold shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>شعبه فعال</span>
                      </span>
                    ) : (
                      <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10">
                        انتخاب
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed pr-9">
                    {branch.addressFa}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 pt-2 border-t border-white/10 pr-9">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>{branch.openingHours}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-white/40" />
                      <span dir="ltr">{branch.phone}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-300" />
                      <span>پیک: {formatCurrency(branch.deliveryFee)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              بستن
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
