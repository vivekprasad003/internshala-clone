import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Inbox
} from 'lucide-react';
import { DeviceType, OperatingSystem, BrowserType, UserProfile, LoginAttempt } from '../types/types_s';
import { useLanguage } from '../context/LanguageContext';

interface UserEntryGateProps {
  device: DeviceType;
  os: OperatingSystem;
  browser: BrowserType;
  getCurrentTime24: () => string; // HH:MM
  users: UserProfile[];
  onEnrollUser: (user: UserProfile) => void;
  onRecordAttempt: (attempt: Omit<LoginAttempt, 'id' | 'timestamp'>) => void;
  onSuccessAuth: () => void;
}

export const UserEntryGate: React.FC<UserEntryGateProps> = ({
  device,
  os,
  browser,
  getCurrentTime24,
  users,
  onEnrollUser,
  onRecordAttempt,
  onSuccessAuth,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'enroll'>('login');
  
  // Login standard fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // OTP State handling
  const [otpStage, setOtpStage] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [pendingUserSession, setPendingUserSession] = useState<{ email: string } | null>(null);

  // Success / Failure notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isLoading, setIsLoading] = useState(false);

  // Simulated IP
  const [simulatedIp, setSimulatedIp] = useState('114.73.4.15');

  const regenerateSimulatedIp = () => {
    const octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 254) + 1);
    setSimulatedIp(octets.join('.'));
  };

  // Helper: check if simulated hour is allowed for mobile
  const isTimeAllowedForMobile = (): { allowed: boolean; reason: string; hour: number; min: number } => {
    const time24 = getCurrentTime24();
    const [hour, min] = time24.split(':').map(Number);
    const totalMinutes = hour * 60 + min;
    const minStart = 10 * 60; // 10:00 AM
    const minEnd = 13 * 60;   // 1:00 PM

    if (totalMinutes >= minStart && totalMinutes <= minEnd) {
      return { allowed: true, reason: 'Valid time window', hour, min };
    }
    return {
      allowed: false,
      reason: `Outside authorized timezone window (10:00 AM - 01:00 PM). Active time: ${formatTime12(time24)}`,
      hour,
      min
    };
  };

  const formatTime12 = (time24: string) => {
    const [hrs, mins] = time24.split(':').map(Number);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs % 12 || 12;
    const minsStr = mins.toString().padStart(2, '0');
    return `${hrs12}:${minsStr} ${ampm}`;
  };

  const handlePreseedAutofill = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setNotification({ type: null, message: '' });
  };

  // 1. Submit login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ type: null, message: '' });

    if (!email || !password) {
      setNotification({ type: 'error', message: t('systemInfo.loginPleaseSpecify') });
      return;
    }

    // A. Validate general account exists
    const matchingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!matchingUser || matchingUser.passwordHash !== password) {
      // Record failed logging attempt
      onRecordAttempt({
        email: email.trim(),
        device,
        os,
        browser,
        ip: simulatedIp,
        status: 'FAILED_CREDENTIALS',
        reason: 'Invalid email username or authentication password match.',
      });
      setNotification({ type: 'error', message: t('systemInfo.loginInvalidCreds') });
      return;
    }

    // B. Validate MOBILE Time Restricting guardrails
    if (device === 'Mobile') {
      const { allowed, reason } = isTimeAllowedForMobile();
      if (!allowed) {
        onRecordAttempt({
          email: matchingUser.email,
          device,
          os,
          browser,
          ip: simulatedIp,
          status: 'BLOCKED_TIME',
          reason,
        });
        setNotification({
          type: 'error',
          message: t('systemInfo.loginBlockedMobile').replace('{timeWindow}', '10:00 AM - 01:00 PM').replace('{reason}', reason),
        });
        return;
      }
    }

    // C. Validate CHROME OTP requirement
    if (browser === 'Google Chrome') {
      setIsLoading(true);
      try {
        const response = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: matchingUser.email }),
        });
        const data = await response.json();

        if (response.ok) {
          // Logic for simulation: use OTP from API if available, otherwise generate for sandbox feel
          const otpCode = data.otp || data.log?.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(otpCode);
          setPendingUserSession({ email: matchingUser.email });
          
          onRecordAttempt({
            email: matchingUser.email,
            device,
            os,
            browser,
            ip: simulatedIp,
            status: 'OTP_PENDING',
            reason: 'Simulated 2FA security challenge triggered via API.',
          });

          setOtpStage(true);
          setUserEnteredOtp('');
          
          setNotification({
            type: 'success',
            message: t('systemInfo.otpDispatched'),
          });
        } else {
          setNotification({ type: 'error', message: data.error || data.message || t('systemInfo.otpDispatchFailed') });
        }
      } catch (err) {
        setNotification({ type: 'error', message: t('systemInfo.otpNetworkError') });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // D. Direct Authorized Login success
    onRecordAttempt({
      email: matchingUser.email,
      device,
      os,
      browser,
      ip: simulatedIp,
      status: 'AUTHORIZED',
      reason: 'Direct verification complete. Credentials & firewall rules checked.',
    });
    setNotification({ type: 'success', message: t('systemInfo.loginAuthorized').replace('{userName}', matchingUser.fullName) });
    onSuccessAuth();
    // Reset fields
    setEmail('');
    setPassword('');
  };

  // 2. Submit OTP handler
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserSession) return;

    setIsLoading(true);
    setNotification({ type: null, message: '' });

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: pendingUserSession.email, 
          otp: userEnteredOtp.trim() 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Correct Code
        onRecordAttempt({
          email: pendingUserSession.email,
          device,
          os,
          browser,
          ip: simulatedIp,
          status: 'AUTHORIZED',
          reason: 'Authorized session following successful API-based 2FA challenge.',
        });
        setNotification({ type: 'success', message: t('systemInfo.otpVerifySuccess') });
        onSuccessAuth();
        // Clear OTP state
        setOtpStage(false);
        setGeneratedOtp('');
        setPendingUserSession(null);
        setEmail('');
        setPassword('');
        setUserEnteredOtp('');
      } else {
        // Incorrect code
        onRecordAttempt({
          email: pendingUserSession.email,
          device,
          os,
          browser,
          ip: simulatedIp,
          status: 'BLOCKED_OTP',
          reason: 'Failed 2FA OTP verification step via API.',
        });
        setNotification({ type: 'error', message: data.message || data.error || t('systemInfo.otpVerifyFailed') });
      }
    } catch (err) {
      setNotification({ type: 'error', message: t('systemInfo.otpServerError') });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Register Handler
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ type: null, message: '' });

    if (!regFullName || !regEmail || !regPassword) {
      setNotification({ type: 'error', message: t('systemInfo.enrollMandatoryFields') });
      return;
    }

    // Check if duplicate email
    const exists = users.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) {
      setNotification({ type: 'error', message: t('systemInfo.enrollDuplicateEmail') });
      return;
    }

    const newUser: UserProfile = {
      fullName: regFullName.trim(),
      email: regEmail.trim().toLowerCase(),
      passwordHash: regPassword,
      enrolledAt: new Date().toLocaleDateString(),
    };

    onEnrollUser(newUser);
    setNotification({ type: 'success', message: t('systemInfo.enrollSuccess').replace('{userName}', newUser.fullName) });
    
    // Clear registration
    setRegFullName('');
    setRegEmail('');
    setRegPassword('');
    // Auto shift to login tab
    setActiveTab('login');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="user-entry-gate">
      
      {/* Upper header section */}
      <div className="border-b border-slate-200 p-4 px-5 bg-slate-50 flex items-center justify-between">
        <h3 className="font-display font-medium text-xs tracking-wider uppercase text-slate-500 font-bold flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-slate-400" />
          {t('systemInfo.userEntryGate')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 font-semibold select-all">
            IP: {simulatedIp}
          </span>
          <button 
            type="button" 
            title={t('systemInfo.title')} 
            onClick={regenerateSimulatedIp}
            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conditional: Standard Tab forms or OTP Screen */}
      {!otpStage ? (
        <div className="p-5 space-y-4">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-100 pb-1" id="gateway-tabs-bar">
            <button
              onClick={() => {
                setActiveTab('login');
                setNotification({ type: null, message: '' });
              }}
              className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 text-center cursor-pointer transition-colors ${
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              id="tab-btn-login"
            >
              {t('systemInfo.login')}
            </button>
            <button
              onClick={() => {
                setActiveTab('enroll');
                setNotification({ type: null, message: '' });
              }}
              className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 text-center cursor-pointer transition-colors ${
                activeTab === 'enroll'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              id="tab-btn-enroll"
            >
              {t('systemInfo.enrollUser')}
            </button>
          </div>



          {/* Action Notification banner */}
          {notification.type && (
            <div className={`p-3.5 rounded-xl text-xs flex gap-2.5 border items-start ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-150 text-rose-800'
                : 'bg-amber-50 border-amber-150 text-amber-800'
            }`} id="status-notice-banner">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : notification.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              )}
              <span className="leading-relaxed">{notification.message}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                  {t('systemInfo.email')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                    id="login-email-input"
                  />
                  {/* Autofill helper button overlay */}
                  <button
                    type="button"
                    title={t('systemInfo.login')}
                    onClick={handlePreseedAutofill}
                    className="absolute right-3 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    id="autofill-credentials-btn"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                  {t('systemInfo.password')}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800 font-medium"
                    id="login-password-input"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1e1b4b] hover:bg-indigo-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 hover:shadow-sm cursor-pointer mt-2 disabled:opacity-50"
                id="login-submit-btn"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isLoading ? t('common.loading') : t('systemInfo.login')}
              </button>
            </form>
          )}

          {/* Enroll Registration Form */}
          {activeTab === 'enroll' && (
            <form onSubmit={handleEnrollSubmit} className="space-y-4" id="enroll-form">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                  {t('systemInfo.fullName')}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Lock className="w-4 h-4 opacity-0" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                    id="enroll-name-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                  {t('systemInfo.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="user@demo-portal.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                    id="enroll-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                  {t('systemInfo.password')}
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                  id="enroll-password-input"
                />
              </div>

              {/* Enroll Button */}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                id="enroll-submit-btn"
              >
                <UserPlus className="w-4 h-4" />
                {t('systemInfo.enrollUser')}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* OTP 2FA Security challenge verification card state */
        <div className="p-5 space-y-4" id="otp-barrier-card">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 shrink-0">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">{t('systemInfo.otpChallengeTitle')}</h4>
              <p className="text-[11px] text-slate-500">{t('systemInfo.otpChallengeSubtitle')}</p>
            </div>
          </div>

          {/* Guidance warning */}
          <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
            {t('systemInfo.otpChallengeGuidance')}
          </div>

          {/* Action Notification banner inside OTP */}
          {notification.type && (
            <div className={`p-3.5 rounded-xl text-xs flex gap-2 border items-start ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                : 'bg-rose-50 border-rose-150 text-rose-800'
            }`} id="otp-notice-banner">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{notification.message}</span>
            </div>
          )}

          {/* Input OTP Form */}
          <form onSubmit={handleOtpVerify} className="space-y-4" id="otp-form-element">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider font-mono">
                {t('systemInfo.otpVerifyCode')}
              </label>
              <div className="flex gap-2 justify-center">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder=""
                  value={userEnteredOtp}
                  onChange={(e) => setUserEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-xl font-mono tracking-widest font-bold"
                  id="otp-digits-input"
                />
              </div>
            </div>

            {/* Verification buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setOtpStage(false);
                  setNotification({ type: 'warning', message: t('systemInfo.otpCancelled') });
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-50"
                id="otp-cancel-btn"
              >
                {t('common.cancel')}
              </button>
              
              <button
                type="submit"
                disabled={isLoading || userEnteredOtp.length < 6}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                id="otp-verify-btn"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>{t('systemInfo.login')} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};