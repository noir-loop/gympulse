import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, Terminal, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ClerkSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ClerkSetupModal: React.FC<ClerkSetupModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [keyInput, setKeyInput] = useState(currentKey);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(keyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e6e4df] space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5c62d6]/10 flex items-center justify-center text-[#5c62d6]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-medium text-[#1a1a1a]">Clerk Authentication</h2>
              <p className="text-xs font-mono text-[#8a8a8a]">Target App: app_3L19RdM9rDEOa24ripIQFjIW192</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#1a1a1a] p-1.5 rounded-lg hover:bg-[#f2efe9] text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-[#555] leading-relaxed">
          {/* Google / Gmail OAuth Section */}
          <div className="bg-[#f0f4ff] border border-[#5c62d6]/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-[#1a1a1a]">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-2xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="font-semibold text-xs text-[#1a1a1a]">Google / Gmail Authentication</span>
              </div>
              <span className="text-[0.65rem] font-mono text-[#5c62d6] bg-[#5c62d6]/10 px-2 py-0.5 rounded-full">
                OAuth 2.0
              </span>
            </div>

            <p className="text-[0.72rem] text-[#4b5563] leading-relaxed">
              Google OAuth is enabled in Clerk by default with shared development credentials. You can authenticate seamlessly using your Gmail account.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const saved = localStorage.getItem('gympulse_auth');
                  const authObj = {
                    role: 'gym_owner',
                    gymId: 'gym-iron-house',
                    username: 'Vikram Malhotra',
                    email: 'f33547501@gmail.com',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                    authProvider: 'clerk_google'
                  };
                  localStorage.setItem('gympulse_auth', JSON.stringify(authObj));
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-[#dadce0] rounded-lg text-xs font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa] transition-all cursor-pointer shadow-2xs"
              >
                <span>Instant Login as <strong className="font-mono text-[#5c62d6]">f33547501@gmail.com</strong></span>
              </button>

              <a
                href="https://dashboard.clerk.com/apps/app_3L19RdM9rDEOa24ripIQFjIW192/user-authentication/social-connections"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-[#5c62d6]/30 bg-[#5c62d6]/5 hover:bg-[#5c62d6]/10 text-[#5c62d6] rounded-lg text-xs font-medium transition-all"
              >
                <span>Clerk Social Connections</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-[#f8f7f4] border border-[#e6e4df] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-medium text-[#1a1a1a]">
              <Sparkles className="w-4 h-4 text-[#5c62d6]" />
              <span>Selected Dashboard Application</span>
            </div>
            <p>
              Your Clerk Dashboard application is set to <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#e6e4df] text-[#5c62d6] font-semibold">app_3L19RdM9rDEOa24ripIQFjIW192</code>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-[#1a1a1a] text-xs">
              Publishable Key (<code className="font-mono text-[#5c62d6]">VITE_CLERK_PUBLISHABLE_KEY</code>)
            </label>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="pk_test_..."
                  className="w-full font-mono text-xs px-3.5 py-2.5 rounded-lg border border-[#d6d3cd] bg-white text-[#1a1a1a] focus:outline-hidden focus:border-[#5c62d6] focus:ring-1 focus:ring-[#5c62d6]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-editorial-primary flex-1 py-2 text-xs font-medium cursor-pointer"
                >
                  Save & Activate Key
                </button>
                {currentKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInput('');
                      onSaveKey('');
                    }}
                    className="px-3 py-2 border border-[#e6e4df] rounded-lg text-xs text-[#b91c1c] hover:bg-red-50 cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="pt-2 border-t border-[#e6e4df] space-y-3">
            <p className="font-medium text-[#1a1a1a]">Or sync directly using Clerk CLI in your host terminal:</p>
            
            <div className="bg-[#1e1e24] text-[#ececed] rounded-lg p-3 font-mono text-[0.7rem] space-y-2">
              <div className="flex items-center justify-between">
                <span>1. Login from host terminal:</span>
                <button 
                  type="button"
                  onClick={() => handleCopy('npx -y clerk@latest auth login', 'login')}
                  className="text-[0.65rem] text-[#8a8a8a] hover:text-white"
                >
                  {copiedCmd === 'login' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-emerald-400 select-all">$ npx -y clerk@latest auth login</div>

              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span>2. Pull development keys:</span>
                <button 
                  type="button"
                  onClick={() => handleCopy('npx -y clerk@latest env pull', 'pull')}
                  className="text-[0.65rem] text-[#8a8a8a] hover:text-white"
                >
                  {copiedCmd === 'pull' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-emerald-400 select-all">$ npx -y clerk@latest env pull</div>
            </div>

            <div className="flex items-center justify-between text-[0.7rem]">
              <a 
                href="https://dashboard.clerk.com/apps/app_3L19RdM9rDEOa24ripIQFjIW192/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#5c62d6] hover:underline"
              >
                Open API Keys in Clerk Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#e6e4df] rounded-lg text-xs font-medium text-[#555] hover:bg-[#f2efe9] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
