import React from 'react';
import { useGym } from '../../context/GymContext';
import {
  LayoutDashboard,
  Users,
  QrCode,
  UserCheck,
  Clock,
  CreditCard,
  ShieldCheck,
  Settings,
  Building,
  Activity,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { auth, activeTab, setActiveTab } = useGym();

  const ownerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'attendance', label: 'Attendance Tracking', icon: QrCode },
    { id: 'followups', label: 'Active Follow-ups', icon: UserCheck },
    { id: 'expiry', label: 'Expiry Alerts', icon: Clock },
    { id: 'payments', label: 'Financial Records', icon: CreditCard },
    { id: 'subscription', label: 'SaaS Plan', icon: ShieldCheck },
    { id: 'settings', label: 'Organization Settings', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'plans', label: 'SaaS Plans & Pricing', icon: Sparkles },
    { id: 'gyms', label: 'Gym Tenants Directory', icon: Building },
    { id: 'subscriptions', label: 'Subscriptions & Billing', icon: CreditCard },
    { id: 'logs', label: 'Audit Activity Logs', icon: Activity },
  ];

  const adminCurrentTab =
    activeTab === 'gyms' || activeTab === 'super_gyms'
      ? 'gyms'
      : activeTab === 'subscriptions' || activeTab === 'super_subscriptions'
      ? 'subscriptions'
      : activeTab === 'logs' || activeTab === 'super_logs'
      ? 'logs'
      : 'plans';

  const navItems = auth.role === 'super_admin' ? adminNavItems : ownerNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#f8f7f4] border-r border-[#e6e4df] p-8 shrink-0 min-h-[calc(100vh-5rem)]">
      <div className="mb-8">
        <span className="nav-label-caps block mb-4">
          {auth.role === 'super_admin' ? 'Administration' : 'Management'}
        </span>
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = auth.role === 'super_admin' ? adminCurrentTab === item.id : activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 py-2 text-left text-[0.88rem] transition-all cursor-pointer touch-manipulation select-none ${
                  isActive
                    ? 'font-semibold text-[#5c62d6]'
                    : 'text-[#1a1a1a] opacity-75 hover:opacity-100 hover:text-[#5c62d6]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5c62d6]' : 'text-[#8a8a8a]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
