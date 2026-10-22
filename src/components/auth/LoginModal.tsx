import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { ArrowRight, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useClerkAuth, GoogleLogoSvg, GoogleSignInButton } from './ClerkAuthProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { auth, login, gyms, resetDemoData, showToast } = useGym();
  const { isConfigured, openSetupModal, signInWithGoogleAccount } = useClerkAuth();
  
  const [selectedGymId, setSelectedGymId] = useState<string>(gyms[0]?.id || 'gym-iron-house');
  const [username, setUsername] = useState<string>(gyms[0]?.ownerName || 'Vikram Malhotra');
  const [passcode, setPasscode] = useState<string>('••••••••');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = passcode.trim();

    // Direct Super Admin detection
    if (
      normalizedUser === 'superadmin' ||
      normalizedUser === 'admin' ||
      normalizedPass === 'admin123'
    ) {
      login('super_admin', undefined, 'Platform Super Admin');
      showToast('Welcome, Super Administrator', 'info');
      onClose();
      return;
    }

    // Otherwise authenticate as Gym Owner
    const selectedGym = gyms.find(g => g.id === selectedGymId) || gyms[0];
    const finalOwnerName = username.trim() || selectedGym.ownerName;
    
    login('gym_owner', selectedGym.id, finalOwnerName);
    showToast(`Welcome back, ${finalOwnerName} (${selectedGym.name})`, 'info');
    onClose();
  };

  return (
    <div className="modal-editorial-wrap animate-fade-in">
      <div className="modal-editorial-body p-8 sm:p-10 max-w-md bg-[#f8f7f4] border border-[#e6e4df] shadow-2xl rounded-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="brand-serif text-3xl font-semibold italic text-[#5c62d6] mb-1">
            GymPulse
          </div>
          <p className="text-[0.7rem] uppercase tracking-widest text-[#8a8a8a] font-medium font-mono">
            Unified Management Access
          </p>
        </div>

        {/* Primary: Clerk Google / Gmail Authentication */}
        <div className="mb-6 p-4 rounded-xl border border-[#5c62d6]/20 bg-[#5c62d6]/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <GoogleLogoSvg className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#1a1a1a]">Google / Gmail Login</span>
            </div>
            <span className="text-[0.62rem] font-mono text-[#5c62d6] bg-[#5c62d6]/10 px-1.5 py-0.5 rounded">
              Clerk Auth
            </span>
          </div>

          {auth.email ? (
            <div className="p-3 bg-white rounded-lg border border-[#e6e4df] space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-medium text-[#1a1a1a] truncate">{auth.email}</p>
                  <p className="text-[0.65rem] text-[#8a8a8a] font-mono">Authenticated via Google</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-editorial-primary w-full py-2 text-xs font-medium cursor-pointer"
              >
                Continue to Dashboard &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <GoogleSignInButton
                label="Sign In with Google (Gmail)"
                onSuccess={onClose}
              />

              <div className="flex items-center justify-between text-[0.68rem] text-[#666] pt-1">
                <span>Fast test with prompt Gmail:</span>
                <button
                  type="button"
                  onClick={() => {
                    signInWithGoogleAccount('f33547501@gmail.com', 'Vikram Malhotra');
                    showToast('Authenticated as f33547501@gmail.com', 'success');
                    onClose();
                  }}
                  className="font-medium text-[#5c62d6] hover:underline cursor-pointer"
                >
                  f33547501@gmail.com &rarr;
                </button>
              </div>

              {!isConfigured && (
                <div className="text-center pt-1 border-t border-[#5c62d6]/10">
                  <button
                    type="button"
                    onClick={openSetupModal}
                    className="text-[0.68rem] text-[#5c62d6] hover:underline cursor-pointer"
                  >
                    Set Clerk Key (app_3L19RdM9rDEOa24ripIQFjIW192) &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#e6e4df]"></div>
          <span className="flex-shrink mx-3 text-[0.65rem] font-mono uppercase tracking-wider text-[#8a8a8a]">
            Or Demo Role Login
          </span>
          <div className="flex-grow border-t border-[#e6e4df]"></div>
        </div>

        {/* Unified Form: Gym Name, User Name, Passcode */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {/* 1. Gym Name */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2 font-mono">
              Gym Name
            </label>
            <select
              value={selectedGymId}
              onChange={e => {
                const gymId = e.target.value;
                setSelectedGymId(gymId);
                const g = gyms.find(item => item.id === gymId);
                if (g) setUsername(g.ownerName);
              }}
              className="w-full bg-white border border-[#e6e4df] p-3 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6] transition-colors"
            >
              {gyms.map(gym => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. User Name */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2 font-mono">
              User Name
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. Vikram Malhotra or superadmin"
              className="w-full bg-white border border-[#e6e4df] p-3 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6] transition-colors"
              required
            />
          </div>

          {/* 3. Passcode */}
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2 font-mono">
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full bg-white border border-[#e6e4df] p-3 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6] transition-colors"
              required
            />
          </div>

          {/* Actions: Log In & Reset */}
          <div className="pt-3 border-t border-[#e6e4df] flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                showToast('Sample data refreshed', 'info');
              }}
              className="btn-editorial-outline !px-3 cursor-pointer"
              title="Reset sample registry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="submit"
              className="btn-editorial-primary flex-1 cursor-pointer flex items-center justify-center gap-2"
            >
              Log In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Discreet Credential Hint */}
          <p className="text-[0.65rem] text-[#8a8a8a] text-center font-mono leading-relaxed pt-1">
            Demo Credentials — Gym Owner: <span className="text-[#1a1a1a]">Vikram Malhotra</span> | Super Admin: <span className="text-[#5c62d6] font-semibold">superadmin</span> / <span className="text-[#5c62d6] font-semibold">admin123</span>
          </p>
        </form>

      </div>
    </div>
  );
};
