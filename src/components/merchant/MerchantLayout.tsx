import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { useAuth } from "../../features/auth/AuthContext";
import { 
  LayoutDashboard, 
  ChefHat, 
  ShoppingBag, 
  Coffee, 
  Layers, 
  Tag, 
  MapPin, 
  Users, 
  Sparkles, 
  Settings, 
  ArrowRight, 
  Menu, 
  X, 
  Store,
  ChevronDown
} from "lucide-react";
import { MerchantDashboard } from "./MerchantDashboard";
import { KitchenDisplaySystem } from "./KitchenDisplaySystem";
import { OrderManagement } from "./OrderManagement";
import { ProductManagement } from "./ProductManagement";
import { CategoryManagement } from "./CategoryManagement";
import { CouponManagement } from "./CouponManagement";
import { BranchManagement } from "./BranchManagement";
import { CustomerManagement } from "./CustomerManagement";
import { MerchantAiAdvisor } from "./MerchantAiAdvisor";
import { SettingsManagement } from "./SettingsManagement";
import { RoleSwitcher } from "../common/RoleSwitcher";

interface MerchantLayoutProps {
  onBackToStorefront: () => void;
}

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({ onBackToStorefront }) => {
  const { allShops, activeShop, switchShop, branches, activeBranch, switchBranch, orders } = useTenant();
  const { profile } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed" || o.orderStatus === "preparing").length;

  const navItems = [
    { id: "dashboard", label: "داشبورد و آمار", icon: LayoutDashboard },
    { id: "kds", label: "نمایشگر آشپزخانه (KDS)", icon: ChefHat, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined },
    { id: "orders", label: "مدیریت سفارش‌ها", icon: ShoppingBag, badge: orders.length.toString() },
    { id: "products", label: "محصولات و تصاویر AI", icon: Coffee },
    { id: "categories", label: "دسته‌بندی‌ها", icon: Layers },
    { id: "coupons", label: "کوپن و تخفیف‌ها", icon: Tag },
    { id: "branches", label: "شعب و پیک", icon: MapPin },
    { id: "customers", label: "باشگاه مشتریان (CRM)", icon: Users },
    { id: "ai-advisor", label: "مشاور هوش مصنوعی Gemini", icon: Sparkles, isAi: true },
    { id: "settings", label: "تنظیمات کافه", icon: Settings },
  ];

  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return <MerchantDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
      case "kds":
        return <KitchenDisplaySystem />;
      case "orders":
        return <OrderManagement />;
      case "products":
        return <ProductManagement />;
      case "categories":
        return <CategoryManagement />;
      case "coupons":
        return <CouponManagement />;
      case "branches":
        return <BranchManagement />;
      case "customers":
        return <CustomerManagement />;
      case "ai-advisor":
        return <MerchantAiAdvisor />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <MerchantDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c14] text-white flex flex-col md:flex-row antialiased font-sans select-none relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Demo Bar for quick switching */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <RoleSwitcher onOpenSettings={() => setCurrentTab("settings")} />
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-black/40 backdrop-blur-3xl border-l border-white/10 pt-16 h-screen sticky top-0 shrink-0 z-30 shadow-2xl">
        {/* Merchant & Tenant Selector */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 text-indigo-300 flex items-center justify-center font-black backdrop-blur-md">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 font-semibold">سامانه ابری مدیریت کافه</div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">
                  {activeShop.nameFa}
                </div>
              </div>
            </div>

            <button
              onClick={onBackToStorefront}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 border border-white/15 text-xs transition-colors backdrop-blur-md"
              title="مشاهده فروشگاه مشتریان"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tenant Switcher dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 font-medium">کافه فعال (تغییر تِنِنت):</label>
            <select
              value={activeShop.id}
              onChange={(e) => switchShop(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white backdrop-blur-md focus:border-indigo-400 focus:outline-none"
            >
              {allShops.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0c0c14] text-white">
                  {s.nameFa} ({s.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 overflow-y-auto flex-1 text-right scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? item.isAi
                      ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 border border-white/20"
                      : "bg-white text-black shadow-md shadow-white/20 font-black"
                    : item.isAi
                    ? "text-indigo-300 hover:bg-white/10 border border-indigo-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.isAi && !isActive ? "text-indigo-400 animate-pulse" : ""}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white/10 text-white/80 border border-white/10"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Storefront bottom banner */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onBackToStorefront}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فروشگاه آنلاین</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-black/40 backdrop-blur-3xl border-b border-white/10 mt-10 sticky top-10 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-xl bg-white/10 text-white border border-white/15"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-white text-sm">{activeShop.nameFa}</span>
        </div>

        <button
          onClick={onBackToStorefront}
          className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow"
        >
          فروشگاه مشتریان ➔
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/80 backdrop-blur-md pt-28 p-4">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold ${
                    isActive ? "bg-white text-black" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 md:pt-16 max-w-7xl mx-auto w-full overflow-y-auto">
        {renderActiveView()}
      </main>

    </div>
  );
};
