/**
 * CampusBite Core Domain Types
 */

export type UserRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
}

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface FoodItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Meals' | 'Snacks' | 'Drinks' | 'Desserts';
  prepMin: number;
  dietary: 'Veg' | 'Non-Veg';
  image: string;
  available: boolean;
  preparedPortionsAvailable: number;
  isPausedByAdmin: boolean;
}

export interface CartItem {
  food: FoodItemDTO;
  qty: number;
}

export interface OrderItem {
  foodId: number;
  name: string;
  qty: number;
  price: number;
}

export interface OrderTransition {
  from: OrderStatus;
  to: OrderStatus;
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface Order {
  id: number;
  idempotencyKey: string;
  userId: string | number;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  etaMin: number;
  created: string;
  transitions: OrderTransition[];
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
  timestamp: number;
}
