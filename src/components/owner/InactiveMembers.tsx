import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { FollowUpStatus, Member } from '../../types';
import { MessageSquare, ExternalLink, X } from 'lucide-react';

export const InactiveMembers: React.FC = () => {
  const { auth, gyms, members, updateFollowUpStatus } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);

  const [thresholdDays, setThresholdDays] = useState<number>(5);
  const [selectedMemberForMsg, setSelectedMemberForMsg] = useState<Member | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');

  const now = new Date().getTime();
  const inactiveMembers = gymMembers.filter(m => {
    if (!m.lastAttendanceDate) return false;
    const lastVisit = new Date(m.lastAttendanceDate).getTime();
    const diffDays = Math.floor((now - lastVisit) / (1000 * 3600 * 24));
    return diffDays >= thresholdDays;
  }).map(m => {
    const lastVisit = new Date(m.lastAttendanceDate!).getTime();
    const daysSince = Math.floor((now - lastVisit) / (1000 * 3600 * 24));
    return { ...m, daysSince };
  });

  const handleOpenWhatsApp = (member: Member) => {
    setSelectedMemberForMsg(member);
    setCustomMessage(`Salutations ${member.fullName}! We have noted your absence at ${currentGym.name} recently. We trust everything is well and invite you to recommence your training schedule.`);
  };

  const handleSendWhatsApp = () => {
    if (!selectedMemberForMsg) return;
    const cleanPhone = selectedMemberForMsg.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
    updateFollowUpStatus(selectedMemberForMsg.id, 'contacted');
    setSelectedMemberForMsg(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">Member Retention</span>
          <h1 className="content-title">Active Follow-ups</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Detect dormancy and initiate proactive retention dispatches via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-1.5 border border-[#e6e4df] rounded bg-white p-1">
          <span className="text-[0.7rem] uppercase font-semibold text-[#8a8a8a] px-3">Absence Threshold:</span>
          {[3, 5, 7, 14].map(days => (
            <button
              key={days}
              onClick={() => setThresholdDays(days)}
              className={`px-3 py-1.5 rounded text-[0.7rem] uppercase font-semibold tracking-wider transition-all cursor-pointer ${
                thresholdDays === days
                  ? 'bg-[#5c62d6] text-white'
                  : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              {days}+ Days
            </button>
          ))}
        </div>
      </div>

      {/* Inactive Members Table */}
      <div className="overflow-x-auto">
        <table className="table-editorial">
          <thead>
            <tr>
              <th>Profile Identity</th>
              <th>Contact Details</th>
              <th>Dormancy Period</th>
              <th>Term Validity</th>
              <th>Engagement State</th>
              <th style={{ textAlign: 'right' }}>Outreach</th>
            </tr>
          </thead>
          <tbody>
            {inactiveMembers.map(member => (
              <tr key={member.id} className="row-editorial">
                <td>
                  <div className="font-semibold text-sm text-[#1a1a1a]">{member.fullName}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a]">ID: {member.id}</div>
                </td>
                <td>
                  <div className="text-xs text-[#1a1a1a]">{member.phone}</div>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a]">{member.membershipPlan}</div>
                </td>
                <td>
                  <span className="font-mono text-xs font-semibold text-[#b45309]">
                    {member.daysSince} Days Absent
                  </span>
                  <div className="font-mono text-[0.65rem] text-[#8a8a8a]">Last visit {member.lastAttendanceDate}</div>
                </td>
                <td>
                  <div className="text-xs text-[#1a1a1a]">{member.membershipEndDate}</div>
                </td>
                <td>
                  <select
                    value={member.followUpStatus}
                    onChange={e => updateFollowUpStatus(member.id, e.target.value as FollowUpStatus)}
                    className="bg-white border border-[#e6e4df] rounded p-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                  >
                    <option value="not_contacted">Pending Outreach</option>
                    <option value="contacted">Dispatched WA</option>
                    <option value="interested">Returning</option>
                    <option value="returned">Re-engaged ✓</option>
                    <option value="not_interested">Terminated</option>
                  </select>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenWhatsApp(member)}
                    className="btn-editorial-primary !py-1.5 !px-3 !text-[0.7rem] cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Dispatch Note
                  </button>
                </td>
              </tr>
            ))}
            {inactiveMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-[#8a8a8a] text-sm bg-white rounded border border-[#e6e4df]">
                  Exemplary adherence. No profiles meet the {thresholdDays}-day dormancy threshold.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Message Modal */}
      {selectedMemberForMsg && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setSelectedMemberForMsg(null)}>
          <div className="modal-editorial-body p-8 max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">Retention Dispatch</span>
              <button onClick={() => setSelectedMemberForMsg(null)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-2">Compose Note</h3>
            <p className="text-xs text-[#8a8a8a] mb-6">
              Recipient: <strong className="text-[#1a1a1a]">{selectedMemberForMsg.fullName}</strong> ({selectedMemberForMsg.phone})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Drafted Communiqué
                </label>
                <textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-[#e6e4df] p-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] leading-relaxed"
                />
              </div>

              <div className="p-3 bg-white border border-[#e6e4df] text-xs text-[#8a8a8a] rounded">
                This dispatch will open the native WhatsApp portal pre-configured with the drafted greeting.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e4df]">
                <button
                  onClick={() => setSelectedMemberForMsg(null)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="btn-editorial-primary cursor-pointer"
                >
                  Launch WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
