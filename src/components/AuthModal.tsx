import React, { useState } from 'react';
import { Lock, KeyRound, Mail, UserCheck, ShieldCheck, X } from 'lucide-react';
import { UserRole } from '../types';
import { signInWithGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleAndLogin: (role: UserRole, methodLabel: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectRoleAndLogin,
}) => {
  const [authTab, setAuthTab] = useState<'passcode' | 'email'>('passcode');
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [careCodeInput, setCareCodeInput] = useState('482913');
  const [emailInput, setEmailInput] = useState('lakshmi.devi@eldercare.example.com');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (careCodeInput.trim() !== '482913') {
      setErrorMsg(
        'Invalid Care Access Code. For Lakshmi Devi’s demo profile, enter 6-digit code 482913.'
      );
      return;
    }
    onSelectRoleAndLogin(selectedRole, `6-Digit Care Code (${careCodeInput})`);
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    onSelectRoleAndLogin(selectedRole, `Email Session (${emailInput})`);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      onSelectRoleAndLogin(selectedRole, 'Firebase Google Auth');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in popup closed';
      setErrorMsg(
        `Google Auth note: ${msg}. You can also sign in immediately using Care Code 482913.`
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-8">
        <div className="px-6 py-5 bg-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-300" />
            <div>
              <h2 className="text-lg font-bold">Secure Care Ecosystem Sign-In</h2>
              <p className="text-xs text-teal-200">
                Role-based authentication · Protected by Elderly Owner Permission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white cursor-pointer"
            aria-label="Close Authentication Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Select Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Choose Your Role in Lakshmi Devi’s Care Network
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  role: 'elderly' as UserRole,
                  title: 'Lakshmi Devi',
                  subtitle: 'Elderly Owner (Full Control)',
                },
                {
                  role: 'family' as UserRole,
                  title: 'Anita Sharma',
                  subtitle: 'Family Member (Daughter)',
                },
                {
                  role: 'caretaker' as UserRole,
                  title: 'Meena Nair',
                  subtitle: 'Daily Caretaker',
                },
                {
                  role: 'admin' as UserRole,
                  title: 'System Admin',
                  subtitle: 'Platform Governance',
                },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedRole === item.role
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose Authentication Method */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthTab('passcode')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                authTab === 'passcode'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              6-Digit Care Code (482913)
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('email')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                authTab === 'email'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Email & Password
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {authTab === 'passcode' ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Elderly Profile Care Access Passcode (Lakshmi Devi: 482913)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={careCodeInput}
                    onChange={(e) => setCareCodeInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-base font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    placeholder="482913"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors cursor-pointer"
              >
                Verify Care Code & Enter as {selectedRole.toUpperCase()}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors cursor-pointer"
              >
                Sign In with Email
              </button>
            </form>
          )}

          {/* Firebase Google Sign-In Option */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-teal-700" />
              <span>
                {loadingGoogle
                  ? 'Connecting to Firebase Auth...'
                  : 'Sign In with Google (Syncs Live with Cloud Firestore)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
