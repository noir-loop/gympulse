import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { SystemUpdateModal } from '../common/SystemUpdateModal';
import {
  LayoutDashboard,
  Users,
  QrCode,
  UserCheck,
  Menu,
  Building,
  CreditCard,
  Clock,
  ShieldCheck,
  Settings,
  Sparkles,
  Activity,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { auth, activeTab, setActiveTab, appVersion, isUpdateAvailable, updateInfo } = useGym();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  if (auth.role === 'super_admin') {
    const adminCurrentTab =
      activeTab === 'gyms' || activeTab === 'super_gyms'
        ? 'gyms'
        : activeTab === 'subscriptions' || activeTab === 'super_subscriptions'
        ? 'subscriptions'
        : activeTab === 'logs' || activeTab === 'super_logs'
        ? 'logs'
        : 'plans';

    const adminNav = [
      { id: 'plans', label: 'Plans & Pricing', icon: Sparkles },
      { id: 'gyms', label: 'Tenants', icon: Building },
      { id: 'subscriptions', label: 'Licenses', icon: CreditCard },
      { id: 'logs', label: 'Audit Logs', icon: Activity },
    ];

    return (
      <>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f8f7f4]/95 border-t border-[#e6e4df] px-2 py-2 flex justify-around items-center backdrop-blur-md shadow-lg">
          {adminNav.map(item => {
            const Icon = item.icon;
            const isActive = adminCurrentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-lg transition-all select-none cursor-pointer touch-manipulation active:scale-95 min-h-[48px] min-w-[64px] ${
                  isActive
                    ? 'bg-[#5c62d6]/10 text-[#5c62d6] font-semibold'
                    : 'text-[#8a8a8a] hover:text-[#1a1a1a] active:bg-[#e6e4df]/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#5c62d6]' : ''}`} />
                <span className="text-[10px] uppercase tracking-wider leading-none">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#5c62d6] -mb-1" />}
              </button>
            );
          })}
        </div>
        <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
      </>
    );
  }

  const ownerPrimaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'attendance', label: 'Tracking', icon: QrCode },
    { id: 'followups', label: 'Follow-ups', icon: UserCheck },
  ];

  const ownerMoreItems = [
    { id: 'expiry', label: 'Expiry Alerts', icon: Clock },
    { id: 'payments', label: 'Financial Records', icon: CreditCard },
    { id: 'subscription', label: 'SaaS Plan', icon: ShieldCheck },
    { id: 'settings', label: 'Org Settings', icon: Settings },
  ];

  return (
    <>
      {isMoreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#1a1a1a]/40 backdrop-blur-xs flex items-end animate-fade-in"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full bg-[#f8f7f4] border-t border-[#e6e4df] p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#8a8a8a]/30 rounded-full mx-auto" />
            <span className="nav-label-caps block">Additional Sections</span>

            <div className="grid grid-cols-2 gap-2.5">
              {ownerMoreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3.5 border rounded text-xs font-semibold transition-all select-none cursor-pointer touch-manipulation active:scale-95 ${
                      isActive
                        ? 'bg-[#5c62d6]/10 border-[#5c62d6] text-[#5c62d6]'
                        : 'bg-white border-[#e6e4df] text-[#1a1a1a] active:bg-[#f8f7f4]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#5c62d6]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* System Update Button in More Drawer */}
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  setIsUpdateModalOpen(true);
                }}
                className={`col-span-2 flex items-center justify-between p-3.5 border rounded text-xs font-semibold transition-all select-none cursor-pointer touch-manipulation active:scale-95 ${
                  isUpdateAvailable
                    ? 'bg-[#5c62d6]/10 border-[#5c62d6] text-[#5c62d6]'
                    : 'bg-white border-[#e6e4df] text-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#5c62d6]" />
                  <span>
                    {isUpdateAvailable
                      ? `Update Available (${updateInfo.version})`
                      : `System Release (${appVersion})`}
                  </span>
                </div>
                {isUpdateAvailable && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#5c62d6] text-white rounded font-mono uppercase">
                    Install
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f8f7f4]/95 border-t border-[#e6e4df] px-2 py-2 flex justify-around items-center backdrop-blur-md shadow-lg">
        {ownerPrimaryNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg transition-all select-none cursor-pointer touch-manipulation active:scale-95 min-h-[48px] min-w-[56px] ${
                isActive
                  ? 'bg-[#5c62d6]/10 text-[#5c62d6] font-semibold'
                  : 'text-[#8a8a8a] hover:text-[#1a1a1a] active:bg-[#e6e4df]/40'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#5c62d6]' : ''}`} />
              <span className="text-[10px] tracking-wider uppercase leading-none">{item.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#5c62d6] -mb-1" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg transition-all select-none cursor-pointer touch-manipulation active:scale-95 min-h-[48px] min-w-[56px] relative ${
            ownerMoreItems.some(i => i.id === activeTab)
              ? 'bg-[#5c62d6]/10 text-[#5c62d6] font-semibold'
              : 'text-[#8a8a8a] hover:text-[#1a1a1a] active:bg-[#e6e4df]/40'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase leading-none">More</span>
          {isUpdateAvailable && (
            <span className="w-2 h-2 rounded-full bg-[#5c62d6] absolute top-1.5 right-2.5 animate-ping" />
          )}
          {ownerMoreItems.some(i => i.id === activeTab) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c62d6] -mb-1" />
          )}
        </button>
      </div>

      <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
    </>
  );
};
