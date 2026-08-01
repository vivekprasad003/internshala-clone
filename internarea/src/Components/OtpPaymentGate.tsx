import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Mail, 
  CheckCircle, 
  ShieldAlert, 
  CreditCard, 
  Smartphone, 
  ArrowRight, 
  Lock, 
  Loader2,
  RefreshCw,
  QrCode,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OtpPaymentGateProps {
  studentEmail: string;
  resumeId: string;
  onResumeUnlocked: () => void;
  onClose: () => void;
}

export default function OtpPaymentGate({ 
  studentEmail, 
  resumeId, 
  onResumeUnlocked, 
  onClose 
}: OtpPaymentGateProps) {
  const { t } = useLanguage();

  // Step workflow state: 'REQUEST_OTP' | 'VERIFY_OTP' | 'CHOOSE_PAYMENT' | 'PROCESSING_PAY' | 'PAY_SUCCESS'
  const [step, setStep] = useState<'REQUEST_OTP' | 'VERIFY_OTP' | 'CHOOSE_PAYMENT' | 'PROCESSING_PAY' | 'PAY_SUCCESS'>('REQUEST_OTP');
  const [emailInput, setEmailInput] = useState(studentEmail || '');
  const [otpCode, setOtpCode] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpResendCounter, setOtpResendCounter] = useState(0);
  
  // Razorpay simulator select method
  const [payMethod, setPayMethod] = useState<'CARD' | 'UPI'>('UPI');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiId, setUpiId] = useState('john@okaxis');

  useEffect(() => {
    if (emailInput.trim()) {
      setUpiId(`${emailInput.trim().split('@')[0]}@okaxis`);
    } else {
      setUpiId('john@okaxis');
    }
  }, [emailInput]);

  // OTP countdown timer: 5 minutes
  useEffect(() => {
    if (step !== 'VERIFY_OTP') return;

    // Reset timer when this effect runs (initial send or resend)
    setOtpTimer(300);
    setOtpExpired(false);

    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, otpResendCounter]);

  useEffect(() => {
    if (step === 'VERIFY_OTP') {
      const fetchLatestOtp = async () => {
        try {
          const res = await fetch('/api/developer/mailbox');
          
          // Avoid parsing if the response is HTML (404) or empty
          const contentType = res.headers.get('content-type');
          if (!res.ok || !contentType || !contentType.includes('application/json')) {
            return;
          }

          const data = await res.json();
          // Handle both 'emails' and 'logs' from different API versions
          const emailList = data.emails || data.logs || [];
          
          if (Array.isArray(emailList) && emailList.length > 0) {
            const targetEmail = getActiveEmail();
            const matchingEmail = emailList.find((email: any) => email?.to?.toLowerCase() === targetEmail.toLowerCase());
            if (matchingEmail?.otp || matchingEmail?.otpCode) {
              setDispatchedOtp(matchingEmail.otp || matchingEmail.otpCode);
            }
          }
        } catch (e) {
          console.error("Error syncing sandbox OTP:", e);
        }
      };
      fetchLatestOtp();
    }
  }, [step, emailInput]);

  const getActiveEmail = () => {
    return emailInput.trim();
  };

  // Request secure OTP code
  const handleRequestOtp = async () => {
    // Clear existing OTP state and input boxes for fresh entry
    setOtpCode('');
    setOtpExpired(false);
    setOtpTimer(300);
    setOtpResendCounter((c) => c + 1);
    otpRefs.current.forEach((ref) => {
      if (ref) ref.value = '';
    });

    const targetEmail = getActiveEmail();
    if (!targetEmail) {
      setErrorMessage(t('premiumResumeUnlock.emailPlaceholder'));
      return;
    }
    
    // More robust email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(targetEmail)) {
      setErrorMessage(t('premiumResumeUnlock.validEmailError'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const contentType = res.headers.get('content-type');
      const data = (contentType && contentType.includes('application/json')) ? await res.json() : null;

      if (res.ok) {
        setStep('VERIFY_OTP');
        setSuccessMsg(data?.message || t('premiumResumeUnlock.otpSent'));
        const otpValue = data?.otp || data?.log?.otpCode;
        if (otpValue) {
          setDispatchedOtp(otpValue);
        }
      } else {
        setErrorMessage(data?.message || data?.error || t('premiumResumeUnlock.otpSendError'));
      }
    } catch (e) {
      setErrorMessage(t('premiumResumeUnlock.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify secure OTP code
  const handleVerifyOtp = async () => {
    const targetEmail = getActiveEmail();
    if (otpCode.length < 4) {
      setErrorMessage(t('premiumResumeUnlock.enterValidOtp'));
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: targetEmail, 
          otp: otpCode,
          otpCode: otpCode 
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.verified || res.status === 200) {
        setStep('CHOOSE_PAYMENT');
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || data.error || t('premiumResumeUnlock.otpVerifyFailed'));
      }
    } catch (e) {
      setErrorMessage(t('premiumResumeUnlock.networkVerifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment capture through Razorpay Simulator
  const handleCompletePayment = async () => {
    const targetEmail = getActiveEmail();
    setIsLoading(true);
    setErrorMessage('');
    try {
      // 1. Initialize custom checkout configuration
      const checkRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, resumeId })
      });
      const checkData = await checkRes.json();
      
      if (!checkRes.ok) {
        setErrorMessage(checkData.message || t('premiumResumeUnlock.initGatewayError'));
        setIsLoading(false);
        return;
      }

      setStep('PROCESSING_PAY');

      // 2. Simulate Razorpay webhook verification and capture
      setTimeout(async () => {
        try {
          const pseudoPaymentId = "pay_rzp_" + Math.random().toString(36).substring(2, 10);
          const pseudoSignature = "sig_rzp_" + Math.random().toString(36).substring(2, 15);

          const payRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: pseudoPaymentId,
              razorpay_order_id: checkData.orderId,
              razorpay_signature: pseudoSignature,
              email: targetEmail,
              resumeId
            })
          });
          
          const payData = await payRes.json();
          if (payRes.ok) {
            try {
              const txId = payData.transactionId || payData.paymentId || pseudoPaymentId;
              const amt = payData.amount || payData.amountINR || 50;
              const planName = payData.planName || "Premium Resume Unlock";
              const payDate = payData.date || new Date().toLocaleString('en-IN');

              await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'send_resume_email',
                  email: targetEmail,
                  transactionId: txId,
                  selectedPlan: planName,
                  actualAmount: amt,
                  paymentDate: payDate
                })
              });
            } catch (emailErr) {
              console.warn("Email service warning:", emailErr);
            }
            setStep('PAY_SUCCESS');
            onResumeUnlocked();
          } else {
            setErrorMessage(payData.message || t('premiumResumeUnlock.paymentVerificationError'));
            setStep('CHOOSE_PAYMENT');
          }
        } catch (err) {
          setErrorMessage(t('premiumResumeUnlock.paymentSignatureError'));
          setStep('CHOOSE_PAYMENT');
        } finally {
          setIsLoading(false);
        }
      }, 2500); // realistic payment latency

    } catch (e) {
      setErrorMessage(t('premiumResumeUnlock.paymentGatewayError'));
      setIsLoading(false);
    }
  };

  return (
    <div id="payment-gate-modal" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 max-h-[90vh]">
        
        {/* Banner/Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-200" />
            <div>
              <h3 className="font-display font-semibold text-lg text-white">{t('premiumResumeUnlock.modalHeader')}</h3>
              <p className="text-xs text-indigo-100 font-sans">{t('premiumResumeUnlock.modalSubheader')}</p>
            </div>
          </div>
          <button 
            id="close-gate-btn"
            onClick={onClose} 
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer"
          >
            {t('premiumResumeUnlock.cancel')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2.5 border border-red-100 text-sm">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Core steps content */}
          {step === 'REQUEST_OTP' && (
            <div className="flex flex-col text-center py-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Mail className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg mb-1">{t('premiumResumeUnlock.verifyEmailIdentity')}</h4>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {t('premiumResumeUnlock.verifyEmailIdentityDescription')}
              </p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                <label htmlFor="student-email-input" className="text-gray-700 text-xs font-semibold block uppercase mb-1.5">{t('premiumResumeUnlock.emailInputLabel')}</label>
                <div className="relative">
                  <input
                    id="student-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t('premiumResumeUnlock.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:bg-white focus:border-indigo-500 placeholder:text-gray-400 outline-none transition-all text-gray-800 font-sans"
                  />
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-6 text-left">
                <div className="text-xs text-blue-800">
                  <span className="font-semibold block text-sm text-blue-900 mb-0.5 uppercase tracking-wide">{t('premiumResumeUnlock.premiumResumeUnlockFee')}</span>
                  {t('premiumResumeUnlock.oneTimeProcessingCharge')}
                </div>
                <div className="text-2xl font-bold text-blue-700 font-display shrink-0">₹50</div>
              </div>

              <button
                id="request-otp-btn"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('premiumResumeUnlock.sendingOtp')}
                  </>
                ) : (
                  <>
                    {t('premiumResumeUnlock.requestVerificationCode')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'VERIFY_OTP' && (
            <div className="flex flex-col text-center py-2">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Key className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg mb-1">{t('premiumResumeUnlock.enterVerificationCode')}</h4>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {t('premiumResumeUnlock.enterOtpDescription')} <strong className="text-gray-700">{emailInput.trim() || 'your email'}</strong>.
              </p>

              {successMsg && (
                <div className="mb-4 bg-green-100 text-green-800 p-3 rounded-lg text-sm font-bold border border-green-200 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-700" />
                  <span>{successMsg}</span>
                </div>
              )}

              {dispatchedOtp && (
                <div id="sandbox-otp-banner" className="mb-4 bg-indigo-50/80 border border-indigo-150 p-3 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {t('premiumResumeUnlock.securityOtpPasscode')}
                  </span>
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-5xl font-mono font-extrabold text-green-600 tracking-[0.5em] bg-white px-6 py-4 rounded-lg border border-indigo-200/80 shadow-2xs text-center flex items-center justify-center min-w-[280px]">
                      {dispatchedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(dispatchedOtp);
                        setTimeout(() => {
                          otpRefs.current.forEach((ref) => {
                            if (ref) ref.value = '';
                          });
                          dispatchedOtp.split('').forEach((digit, i) => {
                            if (otpRefs.current[i]) {
                              otpRefs.current[i]!.value = digit;
                            }
                          });
                          if (otpRefs.current[5]) otpRefs.current[5]!.focus();
                        }, 0);
                      }}
                      className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-3xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {t('premiumResumeUnlock.instantFill')}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Timer */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1.5 rounded-full border ${
                  otpExpired
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : otpTimer <= 60
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {otpExpired ? (
                    <span>{t('premiumResumeUnlock.otpExpired')}</span>
                  ) : (
                    <span>{Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                  )}
                </div>
              </div>

              {/* Modern OTP Input - 6 individual boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    id={`otp-box-${index}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[index] || ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = raw.replace(/\D/g, '');
                      // Handle clearing: if input is empty (backspace/delete), clear this digit
                      if (raw === '') {
                        const newOtp = otpCode.split('');
                        newOtp[index] = '';
                        setOtpCode(newOtp.join(''));
                        // Auto-focus previous box on clear
                        if (index > 0 && otpRefs.current[index - 1]) {
                          otpRefs.current[index - 1]!.focus();
                        }
                      } else if (val) {
                        const newOtp = otpCode.split('');
                        newOtp[index] = val;
                        setOtpCode(newOtp.join(''));
                        // Auto-focus next box
                        if (index < 5 && otpRefs.current[index + 1]) {
                          otpRefs.current[index + 1]!.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        if (otpCode[index]) {
                          // Clear current digit and focus previous
                          const newOtp = otpCode.split('');
                          newOtp[index] = '';
                          setOtpCode(newOtp.join(''));
                          if (index > 0 && otpRefs.current[index - 1]) {
                            otpRefs.current[index - 1]!.focus();
                          }
                        } else if (index > 0) {
                          // Current is empty, just focus previous
                          if (otpRefs.current[index - 1]) {
                            otpRefs.current[index - 1]!.focus();
                          }
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setOtpCode(pasted);
                      pasted.split('').forEach((digit, i) => {
                        if (otpRefs.current[i]) {
                          otpRefs.current[i]!.value = digit;
                        }
                      });
                      if (pasted.length === 6 && otpRefs.current[5]) {
                        otpRefs.current[5]!.focus();
                      } else if (otpRefs.current[pasted.length]) {
                        otpRefs.current[pasted.length]!.focus();
                      }
                    }}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold rounded-xl border-2 outline-none transition-all duration-200 font-mono text-gray-900 ${
                      otpCode[index]
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  id="back-otp-btn"
                  onClick={() => setStep('REQUEST_OTP')}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {t('premiumResumeUnlock.goBack')}
                </button>
                <button
                  id="confirm-otp-btn"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otpCode.length < 6}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('premiumResumeUnlock.checking')}
                    </>
                  ) : (
                    <>
                      {t('premiumResumeUnlock.verifyPasscode')}
                    </>
                  )}
                </button>
              </div>

              {/* Resend OTP Button - Modern Style */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center gap-3">
                <button
                  id="resend-otp-btn"
                  onClick={handleRequestOtp}
                  disabled={isLoading || !otpExpired}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm py-2.5 px-8 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('premiumResumeUnlock.resendingOtp')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      {t('premiumResumeUnlock.resendOtpCode')}
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-400">
                  {t('premiumResumeUnlock.didntReceive')} <span className="text-indigo-500 font-semibold">{t('premiumResumeUnlock.sandboxOtp')}</span> {t('premiumResumeUnlock.above')}
                </p>
              </div>
            </div>
          )}

          {step === 'CHOOSE_PAYMENT' && (
            <div className="flex flex-col py-1">
              {/* Product Info */}
              <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100 rounded-xl mb-5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">{t('premiumResumeUnlock.razorpayCheckoutProduct')}</span>
                  <p className="font-semibold text-gray-800 text-sm">{t('premiumResumeUnlock.singlePremiumResume')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold font-mono">{t('premiumResumeUnlock.amountDue')}</span>
                  <div className="text-lg font-bold text-emerald-600">₹50.00</div>
                </div>
              </div>

              <h4 className="font-display font-medium text-gray-600 text-xs mb-3 uppercase tracking-wide">{t('premiumResumeUnlock.selectPaymentMethod')}</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  id="select-upi-btn"
                  onClick={() => setPayMethod('UPI')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all cursor-pointer ${
                    payMethod === 'UPI' 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  {t('premiumResumeUnlock.upiQrCode')}
                </button>
                <button
                  id="select-card-btn"
                  onClick={() => setPayMethod('CARD')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all cursor-pointer ${
                    payMethod === 'CARD' 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  {t('premiumResumeUnlock.creditDebitCard')}
                </button>
              </div>

              {payMethod === 'UPI' ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase font-mono">{t('premiumResumeUnlock.enterUpiId')}</label>
                    <div className="relative">
                      <input
                        id="upi-id-input"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@vpa"
                        className="text-gray-700 w-full pl-3 pr-20 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 outline-none focus:border-indigo-500"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-700 font-semibold text-[10px] px-2 py-1 rounded">
                        {t('premiumResumeUnlock.upiSecure')}
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-center gap-2.5 text-xs text-blue-800">
                    <QrCode className="w-5 h-5 shrink-0 text-blue-500" />
                    <span>{t('premiumResumeUnlock.upiDescription')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase font-mono">{t('premiumResumeUnlock.cardNumber')}</label>
                    <div className="relative">
                      <input
                        id="card-num-input"
                        type="text"
                        value={cardNumber}
                        placeholder="4111 2222 3333 4444"
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="text-gray-700 w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 outline-none focus:border-indigo-500 font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase font-mono">{t('premiumResumeUnlock.expiryDate')}</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        value={cardExpiry}
                        placeholder="MM/YY"
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="text-gray-700 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 outline-none focus:border-indigo-500 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase font-mono">{t('premiumResumeUnlock.cvvGuard')}</label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        value={cardCvv}
                        placeholder="***"
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="text-gray-700 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 outline-none focus:border-indigo-500 text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                id="complete-pay-btn"
                onClick={handleCompletePayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {t('premiumResumeUnlock.payNow')}
              </button>

              <div className="text-center mt-4 text-[10px] text-gray-400">
                {t('premiumResumeUnlock.securedEncryption')}
              </div>
            </div>
          )}

          {step === 'PROCESSING_PAY' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="relative mb-6">
                <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin" />
                <Lock className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg mb-2">{t('premiumResumeUnlock.authorizingPayments')}</h4>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                {t('premiumResumeUnlock.processingDescription')}
              </p>
            </div>
          )}

          {step === 'PAY_SUCCESS' && (
            <div className="flex flex-col items-center text-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg mb-2">{t('premiumResumeUnlock.transactionSuccess')}</h4>
              <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
                {t('premiumResumeUnlock.successDescription')}
              </p>

              <button
                id="finish-checkout-btn"
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {t('premiumResumeUnlock.closeAndPrint')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}