import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { LoginModal } from '../auth/LoginModal';
import { DocumentationModal } from '../common/DocumentationModal';
import { SystemUpdateModal } from '../common/SystemUpdateModal';
import { LogOut } from 'lucide-react';
import { ClerkNavControls } from '../auth/ClerkAuthProvider';

interface NavbarProps {
  onOpenCheckInModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCheckInModal }) => {
  const { auth, gyms, logout, appVersion, isUpdateAvailable, updateInfo } = useGym();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const currentGym = gyms.find(g => g.id === auth.gymId);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f8f7f4]/80 backdrop-blur-md border-b border-[#1a1a1a]/5 px-6 md:px-12 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Seamless Minimal Brand */}
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl font-normal italic text-[#1a1a1a] tracking-tight select-none">
              GymPulse
            </span>

            {/* Quiet, Traffic-Free Update Indicator */}
            {isUpdateAvailable ? (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="group inline-flex items-center gap-1.5 text-[0.65rem] font-mono text-[#5c62d6] hover:opacity-80 transition-opacity cursor-pointer pl-1.5"
                title={`System update available (${updateInfo.version}) - click to inspect`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5c62d6] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5c62d6]"></span>
                </span>
                <span className="tracking-tight opacity-75 group-hover:opacity-100 hidden sm:inline">
                  {updateInfo.version}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="text-[0.65rem] font-mono text-[#8a8a8a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer hidden sm:inline pl-1.5"
                title="System version"
              >
                {appVersion}
              </button>
            )}
          </div>

          {/* Minimalist Actions - Quiet, Low Noise */}
          <div className="flex items-center gap-4 sm:gap-6">
            {auth.gymId && (
              <span className="text-[0.68rem] uppercase tracking-widest text-[#8a8a8a]/70 font-mono hidden md:inline-block">
                {currentGym?.name || 'Iron House Fitness'}
              </span>
            )}

            {onOpenCheckInModal && (
              <button
                type="button"
                onClick={onOpenCheckInModal}
                className="text-[0.72rem] tracking-wide text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Kiosk
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              className="text-[0.72rem] tracking-wide text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              Docs
            </button>

            {/* Clerk Authentication Controls */}
            <ClerkNavControls />

            {auth.gymId || auth.role === 'super_admin' ? (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-[0.72rem] text-[#8a8a8a]/70 hover:text-[#b91c1c] transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : null}
          </div>

        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
    </>
  );
};
