import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PaymentMethod } from '../../types';
import { PaymentPortalModal } from '../payment/PaymentPortalModal';
import { Search, Plus, QrCode, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const PaymentRecords: React.FC = () => {
  const { auth, gyms, members, payments, addPayment } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);
  const gymPayments = payments.filter(p => p.gymId === currentGym.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(gymMembers[0]?.id || '');
  const [amount, setAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [referenceId, setReferenceId] = useState('');
  const [membershipPlan, setMembershipPlan] = useState('3 Months Quarterly');

  const selectedMember = gymMembers.find(m => m.id === selectedMemberId) || gymMembers[0];

  const filteredPayments = gymPayments.filter(p =>
    p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = gymPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = gymMembers.find(m => m.id === selectedMemberId);
    if (!member) return;

    addPayment({
      gymId: currentGym.id,
      memberId: member.id,
      memberName: member.fullName,
      amount: Number(amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceId: referenceId || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      membershipPlan,
    });
    setIsAddModalOpen(false);
  };

  const handleOpenQrForMember = (memberId: string, memberAmount: number, plan: string) => {
    setSelectedMemberId(memberId);
    setAmount(memberAmount);
    setMembershipPlan(plan);
    setIsQrModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2 text-[#5c62d6]">Accounting & Treasury</span>
          <h1 className="content-title">Financial Records</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Itemized membership remittance, live UPI QR settlements, and instant ledger reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-left md:text-right">
            <span className="nav-label-caps block">Aggregate Receipts</span>
            <span className="font-serif text-2xl font-semibold text-[#1a1a1a]">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="btn-editorial-primary flex items-center gap-2 cursor-pointer shadow-xs text-xs"
            >
              <QrCode className="w-3.5 h-3.5" /> Collect via UPI QR
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-editorial-outline flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions by member, receipt or UTR..."
            className="w-full bg-white border border-[#e6e4df] rounded px-4 py-2.5 pl-10 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
          />
          <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8a8a8a]">
          <span className="w-2 h-2 rounded-full bg-[#15803d]" />
          <span>Live UPI Gateway Listening</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="table-editorial">
          <thead>
            <tr>
              <th>Member Account</th>
              <th>Membership Plan</th>
              <th>Tender Amount</th>
              <th>Instrument & Reference</th>
              <th>Logged Date</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id} className="row-editorial">
                <td>
                  <div className="font-semibold text-sm text-[#1a1a1a]">{payment.memberName}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a]">ID: {payment.memberId}</div>
                </td>
                <td className="text-xs text-[#1a1a1a]">{payment.membershipPlan}</td>
                <td>
                  <span className="font-mono text-sm font-semibold text-[#1a1a1a]">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-[0.7rem] uppercase font-bold text-[#5c62d6] flex items-center gap-1">
                    {payment.paymentMethod === 'upi' ? (
                      <>
                        <QrCode className="w-3 h-3 text-[#5c62d6]" />
                        <span>UPI QR Scan</span>
                      </>
                    ) : (
                      payment.paymentMethod
                    )}
                  </span>
                  <span className="font-mono text-[0.65rem] text-[#8a8a8a] block">
                    {payment.referenceId || 'Over-the-counter'}
                  </span>
                </td>
                <td className="font-mono text-xs text-[#8a8a8a]">{payment.paymentDate}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="status-tag tag-active inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Settled
                  </span>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-[#8a8a8a] text-xs bg-white rounded border border-[#e6e4df]">
                  No financial transactions logged yet. Tap "Collect via UPI QR" to receive a payment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-editorial-body p-8 max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">Manual Treasury Entry</span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-6">Record Receipt</h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Member Beneficiary
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  {gymMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Settled Sum (INR)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Instrument
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  >
                    <option value="upi">UPI Gateway</option>
                    <option value="cash">Direct Cash</option>
                    <option value="bank_transfer">Wire Transfer</option>
                    <option value="card">Card POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Membership Term
                </label>
                <select
                  value={membershipPlan}
                  onChange={e => setMembershipPlan(e.target.value)}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  <option value="Monthly Pass">Monthly Pass</option>
                  <option value="3 Months Quarterly">3 Months Quarterly</option>
                  <option value="6 Months Unlimited">6 Months Unlimited</option>
                  <option value="1 Year Annual Pass">1 Year Annual Pass</option>
                </select>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 bg-[#5c62d6]/10 border border-[#5c62d6]/20 rounded text-xs flex items-center justify-between">
                  <span className="text-[#5c62d6] font-medium">Want to generate dynamic QR code?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsQrModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-[#5c62d6] text-white text-[11px] font-semibold rounded cursor-pointer"
                  >
                    Launch QR Portal
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Transaction UTR / Reference
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  placeholder="e.g. UPI/5829103948"
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live UPI QR Payment Portal for Member */}
      <PaymentPortalModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        mode="member"
        memberDetails={{
          gymId: currentGym.id,
          gymName: currentGym.name,
          memberId: selectedMember?.id || 'M-IH-101',
          memberName: selectedMember?.fullName || 'Member',
          phone: selectedMember?.phone,
          planName: membershipPlan,
          amount: Number(amount) || 3500,
        }}
      />

    </div>
  );
};
