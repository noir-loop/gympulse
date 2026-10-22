import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, PaymentMethod } from '../../types';
import { Clock, AlertTriangle, RefreshCw, X } from 'lucide-react';

export const ExpiryManager: React.FC = () => {
  const { auth, gyms, members, renewMembership } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);

  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('6 Months Unlimited');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  const now = new Date().getTime();

  const membersWithExpiry = gymMembers.map(m => {
    const end = new Date(m.membershipEndDate).getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return { ...m, diffDays };
  });

  const expiringSoon = membersWithExpiry.filter(m => m.diffDays >= 0 && m.diffDays <= 7);
  const expiredMembers = membersWithExpiry.filter(m => m.diffDays < 0);

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMember) return;

    const months = selectedPlan.includes('Annual') ? 12 : selectedPlan.includes('6 Months') ? 6 : selectedPlan.includes('Quarterly') ? 3 : 1;
    const amount = selectedPlan.includes('Annual') ? 15000 : selectedPlan.includes('6 Months') ? 9000 : selectedPlan.includes('Quarterly') ? 5000 : 2000;

    renewMembership(renewingMember.id, selectedPlan, months, amount, paymentMethod);
    setRenewingMember(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">Term Surveillance</span>
          <h1 className="content-title">Expiry Alerts</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Imminent agreement conclusions and membership renewal execution.
          </p>
        </div>
      </div>

      {/* Expiring Soon Section */}
      <div className="space-y-4">
        <span className="nav-label-caps text-[#b45309]">
          Concurrence Expiring in ≤ 7 Days ({expiringSoon.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiringSoon.map(member => (
            <div key={member.id} className="card-editorial p-6 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-base text-[#1a1a1a]">{member.fullName}</div>
                <div className="font-mono text-xs text-[#8a8a8a] mt-0.5">{member.phone} • {member.membershipPlan}</div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="status-tag tag-warning">
                    Concludes in {member.diffDays} Days
                  </span>
                  <span className="font-mono text-xs text-[#8a8a8a]">{member.membershipEndDate}</span>
                </div>
              </div>

              <button
                onClick={() => setRenewingMember(member)}
                className="btn-editorial-primary !py-2 !px-3.5 !text-[0.7rem] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Re-enroll
              </button>
            </div>
          ))}
          {expiringSoon.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8a8a8a] bg-white border border-[#e6e4df] rounded col-span-2">
              No memberships approaching expiration within 7 days.
            </div>
          )}
        </div>
      </div>

      {/* Concluded / Expired Section */}
      <div className="space-y-4 pt-6">
        <span className="nav-label-caps text-[#b91c1c]">
          Concluded Agreements ({expiredMembers.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredMembers.map(member => (
            <div key={member.id} className="card-editorial p-6 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-base text-[#1a1a1a]">{member.fullName}</div>
                <div className="font-mono text-xs text-[#8a8a8a] mt-0.5">{member.phone} • {member.membershipPlan}</div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="status-tag tag-expired">
                    Concluded {Math.abs(member.diffDays)} Days Ago
                  </span>
                  <span className="font-mono text-xs text-[#8a8a8a]">{member.membershipEndDate}</span>
                </div>
              </div>

              <button
                onClick={() => setRenewingMember(member)}
                className="btn-editorial-outline !py-2 !px-3.5 !text-[0.7rem] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Re-enroll
              </button>
            </div>
          ))}
          {expiredMembers.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8a8a8a] bg-white border border-[#e6e4df] rounded col-span-2">
              Zero expired records. Complete facility retention.
            </div>
          )}
        </div>
      </div>

      {/* Renewal Modal */}
      {renewingMember && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setRenewingMember(null)}>
          <div className="modal-editorial-body p-8 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">Agreement Extension</span>
              <button onClick={() => setRenewingMember(null)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-1">{renewingMember.fullName}</h3>
            <p className="text-xs text-[#8a8a8a] mb-6">Prior Conclusion: {renewingMember.membershipEndDate}</p>

            <form onSubmit={handleRenewSubmit} className="space-y-5">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Select Renewal Term
                </label>
                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  <option value="Monthly Pass">Monthly Pass (₹2,000)</option>
                  <option value="3 Months Quarterly">3 Months Quarterly (₹5,000)</option>
                  <option value="6 Months Unlimited">6 Months Unlimited (₹9,000)</option>
                  <option value="1 Year Annual Pass">1 Year Annual Pass (₹15,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Settlement Instrument
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  <option value="upi">UPI (Instant Settlement)</option>
                  <option value="cash">Cash Tender</option>
                  <option value="bank_transfer">Wire / Bank Transfer</option>
                  <option value="card">Card Terminal</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setRenewingMember(null)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  Authorize Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
