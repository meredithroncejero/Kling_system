export type UserRole = "customer" | "admin";

export type ProductCategory = "Bracelet" | "Charm" | "Keychain" | "Necklace";

export type CustomRequestStatus =
  | "New Request"
  | "Under Review"
  | "Negotiating"
  | "Approved"
  | "Rejected"
  | "Converted";

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

export interface CustomRequest {
  id: string;
  user_id: string;
  category: ProductCategory;
  full_name: string;
  contact_number: string;
  landmark: string;
  description: string;
  reference_image_path: string | null;
  reference_image_url?: string | null;
  status: CustomRequestStatus;
  negotiated_price: number | null;
  admin_notes: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
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

export const CUSTOM_REQUEST_STATUSES: CustomRequestStatus[] = [
  "New Request",
  "Under Review",
  "Negotiating",
  "Approved",
  "Rejected",
  "Converted",
];

export const CUSTOM_REQUEST_STATUS_COLORS: Record<CustomRequestStatus, string> = {
  "New Request": "bg-kling-yellow/20 text-amber-700 border-kling-yellow/30",
  "Under Review": "bg-kling-blue/15 text-blue-700 border-kling-blue/25",
  Negotiating: "bg-purple-100 text-purple-700 border-purple-200",
  Approved: "bg-kling-green/15 text-green-700 border-kling-green/25",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Converted: "bg-gray-100 text-gray-700 border-gray-200",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-800",
  "Payment Verified": "bg-blue-100 text-blue-800",
  Processing: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-100 text-gray-800",
  Rejected: "bg-red-100 text-red-800",
};
