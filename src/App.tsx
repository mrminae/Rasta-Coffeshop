/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { TenantProvider, useTenant } from "./features/tenant/TenantContext";
import { CartProvider, useCart } from "./features/cart/CartContext";
import { Product } from "./types";

// Common Components
import { Header } from "./components/common/Header";
import { MobileBottomNav } from "./components/common/MobileBottomNav";
import { RoleSwitcher } from "./components/common/RoleSwitcher";

// Customer Components
import { StorefrontHome } from "./components/customer/StorefrontHome";
import { ProductModal } from "./components/customer/ProductModal";
import { CartDrawer } from "./components/customer/CartDrawer";
import { CheckoutModal } from "./components/customer/CheckoutModal";
import { OrderTrackerModal } from "./components/customer/OrderTrackerModal";
import { OrderHistoryView } from "./components/customer/OrderHistoryView";
import { LoyaltyView } from "./components/customer/LoyaltyView";
import { BranchModal } from "./components/customer/BranchModal";
import { BaristaAiModal } from "./components/customer/BaristaAiModal";
import { AuthModal } from "./components/customer/AuthModal";
import { FavoritesView } from "./components/customer/FavoritesView";
import { ProfileModal } from "./components/customer/ProfileModal";

// Merchant Components
import { MerchantLayout } from "./components/merchant/MerchantLayout";

const MainApp: React.FC = () => {
  const { activeShop, activeBranch, orders } = useTenant();
  const { user, profile } = useAuth();
  const { totalItems } = useCart();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "orders" | "loyalty" | "merchant">("home");

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isBaristaAiOpen, setIsBaristaAiOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search term
  const [searchTerm, setSearchTerm] = useState("");

  // Favorites state persisted locally
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("coffee_favorites");
      return saved ? JSON.parse(saved) : ["prod-1", "prod-3"];
    } catch {
      return ["prod-1", "prod-3"];
    }
  });

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("coffee_favorites", JSON.stringify(next));
      return next;
    });
  };

  // If role changes to merchant/barista and user is in customer storefront, show merchant badge
  const isMerchantRole = profile?.role === "merchant_admin" || profile?.role === "barista";

  // If in Merchant Dashboard mode
  if (activeTab === "merchant") {
    return (
      <MerchantLayout
        onBackToStorefront={() => setActiveTab("home")}
      />
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col antialiased selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Ambient background glow orbs */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/3 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      {/* Top Demo Bar for quick role/shop switching */}
      <RoleSwitcher currentView={activeTab === "merchant" ? "merchant" : "storefront"} setCurrentView={(v) => setActiveTab(v === "merchant" ? "merchant" : "home")} />

      {/* Main Storefront Header */}
      <div className="mt-8">
        <Header
          onOpenCart={() => setIsCartOpen(true)}
          onOpenBranchModal={() => setIsBranchModalOpen(true)}
          onOpenAiBarista={() => setIsBaristaAiOpen(true)}
          onOpenAuth={() => {
            if (user) {
              setIsProfileOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          onOpenOrderHistory={() => setActiveTab("orders")}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenLoyalty={() => setActiveTab("loyalty")}
          onOpenProfile={() => setIsProfileOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSwitchToMerchant={() => setActiveTab("merchant")}
        />
      </div>

      {/* Main Body Content based on active tab */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {activeTab === "home" || activeTab === "menu" ? (
          <StorefrontHome
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onOpenAiBarista={() => setIsBaristaAiOpen(true)}
            onOpenBranchModal={() => setIsBranchModalOpen(true)}
            onOpenLoyalty={() => setActiveTab("loyalty")}
            onOpenActiveOrder={(order) => {
              setActiveTrackingOrderId(order.id);
              setIsOrderTrackerOpen(true);
            }}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : activeTab === "orders" ? (
          <OrderHistoryView
            onTrackOrder={(orderId) => {
              setActiveTrackingOrderId(orderId);
              setIsOrderTrackerOpen(true);
            }}
            onReorderProduct={(product) => setSelectedProduct(product)}
          />
        ) : activeTab === "loyalty" ? (
          <LoyaltyView
            onOpenMenu={() => setActiveTab("home")}
            onOpenAiBarista={() => setIsBaristaAiOpen(true)}
          />
        ) : null}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiBarista={() => setIsBaristaAiOpen(true)}
      />

      {/* Modals & Drawers */}
      
      {/* Product Customizer Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setIsOrderTrackerOpen(true);
        }}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        orderId={activeTrackingOrderId}
      />

      {/* Barista AI Assistant Modal (Gemini 3.1 Flash Lite + Gemini 3.5 Flash Grounding) */}
      <BaristaAiModal
        isOpen={isBaristaAiOpen}
        onClose={() => setIsBaristaAiOpen(false)}
        onSelectProduct={(product) => {
          setIsBaristaAiOpen(false);
          setSelectedProduct(product);
        }}
      />

      {/* Branch Selector Modal */}
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Favorites Modal */}
      <FavoritesView
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectProduct={(prod) => {
          setIsFavoritesOpen(false);
          setSelectedProduct(prod);
        }}
        onToggleFavorite={toggleFavorite}
      />

      {/* Customer Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
