export type UserRole = 'super_admin' | 'shop_owner' | 'shop_manager' | 'staff' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  coffeeShopId?: string;
  branchId?: string;
  createdAt: string;
}

export interface CoffeeShop {
  id: string;
  name: string;
  nameFa: string;
  slug: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
  descriptionFa: string;
  phone: string;
  themeColor: string;
  currency: string;
  active: boolean;
  createdAt: string;
  instagram?: string;
}

export interface Branch {
  id: string;
  coffeeShopId: string;
  name: string;
  nameFa: string;
  address: string;
  addressFa: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: string;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  deliveryFee: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  active: boolean;
}

export interface Category {
  id: string;
  coffeeShopId: string;
  name: string;
  nameFa: string;
  icon: string;
  sortOrder: number;
  active: boolean;
  description?: string;
  descriptionFa?: string;
}

export interface ModifierOption {
  id: string;
  name: string;
  nameFa: string;
  priceDelta: number; // in Toman
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  nameFa: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  coffeeShopId: string;
  branchIds?: string[];
  categoryId: string;
  name: string;
  nameFa: string;
  description: string;
  descriptionFa: string;
  image: string;
  basePrice: number; // in Toman
  compareAtPrice?: number;
  active: boolean;
  available: boolean;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens?: string[];
  calories?: number;
  tags?: string[];
  sortOrder: number;
  modifierGroups?: ModifierGroup[];
  createdAt?: string;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  groupNameFa: string;
  optionId: string;
  optionName: string;
  optionNameFa: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  name: string;
  nameFa: string;
  image: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  selectedModifiers: SelectedModifier[];
  notes?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'online' | 'cash_on_pickup' | 'wallet';
export type FulfillmentType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  orderNumber: string;
  coffeeShopId: string;
  branchId: string;
  branchName?: string;
  branchNameFa?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: {
    title: string;
    fullAddress: string;
    phone: string;
  };
  pickupTime?: string;
  customerNotes?: string;
  rejectionReason?: string;
  timestamps: {
    created: string;
    confirmed?: string;
    preparing?: string;
    ready?: string;
    outForDelivery?: string;
    completed?: string;
    cancelled?: string;
  };
}

export interface Coupon {
  id: string;
  coffeeShopId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  description?: string;
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  coffeeShopId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  coffeeShopId: string;
  orderId?: string;
  points: number;
  type: 'earn' | 'redeem' | 'bonus';
  description: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  customerId: string;
  coffeeShopId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'order' | 'promo' | 'loyalty' | 'system';
  relatedOrderId?: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  title: string;
  fullAddress: string;
  phone: string;
  isDefault: boolean;
}

export interface ShopSettings {
  id: string;
  coffeeShopId: string;
  pointsPerToman: number; // e.g. 1 point for every 10,000 Toman spent
  redeemRateToman: number; // e.g. each point = 100 Toman discount
  taxRatePercent: number; // 9%
  minimumDeliveryAmount: number;
  autoAcceptOrders: boolean;
  soundAlertsEnabled: boolean;
  themeColor: string;
}
