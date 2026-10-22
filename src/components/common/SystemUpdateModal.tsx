import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import {
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  X,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface SystemUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemUpdateModal: React.FC<SystemUpdateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    appVersion,
    isUpdateAvailable,
    updateInfo,
    applySystemUpdate,
    checkForUpdates,
    resetUpdateDemo,
  } = useGym();

  const [installProgress, setInstallProgress] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  if (!isOpen) return null;

  const handleStartUpdate = async () => {
    setInstallProgress(15);
    setCurrentStep('Verifying SHA-256 package signature...');

    setTimeout(() => {
      setInstallProgress(45);
      setCurrentStep('Migrating local storage schemas and UPI gateway endpoints...');

      setTimeout(() => {
        setInstallProgress(85);
        setCurrentStep('Compiling optimized components & asset bundles...');

        setTimeout(async () => {
          setInstallProgress(100);
          setCurrentStep('Finalizing installation & applying hot patch...');

          await applySystemUpdate();
          setTimeout(() => {
            setInstallProgress(null);
            setCurrentStep('');
          }, 800);
        }, 800);
      }, 700);
    }, 600);
  };

  return (
    <div className="modal-editorial-wrap animate-fade-in" onClick={onClose}>
      <div
        className="modal-editorial-body p-6 md:p-8 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
          <div className="flex items-center gap-2">
            <span className="brand-serif text-2xl text-[#5c62d6]">GymPulse</span>
            <span className="text-[0.65rem] uppercase tracking-widest text-[#8a8a8a] font-mono border-l border-[#e6e4df] pl-2.5">
              System Release Management
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Version / Status Banner */}
        <div className="flex items-center justify-between p-4 bg-white border border-[#e6e4df] rounded-lg mb-6 shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#8a8a8a] block">
              Installed Core Version
            </span>
            <div className="font-mono text-base font-bold text-[#1a1a1a] flex items-center gap-2">
              <span>{appVersion}</span>
              {!isUpdateAvailable && (
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 bg-[#e7f7f0] text-[#15803d] border border-[#15803d]/20 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Up to Date
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-[#8a8a8a] block">
              Release Status
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                isUpdateAvailable ? 'text-[#5c62d6]' : 'text-[#15803d]'
              }`}
            >
              {isUpdateAvailable ? `Available: ${updateInfo.version}` : 'Stable Channel'}
            </span>
          </div>
        </div>

        {/* Update Details or Up-to-Date State */}
        {isUpdateAvailable ? (
          <div className="space-y-6">
            <div className="p-5 bg-white border border-[#5c62d6]/30 rounded-lg space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-[#5c62d6] text-white text-[10px] font-mono uppercase font-semibold rounded-bl">
                New Build Available
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-[#5c62d6] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {updateInfo.title}
                </span>
                <h4 className="font-serif text-2xl font-medium text-[#1a1a1a]">
                  Version {updateInfo.version}
                </h4>
                <div className="text-[11px] font-mono text-[#8a8a8a]">
                  Published: {updateInfo.date} • Recommended System Update
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e4df] space-y-2">
                <span className="text-[10px] uppercase font-mono text-[#8a8a8a] font-semibold block">
                  Release Highlights & Improvements:
                </span>
                <ul className="space-y-1.5 text-xs text-[#1a1a1a]">
                  {updateInfo.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#5c62d6] font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Progress bar if installing */}
            {installProgress !== null && (
              <div className="space-y-2 p-4 bg-white border border-[#e6e4df] rounded-lg">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#1a1a1a] font-medium">{currentStep}</span>
                  <span className="font-bold text-[#5c62d6]">{installProgress}%</span>
                </div>
                <div className="w-full bg-[#f8f7f4] border border-[#e6e4df] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5c62d6] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${installProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartUpdate}
                disabled={installProgress !== null}
                className="btn-editorial-primary flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
              >
                {installProgress !== null ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Patch...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Install Update ({updateInfo.version})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="w-12 h-12 bg-[#e7f7f0] text-[#15803d] border border-[#15803d]/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-medium text-[#1a1a1a]">
                You're on the Latest Release
              </h4>
              <p className="text-xs text-[#8a8a8a] max-w-sm mx-auto leading-relaxed">
                GymPulse core engine is currently synchronized with build {appVersion}. All
                SaaS gateways, security policies, and UPI protocols are operating on the
                latest specification.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={checkForUpdates}
                className="btn-editorial-outline py-2.5 px-4 text-xs flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Check for New Releases
              </button>
              <button
                type="button"
                onClick={resetUpdateDemo}
                className="btn-editorial-outline py-2.5 px-4 text-xs flex items-center gap-2 cursor-pointer text-[#8a8a8a]"
                title="Reset demo so you can test the update button again"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Patch
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#e6e4df] flex items-center justify-between text-[10px] font-mono text-[#8a8a8a]">
          <span>GymPulse OTA Engine</span>
          <span>Zero-Downtime Hot Patcher</span>
        </div>
      </div>
    </div>
  );
};
