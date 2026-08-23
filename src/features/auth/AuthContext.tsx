import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  type User
} from "../../lib/firebase";
import { UserProfile, UserRole } from "../../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo profile seeds for instant showcase across roles
const defaultProfiles: Record<UserRole, UserProfile> = {
  customer: {
    id: "demo-customer-1",
    email: "customer@coffeeplus.app",
    displayName: "مبینا سلیمانی (مشتری وفادار)",
    phoneNumber: "۰۹۱۲۳۴۵۶۷۸۹",
    role: "customer",
    coffeeShopId: "shop-lamiz",
    createdAt: new Date().toISOString(),
  },
  staff: {
    id: "demo-staff-1",
    email: "barista@lamiz.com",
    displayName: "امیرحسین باریستا (آشپزخانه و بار)",
    phoneNumber: "۰۹۱۲۰۹۸۷۶۵۴",
    role: "staff",
    coffeeShopId: "shop-lamiz",
    branchId: "branch-lamiz-tajrish",
    createdAt: new Date().toISOString(),
  },
  shop_manager: {
    id: "demo-manager-1",
    email: "manager@lamiz.com",
    displayName: "سارا رضایی (مدیر شعبه تجریش)",
    phoneNumber: "۰۹۱۹۸۷۶۵۴۳۲",
    role: "shop_manager",
    coffeeShopId: "shop-lamiz",
    branchId: "branch-lamiz-tajrish",
    createdAt: new Date().toISOString(),
  },
  shop_owner: {
    id: "demo-owner-1",
    email: "owner@lamiz.com",
    displayName: "مهندس کمالی (مالک کافه لمیز)",
    phoneNumber: "۰۹۱۲۱۱۱۱۱۱۱",
    role: "shop_owner",
    coffeeShopId: "shop-lamiz",
    createdAt: new Date().toISOString(),
  },
  super_admin: {
    id: "demo-admin-1",
    email: "admin@coffeeplus.app",
    displayName: "مدیر ارشد پلتفرم کافه پلاس (Super Admin)",
    phoneNumber: "۰۹۱۲۰۰۰۰۰۰۰",
    role: "super_admin",
    createdAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("coffeeplus_demo_role");
    const role = (saved as UserRole) || "customer";
    return defaultProfiles[role] || defaultProfiles.customer;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setProfile(userDocSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "مشتری گرامی",
              photoURL: currentUser.photoURL || undefined,
              phoneNumber: currentUser.phoneNumber || undefined,
              role: "customer",
              coffeeShopId: "shop-lamiz",
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Firestore user profile fetch error:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        const newProfile: UserProfile = {
          id: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "کاربر جدید",
          photoURL: result.user.photoURL || undefined,
          role: "customer",
          coffeeShopId: "shop-lamiz",
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(userDocSnap.data() as UserProfile);
      }
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, "users", result.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setProfile(userDocSnap.data() as UserProfile);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      id: result.user.uid,
      email: result.user.email || email,
      displayName: name,
      role: "customer",
      coffeeShopId: "shop-lamiz",
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", result.user.uid), newProfile);
    setProfile(newProfile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(defaultProfiles.customer);
    localStorage.removeItem("coffeeplus_demo_role");
  };

  const switchDemoRole = (role: UserRole) => {
    localStorage.setItem("coffeeplus_demo_role", role);
    setProfile(defaultProfiles[role]);
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), updated, { merge: true });
      } catch (err) {
        console.error("Failed to update profile:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        switchDemoRole,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
