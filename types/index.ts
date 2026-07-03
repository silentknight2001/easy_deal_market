// types/index.ts
import type { Timestamp } from 'firebase/firestore';

// ── User ──────────────────────────────────────────────────────────────────────
export type UserRole   = 'buyer' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

export interface User {
  uid: string; email: string | null; displayName: string | null;
  photoURL: string | null; phoneNumber: string | null;
  role: UserRole; status: UserStatus;
  isEmailVerified: boolean; isPhoneVerified: boolean; isVerifiedSeller: boolean;
  whatsappNumber?: string; location?: string; bio?: string;
  totalListings: number; totalSales: number; totalPurchases: number;
  rating: number; ratingCount: number;
  loginCount: number; failedLoginAttempts: number; lockedUntil?: Timestamp | null;
  fcmTokens?: string[];
  createdAt: Timestamp; updatedAt: Timestamp; lastLoginAt?: Timestamp;
}

// ── Product ───────────────────────────────────────────────────────────────────
export type ProductCategory =
  'mobiles' | 'laptops' | 'tvs' | 'furniture' | 'bikes' | 'electronics' | 'home_appliances';
export type ProductCondition = 'like_new' | 'good' | 'fair' | 'poor';
export type ProductStatus    = 'pending' | 'active' | 'sold' | 'rejected' | 'removed' | 'draft';

export interface ProductImage { url: string; storagePath: string; size?: number; }

export interface Product {
  id: string; title: string; slug: string; description: string;
  category: ProductCategory; condition: ProductCondition;
  price: number; negotiable: boolean; images: ProductImage[];
  location: string; city: string;
  sellerId: string; sellerName: string; sellerPhoto?: string;
  sellerWhatsapp: string; isVerifiedSeller: boolean;
  status: ProductStatus; views: number; wishlistCount: number; reportCount: number;
  tags: string[]; adminNote?: string;
  approvedAt?: Timestamp; approvedBy?: string; soldAt?: Timestamp; expiresAt?: Date | Timestamp;
  createdAt: Timestamp; updatedAt: Timestamp;
}

export interface ProductFilters {
  category?: ProductCategory; condition?: ProductCondition;
  minPrice?: number; maxPrice?: number; city?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views';
  page?: number; limit?: number;
}

// ── Booking ───────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
  id: string; productId: string; productTitle: string;
  productImage?: string; productPrice: number;
  sellerId: string; sellerName: string;
  buyerId: string; buyerName: string; buyerPhone: string; buyerWhatsapp: string;
  message?: string; offeredPrice?: number;
  status: BookingStatus; bookingFeePaid: boolean;
  meetupLocation?: string; meetupDate?: Timestamp; cancelReason?: string;
  createdAt: Timestamp; updatedAt: Timestamp;
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  id: string; productId?: string; sellerId: string;
  reviewerId: string; reviewerName: string; reviewerPhoto?: string;
  rating: number; comment: string; isVerifiedPurchase: boolean;
  helpful: number; reported: boolean; createdAt: Timestamp;
}

// ── Notification ──────────────────────────────────────────────────────────────
export type NotificationType =
  'booking_received' | 'booking_accepted' | 'booking_rejected' | 'booking_completed' | 'booking_cancelled' |
  'product_approved' | 'product_rejected' | 'new_review' | 'system_message' | 'admin_alert';

export interface Notification {
  id: string; userId: string; type: NotificationType;
  title: string; body: string; imageUrl?: string; link?: string;
  isRead: boolean; createdAt: Timestamp;
}

// ── Report ────────────────────────────────────────────────────────────────────
export type ReportType   = 'scam' | 'spam' | 'inappropriate' | 'wrong_category' | 'duplicate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string; productId: string; productTitle: string;
  reporterId: string; type: ReportType; description: string;
  status: ReportStatus; adminNote?: string; reviewedBy?: string;
  createdAt: Timestamp; resolvedAt?: Timestamp;
}

// ── Transaction ───────────────────────────────────────────────────────────────
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Transaction {
  id: string; bookingId?: string; productId?: string; userId: string;
  type: 'booking_fee' | 'commission_buyer' | 'commission_seller' | 'refund';
  amount: number; currency: string; status: TransactionStatus;
  razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string;
  description: string; metadata?: Record<string, unknown>;
  createdAt: Timestamp; updatedAt: Timestamp;
}

// ── API helpers ───────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }

export interface PaginatedResponse<T> {
  items: T[]; total: number; page: number; limit: number; hasMore: boolean; lastDoc?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  { id: 'mobiles'       as ProductCategory, name: 'Mobiles',        description: 'Smartphones & feature phones',  icon: '📱', slug: 'mobiles'         },
  { id: 'laptops'       as ProductCategory, name: 'Laptops',         description: 'Laptops & notebooks',           icon: '💻', slug: 'laptops'         },
  { id: 'tvs'           as ProductCategory, name: 'TVs',             description: 'Televisions & monitors',        icon: '📺', slug: 'tvs'             },
  { id: 'furniture'     as ProductCategory, name: 'Furniture',       description: 'Home & office furniture',       icon: '🪑', slug: 'furniture'       },
  { id: 'bikes'         as ProductCategory, name: 'Bikes',           description: 'Bicycles & motorcycles',        icon: '🏍️', slug: 'bikes'           },
  { id: 'electronics'   as ProductCategory, name: 'Electronics',     description: 'Gadgets & electronics',         icon: '🔌', slug: 'electronics'     },
  { id: 'home_appliances' as ProductCategory, name: 'Home Appliances', description: 'Kitchen & home appliances',  icon: '🏠', slug: 'home-appliances' },
] as const;

export const SERVICE_AREAS = [
  { name: 'Silchar',   district: 'Cachar',    state: 'Assam' },
  { name: 'Guwahati',  district: 'Kamrup',    state: 'Assam' },
  { name: 'Cachar',    district: 'Cachar',    state: 'Assam' },
  { name: 'Dibrugarh', district: 'Dibrugarh', state: 'Assam' },
  { name: 'Jorhat',    district: 'Jorhat',    state: 'Assam' },
  { name: 'Tezpur',    district: 'Sonitpur',  state: 'Assam' },
] as const;