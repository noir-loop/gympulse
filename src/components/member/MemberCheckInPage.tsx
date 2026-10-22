import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PaymentPortalModal } from '../payment/PaymentPortalModal';
import { QrCode, CheckCircle, AlertTriangle, Search, X, Sparkles, CreditCard } from 'lucide-react';
import { Member } from '../../types';

interface MemberCheckInPageProps {
  onClose: () => void;
}

export const MemberCheckInPage: React.FC<MemberCheckInPageProps> = ({ onClose }) => {
  const { gyms, members, recordCheckIn } = useGym();
  const [selectedGymId, setSelectedGymId] = useState<string>(gyms[0]?.id || 'gym-iron-house');
  const [activeKioskTab, setActiveKioskTab] = useState<'checkin' | 'pay_qr'>('checkin');
  const [identifier, setIdentifier] = useState<string>('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    member?: Member;
  } | null>(null);

  // QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTargetMember, setQrTargetMember] = useState<Member | null>(null);

  const currentGym = gyms.find(g => g.id === selectedGymId);
  const gymMembers = members.filter(m => m.gymId === selectedGymId);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    const res = recordCheckIn(selectedGymId, identifier);
    setCheckInResult(res);
  };

  const handleOpenQrForMember = (member: Member) => {
    setQrTargetMember(member);
    setIsQrModalOpen(true);
  };

  return (
    <div className="modal-editorial-wrap animate-fade-in" onClick={onClose}>
      <div
        className="modal-editorial-body p-6 md:p-10 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
          <div className="flex items-center gap-2">
            <span className="brand-serif text-2xl text-[#5c62d6]">GymPulse</span>
            <span className="text-[0.65rem] uppercase tracking-widest text-[#8a8a8a] font-mono border-l border-[#e6e4df] pl-2.5">
              Turnstile & Kiosk Portal
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Facility Selector */}
        <div className="mb-6 space-y-3">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
              Turnstile Location / Facility
            </label>
            <select
              value={selectedGymId}
              onChange={e => {
                setSelectedGymId(e.target.value);
                setCheckInResult(null);
              }}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
            >
              {gyms.map(gym => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kiosk Mode Switcher */}
          <div className="flex border border-[#e6e4df] rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveKioskTab('checkin')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeKioskTab === 'checkin'
                  ? 'bg-[#5c62d6] text-white'
                  : 'bg-white text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              Daily Check-In
            </button>
            <button
              type="button"
              onClick={() => setActiveKioskTab('pay_qr')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeKioskTab === 'pay_qr'
                  ? 'bg-[#5c62d6] text-white'
                  : 'bg-white text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Pay Dues (UPI QR)
            </button>
          </div>
        </div>

        {/* 1. CHECK-IN TAB */}
        {activeKioskTab === 'checkin' && (
          <div className="space-y-6">
            {!checkInResult ? (
              <form onSubmit={handleCheckInSubmit} className="space-y-5">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Member Identifier or Telephony Line
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. M-IH-101 or 9876543210"
                      className="w-full bg-white border border-[#e6e4df] p-3 pl-10 text-sm font-mono text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                      autoFocus
                      required
                    />
                    <Search className="w-4 h-4 text-[#8a8a8a] absolute left-3.5 top-3.5" />
                  </div>
                  <span className="font-mono text-[0.65rem] text-[#8a8a8a] mt-1.5 block">
                    Demonstration tokens: <strong className="text-[#1a1a1a]">M-IH-101</strong>, <strong className="text-[#1a1a1a]">M-US-201</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-editorial-primary w-full py-3 cursor-pointer text-sm"
                >
                  <QrCode className="w-3.5 h-3.5" /> Authenticate Entry
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-14 h-14 mx-auto rounded flex items-center justify-center border border-[#e6e4df] bg-white">
                  {checkInResult.success ? (
                    <CheckCircle className="w-7 h-7 text-[#15803d]" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-[#b91c1c]" />
                  )}
                </div>

                <div>
                  <h4 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-2">
                    {checkInResult.success ? 'Access Granted' : 'Verification Denied'}
                  </h4>
                  <p className="text-xs text-[#8a8a8a] leading-relaxed">{checkInResult.message}</p>
                </div>

                {checkInResult.member && (
                  <div className="p-4 bg-white border border-[#e6e4df] rounded text-left font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8a8a8a]">Member:</span>
                      <span className="font-semibold text-[#1a1a1a]">{checkInResult.member.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a8a]">Term:</span>
                      <span className="text-[#1a1a1a]">{checkInResult.member.membershipPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a8a]">Conclusion:</span>
                      <span className={checkInResult.member.membershipStatus === 'expired' ? 'text-[#b91c1c] font-bold' : 'text-[#15803d]'}>
                        {checkInResult.member.membershipEndDate}
                      </span>
                    </div>
                  </div>
                )}

                {/* If expired or denied, offer instant UPI QR settlement right here */}
                {checkInResult.member && (checkInResult.member.membershipStatus === 'expired' || !checkInResult.success) && (
                  <button
                    type="button"
                    onClick={() => handleOpenQrForMember(checkInResult.member!)}
                    className="btn-editorial-primary w-full py-3 cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Pay Fees via UPI QR & Clear Turnstile
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCheckInResult(null);
                    setIdentifier('');
                  }}
                  className="btn-editorial-outline w-full cursor-pointer text-xs"
                >
                  Authenticate Another Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. PAY DUES (UPI QR) TAB */}
        {activeKioskTab === 'pay_qr' && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs text-[#8a8a8a] block">
              Select your membership profile to generate dynamic UPI QR code for fee remittance:
            </span>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {gymMembers.map(m => (
                <div
                  key={m.id}
                  className="p-3 bg-white border border-[#e6e4df] rounded hover:border-[#5c62d6] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm text-[#1a1a1a]">{m.fullName}</div>
                    <div className="font-mono text-[10px] text-[#8a8a8a]">
                      {m.id} • {m.membershipPlan}
                    </div>
                    <span
                      className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                        m.paymentStatus === 'paid'
                          ? 'bg-[#e7f7f0] text-[#15803d]'
                          : 'bg-[#fef2f2] text-[#b91c1c]'
                      }`}
                    >
                      {m.paymentStatus === 'paid' ? 'Active / Settled' : 'Payment Due'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQrForMember(m)}
                    className="btn-editorial-primary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#e6e4df] text-center text-[0.65rem] font-mono text-[#8a8a8a]">
          GymPulse Turnstile Access Gateway • Live UPI Settlement Enabled
        </div>

      </div>

      {/* UPI QR Payment Modal */}
      {qrTargetMember && (
        <PaymentPortalModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          mode="member"
          memberDetails={{
            gymId: selectedGymId,
            gymName: currentGym?.name || 'Iron House Fitness',
            memberId: qrTargetMember.id,
            memberName: qrTargetMember.fullName,
            phone: qrTargetMember.phone,
            planName: qrTargetMember.membershipPlan,
            amount:
              qrTargetMember.membershipPlan.toLowerCase().includes('annual')
                ? 12000
                : qrTargetMember.membershipPlan.toLowerCase().includes('6 month')
                ? 6500
                : 2500,
            autoCheckIn: true,
            onPaymentSuccess: () => {
              setCheckInResult({
                success: true,
                message: `Dues paid & entrance authorized! Welcome, ${qrTargetMember.fullName}.`,
                member: qrTargetMember,
              });
              setActiveKioskTab('checkin');
            },
          }}
        />
      )}
    </div>
  );
};
