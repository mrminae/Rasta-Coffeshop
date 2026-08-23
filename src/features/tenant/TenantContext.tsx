import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  db, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  onSnapshot, 
  query, 
  where 
} from "../../lib/firebase";
import { 
  CoffeeShop, 
  Branch, 
  Category, 
  Product, 
  Coupon, 
  Order, 
  OrderStatus 
} from "../../types";
import { 
  initialCoffeeShops, 
  initialBranches, 
  initialCategories, 
  initialProducts, 
  initialCoupons 
} from "../../lib/seedData";

interface TenantContextType {
  coffeeShops: CoffeeShop[];
  activeShop: CoffeeShop;
  branches: Branch[];
  activeBranch: Branch | null;
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  setActiveShopId: (shopId: string) => void;
  setActiveBranchId: (branchId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason?: string) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  saveBranch: (branch: Branch) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  saveOrder: (order: Order) => Promise<void>;
  refreshTenantData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>(initialCoffeeShops);
  const [activeShopId, setActiveShopIdState] = useState<string>("shop-lamiz");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const activeShop = coffeeShops.find((s) => s.id === activeShopId) || coffeeShops[0] || initialCoffeeShops[0];

  // Initialize & Seed Database if needed
  useEffect(() => {
    async function initializeTenantData() {
      try {
        // Check coffee shops
        const shopsSnap = await getDocs(collection(db, "coffeeShops"));
        if (shopsSnap.empty) {
          for (const s of initialCoffeeShops) {
            await setDoc(doc(db, "coffeeShops", s.id), s);
          }
          for (const b of initialBranches) {
            await setDoc(doc(db, "branches", b.id), b);
          }
          for (const c of initialCategories) {
            await setDoc(doc(db, "categories", c.id), c);
          }
          for (const p of initialProducts) {
            await setDoc(doc(db, "products", p.id), p);
          }
          for (const cp of initialCoupons) {
            await setDoc(doc(db, "coupons", cp.id), cp);
          }
        }
      } catch (err) {
        console.warn("Firestore seed note (using client state if offline):", err);
      }
    }
    initializeTenantData();
  }, []);

