import React from "react";
import { Home, Coffee, ShoppingBag, History, User } from "lucide-react";
import { useCart } from "../../features/cart/CartContext";

interface MobileBottomNavProps {
  activeTab: "home" | "menu" | "orders" | "profile";
  setActiveTab: (tab: "home" | "menu" | "orders" | "profile") => void;
  onOpenCart: () => void;
  onOpenOrderHistory: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenOrderHistory,
  onOpenProfile,
}) => {
  const { itemCount } = useCart();

  return (
    <nav aria-label="ناوبری اصلی موبایل" id="mobile-bottom-nav" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-3xl border-t border-white/10 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === "home" ? "text-amber-400 font-bold" : "text-white/50 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>خانه</span>
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === "menu" ? "text-amber-400 font-bold" : "text-white/50 hover:text-white"
          }`}
        >
          <Coffee className="w-5 h-5" />
          <span>منو</span>
        </button>

        {/* Floating Cart Button */}
        <button
          onClick={onOpenCart}
          className="relative -top-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-amber-500 text-stone-950 shadow-xl shadow-amber-500/30 border-4 border-[#0c0c14] active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-stone-950 text-amber-400 rounded-full text-[10px] font-black border border-amber-400">
              {itemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("orders");
            onOpenOrderHistory();
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === "orders" ? "text-amber-400 font-bold" : "text-white/50 hover:text-white"
          }`}
        >
          <History className="w-5 h-5" />
          <span>سفارش‌ها</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("profile");
            onOpenProfile();
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === "profile" ? "text-amber-400 font-bold" : "text-white/50 hover:text-white"
          }`}
        >
          <User className="w-5 h-5" />
          <span>پروفایل</span>
        </button>
      </div>
    </nav>
  );
};
