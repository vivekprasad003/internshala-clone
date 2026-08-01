import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Send,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { SubscriptionPlan, PlanConfig } from "../types/types_m";
import { useLanguage } from '../context/LanguageContext';

interface PaymentModalProps {
  plan: PlanConfig;
  userEmail: string;
  timeContext: {
    currentISTTime: string;
    isWithinWindow: boolean;
    istHours: number;
    istMinutes: number;
    istSeconds: number;
    devBypassTimeRestriction: boolean;
  };
  onClose: () => void;
  onPaymentSuccess: (payload: {
    planId: SubscriptionPlan;
    paymentGateway: "STRIPE" | "RAZORPAY";
    billingEmail: string;
    cardLast4?: string;
    upiId?: string;
  }) => Promise<void>;
}

export default function PaymentModal({
  plan,
  userEmail,
  timeContext,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { t } = useLanguage();
  const [gateway, setGateway] = useState<"STRIPE" | "RAZORPAY">("STRIPE");
  const [billingEmail, setBillingEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Input States for Stripe
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Input States for Razorpay
  const [upiId, setUpiId] = useState("");

  // Strict time-lock: only allow payment if within 10-11 AM IST OR dev bypass is active
  const isWindowOpen =
    timeContext.isWithinWindow || timeContext.devBypassTimeRestriction;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Strict frontend time-lock: reject all payment attempts outside window
    if (!isWindowOpen) {
      setErrorMessage(t('resume.paymentWindowClosed'));
      return;
    }

    const activeEmail = billingEmail.trim() || userEmail || "Jhon@gmail.com";
    const activeCardNumber = cardNumber.trim() || "4242 4242 4242 4242";
    const activeCardName = cardName.trim() || "John Doe";
    const activeCardExpiry = cardExpiry.trim() || "12/28";
    const activeCardCvv = cardCvv.trim() || "321";
    const activeUpiId = upiId.trim() || "xyz@ybl";

    // Validate email
    if (!activeEmail || !activeEmail.includes("@")) {
      setErrorMessage(t('resume.validBillingEmail'));
      return;
    }

    if (gateway === "RAZORPAY" && !activeUpiId.includes("@")) {
      setErrorMessage(t('resume.validUpiId'));
      return;
    }

    try {
      setIsProcessing(true);
      // Simulate Payment Gateway Network Handshake Latency (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        planId: plan.id,
        paymentGateway: gateway,
        billingEmail: activeEmail,
        ...(gateway === "STRIPE"
          ? { cardLast4: activeCardNumber.replace(/\s/g, "").slice(-4) }
          : { upiId: activeUpiId }),
      };

      await onPaymentSuccess(payload);
    } catch (err: any) {
      setErrorMessage(
        err.message || t('resume.transactionFault'),
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="flex bg-slate-50 border-b border-slate-100 items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {t('resume.securePayment')}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                {t('resume.billingId')}: {plan.id}-SECURE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition duration-150 cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Warning for Hours */}
        {!isWindowOpen && (
          <div className="bg-rose-50 border-b border-rose-100 text-rose-800 p-4 shrink-0">
            <div className="flex gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">
                  {t('resume.transactionBlocked')}
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {t('resume.paymentsLocked')}{" "}
                  <strong>10:00 AM and 11:00 AM IST</strong>.
                </p>
                <p className="text-[10px] text-rose-500 font-mono mt-1">
                  {t('resume.currentIstTime')}:{" "}
                  <strong>{timeContext.currentISTTime}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitPayment} className="p-6">
          {/* Summary Details */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('resume.subscribedItem')}
              </div>
              <div className="text-sm font-bold text-slate-800">
                {plan.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('resume.totalCharge')}
              </div>
              <div className="text-lg font-extrabold text-indigo-600">
                ₹{plan.priceINR}.00{" "}
                <span className="text-[10px] text-slate-400 font-normal">
                  INR
                </span>
              </div>
            </div>
          </div>

          {/* Billing Email Input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t('resume.billingEmail')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              disabled={isProcessing || !isWindowOpen}
              placeholder="e.g. John@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-sm text-slate-800 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              {t('resume.billingEmailDesc')}
            </p>
          </div>

          {/* Gateway Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t('resume.chooseGateway')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway("STRIPE")}
                disabled={isProcessing || !isWindowOpen}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                  !isWindowOpen
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                    : gateway === "STRIPE"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                {t('resume.stripePayments')}
              </button>
              <button
                type="button"
                onClick={() => setGateway("RAZORPAY")}
                disabled={isProcessing || !isWindowOpen}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                  !isWindowOpen
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                    : gateway === "RAZORPAY"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Send className="w-4 h-4 text-emerald-600" />
                {t('resume.razorpayUpi')}
              </button>
            </div>
          </div>

          {/* Checkout Fields according to Gateway */}
          <div className="mb-6 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            {gateway === "STRIPE" ? (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {t('resume.cardIntake')}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t('resume.cardholderName')}
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    disabled={isProcessing || !isWindowOpen}
                    placeholder="e.g. John Alen"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-md text-xs text-slate-800 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t('resume.cardDetails')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={isProcessing || !isWindowOpen}
                      placeholder="4242 4242 4242 4242"
                      className="text-gray-700 w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-md text-xs text-slate-800 transition outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <CreditCard className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      {t('resume.expiryDate')}
                    </label>
                    <input
                      type="date-month-year"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      disabled={isProcessing || !isWindowOpen}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="text-gray-700 w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-md text-xs text-slate-800 transition outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      {t('resume.cvvCode')}
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      disabled={isProcessing || !isWindowOpen}
                      placeholder="***"
                      maxLength={3}
                      className="text-gray-700 w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-md text-xs text-slate-800 transition outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('resume.upiSmartCollect')}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t('resume.upiAddress')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      disabled={isProcessing || !isWindowOpen}
                      placeholder="e.g. xyz@ybl"
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-md text-xs text-slate-800 transition outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Send className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    {t('resume.upiDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Error Notices */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Time-lock message directly above the button */}
          {!isWindowOpen && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                {t('resume.membershipPaymentsOnly')}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isProcessing || !isWindowOpen}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all duration-150 ${
                !isWindowOpen
                  ? "bg-slate-300 cursor-not-allowed opacity-60 hover:bg-slate-300 hover:shadow-none"
                  : isProcessing
                    ? "bg-indigo-600 cursor-wait"
                    : gateway === "STRIPE"
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 cursor-pointer"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 cursor-pointer"
              }`}
              style={!isWindowOpen ? { pointerEvents: "none" } : {}}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('resume.processing')}</span>
                </>
              ) : (
                <>
                  <span>{t('resume.authorizeUpgrade')} {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-400 text-center mt-1 leading-normal">
              {t('resume.paymentDisclaimer')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}