  // Sync Active Tenant Data
  useEffect(() => {
    // 1. Branches for active shop
    const branchUnsub = onSnapshot(
      query(collection(db, "branches"), where("coffeeShopId", "==", activeShopId)),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Branch);
          setBranches(list);
          if (!activeBranch || !list.some((b) => b.id === activeBranch.id)) {
            setActiveBranch(list[0] || null);
          }
        } else {
          const fallback = initialBranches.filter((b) => b.coffeeShopId === activeShopId);
          setBranches(fallback);
          setActiveBranch(fallback[0] || null);
        }
      },
      () => {
        const fallback = initialBranches.filter((b) => b.coffeeShopId === activeShopId);
        setBranches(fallback);
        setActiveBranch(fallback[0] || null);
      }
    );

    // 2. Categories
    const catUnsub = onSnapshot(
      query(collection(db, "categories")),
      (snapshot) => {
        if (!snapshot.empty) {
          setCategories(snapshot.docs.map((d) => d.data() as Category));
        } else {
          setCategories(initialCategories);
        }
      },
      () => setCategories(initialCategories)
    );

    // 3. Products
    const prodUnsub = onSnapshot(
      query(collection(db, "products"), where("coffeeShopId", "==", activeShopId)),
      (snapshot) => {
        if (!snapshot.empty) {
          setProducts(snapshot.docs.map((d) => d.data() as Product));
        } else {
          setProducts(initialProducts.filter((p) => p.coffeeShopId === activeShopId));
        }
      },
      () => setProducts(initialProducts.filter((p) => p.coffeeShopId === activeShopId))
    );

    // 4. Coupons
    const couponUnsub = onSnapshot(
      query(collection(db, "coupons"), where("coffeeShopId", "==", activeShopId)),
      (snapshot) => {
        if (!snapshot.empty) {
          setCoupons(snapshot.docs.map((d) => d.data() as Coupon));
        } else {
          setCoupons(initialCoupons.filter((c) => c.coffeeShopId === activeShopId));
        }
      },
      () => setCoupons(initialCoupons.filter((c) => c.coffeeShopId === activeShopId))
    );

    // 5. Orders
    const orderUnsub = onSnapshot(
      query(collection(db, "orders"), where("coffeeShopId", "==", activeShopId)),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Order);
          list.sort((a, b) => new Date(b.timestamps.created).getTime() - new Date(a.timestamps.created).getTime());
          setOrders(list);
        }
      },
      (err) => console.warn("Order snapshot warning:", err)
    );

    return () => {
      branchUnsub();
      catUnsub();
      prodUnsub();
      couponUnsub();
      orderUnsub();
    };
  }, [activeShopId]);

  const setActiveShopId = (shopId: string) => {
    setActiveShopIdState(shopId);
  };

  const setActiveBranchId = (branchId: string) => {
    const found = branches.find((b) => b.id === branchId);
    if (found) setActiveBranch(found);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, rejectionReason?: string) => {
    const timestampKey = 
      status === "confirmed" ? "confirmed" :
      status === "preparing" ? "preparing" :
      status === "ready" ? "ready" :
      status === "out_for_delivery" ? "outForDelivery" :
      status === "completed" ? "completed" :
      status === "cancelled" ? "cancelled" : undefined;

    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        const timestamps = { ...ord.timestamps };
        if (timestampKey) {
          (timestamps as any)[timestampKey] = new Date().toISOString();
        }
        return {
          ...ord,
          orderStatus: status,
          rejectionReason: rejectionReason || ord.rejectionReason,
          timestamps,
        };
      }
      return ord;
    });

    setOrders(updatedOrders);

    try {
      const orderRef = doc(db, "orders", orderId);
      const payload: any = {
        orderStatus: status,
      };
      if (rejectionReason) payload.rejectionReason = rejectionReason;
      if (timestampKey) {
        payload[`timestamps.${timestampKey}`] = new Date().toISOString();
      }
      await setDoc(orderRef, payload, { merge: true });
    } catch (err) {
      console.warn("Update order status Firestore note:", err);
    }
  };

  const saveProduct = async (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
    try {
      await setDoc(doc(db, "products", product.id), product, { merge: true });
    } catch (err) {
      console.warn("Product save note:", err);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await setDoc(doc(db, "products", productId), { active: false, available: false }, { merge: true });
    } catch (err) {
      console.warn("Product delete note:", err);
    }
  };

  const saveCategory = async (category: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
    try {
      await setDoc(doc(db, "categories", category.id), category, { merge: true });
    } catch (err) {
      console.warn("Category save note:", err);
    }
  };

  const saveBranch = async (branch: Branch) => {
    setBranches((prev) => {
      const idx = prev.findIndex((b) => b.id === branch.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = branch;
        return copy;
      }
      return [...prev, branch];
    });
    try {
      await setDoc(doc(db, "branches", branch.id), branch, { merge: true });
    } catch (err) {
      console.warn("Branch save note:", err);
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === coupon.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = coupon;
        return copy;
      }
      return [coupon, ...prev];
    });
    try {
      await setDoc(doc(db, "coupons", coupon.id), coupon, { merge: true });
    } catch (err) {
      console.warn("Coupon save note:", err);
    }
  };

  const saveOrder = async (order: Order) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    try {
      await setDoc(doc(db, "orders", order.id), order);
    } catch (err) {
      console.warn("Order save note:", err);
    }
  };

  const refreshTenantData = async () => {
    // No-op or trigger reload
  };

  return (
    <TenantContext.Provider
      value={{
        coffeeShops,
        activeShop,
        branches,
        activeBranch,
        categories,
        products,
        coupons,
        orders,
        setActiveShopId,
        setActiveBranchId,
        updateOrderStatus,
        saveProduct,
        deleteProduct,
        saveCategory,
        saveBranch,
        saveCoupon,
        saveOrder,
        refreshTenantData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
