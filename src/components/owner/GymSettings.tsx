import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Save, Sparkles, RefreshCw } from 'lucide-react';
import { SystemUpdateModal } from '../common/SystemUpdateModal';

export const GymSettings: React.FC = () => {
  const { auth, gyms, updateGym, appVersion, isUpdateAvailable, updateInfo, checkForUpdates } = useGym();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];

  const [formData, setFormData] = useState({
    name: currentGym.name,
    ownerName: currentGym.ownerName,
    phone: currentGym.phone,
    email: currentGym.email,
    address: currentGym.address,
    logoText: currentGym.logoText,
    accentColor: currentGym.accentColor,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGym(currentGym.id, formData);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">Facility Configuration</span>
          <h1 className="content-title">Organization Settings</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Institutional branding, address registry, and contact attributes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-editorial p-10 max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Institution Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              required
            />
          </div>
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Principal Owner / Officer
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Telephony Contact
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              required
            />
          </div>
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Official Electronic Mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
            Facility Physical Address
          </label>
          <textarea
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            rows={2}
            className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Insignia Monogram (1-3 glyphs)
            </label>
            <input
              type="text"
              value={formData.logoText}
              onChange={e => setFormData({ ...formData, logoText: e.target.value })}
              maxLength={3}
              className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm font-mono text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6]"
              required
            />
          </div>
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
              Brand Accent Tone
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-10 h-10 bg-white border border-[#e6e4df] rounded cursor-pointer"
              />
              <span className="font-mono text-xs text-[#8a8a8a]">{formData.accentColor}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#e6e4df] flex justify-end">
          <button
            type="submit"
            className="btn-editorial-primary cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </form>

      {/* System Release & Software Update Governance */}
      <div className="card-editorial p-8 max-w-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="nav-label-caps block text-[#5c62d6]">Software Version & OTA Releases</span>
            <h3 className="font-serif text-2xl font-medium text-[#1a1a1a]">
              GymPulse Engine {appVersion}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-1">
              Zero-downtime hot patches, UPI settlement protocols, and multi-tenant ledger synchronization.
            </p>
          </div>

          <div className="shrink-0">
            {isUpdateAvailable ? (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="btn-editorial-primary flex items-center gap-2 cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" /> Install Update ({updateInfo.version})
              </button>
            ) : (
              <button
                type="button"
                onClick={checkForUpdates}
                className="btn-editorial-outline flex items-center gap-2 cursor-pointer text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Check for Releases
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border border-[#e6e4df] rounded text-xs font-mono flex flex-col sm:flex-row justify-between gap-2 text-[#8a8a8a]">
          <span>Current Channel: Production Stable</span>
          <span>Status: {isUpdateAvailable ? `Patch Available (${updateInfo.version})` : 'Up to date'}</span>
        </div>
      </div>

      <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
    </div>
  );
};
