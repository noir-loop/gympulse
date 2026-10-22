import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { QrCode, Search, UserCheck, Printer } from 'lucide-react';
import { MemberCheckInPage } from '../member/MemberCheckInPage';

export const AttendanceTracker: React.FC = () => {
  const { auth, gyms, members, attendance, manualAttendance } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymMembers = members.filter(m => m.gymId === currentGym.id);
  const gymAttendance = attendance.filter(a => a.gymId === currentGym.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [manualMemberId, setManualMemberId] = useState(gymMembers[0]?.id || '');

  const filteredAttendance = gymAttendance.filter(a => {
    const matchesSearch = 
      a.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.memberId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!selectedDate) return matchesSearch;
    return matchesSearch && a.date === selectedDate;
  });

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMemberId) return;
    manualAttendance(currentGym.id, manualMemberId);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = gymAttendance.filter(a => a.date === todayStr && a.status === 'success').length;

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">Access Control</span>
          <h1 className="content-title">Attendance Tracking</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Real-time turnstile and front-desk entry management.
          </p>
        </div>

        <button
          onClick={() => setIsQRModalOpen(true)}
          className="btn-editorial-primary cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" /> Launch Member QR Portal
        </button>
      </div>

      {/* QR Poster & Manual Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Printable QR Poster Card */}
        <div className="card-editorial p-8 text-center flex flex-col justify-between">
          <div>
            <span className="nav-label-caps block mb-4">Entrance Signage</span>
            <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-1">Facility QR Pass</h3>
            <p className="text-xs text-[#8a8a8a] mb-6">
              Mount this token at your entryway for smartphone check-ins.
            </p>
            
            <div className="w-44 h-44 mx-auto p-4 bg-[#f8f7f4] border border-[#e6e4df] rounded flex flex-col items-center justify-center text-[#1a1a1a] shadow-inner mb-4">
              <QrCode className="w-24 h-24 text-[#1a1a1a] mb-2" />
              <span className="font-mono text-[0.65rem] uppercase font-bold tracking-widest text-[#5c62d6]">
                {currentGym.name}
              </span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-editorial-outline w-full cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Facility Placard
          </button>
        </div>

        {/* Desk Registry Option */}
        <div className="lg:col-span-2 card-editorial p-8 flex flex-col justify-between">
          <div>
            <span className="nav-label-caps block mb-4">Administrative Override</span>
            <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-1">Front-Desk Verification</h3>
            <p className="text-xs text-[#8a8a8a] mb-8">
              Manually authenticate attendance for members without mobile devices or guest entries.
            </p>

            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Select Member Profile
                </label>
                <select
                  value={manualMemberId}
                  onChange={e => setManualMemberId(e.target.value)}
                  className="w-full bg-white border border-[#e6e4df] p-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
                >
                  {gymMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.id}) — {m.membershipPlan}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-editorial-primary w-full cursor-pointer py-3"
              >
                <UserCheck className="w-3.5 h-3.5" /> Log Check-In Record
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e6e4df] flex items-center justify-between text-xs text-[#8a8a8a]">
            <span>Today's Verified Check-Ins: <strong className="font-mono text-[#1a1a1a] text-sm">{todayCount}</strong></span>
            <span className="font-mono text-[0.7rem]">Anti-proxy constraint: 1 check-in/day</span>
          </div>
        </div>

      </div>

      {/* Attendance Log Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <span className="nav-label-caps">Attendance Ledger</span>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter entries..."
                className="bg-white border border-[#e6e4df] rounded px-3 py-2 pl-9 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              />
              <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-2.5" />
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-white border border-[#e6e4df] rounded px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-[#5c62d6] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-editorial">
            <thead>
              <tr>
                <th>Member Identity</th>
                <th>Catalog ID</th>
                <th>Date & Time</th>
                <th>Authentication</th>
                <th style={{ textAlign: 'right' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(att => (
                <tr key={att.id} className="row-editorial">
                  <td className="font-semibold text-sm text-[#1a1a1a]">{att.memberName}</td>
                  <td className="font-mono text-xs text-[#8a8a8a]">{att.memberId}</td>
                  <td className="text-xs text-[#1a1a1a]">{att.date} at {att.time}</td>
                  <td className="font-mono text-[0.7rem] uppercase text-[#8a8a8a]">
                    {att.method.replace('_', ' ')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`status-tag ${
                      att.status === 'success'
                        ? 'tag-active'
                        : att.status === 'duplicate'
                        ? 'tag-warning'
                        : 'tag-expired'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#8a8a8a] text-xs bg-white rounded border border-[#e6e4df]">
                    No attendance records located.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isQRModalOpen && (
        <MemberCheckInPage onClose={() => setIsQRModalOpen(false)} />
      )}

    </div>
  );
};
