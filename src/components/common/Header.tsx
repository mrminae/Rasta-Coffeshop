import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { useCart } from "../../features/cart/CartContext";
import { useAuth } from "../../features/auth/AuthContext";
import { 
  Coffee, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  User as UserIcon, 
  ChevronDown, 
  Search, 
  History, 
  Heart, 
  Award,
  Store,
  LogOut,
  SlidersHorizontal
} from "lucide-react";

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAiBarista: () => void;
  onOpenAuth: () => void;
  onOpenBranchModal: () => void;
  onOpenOrderHistory: () => void;
  onOpenFavorites: () => void;
  onOpenLoyalty: () => void;
  onOpenProfile: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSwitchToMerchant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAiBarista,
  onOpenAuth,
  onOpenBranchModal,
  onOpenOrderHistory,
  onOpenFavorites,
  onOpenLoyalty,
  onOpenProfile,
  searchTerm,
  setSearchTerm,
  onSwitchToMerchant,
}) => {
  const { coffeeShops, activeShop, setActiveShopId, activeBranch } = useTenant();
  const { itemCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header id="main-storefront-header" className="sticky top-[37px] z-40 bg-white/[0.04] backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand & Tenant Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                id="btn-tenant-switcher"
                onClick={() => setShowShopDropdown(!showShopDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-white/10 transition-all text-right group backdrop-blur-md"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20">
                  <img
                    src={activeShop.logoUrl}
                    alt={activeShop.nameFa}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                      {activeShop.nameFa}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-amber-300 transition-transform" />
                  </div>
                  <span className="text-[11px] text-white/40 block font-light">
                    {activeShop.name}
                  </span>
                </div>
              </button>

              {/* Tenant Dropdown */}
              {showShopDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#12111f]/95 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-white/50 px-3 py-1.5 mb-1 border-b border-white/10">
                    انتخاب کافه (چندمستأجره SaaS)
                  </div>
                  {coffeeShops.map((shop) => (
                    <button
                      key={shop.id}
                      id={`tenant-option-${shop.id}`}
                      onClick={() => {
                        setActiveShopId(shop.id);
                        setShowShopDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-right ${
                        shop.id === activeShop.id
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "hover:bg-white/10 text-white/70"
                      }`}
                    >
                      <img src={shop.logoUrl} alt={shop.nameFa} className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs text-white">{shop.nameFa}</div>
                        <div className="text-[10px] text-white/40">{shop.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Branch Selector Pill */}
            <button
              id="btn-header-branch-select"
              onClick={onOpenBranchModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs backdrop-blur-md transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {activeBranch ? activeBranch.nameFa : "انتخاب شعبه"}
              </span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-2">
            <div className="relative w-full">
              <input
                id="search-input-desktop"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی قهوه، لاته، کروسان، دسر..."
                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-full py-2 pr-9 pl-4 text-xs sm:text-sm text-white placeholder-white/30 backdrop-blur-md focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Barista Assistant Button */}
            <button
              id="btn-header-ai-barista"
              onClick={onOpenAiBarista}
              className="relative group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
              <span className="hidden sm:inline">باریستای هوش مصنوعی</span>
              <span className="sm:hidden">باریستا</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </button>

            {/* Loyalty Quick Access */}
            <button
              id="btn-header-loyalty"
              onClick={onOpenLoyalty}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              <span>باشگاه مشتریان</span>
            </button>

            {/* Favorites */}
            <button
              id="btn-header-favorites"
              onClick={onOpenFavorites}
              aria-label="علاقه‌مندی‌ها"
              className="hidden sm:flex p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-rose-400 border border-white/10 backdrop-blur-md transition-all hover:scale-105"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Past Orders */}
            <button
              id="btn-header-orders"
              onClick={onOpenOrderHistory}
              aria-label="سفارش‌های من"
              className="hidden sm:flex p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-amber-400 border border-white/10 backdrop-blur-md transition-all hover:scale-105"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-header-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950" />
              <span className="hidden sm:inline">سبد خرید</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded-full text-[11px] font-black animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              {user || profile ? (
                <div>
                  <button
                    id="btn-header-profile-menu"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-right"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                      {profile?.displayName?.charAt(0) || "ک"}
                    </div>
                    <ChevronDown className="w-3 h-3 text-white/40 hidden sm:block" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-[#12111f]/95 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl p-2 z-50 text-right animate-in fade-in">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="font-bold text-white text-xs truncate">
                          {profile?.displayName || "کاربر کافه پلاس"}
                        </div>
                        <div className="text-[10px] text-white/40 truncate">
                          {profile?.email || "کاربر گرامی"}
                        </div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                          نقش: {profile?.role}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-white/40" />
                        <span>پروفایل و آدرس‌ها</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenLoyalty();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>امتیازات و جوایز</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrderHistory();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-white/40" />
                        <span>تاریخچه سفارش‌ها</span>
                      </button>

                      {profile && profile.role !== "customer" && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onSwitchToMerchant();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 my-1 font-semibold transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                          <span>پنل مدیریت و آشپزخانه</span>
                        </button>
                      )}

                      <div className="border-t border-white/10 my-1" />

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج از حساب</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-header-login"
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 shadow-sm"
                >
                  ورود / ثبت‌نام
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
