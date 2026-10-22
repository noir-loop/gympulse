import React, { useState } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { ClerkAuthProvider, GoogleSignInButton } from './components/auth/ClerkAuthProvider';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Toast } from './components/common/Toast';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { MemberList } from './components/owner/MemberList';
import { AttendanceTracker } from './components/owner/AttendanceTracker';
import { InactiveMembers } from './components/owner/InactiveMembers';
import { ExpiryManager } from './components/owner/ExpiryManager';
import { PaymentRecords } from './components/owner/PaymentRecords';
import { SubscriptionView } from './components/owner/SubscriptionView';
import { GymSettings } from './components/owner/GymSettings';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { MemberCheckInPage } from './components/member/MemberCheckInPage';
import { LoginModal } from './components/auth/LoginModal';
import { PaymentPortalModal } from './components/payment/PaymentPortalModal';
import { RefreshCw, AlertTriangle, QrCode } from 'lucide-react';

const MainContent: React.FC = () => {
  const { auth, activeTab, setActiveTab, gyms, subscriptions } = useGym();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isManualLoginOpen, setIsManualLoginOpen] = useState(false);
  const [isExpiredQrOpen, setIsExpiredQrOpen] = useState(false);

  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymSub = subscriptions.find(s => s.gymId === currentGym?.id);

  const isExpired = auth.role === 'gym_owner' && gymSub?.status === 'expired' && activeTab !== 'subscription';
  const needsLogin = !auth.gymId && auth.role !== 'super_admin';

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] flex flex-col font-sans antialiased selection:bg-[#5c62d6] selection:text-white">
      <Navbar onOpenCheckInModal={() => setIsCheckInModalOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!needsLogin && <Sidebar />}

        <main className="flex-1 p-6 md:p-12 max-w-full overflow-hidden">
          {needsLogin ? (
            <div className="max-w-md mx-auto my-16 card-editorial p-8 sm:p-10 text-center space-y-6 animate-fade-in shadow-xl">
              <div className="brand-serif text-4xl italic text-[#5c62d6]">
                GymPulse
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-medium text-[#1a1a1a]">Unified Sign In</h3>
                <p className="text-xs text-[#8a8a8a] leading-relaxed">
                  Authenticate using your Google / Gmail account via Clerk or access your gym tenant jurisdiction.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <GoogleSignInButton
                  label="Sign in with Google (Gmail) via Clerk"
                />

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#e6e4df]"></div>
                  <span className="flex-shrink mx-3 text-[0.65rem] font-mono uppercase tracking-wider text-[#8a8a8a]">
                    Or Credentials
                  </span>
                  <div className="flex-grow border-t border-[#e6e4df]"></div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualLoginOpen(true)}
                  className="w-full py-2.5 px-4 text-xs font-medium text-[#1a1a1a]/80 border border-[#e6e4df] rounded-lg hover:bg-white hover:border-[#d6d3cd] transition-all cursor-pointer"
                >
                  Enter Manual Credentials / Switch Role
                </button>
              </div>
            </div>
          ) : isExpired ? (
            <div className="max-w-xl mx-auto my-12 card-editorial p-10 text-center space-y-6 animate-fade-in border-[#b91c1c]/30 shadow-xl">
              <div className="w-14 h-14 bg-[#fef2f2] text-[#b91c1c] border border-[#b91c1c]/20 flex items-center justify-center mx-auto rounded">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-4xl font-medium text-[#1a1a1a]">License Concluded</h3>
                <p className="text-xs text-[#8a8a8a] leading-relaxed">
                  The SaaS subscription for <strong className="text-[#1a1a1a]">{currentGym?.name}</strong> has concluded. Facility operations are constrained until renewal.
                </p>
              </div>

              <div className="p-4 bg-[#f8f7f4] border border-[#e6e4df] rounded text-left font-mono text-xs space-y-2">
                <div className="flex justify-between"><span className="text-[#8a8a8a]">Tier:</span> <span className="font-semibold text-[#1a1a1a]">{gymSub?.planName}</span></div>
                <div className="flex justify-between"><span className="text-[#8a8a8a]">Rate:</span> <span className="font-semibold text-[#1a1a1a]">₹{gymSub?.price.toLocaleString('en-IN')} / Term</span></div>
                <div className="flex justify-between"><span className="text-[#8a8a8a]">Conclusion:</span> <span className="font-bold text-[#b91c1c]">{gymSub?.endDate}</span></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpiredQrOpen(true)}
                  className="btn-editorial-primary flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-4 h-4" /> Pay via UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('subscription')}
                  className="btn-editorial-outline flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> View Plans
                </button>
              </div>
            </div>
          ) : auth.role === 'super_admin' ? (
            <SuperAdminDashboard />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <OwnerDashboard
                  onNavigate={tab => setActiveTab(tab)}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                />
              )}
              {activeTab === 'members' && (
                <MemberList
                  isAddModalOpen={isAddMemberOpen}
                  onCloseAddModal={() => setIsAddMemberOpen(false)}
                />
              )}
              {activeTab === 'attendance' && <AttendanceTracker />}
              {activeTab === 'followups' && <InactiveMembers />}
              {activeTab === 'expiry' && <ExpiryManager />}
              {activeTab === 'payments' && <PaymentRecords />}
              {activeTab === 'subscription' && <SubscriptionView />}
              {activeTab === 'settings' && <GymSettings />}
            </>
          )}
        </main>
      </div>

      {!needsLogin && <MobileBottomNav />}
      <Toast />

      {isCheckInModalOpen && (
        <MemberCheckInPage onClose={() => setIsCheckInModalOpen(false)} />
      )}

      <LoginModal isOpen={needsLogin || isManualLoginOpen} onClose={() => setIsManualLoginOpen(false)} />

      {isExpiredQrOpen && currentGym && (
        <PaymentPortalModal
          isOpen={isExpiredQrOpen}
          onClose={() => setIsExpiredQrOpen(false)}
          mode="saas"
          saasDetails={{
            gymId: currentGym.id,
            gymName: currentGym.name,
            planName: gymSub?.planName || 'Growth Enterprise Plan',
            price: gymSub?.price || 4999,
            period: 'Monthly',
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GymProvider>
      <ClerkAuthProvider>
        <MainContent />
      </ClerkAuthProvider>
    </GymProvider>
  );
}
