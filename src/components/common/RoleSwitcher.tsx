import React from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { UserRole } from "../../types";
import { Shield, User, ChefHat, Store, UserCheck, RefreshCw } from "lucide-react";

interface RoleSwitcherProps {
  currentView: "storefront" | "merchant";
  setCurrentView: (view: "storefront" | "merchant") => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentView, setCurrentView }) => {
  const { profile, switchDemoRole } = useAuth();

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: "customer", label: "مشتری فروشگاه (Customer)", icon: User, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { role: "staff", label: "باریستا و آشپزخانه (KDS Staff)", icon: ChefHat, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { role: "shop_manager", label: "مدیر شعبه (Manager)", icon: UserCheck, color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { role: "shop_owner", label: "مالک کافه (Owner)", icon: Store, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { role: "super_admin", label: "مدیر کل پلتفرم (Admin)", icon: Shield, color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  ];

  const handleRoleClick = (role: UserRole) => {
    switchDemoRole(role);
    if (role === "customer") {
      setCurrentView("storefront");
    } else if (currentView === "storefront") {
      setCurrentView("merchant");
    }
  };

  return (
    <aside aria-label="Demo role selector" id="role-switcher-banner" className="bg-black/40 backdrop-blur-2xl border-b border-white/10 px-3.5 py-2 text-xs text-white/80 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-white/50 font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="hidden sm:inline">حالت آزمایشی نقش‌ها:</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[calc(100vw-180px)]">
          {roles.map(({ role, label, icon: Icon, color }) => {
            const isActive = profile?.role === role;
            return (
              <button
                key={role}
                id={`btn-switch-role-${role}`}
                onClick={() => handleRoleClick(role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all backdrop-blur-md whitespace-nowrap ${
                  isActive
                    ? `${color} border shadow-lg shadow-amber-500/10 font-bold scale-105`
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mr-auto">
        <button
          id="btn-toggle-view"
          onClick={() => setCurrentView(currentView === "storefront" ? "merchant" : "storefront")}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-[11px] font-semibold transition-all backdrop-blur-md flex items-center gap-1.5 shadow-sm hover:scale-105"
        >
          <span>{currentView === "storefront" ? "رفتن به پنل مدیریت کافه ←" : "مشاهده فروشگاه آنلاین مشتریان ←"}</span>
        </button>
      </div>
    </aside>
  );
};
