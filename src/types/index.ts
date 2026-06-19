export type UserRole = "customer" | "admin";

export type ProductCategory = "Bracelet" | "Charm" | "Keychain" | "Necklace";

export type OrderStatus =
  | "Pending Verification"
  | "Payment Verified"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_receipt_url: string | null;
  shipping_address: string;
  contact_number: string;
  full_name: string;
  created_at: string;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalSales: number;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Bracelet",
  "Charm",
  "Keychain",
  "Necklace",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending Verification",
  "Payment Verified",
  "Processing",
  "Shipped",
  "Completed",
  "Cancelled",
  "Rejected",
];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-800",
  "Payment Verified": "bg-blue-100 text-blue-800",
  Processing: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-100 text-gray-800",
  Rejected: "bg-red-100 text-red-800",
};
