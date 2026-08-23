import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Coupon, FulfillmentType, Order, Product, SelectedModifier } from "../../types";
import { useTenant } from "../tenant/TenantContext";
import { useAuth } from "../auth/AuthContext";
import { db, doc, setDoc, getDoc } from "../../lib/firebase";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  fulfillmentType: FulfillmentType;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  addItem: (product: Product, selectedModifiers: SelectedModifier[], quantity?: number, notes?: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  reorderPastOrder: (order: Order) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeShop, activeBranch, coupons, products } = useTenant();
  const { user, profile } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("coffeeplus_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync to local storage & Firestore if user is authenticated
  useEffect(() => {
    try {
      localStorage.setItem("coffeeplus_cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Local storage cart save error:", e);
    }

    if (user) {
      try {
        setDoc(doc(db, "carts", user.uid), {
          customerId: user.uid,
          coffeeShopId: activeShop.id,
          items,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn("Firestore cart sync note:", err);
      }
    }
  }, [items, user, activeShop.id]);

  const addItem = (
    product: Product, 
    selectedModifiers: SelectedModifier[], 
    quantity: number = 1, 
    notes?: string
  ) => {
    const modifierDeltaTotal = selectedModifiers.reduce((acc, mod) => acc + mod.priceDelta, 0);
    const unitPrice = product.basePrice + modifierDeltaTotal;
    const itemTotal = unitPrice * quantity;

    // Check if identical item (same productId and same sorted modifier option IDs) already in cart
    const modSignature = selectedModifiers.map((m) => m.optionId).sort().join(",");
    const existingIndex = items.findIndex((i) => {
      const iModSig = i.selectedModifiers.map((m) => m.optionId).sort().join(",");
      return i.productId === product.id && iModSig === modSignature;
    });

    if (existingIndex >= 0) {
      const updated = [...items];
      const current = updated[existingIndex];
      const newQty = current.quantity + quantity;
      updated[existingIndex] = {
        ...current,
        quantity: newQty,
        itemTotal: current.unitPrice * newQty,
        notes: notes || current.notes,
      };
      setItems(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        nameFa: product.nameFa,
        image: product.image,
        basePrice: product.basePrice,
        unitPrice,
        quantity,
        itemTotal,
        selectedModifiers,
        notes,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: newQty,
              itemTotal: item.unitPrice * newQty,
            }
          : item
      )
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Calculations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);

  let discount = 0;
  if (appliedCoupon && appliedCoupon.active) {
    if (!appliedCoupon.minOrderAmount || subtotal >= appliedCoupon.minOrderAmount) {
      if (appliedCoupon.discountType === "percentage") {
        discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
          discount = appliedCoupon.maxDiscountAmount;
        }
      } else if (appliedCoupon.discountType === "fixed") {
        discount = Math.min(subtotal, appliedCoupon.discountValue);
      }
    }
  }

  const deliveryFee = fulfillmentType === "delivery" ? (activeBranch?.deliveryFee || 25000) : 0;
  const tax = Math.round((subtotal - discount) * 0.09); // 9% VAT
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const applyCouponCode = (code?: string): boolean => {
    setCouponError(null);
    if (!code) {
      setCouponError("لطفاً کد تخفیف را وارد نمایید.");
      return false;
    }
    const cleaned = (code || "").trim().toUpperCase();
    if (!cleaned) {
      setCouponError("لطفاً کد تخفیف را وارد نمایید.");
      return false;
    }
    const found = coupons.find((c) => (c.code || "").toUpperCase() === cleaned && c.active);

    if (!found) {
      setCouponError("کد تخفیف وارد شده معتبر نیست یا منقضی شده است.");
      return false;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      setCouponError(`این کد تخفیف برای سفارش‌های بالای ${new Intl.NumberFormat("fa-IR").format(found.minOrderAmount)} تومان قابل استفاده است.`);
      return false;
    }

    setAppliedCoupon(found);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Safe Reorder with latest pricing verification
  const reorderPastOrder = (pastOrder: Order): boolean => {
    if (!pastOrder.items || pastOrder.items.length === 0) return false;

    const freshItems: CartItem[] = [];
    for (const oldItem of pastOrder.items) {
      const freshProd = products.find((p) => p.id === oldItem.productId);
      if (freshProd && freshProd.available && freshProd.active) {
        const modTotal = oldItem.selectedModifiers.reduce((acc, m) => acc + (m.priceDelta || 0), 0);
        const unitPrice = freshProd.basePrice + modTotal;
        freshItems.push({
          ...oldItem,
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          basePrice: freshProd.basePrice,
          unitPrice,
          itemTotal: unitPrice * oldItem.quantity,
        });
      }
    }

    if (freshItems.length > 0) {
      setItems(freshItems);
      setFulfillmentType(pastOrder.fulfillmentType);
      return true;
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        fulfillmentType,
        appliedCoupon,
        couponError,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setFulfillmentType,
        applyCouponCode,
        removeCoupon,
        reorderPastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
