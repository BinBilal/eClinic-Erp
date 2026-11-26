import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Globe,
  KeyRound,
  Lock,
  Shield,
  Store,
  Warehouse,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useDemoStore } from '../../store/demoStore';
import { ExperienceRole } from '../../types/erp';

interface LoginViewProps {
  onAuthenticate: (role: ExperienceRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onAuthenticate }) => {
  const { state, completeFirstLoginPasswordChange } = useDemoStore();
  const [email, setEmail] = useState('hassan@alshifapharma.so');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [pendingChangeEmail, setPendingChangeEmail] = useState<string | null>(null);
  const [pendingTargetRole, setPendingTargetRole] = useState<ExperienceRole | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resolveRoleForEmail = (targetEmail: string): ExperienceRole | null => {
    const acc = state.accounts.find(
      (a) => a.email.toLowerCase() === targetEmail.trim().toLowerCase()
    );
    if (!acc) return null;
    if (acc.role === 'Super Admin') return 'super_admin';
    if (acc.role === 'Pharmacy Admin') return 'pharmacy_admin';
    if (acc.role === 'Pharmaceutical Admin') return 'pharmaceutical_admin';
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const acc = state.accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!acc || !password.trim()) {
      setError(
        'Invalid credentials. Select one of the configured access profiles below or enter a valid account email.'
      );
      return;
    }
    if (acc.status === 'Locked') {
      setError("This account is currently locked. Contact MI'AH ICT Super Admin.");
      return;
    }

    const role = resolveRoleForEmail(acc.email);
    if (!role) return;

    if (acc.requirePasswordChange) {
      setPendingChangeEmail(acc.email);
      setPendingTargetRole(role);
      return;
    }

    onAuthenticate(role);
  };

  const handleFirstLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (pendingChangeEmail && pendingTargetRole) {
      completeFirstLoginPasswordChange(pendingChangeEmail);
      onAuthenticate(pendingTargetRole);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onAuthenticate('public')}
          className="inline-flex items-center gap-3"
        >
          <Logo />
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="pill" />
          <button
            type="button"
            onClick={() => onAuthenticate('public')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1E396A] dark:text-slate-100 hover:text-[#F05D21] dark:hover:text-[#F05D21] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Public Website</span>
            <span className="sm:hidden">Website</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Production Login Card */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-9">
            <div className="mb-6">
              <Logo variant="auth" />
              <h1 className="mt-5 text-2xl font-bold text-[#1E396A] dark:text-white">
                {pendingChangeEmail ? 'Update Your Password' : 'Sign in to eClinic ERP'}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {pendingChangeEmail
                  ? 'First-login security policy requires setting a new personal password.'
                  : "Enter your organization credentials to access your eClinic by MI'AH ICT Solutions workspace."}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-2 text-xs text-[#DC2626] dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {pendingChangeEmail ? (
              <form onSubmit={handleFirstLoginSubmit} className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                  Account: <span className="font-semibold">{pendingChangeEmail}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold transition-colors"
                  >
                    Save Password &amp; Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingChangeEmail(null);
                      setPendingTargetRole(null);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.so"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <span className="text-xs text-[#396BA4] dark:text-sky-400 font-medium">
                      Multi-Tenant Portal Auth
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#1E396A] hover:bg-[#162b52] text-white text-sm font-semibold transition-colors"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>

          {/* Right: Clearly Separated Experience Access Profiles */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#1E396A] dark:text-white">
                Select Product Experience
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Launch any of the four V0.0 platform experiences directly with preconfigured profiles.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => onAuthenticate('super_admin')}
                className="w-full text-left bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 hover:border-[#1E396A] dark:hover:border-[#396BA4] rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-[#1E396A] text-white flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Platform Super Admin Dashboard
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Amina Farah Hassan · MI&apos;AH ICT Platform Administration
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      superadmin@miahict.so
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F9] dark:bg-slate-800 text-[#1E396A] dark:text-slate-100 text-xs font-semibold shrink-0">
                  Open
                </span>
              </button>

              <button
                type="button"
                onClick={() => onAuthenticate('pharmacy_admin')}
                className="w-full text-left bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 hover:border-[#F05D21] rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-[#F05D21] text-white flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Pharmacy Admin Dashboard
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Dr. Hassan Mohamed · Al-Shifa Modern Pharmacy (POS &amp; Lab)
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      hassan@alshifapharma.so
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F9] dark:bg-slate-800 text-[#F05D21] text-xs font-semibold shrink-0">
                  Open
                </span>
              </button>

              <button
                type="button"
                onClick={() => onAuthenticate('pharmaceutical_admin')}
                className="w-full text-left bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 hover:border-[#396BA4] rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-[#396BA4] text-white flex items-center justify-center shrink-0">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Pharmaceutical Admin Dashboard
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Abdirahman Yusuf · Benaadir Pharmaceutical Supply Ltd
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      ops@benaadirpharma.so
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F9] dark:bg-slate-800 text-[#396BA4] dark:text-sky-300 text-xs font-semibold shrink-0">
                  Open
                </span>
              </button>

              <button
                type="button"
                onClick={() => onAuthenticate('public')}
                className="w-full text-left bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1E396A] dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Public Website (Somali)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Home, About, Features, Solutions, Contact, Apply Now &amp; Status
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F9] dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0">
                  Visit
                </span>
              </button>
            </div>

            {/* First-login test helper */}
            <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <KeyRound className="h-4 w-4 text-[#D97706] dark:text-amber-400 shrink-0" />
                <span>
                  Test First-Login Password Policy with{' '}
                  <span className="font-mono font-medium">msaeed@garowecentral.so</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEmail('msaeed@garowecentral.so')}
                className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline shrink-0"
              >
                Prefill
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2E]">
        © 2026 MI&apos;AH ICT Solutions · eClinic ERP Platform
      </footer>
    </div>
  );
};
