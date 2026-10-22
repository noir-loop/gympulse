import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  useUser 
} from '@clerk/clerk-react';
import { useGym } from '../../context/GymContext';
import { ClerkSetupModal } from './ClerkSetupModal';
import { Shield } from 'lucide-react';

export const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface ClerkAuthContextType {
  publishableKey: string;
  isConfigured: boolean;
  appId: string;
  setPublishableKey: (key: string) => void;
  openSetupModal: () => void;
  signInWithGoogleAccount: (email?: string, name?: string) => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error('useClerkAuth must be used within ClerkAuthProvider');
  }
  return context;
};

// Component that syncs Clerk authenticated user with GymContext
const ClerkUserSynchronizer: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const { auth, login, showToast } = useGym();

  useEffect(() => {
    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const name = user.fullName || user.firstName || email.split('@')[0] || 'User';
      const avatar = user.imageUrl || '';
      
      // If not logged in yet or username/email doesn't match, sync state
      if (!auth.username || auth.username !== name || auth.email !== email) {
        // Super admin check or default gym owner
        const role = email.toLowerCase().includes('admin') ? 'super_admin' : 'gym_owner';
        login(
          role, 
          role === 'gym_owner' ? (auth.gymId || 'gym-iron-house') : undefined, 
          name,
          email,
          avatar,
          'clerk_google'
        );
        showToast(`Signed in with Google (${email})`, 'success');
      }
    }
  }, [isSignedIn, user]);

  return null;
};

export const ClerkNavControls: React.FC = () => {
  const { isConfigured, openSetupModal } = useClerkAuth();
  const { auth } = useGym();

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2">
        {auth.email ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#e6e4df] rounded-full shadow-2xs">
            {auth.avatarUrl ? (
              <img src={auth.avatarUrl} alt={auth.username || 'Google User'} className="w-3.5 h-3.5 rounded-full object-cover" />
            ) : (
              <GoogleLogoSvg className="w-3 h-3" />
            )}
            <span className="text-[0.65rem] font-medium text-[#1a1a1a] max-w-[110px] truncate">
              {auth.email}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={openSetupModal}
            className="flex items-center gap-1.5 text-[0.72rem] tracking-wide text-[#5c62d6]/80 hover:text-[#5c62d6] transition-colors cursor-pointer"
            title="Configure Clerk Google Auth (app_3L19RdM9rDEOa24ripIQFjIW192)"
          >
            <GoogleLogoSvg className="w-3 h-3 opacity-80" />
            <span className="hidden sm:inline">Google Auth</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button 
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#dadce0] rounded text-[0.7rem] font-medium text-[#3c4043] hover:bg-[#f8f9fa] transition-all cursor-pointer shadow-2xs"
            title="Sign in with Google / Gmail"
          >
            <GoogleLogoSvg className="w-3 h-3" />
            <span className="hidden sm:inline">Google Sign-In</span>
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton 
            afterSignOutUrl="/" 
            showName={false}
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-6 h-6 border border-[#e6e4df]',
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
};

export const GoogleSignInButton: React.FC<{
  className?: string;
  label?: string;
  onSuccess?: () => void;
}> = ({ className, label = 'Continue with Google (Gmail)', onSuccess }) => {
  const { isConfigured, openSetupModal } = useClerkAuth();

  const defaultClasses = "w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#dadce0] rounded-lg text-xs font-semibold text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#c2c5c9] hover:shadow-xs transition-all cursor-pointer";

  if (isConfigured) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          onClick={() => {
            if (onSuccess) onSuccess();
          }}
          className={className || defaultClasses}
        >
          <GoogleLogoSvg className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        openSetupModal();
        if (onSuccess) onSuccess();
      }}
      className={className || defaultClasses}
    >
      <GoogleLogoSvg className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
};

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appId = 'app_3L19RdM9rDEOa24ripIQFjIW192';
  const { login } = useGym();

  const [publishableKey, setPublishableKeyState] = useState<string>(() => {
    return (
      (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ||
      localStorage.getItem('gympulse_clerk_pub_key') ||
      ''
    );
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const setPublishableKey = (key: string) => {
    setPublishableKeyState(key);
    if (key) {
      localStorage.setItem('gympulse_clerk_pub_key', key);
    } else {
      localStorage.removeItem('gympulse_clerk_pub_key');
    }
  };

  const isConfigured = Boolean(publishableKey && publishableKey.startsWith('pk_'));

  const signInWithGoogleAccount = (email: string = 'f33547501@gmail.com', name: string = 'Vikram Malhotra') => {
    login(
      'gym_owner',
      'gym-iron-house',
      name,
      email,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      'clerk_google'
    );
    setIsSetupModalOpen(false);
  };

  const contextValue: ClerkAuthContextType = {
    publishableKey,
    isConfigured,
    appId,
    setPublishableKey,
    openSetupModal: () => setIsSetupModalOpen(true),
    signInWithGoogleAccount,
  };

  return (
    <ClerkAuthContext.Provider value={contextValue}>
      {isConfigured ? (
        <ClerkProvider 
          publishableKey={publishableKey}
          afterSignOutUrl="/"
        >
          <ClerkUserSynchronizer />
          {children}
        </ClerkProvider>
      ) : (
        <>
          {children}
        </>
      )}

      <ClerkSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentKey={publishableKey}
        onSaveKey={setPublishableKey}
      />
    </ClerkAuthContext.Provider>
  );
};
