import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import {
  Users,
  UserCheck,
  QrCode,
  Clock,
  AlertTriangle,
  CreditCard,
  Plus,
  ShieldCheck,
  Percent,
  X,
} from 'lucide-react';

interface OwnerDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddMember?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigate, onOpenAddMember }) => {
  const { auth, gyms, members, attendance, payments, subscriptions, addMember, showToast } = useGym();

  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);
  const gymAttendance = attendance.filter(a => a.gymId === currentGym.id);
  const gymPayments = payments.filter(p => p.gymId === currentGym.id);
  const gymSub = subscriptions.find(s => s.gymId === currentGym.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = gymAttendance.filter(a => a.date === todayStr && a.status === 'success').length;
  const activeMembersCount = gymMembers.filter(m => m.membershipStatus === 'active').length;
  const expiringSoonCount = gymMembers.filter(m => m.membershipStatus === 'expiring_soon').length;
  const expiredCount = gymMembers.filter(m => m.membershipStatus === 'expired').length;

  const inactiveCount = gymMembers.filter(m => {
    if (!m.lastAttendanceDate) return true;
    const diff = (new Date().getTime() - new Date(m.lastAttendanceDate).getTime()) / (1000 * 3600 * 24);
    return diff >= 5;
  }).length;

  const totalRevenue = gymPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Admin control state for offers / discounts
  const [hasOffer, setHasOffer] = useState<boolean>(true);
  const [offerTitle, setOfferTitle] = useState<string>('Festival Season Pass: 20% Privilege on 6-Month Terms');
  const [offerCode, setOfferCode] = useState<string>('PULSE20');

  // Add Member Modal state directly in dashboard
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    fullName: '',
    phone: '+91 ',
    email: '',
    membershipPlan: '6 Months Unlimited',
    months: 6,
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'paid' as 'paid' | 'pending',
    emergencyContact: '',
    notes: '',
  });

  const handlePlanChange = (plan: string, months: number) => {
    const startDate = newMemberData.membershipStartDate;
    const endDate = new Date(new Date(startDate).getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setNewMemberData({
      ...newMemberData,
      membershipPlan: plan,
      months,
      membershipEndDate: endDate,
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.fullName.trim()) return;

    addMember({
      gymId: currentGym.id,
      fullName: newMemberData.fullName.trim(),
      phone: newMemberData.phone.trim(),
      email: newMemberData.email.trim(),
      membershipPlan: newMemberData.membershipPlan,
      membershipStartDate: newMemberData.membershipStartDate,
      membershipEndDate: newMemberData.membershipEndDate,
      paymentStatus: newMemberData.paymentStatus,
      emergencyContact: newMemberData.emergencyContact.trim(),
      notes: newMemberData.notes.trim(),
    });

    showToast(`Member ${newMemberData.fullName.trim()} registered successfully!`, 'success');
    setIsAddModalOpen(false);
    setNewMemberData({
      fullName: '',
      phone: '+91 ',
      email: '',
      membershipPlan: '6 Months Unlimited',
      months: 6,
      membershipStartDate: new Date().toISOString().split('T')[0],
      membershipEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'paid',
      emergencyContact: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 md:pb-8">
      
      {/* Editorial Content Header matching Variation 3 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">{currentGym.name}</span>
          <h1 className="content-title">Overview</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Real-time management ledger and facility vitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-editorial-primary cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> New Member
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="btn-editorial-outline cursor-pointer flex items-center gap-2"
          >
            <QrCode className="w-3.5 h-3.5" /> Attendance Portal
          </button>
        </div>
      </div>

      {/* Offers & Active Promotions Section */}
      <div className="card-editorial p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#e6e4df]">
          <div className="flex items-center gap-3">
            <span className="nav-label-caps text-[#5c62d6]">Promotional Campaign</span>
            <span className="text-xs text-[#8a8a8a]">•</span>
            <span className="text-xs text-[#8a8a8a]">Member Retention Initiative</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-[#8a8a8a] font-medium">Status</span>
            <button
              onClick={() => setHasOffer(!hasOffer)}
              className={`px-3 py-1 rounded text-[0.7rem] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                hasOffer
                  ? 'bg-[#e7f7f0] text-[#15803d] border border-[#15803d]/20'
                  : 'bg-white text-[#8a8a8a] border border-[#e6e4df]'
              }`}
            >
              {hasOffer ? 'Active Campaign' : 'Inactive'}
            </button>
          </div>
        </div>

        {hasOffer ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
            <div className="md:col-span-2 space-y-2">
              <span className="font-mono text-[0.7rem] uppercase tracking-wider text-[#5c62d6] font-semibold">
                Authorization Code: {offerCode}
              </span>
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a]">{offerTitle}</h3>
              <p className="text-xs text-[#8a8a8a] leading-relaxed">
                Automated check-in kiosks display this concession banner to attending members upon entrance.
              </p>
            </div>

            <div className="bg-[#f8f7f4] border border-[#e6e4df] p-6 text-center rounded flex flex-col justify-center items-center">
              <span className="font-serif text-3xl italic text-[#5c62d6] font-semibold">20% Off</span>
              <span className="text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] mt-1 font-medium">Seasonal Discount</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#8a8a8a]">
            No promotional broadcast active. Regular rates enforced.
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('members')}
          className="card-editorial p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="nav-label-caps">Enrollment</span>
            <Users className="w-4 h-4 text-[#8a8a8a]" />
          </div>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">{activeMembersCount}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">
            of {gymMembers.length} Total Registered
          </div>
        </div>

        <div 
          onClick={() => onNavigate('attendance')}
          className="card-editorial p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="nav-label-caps">Visits Today</span>
            <UserCheck className="w-4 h-4 text-[#8a8a8a]" />
          </div>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">{todayAttendanceCount}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">
            Recorded via QR & Desk
          </div>
        </div>

        <div 
          onClick={() => onNavigate('followups')}
          className="card-editorial p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="nav-label-caps">Absence Flag</span>
            <AlertTriangle className="w-4 h-4 text-[#8a8a8a]" />
          </div>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">{inactiveCount}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">
            Absent 5+ Days
          </div>
        </div>

        <div 
          onClick={() => onNavigate('payments')}
          className="card-editorial p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="nav-label-caps">Revenue Recorded</span>
            <CreditCard className="w-4 h-4 text-[#8a8a8a]" />
          </div>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">
            Total Collections
          </div>
        </div>
      </div>

      {/* Warning Notice if Expiring */}
      {(expiringSoonCount > 0 || expiredCount > 0) && (
        <div 
          onClick={() => onNavigate('expiry')}
          className="p-4 border border-[#e6e4df] bg-transparent rounded flex items-center justify-between cursor-pointer hover:border-[#5c62d6] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#8a8a8a]" />
            <span className="text-xs text-[#1a1a1a]">
              <strong>Term Expiry Notice:</strong> {expiringSoonCount} profiles expiring within 7 days; {expiredCount} memberships concluded.
            </span>
          </div>
          <span className="text-[0.75rem] uppercase font-bold text-[#5c62d6] tracking-wider">
            Review Expirations →
          </span>
        </div>
      )}

      {/* Recent Activity Table and SaaS Subscription Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="nav-label-caps">Recent Attendance Check-Ins</span>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs text-[#5c62d6] font-medium hover:underline cursor-pointer"
            >
              Full Ledger →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-editorial">
              <thead>
                <tr>
                  <th>Member Identity</th>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {gymAttendance.slice(0, 5).map(att => (
                  <tr key={att.id} className="row-editorial">
                    <td>
                      <div className="font-semibold text-sm text-[#1a1a1a]">{att.memberName}</div>
                      <div className="font-mono text-[0.65rem] text-[#8a8a8a]">ID: {att.memberId}</div>
                    </td>
                    <td>
                      <div className="text-xs text-[#1a1a1a]">{att.date}</div>
                      <div className="font-mono text-[0.65rem] text-[#8a8a8a]">{att.time}</div>
                    </td>
                    <td>
                      <span className="font-mono text-[0.65rem] uppercase text-[#8a8a8a]">
                        {att.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`status-tag ${att.status === 'success' ? 'tag-active' : 'tag-expired'}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {gymAttendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-xs text-[#8a8a8a] bg-white border border-[#e6e4df] rounded">
                      No visits logged today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="card-editorial p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">SaaS Subscription</span>
              <ShieldCheck className="w-4 h-4 text-[#5c62d6]" />
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-2">{gymSub?.planName || 'Growth License'}</h3>
            <p className="text-xs text-[#8a8a8a] mb-6 leading-relaxed">
              Full multi-tenant facilities access including QR kiosks, analytics, and automated member retention tooling.
            </p>

            <div className="space-y-3 font-mono text-xs pt-4 border-t border-[#e6e4df]">
              <div className="flex justify-between">
                <span className="text-[#8a8a8a]">Billing Rate:</span>
                <span className="font-semibold text-[#1a1a1a]">₹{gymSub?.price.toLocaleString('en-IN')} / Term</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8a8a]">Valid Through:</span>
                <span className="font-semibold text-[#1a1a1a]">{gymSub?.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8a8a]">State:</span>
                <span className="font-bold uppercase text-[#15803d]">{gymSub?.status}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('subscription')}
            className="btn-editorial-outline w-full mt-8 cursor-pointer"
          >
            Manage Enterprise Terms
          </button>
        </div>

      </div>

      {/* Add Member Modal directly in OwnerDashboard */}
      {isAddModalOpen && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-editorial-body p-8 max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <div>
                <span className="nav-label-caps block text-[#5c62d6]">Enrollment Ledger</span>
                <h3 className="font-serif text-2xl font-medium text-[#1a1a1a]">Register New Member</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newMemberData.fullName}
                  onChange={e => setNewMemberData({ ...newMemberData, fullName: e.target.value })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberData.phone}
                    onChange={e => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={newMemberData.email}
                    onChange={e => setNewMemberData({ ...newMemberData, email: e.target.value })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Membership Tier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {[
                    { name: '1 Month Standard', months: 1, label: '1 Month' },
                    { name: 'Quarterly Strength', months: 3, label: '3 Months' },
                    { name: '6 Months Unlimited', months: 6, label: '6 Months' },
                    { name: 'Annual Pro', months: 12, label: '1 Year' },
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handlePlanChange(p.name, p.months)}
                      className={`p-2 text-xs rounded border transition-colors cursor-pointer text-center ${
                        newMemberData.membershipPlan === p.name
                          ? 'border-[#5c62d6] bg-[#5c62d6]/10 text-[#5c62d6] font-semibold'
                          : 'border-[#e6e4df] bg-white text-[#1a1a1a] hover:border-[#5c62d6]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newMemberData.membershipStartDate}
                    onChange={e => {
                      const newStart = e.target.value;
                      const newEnd = new Date(new Date(newStart).getTime() + newMemberData.months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setNewMemberData({ ...newMemberData, membershipStartDate: newStart, membershipEndDate: newEnd });
                    }}
                    className="w-full bg-white border border-[#e6e4df] p-2 text-xs font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newMemberData.membershipEndDate}
                    onChange={e => setNewMemberData({ ...newMemberData, membershipEndDate: e.target.value })}
                    className="w-full bg-white border border-[#e6e4df] p-2 text-xs font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Initial Payment Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={newMemberData.paymentStatus === 'paid'}
                      onChange={() => setNewMemberData({ ...newMemberData, paymentStatus: 'paid' })}
                      className="accent-[#5c62d6]"
                    />
                    <span>Paid in Full</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={newMemberData.paymentStatus === 'pending'}
                      onChange={() => setNewMemberData({ ...newMemberData, paymentStatus: 'pending' })}
                      className="accent-[#5c62d6]"
                    />
                    <span>Pending Settlement</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6e4df]">
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
                  <Plus className="w-3.5 h-3.5" /> Confirm & Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
