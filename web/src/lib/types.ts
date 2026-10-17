/**
 * CampusBite Core Domain Types & Stage 3 Ordering Contracts
 */

export type UserRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  department?: string;
  balance?: number;
}

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export interface FoodItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Meals' | 'Snacks' | 'Drinks' | 'Desserts' | 'Breakfast';
  prepMin: number;
  dietary: 'Veg' | 'Non-Veg' | 'Vegan';
  image?: string;
  available: boolean;
  preparedPortions: number;
  allocatedPortions: number;
  availablePreparedPortions: number;
  isPausedByAdmin: boolean;
  pauseReason?: string;
  allergens?: string[];
}

export interface CartItem {
  food: FoodItemDTO;
  qty: number;
}

export interface OrderItem {
  id?: number;
  foodId: number;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  coveredByPreparedPortions?: number;
  requiresCookingQty?: number;
}

export interface OrderTransition {
  id?: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
}

export interface Order {
  id: number;
  orderRef: string;
  idempotencyKey: string;
  userId?: string | null;
  customerName: string;
  customerRole: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  etaMin: number;
  estimatedReadyAt: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  transitions?: OrderTransition[];
}

export interface InventoryItem {
  id: number;
  ingredient: string;
  qty: number;
  unit: string;
  minQty: number;
  unitCost: number;
}

export interface BreakFitRecommendation {
  foodId: number;
  name: string;
  price: number;
  requestedQty: number;
  estimatedPrepMins: number;
  availablePreparedPortions: number;
  fitsBreak: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  uncoveredCookTime: number;
  queueCongestionBuffer: number;
}

export interface LastPlateListing {
  id: number;
  dishName: string;
  price: number;
  portions: number;
  portionsRemaining: number;
  deadline: string;
  location: string;
  description?: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CLOSED' | 'EXPIRED' | 'WITHDRAWN';
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp?: number;
  durationMs?: number;
}
