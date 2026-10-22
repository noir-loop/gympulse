import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Gym,
  GymSubscription,
  Member,
  AttendanceRecord,
  PaymentRecord,
  ActivityLog,
  AuthState,
  FollowUpStatus,
  MembershipStatus,
  PaymentStatus,
  PaymentMethod,
  SaaSPlan,
} from '../types';
import {
  INITIAL_GYMS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_MEMBERS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SAAS_PLANS,
} from '../data/mockData';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface GymContextType {
  gyms: Gym[];
  subscriptions: GymSubscription[];
  saasPlans: SaaSPlan[];
  members: Member[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  activityLogs: ActivityLog[];
  auth: AuthState;
  activeTab: string;
  checkInGymId: string;
  toast: ToastInfo | null;

  // System Updates
  appVersion: string;
  isUpdateAvailable: boolean;
  updateInfo: {
    version: string;
    date: string;
    title: string;
    features: string[];
  };
  applySystemUpdate: () => Promise<void>;
  checkForUpdates: () => void;
  resetUpdateDemo: () => void;
  
  // Actions
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  setActiveTab: (tab: string) => void;
  setCheckInGymId: (gymId: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  
  login: (
    role: AuthState['role'], 
    gymId?: string, 
    username?: string, 
    email?: string, 
    avatarUrl?: string, 
    authProvider?: AuthState['authProvider']
  ) => void;
  logout: () => void;
  
  addGym: (gymData: Omit<Gym, 'id' | 'createdAt'>, planName: string, price: number) => void;
  updateGym: (gymId: string, data: Partial<Gym>) => void;
  updateGymSubscriptionStatus: (gymId: string, status: 'active' | 'expired' | 'suspended') => void;
  updateGymSubscription: (gymId: string, data: Partial<GymSubscription>) => void;

  // SaaS Plans Management for Super Admin
  addSaaSPlan: (planData: Omit<SaaSPlan, 'id'>) => void;
  updateSaaSPlan: (id: string, data: Partial<SaaSPlan>) => void;
  deleteSaaSPlan: (id: string) => void;
  
  addMember: (memberData: Omit<Member, 'id' | 'joinDate' | 'membershipStatus' | 'followUpStatus'>) => void;
  updateMember: (memberId: string, data: Partial<Member>) => void;
  deleteMember: (memberId: string) => void;
  
  recordCheckIn: (gymId: string, identifier: string) => { success: boolean; message: string; member?: Member };
  manualAttendance: (gymId: string, memberId: string) => void;
  
  addPayment: (paymentData: Omit<PaymentRecord, 'id' | 'status'>) => void;
  processMemberQRPayment: (
    gymId: string,
    memberId: string,
    amount: number,
    planName?: string,
    referenceId?: string
  ) => { success: boolean; payment: PaymentRecord; member: Member };
  updateFollowUpStatus: (memberId: string, status: FollowUpStatus) => void;
  renewMembership: (memberId: string, plan: string, months: number, amountPaid: number, paymentMethod: PaymentMethod) => void;
  
  resetDemoData: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [gyms, setGyms] = useState<Gym[]>(() => {
    const saved = localStorage.getItem('gympulse_gyms');
    return saved ? JSON.parse(saved) : INITIAL_GYMS;
  });

  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>(() => {
    const saved = localStorage.getItem('gympulse_subs');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(() => {
    const saved = localStorage.getItem('gympulse_saas_plans');
    return saved ? JSON.parse(saved) : INITIAL_SAAS_PLANS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('gympulse_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('gympulse_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('gympulse_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('gympulse_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('gympulse_auth');
    return saved ? JSON.parse(saved) : { role: 'gym_owner', gymId: undefined, username: undefined };
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [checkInGymId, setCheckInGymId] = useState<string>('gym-iron-house');
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // App Release & Updates State
  const [appVersion, setAppVersion] = useState<string>(() => {
    return localStorage.getItem('gympulse_app_version') || 'v2.4.0';
  });

  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(() => {
    const saved = localStorage.getItem('gympulse_update_available');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const updateInfo = {
    version: 'v2.5.0',
    date: 'October 2026',
    title: 'Live UPI QR Payment Gateway & System Upgrade',
    features: [
      'Interactive UPI QR Payment Gateway for both SaaS subscriptions & member dues',
      'Real-time automated transaction reconciliation directly visible in app ledgers',
      'Instant membership extension & Turnstile clearance upon payment',
      'Centralized OTA System Update Patcher with zero downtime',
    ],
  };

  useEffect(() => {
    localStorage.setItem('gympulse_app_version', appVersion);
  }, [appVersion]);

  useEffect(() => {
    localStorage.setItem('gympulse_update_available', JSON.stringify(isUpdateAvailable));
  }, [isUpdateAvailable]);

  const applySystemUpdate = async () => {
    await new Promise(res => setTimeout(res, 800));
    setAppVersion('v2.5.0');
    setIsUpdateAvailable(false);
    addLog('SYSTEM_UPDATED', 'Platform updated to version v2.5.0 (Live UPI QR Gateway release)');
    showToast('System successfully upgraded to v2.5.0!', 'success');
  };

  const checkForUpdates = () => {
    if (appVersion === 'v2.5.0') {
      showToast('GymPulse is up to date on version v2.5.0', 'info');
    } else {
      setIsUpdateAvailable(true);
      showToast('Update v2.5.0 is available for installation!', 'info');
    }
  };

  const resetUpdateDemo = () => {
    setAppVersion('v2.4.0');
    setIsUpdateAvailable(true);
    showToast('Demo update v2.5.0 reset - update button is now active again.', 'info');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gympulse_gyms', JSON.stringify(gyms));
  }, [gyms]);

  useEffect(() => {
    localStorage.setItem('gympulse_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('gympulse_saas_plans', JSON.stringify(saasPlans));
  }, [saasPlans]);

  useEffect(() => {
    localStorage.setItem('gympulse_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('gympulse_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('gympulse_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('gympulse_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('gympulse_auth', JSON.stringify(auth));
  }, [auth]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearToast = () => setToast(null);

  const login = (
    role: AuthState['role'], 
    gymId?: string, 
    username?: string,
    email?: string,
    avatarUrl?: string,
    authProvider?: AuthState['authProvider']
  ) => {
    const updatedAuth: AuthState = { role, gymId, username, email, avatarUrl, authProvider };
    setAuth(updatedAuth);
    localStorage.setItem('gympulse_auth', JSON.stringify(updatedAuth));
    setActiveTab(role === 'super_admin' ? 'plans' : 'dashboard');
    showToast(`Logged in successfully as ${email || username || (role === 'super_admin' ? 'Super Admin' : 'Gym Owner')}`);
  };

  const logout = () => {
    localStorage.removeItem('gympulse_auth');
    setAuth({ role: 'gym_owner', gymId: undefined, username: undefined });
    showToast('Logged out successfully', 'info');
  };

  const addLog = (action: string, description: string, gymId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      gymId,
      action,
      description,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      userName: auth.role === 'super_admin' ? 'Super Admin' : auth.username || 'Gym Owner',
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addGym = (gymData: Omit<Gym, 'id' | 'createdAt'>, planName: string, price: number) => {
    const gymId = `gym-${Date.now()}`;
    const newGym: Gym = {
      ...gymData,
      id: gymId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newSub: GymSubscription = {
      id: `sub-${Date.now()}`,
      gymId,
      planName,
      price,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      paymentStatus: 'paid',
    };

    setGyms(prev => [...prev, newGym]);
    setSubscriptions(prev => [...prev, newSub]);
    addLog('GYM_CREATED', `Onboarded new gym: ${newGym.name}`, gymId);
    showToast(`Gym "${newGym.name}" onboarded successfully!`);
  };

  const updateGym = (gymId: string, data: Partial<Gym>) => {
    setGyms(prev => prev.map(g => g.id === gymId ? { ...g, ...data } : g));
    addLog('GYM_UPDATED', `Updated details for gym ID ${gymId}`, gymId);
    showToast('Gym details updated successfully!');
  };

  const updateGymSubscriptionStatus = (gymId: string, status: 'active' | 'expired' | 'suspended') => {
    setSubscriptions(prev => prev.map(s => s.gymId === gymId ? { ...s, status } : s));
    addLog('SUBSCRIPTION_UPDATED', `Changed subscription status to ${status}`, gymId);
    showToast(`Gym subscription status updated to ${status}`);
  };

  const updateGymSubscription = (gymId: string, data: Partial<GymSubscription>) => {
    setSubscriptions(prev => prev.map(s => s.gymId === gymId ? { ...s, ...data } : s));
    addLog('SUBSCRIPTION_CUSTOMIZED', `Admin adjusted subscription terms for gym ${gymId}`);
    showToast('Facility subscription contract updated successfully!', 'success');
  };

  const addSaaSPlan = (planData: Omit<SaaSPlan, 'id'>) => {
    const newPlan: SaaSPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setSaasPlans(prev => [...prev, newPlan]);
    addLog('PLAN_CREATED', `Added new SaaS subscription plan: ${newPlan.name} (₹${newPlan.price.toLocaleString('en-IN')}/${newPlan.period})`);
    showToast(`Plan "${newPlan.name}" created successfully!`, 'success');
  };

  const updateSaaSPlan = (id: string, data: Partial<SaaSPlan>) => {
    setSaasPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    addLog('PLAN_UPDATED', `Modified pricing / terms for plan ID: ${id}`);
    showToast('Plan specifications and pricing updated!', 'success');
  };

  const deleteSaaSPlan = (id: string) => {
    setSaasPlans(prev => prev.filter(p => p.id !== id));
    addLog('PLAN_DELETED', `Decommissioned SaaS plan ID: ${id}`);
    showToast('Plan removed from active offerings.', 'info');
  };

  const addMember = (memberData: Omit<Member, 'id' | 'joinDate' | 'membershipStatus' | 'followUpStatus'>) => {
    const prefix = memberData.gymId === 'gym-iron-house' ? 'M-IH' : 'M-US';
    const memberId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    // Determine membership status based on end date
    const endDateObj = new Date(memberData.membershipEndDate);
    const nowObj = new Date();
    const diffDays = Math.ceil((endDateObj.getTime() - nowObj.getTime()) / (1000 * 3600 * 24));
    
    let status: MembershipStatus = 'active';
    if (diffDays < 0) {
      status = 'expired';
    } else if (diffDays <= 7) {
      status = 'expiring_soon';
    }

    const newMember: Member = {
      ...memberData,
      id: memberId,
      joinDate: today,
      membershipStatus: status,
      followUpStatus: 'not_contacted',
    };

    setMembers(prev => [newMember, ...prev]);

    // Also record initial payment if payment status is paid
    if (newMember.paymentStatus === 'paid') {
      const planPrice = newMember.membershipPlan.toLowerCase().includes('annual') ? 12000 : 
                        newMember.membershipPlan.toLowerCase().includes('6 months') ? 6500 : 
                        newMember.membershipPlan.toLowerCase().includes('quarterly') ? 3500 : 2000;
      
      const newPay: PaymentRecord = {
        id: `pay-${Date.now()}`,
        gymId: memberData.gymId,
        memberId,
        memberName: memberData.fullName,
        amount: planPrice,
        paymentDate: today,
        paymentMethod: 'upi',
        referenceId: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        membershipPlan: memberData.membershipPlan,
        status: 'success',
      };
      setPayments(prev => [newPay, ...prev]);
    }

    addLog('MEMBER_REGISTERED', `Added new member ${newMember.fullName} (${memberId})`, memberData.gymId);
    showToast(`Member ${newMember.fullName} registered successfully!`);
  };

  const updateMember = (memberId: string, data: Partial<Member>) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, ...data };
        // Recalculate status if end date changed
        if (data.membershipEndDate) {
          const diffDays = Math.ceil((new Date(data.membershipEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          if (diffDays < 0) updated.membershipStatus = 'expired';
          else if (diffDays <= 7) updated.membershipStatus = 'expiring_soon';
          else updated.membershipStatus = 'active';
        }
        return updated;
      }
      return m;
    }));
    showToast('Member details updated successfully!');
  };

  const deleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    if (member) {
      addLog('MEMBER_DELETED', `Archived/deleted member ${member.fullName} (${memberId})`, member.gymId);
      showToast(`Member ${member.fullName} removed.`);
    }
  };

  const recordCheckIn = (gymId: string, identifier: string): { success: boolean; message: string; member?: Member } => {
    const trimmed = identifier.trim().toLowerCase();
    const member = members.find(
      m => m.gymId === gymId && (m.id.toLowerCase() === trimmed || m.phone.replace(/\s+/g, '').includes(trimmed.replace(/\s+/g, '')))
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (!member) {
      // Record failed attempt
      const failedAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        gymId,
        memberId: 'UNKNOWN',
        memberName: `Unknown (${identifier})`,
        date: todayStr,
        time: timeStr,
        status: 'not_found',
        method: 'qr_scan',
      };
      setAttendance(prev => [failedAtt, ...prev]);
      return { success: false, message: 'Member not found with this ID or phone number. Please check with the front desk.' };
    }

    // Check membership expiry
    const isExpired = new Date(member.membershipEndDate).getTime() < new Date().getTime();
    if (isExpired || member.membershipStatus === 'expired') {
      const expiredAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        gymId,
        memberId: member.id,
        memberName: member.fullName,
        date: todayStr,
        time: timeStr,
        status: 'expired',
        method: 'qr_scan',
      };
      setAttendance(prev => [expiredAtt, ...prev]);
      return { success: false, message: `Membership expired on ${member.membershipEndDate}. Please contact the front desk to renew.`, member };
    }

    // Check duplicate check-in today
    const alreadyCheckedInToday = attendance.some(
      a => a.gymId === gymId && a.memberId === member.id && a.date === todayStr && a.status === 'success'
    );

    if (alreadyCheckedInToday) {
      const dupAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        gymId,
        memberId: member.id,
        memberName: member.fullName,
        date: todayStr,
        time: timeStr,
        status: 'duplicate',
        method: 'qr_scan',
      };
      setAttendance(prev => [dupAtt, ...prev]);
      return { success: false, message: `Attendance already recorded for today (${timeStr}). Have a great workout!`, member };
    }

    // Success check-in
    const successAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      date: todayStr,
      time: timeStr,
      status: 'success',
      method: 'qr_scan',
    };

    setAttendance(prev => [successAtt, ...prev]);

    // Update member's last attendance date and follow-up status if returned
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, lastAttendanceDate: todayStr, followUpStatus: m.followUpStatus === 'contacted' ? 'returned' : m.followUpStatus } : m));

    addLog('ATTENDANCE_CHECKIN', `Member ${member.fullName} checked in successfully`, gymId);
    return { success: true, message: `Welcome back, ${member.fullName}! Attendance recorded successfully.`, member };
  };

  const manualAttendance = (gymId: string, memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      date: todayStr,
      time: timeStr,
      status: 'success',
      method: 'manual',
    };

    setAttendance(prev => [newAtt, ...prev]);
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, lastAttendanceDate: todayStr } : m));
    showToast(`Manual attendance recorded for ${member.fullName}`);
  };

  const addPayment = (paymentData: Omit<PaymentRecord, 'id' | 'status'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      status: 'success',
    };
    setPayments(prev => [newPayment, ...prev]);

    // Update member payment status
    setMembers(prev => prev.map(m => m.id === paymentData.memberId ? { ...m, paymentStatus: 'paid' } : m));

    addLog('PAYMENT_RECORDED', `Recorded payment of ₹${paymentData.amount} for ${paymentData.memberName}`, paymentData.gymId);
    showToast(`Payment of ₹${paymentData.amount} recorded successfully!`);
  };

  const updateFollowUpStatus = (memberId: string, status: FollowUpStatus) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, followUpStatus: status } : m));
    showToast('Follow-up status updated!');
  };

  const renewMembership = (memberId: string, plan: string, months: number, amountPaid: number, paymentMethod: PaymentMethod) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const currentEnd = new Date(member.membershipEndDate) > new Date() ? new Date(member.membershipEndDate) : new Date();
    const newEnd = new Date(currentEnd.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          membershipPlan: plan,
          membershipStartDate: todayStr,
          membershipEndDate: newEnd,
          membershipStatus: 'active',
          paymentStatus: 'paid',
        };
      }
      return m;
    }));

    // Record payment
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      gymId: member.gymId,
      memberId: member.id,
      memberName: member.fullName,
      amount: amountPaid,
      paymentDate: todayStr,
      paymentMethod,
      referenceId: `${paymentMethod.toUpperCase()}/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      membershipPlan: plan,
      status: 'success',
    };
    setPayments(prev => [newPayment, ...prev]);

    addLog('MEMBERSHIP_RENEWED', `Renewed membership for ${member.fullName} (${plan}, ${months} months)`, member.gymId);
    showToast(`Membership successfully renewed for ${member.fullName}!`);
  };

  const processMemberQRPayment = (
    gymId: string,
    memberId: string,
    amount: number,
    planName?: string,
    referenceId?: string
  ): { success: boolean; payment: PaymentRecord; member: Member } => {
    const member = members.find(m => m.id === memberId);
    const todayStr = new Date().toISOString().split('T')[0];

    const plan = planName || member?.membershipPlan || 'Monthly Unlimited';
    const isYearly = plan.toLowerCase().includes('annual') || plan.toLowerCase().includes('year');
    const isSixMonths = plan.toLowerCase().includes('6 month');
    const isQuarterly = plan.toLowerCase().includes('quarter') || plan.toLowerCase().includes('3 month');
    const monthsToAdd = isYearly ? 12 : isSixMonths ? 6 : isQuarterly ? 3 : 1;

    let newEndDate = member?.membershipEndDate || todayStr;
    const currentEnd = new Date(newEndDate);
    const now = new Date();
    const baseDate = currentEnd > now ? currentEnd : now;
    newEndDate = new Date(baseDate.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const updatedMember: Member = member
      ? {
          ...member,
          membershipPlan: plan,
          membershipEndDate: newEndDate,
          membershipStatus: 'active',
          paymentStatus: 'paid',
        }
      : {
          id: memberId,
          gymId,
          fullName: 'Enrolled Member',
          phone: '+91 9876543210',
          joinDate: todayStr,
          membershipPlan: plan,
          membershipStartDate: todayStr,
          membershipEndDate: newEndDate,
          membershipStatus: 'active',
          paymentStatus: 'paid',
          followUpStatus: 'not_contacted',
        };

    setMembers(prev => prev.map(m => (m.id === memberId ? updatedMember : m)));

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      gymId,
      memberId,
      memberName: updatedMember.fullName,
      amount,
      paymentDate: todayStr,
      paymentMethod: 'upi',
      referenceId: referenceId || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      membershipPlan: plan,
      status: 'success',
    };

    setPayments(prev => [newPayment, ...prev]);

    addLog(
      'MEMBER_PAID_QR',
      `Received ₹${amount} via UPI QR for ${updatedMember.fullName} (${plan})`,
      gymId
    );
    showToast(`Payment of ₹${amount} received from ${updatedMember.fullName}!`, 'success');

    return { success: true, payment: newPayment, member: updatedMember };
  };

  const resetDemoData = () => {
    localStorage.removeItem('gympulse_gyms');
    localStorage.removeItem('gympulse_subs');
    localStorage.removeItem('gympulse_members');
    localStorage.removeItem('gympulse_attendance');
    localStorage.removeItem('gympulse_payments');
    localStorage.removeItem('gympulse_logs');
    localStorage.removeItem('gympulse_auth');
    localStorage.removeItem('gympulse_saas_plans');
    localStorage.removeItem('gympulse_app_version');
    localStorage.removeItem('gympulse_update_available');

    setGyms(INITIAL_GYMS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setSaasPlans(INITIAL_SAAS_PLANS);
    setMembers(INITIAL_MEMBERS);
    setAttendance(INITIAL_ATTENDANCE);
    setPayments(INITIAL_PAYMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setAuth({ role: 'gym_owner', gymId: 'gym-iron-house', username: 'Vikram Malhotra' });
    setAppVersion('v2.4.0');
    setIsUpdateAvailable(true);
    showToast('Demo data reset to default successfully!', 'info');
  };

  return (
    <GymContext.Provider
      value={{
        gyms,
        subscriptions,
        saasPlans,
        members,
        attendance,
        payments,
        activityLogs,
        auth,
        activeTab,
        checkInGymId,
        toast,
        appVersion,
        isUpdateAvailable,
        updateInfo,
        applySystemUpdate,
        checkForUpdates,
        resetUpdateDemo,
        setAuth,
        setActiveTab,
        setCheckInGymId,
        showToast,
        clearToast,
        login,
        logout,
        addGym,
        updateGym,
        updateGymSubscriptionStatus,
        updateGymSubscription,
        addSaaSPlan,
        updateSaaSPlan,
        deleteSaaSPlan,
        addMember,
        updateMember,
        deleteMember,
        recordCheckIn,
        manualAttendance,
        addPayment,
        processMemberQRPayment,
        updateFollowUpStatus,
        renewMembership,
        resetDemoData,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) throw new Error('useGym must be used within a GymProvider');
  return context;
};
