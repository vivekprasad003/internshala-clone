import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, X, Send, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (email: string) => void;
  userEmailInitial?: string;
}

export default function OtpModal({ isOpen, onClose, onVerificationSuccess, userEmailInitial = "" }: OtpModalProps) {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState<number>(300); // 5 minutes (300s)
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  const { t } = useLanguage();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (userEmailInitial) {
      setEmail(userEmailInitial);
    }
  }, [userEmailInitial]);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage(t("frenchAuth.validEmailError"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setOtpSent(true);
        setTimer(300);
        setIsResendDisabled(true);
      } else {
        // Show the actual error message from the server if available
        setErrorMessage(data.error || `Server Error (${response.status}): Failed to generate token.`);
      }
    } catch (err) {
      setErrorMessage(t("frenchAuth.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const joinedOtp = otpCode.join("");
    if (joinedOtp.length < 6) {
      setErrorMessage(t("frenchAuth.otpRequiredError"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: joinedOtp }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessAnimation(true);
        setTimeout(() => {
          onVerificationSuccess(email);
          setSuccessAnimation(false);
          setOtpSent(false);
          setOtpCode(Array(6).fill(""));
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.error || t("frenchAuth.invalidOtpError"));
      }
    } catch (err) {
      setErrorMessage(t("frenchAuth.serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpCode(Array(6).fill(""));
    setErrorMessage("");
    setIsResendDisabled(true);
    setTimer(300);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.error || t("frenchAuth.resendFailed"));
        setIsResendDisabled(false);
      }
    } catch (err) {
      setErrorMessage(t("frenchAuth.resendError"));
      setIsResendDisabled(false);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (value !== "" && (isNaN(Number(value)) || value === " ")) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1);
    setOtpCode(newOtp);

    if (value) {
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    } else {
      // Clear happened (backspace/delete), focus previous
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otpCode[index]) {
        // Clear current digit and focus previous
        const newOtp = [...otpCode];
        newOtp[index] = "";
        setOtpCode(newOtp);
        if (index > 0) {
          otpRefs.current[index - 1]?.focus();
        }
      } else if (index > 0) {
        // Current is empty, just focus previous
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with a soft frosted glass layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isLoading && onClose()}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px]"
      />

      {/* Sleek Design Frame */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-10 overflow-hidden border border-slate-100 z-10 flex flex-col items-center text-center"
      >
        {/* Close Switch */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition duration-150 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Rounded Emblem Header */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.033A11.966 11.966 0 0112 21a11.966 11.966 0 017.618-15.023z"></path>
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
          {t("frenchAuth.title")}
        </h3>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-sm">
          {t("frenchAuth.description")}
        </p>

        {/* Error Alert Streamline */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-red-50 border border-red-100 rounded-xl p-3 mb-5 flex items-start space-x-2 text-red-700 text-xs text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {successAnimation ? (
          /* Verified state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 space-y-3"
          >
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <p className="font-semibold text-green-600 text-sm">
              {t("frenchAuth.sessionVerified")}
            </p>
          </motion.div>
        ) : !otpSent ? (
          /* STEP 1: Dispatch email command */
          <form onSubmit={handleSendOtp} className="w-full space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                {t("frenchAuth.emailLabel")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("frenchAuth.emailPlaceholder")}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-4 pr-10 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                />
                <div className="absolute right-3.5 top-3.5 text-slate-400">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex gap-2.5 text-left">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("frenchAuth.securityWarning")}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin animate-reverse" />
                  <span>{t("frenchAuth.sendingButton")}</span>
                </>
              ) : (
                <>
                  <span>{t("frenchAuth.sendOtpButton")}</span>
                </>
              )}
            </motion.button>

            <p className="text-[11px] text-slate-400 font-mono leading-relaxed mt-2">
              {t("frenchAuth.hintText")}
            </p>
          </form>
        ) : (
          /* STEP 2: Input code */
          <div className="w-full space-y-8">
            <div className="text-xs text-slate-500 text-left bg-blue-50/70 rounded-2xl p-5 border border-blue-100/80 shadow-sm leading-relaxed">
              <span className="text-blue-700 font-semibold text-[14px] flex items-center gap-1.5 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                ✓ {t("frenchAuth.otpSentTitle")}
              </span>
              <p className="font-sans text-[13px] text-slate-600 leading-relaxed md:leading-loose">
                {t("frenchAuth.otpSentMessage")}{" "}
                <span className="inline-block bg-blue-100/30 text-blue-900 font-mono font-medium px-2 py-0.5 rounded border border-blue-200/50 break-all select-all text-[12px] mt-1">
                  {email}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                {t("frenchAuth.enterOtp")}
              </label>

              {/* 6 Grid layout box */}
              <div className="flex justify-between gap-3 max-w-[340px] mx-auto py-2">
                {otpCode.map((digit, idx) => {
                  const hasValue = digit !== "";
                  return (
                    <input
                      key={idx}
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={isLoading}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      onChange={(e) => handleOtpChange(e.target as HTMLInputElement, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className={`w-12 h-14 bg-slate-50 border-2 rounded-xl text-center text-xl font-bold transition-all focus:outline-none focus:border-blue-500 focus:bg-white ${
                        hasValue ? "border-blue-300 text-blue-600 bg-blue-50/20 shadow-inner" : "border-slate-200/80 text-slate-800"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Expire label and Resend underline trigger */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1 py-1.5 border-t border-b border-dashed border-slate-200/80">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {t("frenchAuth.timerLabel")}: <span className="font-semibold text-slate-700">{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}</span>
                </span>
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled || isLoading}
                className={`font-semibold underline decoration-2 underline-offset-4 transition-colors ${
                  isResendDisabled
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700 cursor-pointer"
                }`}
              >
                {t("frenchAuth.resendButton")}
              </button>
            </div>

            <div className="flex gap-4 pt-3">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
                className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold py-4 rounded-xl text-sm transition-all font-sans cursor-pointer"
              >
                {t("frenchAuth.backButton")}
              </button>
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpCode.join("").length < 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-sm shadow-lg shadow-blue-100 transition-all font-sans cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : t("frenchAuth.verifyButton")}
              </button>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-150 text-[11px] text-slate-400 text-left leading-relaxed">
              {t("frenchAuth.securityLogsHint")}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}