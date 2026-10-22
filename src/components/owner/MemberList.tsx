import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, MembershipStatus, PaymentStatus } from '../../types';
import { Search, X, QrCode, CreditCard } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { PaymentPortalModal } from '../payment/PaymentPortalModal';

interface MemberListProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({ isAddModalOpen: externalAddOpen = false, onCloseAddModal }) => {
  const { auth, gyms, members, addMember, updateMember, deleteMember, showToast } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isAddOpen, setIsAddOpen] = useState(externalAddOpen);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [qrMember, setQrMember] = useState<Member | null>(null);
  const [payQrMember, setPayQrMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  React.useEffect(() => {
    if (externalAddOpen) {
      handleOpenAdd();
    }
  }, [externalAddOpen]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+91 ',
    email: '',
    membershipPlan: '6 Months Unlimited',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'paid' as PaymentStatus,
    emergencyContact: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      phone: '+91 ',
      email: '',
      membershipPlan: '6 Months Unlimited',
      membershipStartDate: new Date().toISOString().split('T')[0],
      membershipEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'paid',
      emergencyContact: '',
      notes: '',
    });
    setEditingMember(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || '',
      membershipPlan: member.membershipPlan,
      membershipStartDate: member.membershipStartDate,
      membershipEndDate: member.membershipEndDate,
      paymentStatus: member.paymentStatus,
      emergencyContact: member.emergencyContact || '',
      notes: member.notes || '',
    });
    setIsAddOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        membershipPlan: formData.membershipPlan,
        membershipStartDate: formData.membershipStartDate,
        membershipEndDate: formData.membershipEndDate,
        paymentStatus: formData.paymentStatus,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
      });
    } else {
      addMember({
        gymId: currentGym.id,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        membershipPlan: formData.membershipPlan,
        membershipStartDate: formData.membershipStartDate,
        membershipEndDate: formData.membershipEndDate,
        paymentStatus: formData.paymentStatus,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
      });
    }
    setIsAddOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const filteredMembers = gymMembers.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && m.membershipStatus === statusFilter;
  });

  const exportCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Phone', 'Plan', 'Start Date', 'End Date', 'Status', 'Payment'];
    const rows = filteredMembers.map(m => [
      m.id,
      `"${m.fullName}"`,
      m.phone,
      `"${m.membershipPlan}"`,
      m.membershipStartDate,
      m.membershipEndDate,
      m.membershipStatus,
      m.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentGym.name}_members_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Member profiles exported successfully.');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Content Header matching Variation 3 */}
      <div className="content-header">
        <h1 className="content-title">Members</h1>
        <p className="text-[1rem] text-[#8a8a8a] mt-2">
          Total {filteredMembers.length} registered profiles in your repository.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entries by ID, name or contact..."
            className="w-full bg-white border border-[#e6e4df] rounded px-4 py-3 pl-11 text-[0.85rem] text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] transition-colors"
          />
          <Search className="w-4 h-4 text-[#8a8a8a] absolute left-4 top-3.5" />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter pills */}
          <div className="hidden sm:flex items-center border border-[#e6e4df] rounded bg-white p-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'expiring_soon', label: 'Expiring' },
              { id: 'expired', label: 'Expired' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-[0.7rem] uppercase font-semibold tracking-wider rounded transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#5c62d6] text-white'
                    : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="btn-editorial-outline cursor-pointer"
          >
            Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-editorial-primary cursor-pointer"
          >
            + New Member
          </button>
        </div>
      </div>

      {/* Table matching Variation 3 */}
      <div className="overflow-x-auto">
        <table className="table-editorial">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Connection</th>
              <th>Plan Details</th>
              <th>Validity</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id} className="row-editorial">
                <td>
                  <div className="font-semibold text-[1rem] text-[#1a1a1a]">{member.fullName}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a] mt-1">ID: {member.id}</div>
                </td>
                <td>
                  <div className="text-[0.85rem] text-[#1a1a1a]">{member.phone}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a] mt-1">{member.email || 'No email provided'}</div>
                </td>
                <td>
                  <div className="text-[0.85rem] text-[#1a1a1a] font-medium">{member.membershipPlan}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a] mt-1">Joined {member.joinDate}</div>
                </td>
                <td>
                  <div className="text-[0.85rem] text-[#1a1a1a]">{member.membershipEndDate}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a] mt-1">
                    Vis. {member.lastAttendanceDate ? member.lastAttendanceDate.slice(5) : 'None'}
                  </div>
                </td>
                <td>
                  <span className={`status-tag ${
                    member.membershipStatus === 'active'
                      ? 'tag-active'
                      : member.membershipStatus === 'expiring_soon'
                      ? 'tag-warning'
                      : 'tag-expired'
                  }`}>
                    {member.membershipStatus.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPayQrMember(member)}
                      className="btn-editorial-primary !py-1 !px-2.5 !text-[0.65rem] flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Collect Fee via Live UPI QR"
                    >
                      <CreditCard className="w-2.5 h-2.5" /> Pay QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrMember(member)}
                      className="btn-editorial-outline !py-1 !px-2.5 !text-[0.65rem] cursor-pointer"
                      title="Member QR Code Pass"
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="btn-editorial-outline !py-1 !px-2.5 !text-[0.65rem] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(member.id)}
                      className="btn-editorial-outline !py-1 !px-2 !text-[0.65rem] text-[#b91c1c] hover:border-[#b91c1c] hover:text-[#b91c1c] cursor-pointer"
                      title="Archive Profile"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-[#8a8a8a] text-sm bg-white rounded border border-[#e6e4df]">
                  No member records found in this repository.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member QR Code Modal */}
      {qrMember && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setQrMember(null)}>
          <div className="modal-editorial-body p-10 max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">Attendance Pass</span>
              <button onClick={() => setQrMember(null)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-40 h-40 mx-auto p-4 bg-white border border-[#e6e4df] rounded flex flex-col items-center justify-center mb-4 shadow-sm">
              <QrCode className="w-20 h-20 text-[#1a1a1a] mb-2" />
              <span className="font-mono text-[0.7rem] font-bold tracking-wider text-[#1a1a1a]">{qrMember.id}</span>
            </div>

            <h3 className="font-serif text-2xl font-semibold text-[#1a1a1a] mb-1">{qrMember.fullName}</h3>
            <p className="text-xs text-[#8a8a8a] mb-3">{qrMember.membershipPlan}</p>
            <span className={`status-tag ${qrMember.membershipStatus === 'active' ? 'tag-active' : 'tag-expired'}`}>
              {qrMember.membershipStatus}
            </span>

            <div className="mt-8 pt-4 border-t border-[#e6e4df]">
              <button
                onClick={() => setQrMember(null)}
                className="btn-editorial-outline w-full cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration / Edit Modal matching Variation 3 */}
      {(isAddOpen || externalAddOpen) && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => {
          setIsAddOpen(false);
          if (onCloseAddModal) onCloseAddModal();
        }}>
          <div className="modal-editorial-body p-10 max-w-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-4xl font-medium text-[#1a1a1a] mb-8">
              {editingMember ? 'Update Profile' : 'Registration'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@domain.com"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Plan Type
                </label>
                <select
                  value={formData.membershipPlan}
                  onChange={e => {
                    const plan = e.target.value;
                    const days = plan.includes('Annual') ? 365 : plan.includes('6 Months') ? 180 : plan.includes('Quarterly') ? 90 : 30;
                    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setFormData({ ...formData, membershipPlan: plan, membershipEndDate: end });
                  }}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  <option value="Monthly Pass">Monthly Pass (₹2,000)</option>
                  <option value="3 Months Quarterly">3 Months Quarterly (₹5,000)</option>
                  <option value="6 Months Unlimited">6 Months Unlimited (₹9,000)</option>
                  <option value="1 Year Annual Pass">1 Year Annual Pass (₹15,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.membershipStartDate}
                    onChange={e => setFormData({ ...formData, membershipStartDate: e.target.value })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Conclusion Date
                  </label>
                  <input
                    type="date"
                    value={formData.membershipEndDate}
                    onChange={e => setFormData({ ...formData, membershipEndDate: e.target.value })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Billing State
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Emerg. Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Relation & Number"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Internal Trainer Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  {editingMember ? 'Update Profile' : 'Complete Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        title="Archive Profile"
        message="Are you sure you want to archive this member profile? Historical visit and billing logs will remain cataloged."
        confirmText="Archive Entry"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) {
            deleteMember(deleteId);
            setDeleteId(null);
          }
        }}
        onClose={() => setDeleteId(null)}
      />

      {/* Member Live UPI QR Payment Modal */}
      {payQrMember && (
        <PaymentPortalModal
          isOpen={!!payQrMember}
          onClose={() => setPayQrMember(null)}
          mode="member"
          memberDetails={{
            gymId: currentGym.id,
            gymName: currentGym.name,
            memberId: payQrMember.id,
            memberName: payQrMember.fullName,
            phone: payQrMember.phone,
            planName: payQrMember.membershipPlan,
            amount:
              payQrMember.membershipPlan.toLowerCase().includes('annual')
                ? 12000
                : payQrMember.membershipPlan.toLowerCase().includes('6 month')
                ? 6500
                : 2500,
            onPaymentSuccess: () => {
              setPayQrMember(null);
            },
          }}
        />
      )}

    </div>
  );
};
