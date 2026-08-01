import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, ShieldAlert, CheckCircle2, KeyRound, Sparkles, BellRing, Shield } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useSelector } from 'react-redux';
import { selectuser } from '../Feature/Userslice';

import { 
  getStoredUsers, 
  checkResetRateLimit, 
  recordPasswordReset, 
  generateLetterOnlyPassword,
  saveUsers,
  getDeviceResetLock,
  setDeviceResetLock
} from '../TS_files/security';
import type { UserProfile } from '../types/types_s';

async function postResetLockCheck(payload: { contact: string; action: 'check' | 'reset' }) {
  const resp = await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

import { useLanguage } from '../context/LanguageContext';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  initialContact?: string;
}

type ResetStep = 'request' | 'success';
type ResetMethod = 'email' | 'phone';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '87981 23000' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '555-0199' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7700 900077' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '555-0199' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 23456789' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', placeholder: '985-1012345' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90-1234-5678' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
];

export default function ForgotPassword({ onBackToLogin, initialContact = '' }: ForgotPasswordProps) {
  const { t } = useLanguage();
  const reduxUser = useSelector(selectuser) as { uid?: string; email?: string; name?: string; phoneNumber?: string; photo?: string } | null;
  const [resetMethod, setResetMethod] = useState<ResetMethod>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to India (+91)
  
  const [error, setError] = useState<string | null>(null);

  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);
  const phoneInputHasBeenBlurredRef = { current: false as boolean };




  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  // Wizard steps and simulated messages
  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [simulatedNotification, setSimulatedNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'sms' | 'email'>('email');
  
  // Generation & Success States
  const [suggestedPassword, setSuggestedPassword] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(6); // Default 6
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Auto-fill input value if initialContact is provided
  useEffect(() => {
    if (initialContact) {
      if (initialContact.includes('@')) {
        setResetMethod('email');
        setEmailInput(initialContact);
      } else {
        setResetMethod('phone');
        const cleanInput = initialContact.replace(/[^0-9\- \(\)]/g, '');
        setPhoneInput(cleanInput);
        
        // Auto-detect country code from initial format if matches dialCode
        const matchedCountry = COUNTRIES.find(c => initialContact.startsWith(c.dialCode));
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setPhoneInput(initialContact.slice(matchedCountry.dialCode.length).trim());
        }
      }
    }
  }, [initialContact]);

  // Generate suggested passwords when password length changes initially or manually
  useEffect(() => {
    const pass = generateLetterOnlyPassword(passwordLength);
    setSuggestedPassword(pass);
    setIsCopied(false);
  }, [passwordLength]);

  const handleManualRegenerate = () => {
    const pass = generateLetterOnlyPassword(passwordLength);
    setSuggestedPassword(pass);
    setIsCopied(false);
  };

  const handlePhoneInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Strictly restrict the input characters for phone input: allow only decimal digits, dashes, brackets, and spaces.
    const cleanValue = e.target.value.replace(/[^0-9\- \(\)]/g, '');
    setPhoneInput(cleanValue);

    // Clear visible errors as user edits (will be re-applied on blur/submit)
    setError(null);
    setWarningMessage(null);
    setIsPhoneInvalid(false);
  };

  const handlePhoneInputBlur = () => {
    phoneInputHasBeenBlurredRef.current = true;
    const validation = validatePhoneForSelectedCountry(phoneInput);
    if (!validation.valid) {
      setIsPhoneInvalid(true);
      setError(validation.errorMessage || getCountryValidationError(selectedCountry));
      return;
    }

    // Auto-remove error once valid
    setIsPhoneInvalid(false);
    setError(null);
  };


  const handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setError(null);
    setWarningMessage(null);
  };

  const getCountryValidationError = (country: Country): string => {
    // Keep copy aligned with requirement: “Invalid Phone Number” + country-specific message
    return `Please enter a valid ${country.name} phone number.`;
  };


  const validatePhoneForSelectedCountry = (rawPhone: string): { valid: boolean; formatted: string | null; errorMessage: string | null } => {
    const input = rawPhone.trim();
    if (!input) {
      return { valid: false, formatted: null, errorMessage: t('forgotPassword.enterPhone') };
    }

    const region = selectedCountry.code as any;
    const dial = selectedCountry.dialCode;

    // The API expects whatever user typed; for validation we try to normalize to E.164.
    const normalizedForParsing = input.startsWith('+') ? input : `${dial}${input.replace(/[^0-9]/g, '')}`;

    const parsed = parsePhoneNumberFromString(normalizedForParsing, region);
    if (!parsed || !parsed.isValid()) {
      return {
        valid: false,
        formatted: null,
        errorMessage: getCountryValidationError(selectedCountry),

      };
    }

    // Use the international format for consistency.
    return {
      valid: true,
      formatted: parsed.number, // e.g. +14155552671
      errorMessage: null,
    };
  };

  // Submit password reset directly without separate OTP wall
  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarningMessage(null);
    setSimulatedNotification(null);

    // Merge users from all storage locations + Redux (Firebase) user
    const appUsers = getStoredUsers();
    let gatekeeperUsers: UserProfile[] = [];
    try {
      const raw = localStorage.getItem('gatekeeper_users');
      if (raw) gatekeeperUsers = JSON.parse(raw);
    } catch {}
    const gatekeeperConverted = gatekeeperUsers.map(u => ({
      id: 'gk-' + u.email.replace(/[^a-zA-Z0-9]/g, '-'),
      name: u.fullName || u.email.split('@')[0],
      email: u.email,
      phone: (u as any).phone || '',
      passwordHash: u.passwordHash,
      createdAt: u.enrolledAt || new Date().toISOString(),
    }));
    // Add the Firebase-authenticated user from Redux store if available
    const reduxConverted = reduxUser ? [{
      id: 'rx-' + (reduxUser.uid || reduxUser.email || 'firebase'),
      name: reduxUser.name || (reduxUser.email ? reduxUser.email.split('@')[0] : 'User'),
      email: reduxUser.email || '',
      phone: reduxUser.phoneNumber || '',
      passwordHash: '',
      createdAt: new Date().toISOString(),
    }] : [];
    const users = [...appUsers, ...gatekeeperConverted, ...reduxConverted];
    let foundUser = null;
    let contactKey = '';

    const buildDeviceKey = () => {
      try {
        if (typeof window === 'undefined') return 'unknown-device';
        return 'fp_device_' + window.location.hostname;
      } catch {
        return 'unknown-device';
      }
    };

    if (resetMethod === 'email') {
      const email = emailInput.trim();
      if (!email) {
        setError(t('forgotPassword.enterEmail'));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t('forgotPassword.validEmail'));
        return;
      }
      contactKey = email;

      // 1) Server-side lock check (persistent across refresh/browser restart)
      const serverCheck = await postResetLockCheck({ contact: email, action: 'check' });
      if (!serverCheck.ok || (serverCheck.data as any)?.locked) {
        setWarningMessage(t('forgotPassword.rateLimitDesc'));
        return;
      }

      // Locate User Account by email
      foundUser = users.find(u => u.email.trim().toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        // If not found in demo, let's create a simulated user account so ANY real email is supported right away!
        foundUser = {
          id: 'simulated-' + Date.now(),
          name: email.split('@')[0],
          email: email,
          phone: '',
          passwordHash: ''
        };
      }
      setNotificationType('email');
    } else {
      // Phone method
      const contactRaw = phoneInput.trim();

      const validation = validatePhoneForSelectedCountry(contactRaw);
      if (!validation.valid || !validation.formatted) {
        setIsPhoneInvalid(true);
        setError(validation.errorMessage || `Please enter a valid ${selectedCountry.name} phone number.`);
        return;
      }

      const contact = validation.formatted;
      contactKey = contact;
      
      // Locate User Account by Phone using digit-only normalization
      // This handles: country code differences, formatting differences (spaces, dashes, parens),
      // leading zeros, and any mismatch between stored format and input format.
      const normalizeDigits = (phone: string): string => phone.replace(/[^0-9]/g, '');
      const inputDigits = normalizeDigits(contactKey); // e.g. "+919828154528" → "919828154528"
      foundUser = users.find(u => {
        if (!u.phone) return false;
        const dbDigits = normalizeDigits(u.phone); // e.g. "555-0199" → "5550199", "+919828154528" → "919828154528"
        // Compare the full digit strings. Also handle if one contains the other
        // (e.g. stored as "9828154528" and input as "919828154528").
        return dbDigits === inputDigits || inputDigits.endsWith(dbDigits) || dbDigits.endsWith(inputDigits);
      });

      if (!foundUser) {
        // If not found in DB, create a user entry so the password reset flow can proceed.
        // This mirrors the email method behavior which also creates simulated users.
        foundUser = {
          id: 'simulated-phone-' + Date.now(),
          name: 'User',
          email: '',
          phone: contact,
          passwordHash: ''
        };
      }
      
      setNotificationType('sms');
    }

    if (!suggestedPassword) {
      setError(t('forgotPassword.generatePassword'));
      return;
    }

    // Verify alphabetical characters constraints
    const alphaOnly = /^[a-zA-Z]+$/;
    if (!alphaOnly.test(suggestedPassword)) {
      setError('Security constraint: The password generator must output letter characters only.');
      return;
    }

    if (!foundUser) {
      setError(t('forgotPassword.noAccount'));
      return;
    }

    // 2) Ask server to record the reset attempt/lock (server enforces 24h)
    const serverReset = await postResetLockCheck({ contact: contactKey, action: 'reset' });
    if (!serverReset.ok || (serverReset.data as any)?.locked) {
      setWarningMessage(t('forgotPassword.rateLimitDesc'));
      return;
    }

    // Commit password change in both storage locations
    const isGatekeeperUser = foundUser!.id.startsWith('gk-');
    if (isGatekeeperUser) {
      // Update 'gatekeeper_users' localStorage
      try {
        const raw = localStorage.getItem('gatekeeper_users');
        if (raw) {
          let gkUsers: UserProfile[] = JSON.parse(raw);
          gkUsers = gkUsers.map(u => {
            if (u.email.toLowerCase() === foundUser!.email.toLowerCase()) {
              return { ...u, passwordHash: suggestedPassword };
            }
            return u;
          });
          localStorage.setItem('gatekeeper_users', JSON.stringify(gkUsers));
        }
      } catch {}
    } else {
      // Update 'app_users' localStorage via saveUsers
      const updatedUsers = [...appUsers];
      const existingIndex = updatedUsers.findIndex(u => u.id === foundUser!.id);
      if (existingIndex !== -1) {
        updatedUsers[existingIndex] = {
          ...updatedUsers[existingIndex],
          passwordHash: suggestedPassword
        };
      } else {
        updatedUsers.push({
            ...foundUser!,
            passwordHash: suggestedPassword,
            createdAt: ''
        });
      }
      saveUsers(updatedUsers);
    }

    // Record the reset event for this contact (frontend UX only)
    // Server-side lock is enforced in /api/reset.
    recordPasswordReset(contactKey);


    // Trigger visual notification simulator
    let alertMsg = '';
    if (resetMethod === 'email') {
      alertMsg = `Simulated Email Deliverability Gateway (Live)\nRecipient Address: ${foundUser.email}\nUser Account: ${foundUser.name}\nSubject: Compliance Account Password Secured Notification\n\nHi ${foundUser.name},\nWe completed the security override successfully. Your new compliance gateway temporary key is: ${suggestedPassword}`;
    } else {
      alertMsg = `Simulated SMS Gateway Dispatch (Live)\nRecipient: ${selectedCountry.dialCode} ${contactKey}\nUser Account: ${foundUser.name}\nStatus: Credentials verified and updated. Use new letters-only compliance key: ${suggestedPassword}`;
    }
    
    setSimulatedNotification(alertMsg);
    setCurrentStep('success');
  };

  return (
    <div id="forgot-password-panel" className="w-full max-w-md mx-auto bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden relative pt-1 border-t-4 border-t-blue-600 transition-all duration-300">
      
      <div className="p-8">
        
        <AnimatePresence mode="wait">
          
          {/* STEP 1: REQUEST FORM */}
          {currentStep === 'request' && (
            <motion.div
              key="step-request"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Badge Icon exactly matching requested mockup with shield inside circle */}
              <div className="flex justify-center mb-4 font-sans">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-3xs">
                  <Shield className="w-6 h-6 stroke-[1.5]" />
                </div>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-sans">{t('forgotPassword.forgotPassword')}</h2>
                <p className="text-[#64748b] text-[13px] leading-relaxed max-w-[340px] mx-auto font-medium">
                  {t('forgotPassword.description')}
                </p>
              </div>

              {/* Tabs for choosing reset method */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  id="tab-method-email"
                  onClick={() => {
                    setResetMethod('email');
                    setError(null);
                    setWarningMessage(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    resetMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  {t('forgotPassword.emailAddress')}
                </button>
                <button
                  type="button"
                  id="tab-method-phone"
                  onClick={() => {
                    setResetMethod('phone');
                    setError(null);
                    setWarningMessage(null);
                  }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    resetMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}

                >
                  <Phone className="w-3.5 h-3.5" />
                  {t('forgotPassword.phoneNumber')}
                </button>
              </div>

              {/* Error alerts */}
              {error && (
                <div id="error-alert" className="p-4 mb-5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 font-semibold text-left leading-relaxed">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* WARNING MESSAGE FOR RATE LIMITING */}
              {warningMessage && (
                <div id="rate-limit-warning" className="p-4 mb-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex gap-2.5 items-start text-left leading-relaxed">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 mb-0.5">{t('forgotPassword.resetRateLimit')}</h4>
                    <p className="opacity-95 text-[11px] font-medium leading-relaxed">{warningMessage}</p>
                    <p className="mt-1.5 opacity-85 text-[10px] font-medium leading-relaxed">{t('forgotPassword.rateLimitNotice')}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-5 text-left">
                
                {/* Method inputs */}
                {resetMethod === 'email' ? (
                  <div>
                    <label htmlFor="reset-contact-input" className="block text-[10px] font-bold tracking-wider text-[#94a3b8] mb-2 font-sans uppercase">
                      {t('forgotPassword.registeredEmail')}
                    </label>
                    
                    <div className="relative flex border border-slate-200 rounded-xl bg-[#f8fafc] focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 overflow-hidden transition-all duration-200">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4 text-[#94a3b8]" />
                      </span>
                      
                      <input
                        id="reset-contact-input"
                        type="email"
                        placeholder={t('forgotPassword.emailPlaceholder')}
                        value={emailInput}
                        onChange={handleEmailInputChange}
                        className="w-full bg-transparent text-slate-900 text-sm pl-4 pr-11 py-3.5 focus:outline-none placeholder:text-[#94a3b8] font-semibold"
                        required
                      />
                    </div>
                    
                    <p className="text-[11px] text-[#94a3b8] mt-1.5 font-medium leading-relaxed">
                      {t('forgotPassword.emailHint')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="reset-contact-input" className="block text-[10px] font-bold tracking-wider text-[#94a3b8] mb-2 font-sans uppercase">
                      {t('forgotPassword.registeredMobile')}
                    </label>
                    
                    <div className="relative flex border border-slate-200 rounded-xl bg-[#f8fafc] focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 overflow-hidden transition-all duration-200">
                      
                      {/* Country Code Selection Column */}
                      <div className="relative flex items-center bg-slate-50 border-r border-slate-200 px-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors">
                        <select
                          id="country-selector"
                          value={selectedCountry.code}
                          onChange={(e) => {
                            const found = COUNTRIES.find(c => c.code === e.target.value);
                            if (found) setSelectedCountry(found);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name} ({c.dialCode})
                            </option>
                          ))}
                        </select>
                        
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
                          <span className="font-mono text-[13px]">{selectedCountry.dialCode}</span>
                          <span className="text-[10px] text-slate-400 select-none ml-0.5">▼</span>
                        </div>
                      </div>

                      {/* Restricted Input Box */}
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Phone className="w-4 h-4 text-[#94a3b8]" />
                      </span>
                      
                      <input
                        id="reset-contact-input"
                        type="text"
                        inputMode="tel"
                        placeholder={`e.g. ${selectedCountry.placeholder}`}
                        value={phoneInput}
                        onChange={handlePhoneInputChange}
                        onBlur={handlePhoneInputBlur}
                        aria-invalid={isPhoneInvalid ? 'true' : 'false'}
                        className={`w-full bg-transparent text-slate-900 text-sm pl-4 pr-11 py-3.5 focus:outline-none placeholder:text-[#94a3b8] font-semibold ${
                          isPhoneInvalid ? 'text-rose-700' : ''
                        }`}
                        required
                      />

                    </div>
                    
                    <p className="text-[11px] text-[#94a3b8] mt-1.5 font-medium leading-relaxed">
                      {t('forgotPassword.phoneHint')}
                    </p>
                  </div>
                )}

                {/* Smart Password Generator section */}
                <div className="bg-[#f8fafc] border border-slate-100 p-5 rounded-2xl mb-8 mt-6 relative text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      {t('forgotPassword.smartCodeGenerator')}
                    </span>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                      {passwordLength} {t('forgotPassword.letters')}
                    </span>
                  </div>
                  
                  <p className="text-[#64748b] text-[11px] leading-relaxed font-semibold mt-1">
                    {t('forgotPassword.codeGeneratorDesc')}
                  </p>

                  {/* Character Length Range Selector matching design */}
                  <div className="mt-4">
                    <input
                      id="password-length-slider"
                      type="range"
                      min="6"
                      max="16"
                      value={passwordLength}
                      onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                      className="w-full accent-blue-600 bg-slate-200 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#94a3b8] font-bold mt-1 tracking-tight font-mono">
                      <span>6 {t('forgotPassword.letters')}</span>
                      <span>11 {t('forgotPassword.letters')}</span>
                      <span>16 {t('forgotPassword.letters')}</span>
                    </div>
                  </div>

                  {/* Display generated key in real time */}
                  <div className="bg-white border border-slate-150 rounded-xl px-4 py-3.5 flex items-center justify-between mt-4 shadow-3xs">
                    <span 
                      id="generated-password-display"
                      className="font-mono text-base font-bold text-blue-600 tracking-wider select-all"
                    >
                      {suggestedPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleManualRegenerate}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold hover:underline bg-transparent border-none cursor-pointer tracking-tight transition-colors"
                      id="btn-generate-again"
                    >
                      {t('forgotPassword.regenerate')}
                    </button>
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  id="btn-request-reset"
                  type="submit"
                  className="w-full bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-bold py-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.99] transition-transform duration-200"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1" />
                  {t('forgotPassword.resetPassword')}
                </button>

              </form>
            </motion.div>
          )}

          {/* STEP 2: BEAUTIFUL SUCCESS COMPLETION VIEW */}
          {currentStep === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 text-slate-800"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-sans">{t('forgotPassword.passwordUpdated')}</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 font-medium leading-relaxed">
                {t('forgotPassword.passwordUpdatedDesc')}
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 max-w-xs mx-auto text-left relative">
                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t('forgotPassword.activeSandboxKey')}</span>
                <div className="flex justify-between items-center">
                  <span id="recovery-success-text" className="font-mono text-sm text-emerald-700 select-all font-bold whitespace-pre-wrap leading-relaxed">
                    {suggestedPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(suggestedPassword);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-bold bg-white border border-slate-100 rounded px-2 py-1 flex items-center gap-1 shadow-3xs cursor-pointer"
                  >
                    {isCopied ? t('forgotPassword.copied') : t('forgotPassword.copy')}
                  </button>
                </div>
              </div>

              <button
                id="btn-success-goto-login"
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-[#0a0f1d] hover:bg-[#1a233a] text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {t('forgotPassword.resetAndTest')}
              </button>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}