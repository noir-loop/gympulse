export type UserRole = 'super_admin' | 'gym_owner' | 'member';

export type SubscriptionStatus = 'active' | 'expired' | 'suspended';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'inactive';
export type FollowUpStatus = 'not_contacted' | 'contacted' | 'interested' | 'returned' | 'not_interested';
export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer' | 'card';

export interface Gym {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  logoText: string;
  primaryColor: string; // e.g. '#1e293b'
  accentColor: string; // e.g. '#f97316'
  themeName: 'dark-orange' | 'navy-lime' | 'slate-emerald';
  address: string;
  createdAt: string;
}

export interface GymSubscription {
  id: string;
  gymId: string;
  planName: string;
  price: number; // in INR
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
}

export interface SaaSPlan {
  id: string;
  name: string;
  period: 'Monthly' | 'Quarterly' | 'Annual';
  price: number; // INR
  description: string;
  features: string[];
  popular?: boolean;
  active: boolean;
}

export interface Member {
  id: string;
  gymId: string;
  fullName: string;
  phone: string;
  email?: string;
  joinDate: string;
  membershipPlan: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: MembershipStatus;
  lastAttendanceDate?: string;
  paymentStatus: PaymentStatus;
  emergencyContact?: string;
  followUpStatus: FollowUpStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'success' | 'expired' | 'duplicate' | 'not_found';
  method: 'qr_scan' | 'manual';
}

export interface PaymentRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  amount: number; // INR
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceId?: string;
  membershipPlan: string;
  status: 'success' | 'pending';
}

export interface ActivityLog {
  id: string;
  gymId?: string;
  action: string;
  description: string;
  timestamp: string;
  userName: string;
}

export interface AuthState {
  role: UserRole;
  gymId?: string; // If gym_owner
  username?: string;
  email?: string;
  avatarUrl?: string;
  authProvider?: 'clerk_google' | 'clerk' | 'demo';
}
