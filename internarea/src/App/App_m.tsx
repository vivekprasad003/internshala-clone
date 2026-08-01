import React, { useState, useEffect } from "react";
import {
  Compass,
  Award,
  Gem,
  Flame,
  Clock,
  Check,
  MapPin,
  Briefcase,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Mail,
  Receipt,
  FileText,
  Sparkles,
  ArrowRight,
  Server,
  User,
  ExternalLink,
  Laptop,
} from "lucide-react";
import {
  SubscriptionPlan,
  PlanConfig,
  SubscriptionState,
  Internship,
  Invoice,
  OutgoingEmail,
} from "../types/types_m";
import PlanCard, { PLANS_DETAILS, getPlanName } from "../Components/PlanCard";
import PaymentModal from "../Components/PaymentModal";
import { useLanguage } from "../context/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<
    "membership" | "invoices" | "emails"
  >("membership");

  // Server state parameters synced dynamically
  const [subscription, setSubscription] = useState<SubscriptionState>({
    currentPlan: SubscriptionPlan.FREE,
    applicationsUsed: 0,
    email: "sumitsoni.btech2024@iujaipur.edu.in",
    startDate: "2026-06-15",
    renewalDate: "2026-07-15",
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [emails, setEmails] = useState<OutgoingEmail[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const [timeContext, setTimeContext] = useState({
    currentISTTime: "",
    isWithinWindow: false,
    istHours: 10,
    istMinutes: 0,
    istSeconds: 0,
    devBypassTimeRestriction: false,
  });

  // UI state managers
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] =
    useState<PlanConfig | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<OutgoingEmail | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [internshipActionLoading, setInternshipActionLoading] = useState<
    string | null
  >(null);

  // Fetch state on mount and keep synced at short intervals
  const fetchState = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const isBypass =
        new URLSearchParams(window.location.search).get("bypass") === "true";
      const fetchUrl = isBypass ? "/api/state?bypass=true" : "/api/state";
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Fault syncing application database state.");
      const data = await res.json();
      setSubscription(data.state);
      setInvoices(data.invoices);
      setEmails(data.emails);
      setInternships(data.internships);
      setAppliedIds(data.appliedInternshipIds);
      setTimeContext(data.timeContext);
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Network synchronization failure.", "error");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState(false);
    // Poll state every 3 seconds for exact clock syncing & updates
    const interval = setInterval(() => {
      fetchState(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string, type: "success" | "error") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Toggle server bypass trigger
  const handleToggleBypass = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/set-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const out = await res.json();
        setTimeContext((prev) => ({
          ...prev,
          devBypassTimeRestriction: out.devBypassTimeRestriction,
        }));
        triggerToast(
          out.devBypassTimeRestriction
            ? t('membership.toastBypassActivated')
            : t('membership.toastBypassDeactivated'),
          "success",
        );
        fetchState(true);
      }
    } catch (err) {
      triggerToast(t('membership.toastBypassFailed'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset backend state
  const handleResetState = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        triggerToast(
          t('membership.toastResetSuccess'),
          "success",
        );
        setSelectedEmail(null);
        await fetchState(false);
      }
    } catch (err) {
      triggerToast(t('membership.toastResetFailed'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Select a plan
  const handleSelectUpgrade = (plan: PlanConfig) => {
    if (plan.id === SubscriptionPlan.FREE) {
      // Free downgrading can be done directly or alert them
      confirmDowngrade(plan);
      return;
    }
    if (!timeContext.isWithinWindow && !timeContext.devBypassTimeRestriction) {
      triggerToast(
        t('membership.toastTransactionBlocked'),
        "error",
      );
      return;
    }
    setSelectedPlanForUpgrade(plan);
  };

  const confirmDowngrade = async (plan: PlanConfig) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          paymentGateway: "STRIPE",
          billingEmail: subscription.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to downgrade plan.");
      }
      setSubscription(data.state);
      setInvoices(data.invoices);
      setEmails(data.emails);
      triggerToast(
        t('membership.toastDowngradeSuccess').replace('{planName}', getPlanName(t, plan.id)),
        "success",
      );
    } catch (err: any) {
      triggerToast(err.message || t('membership.toastDowngradeFailed'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Payment Confirmation Hook
  const handlePaymentSuccess = async (payload: {
    planId: SubscriptionPlan;
    paymentGateway: "STRIPE" | "RAZORPAY";
    billingEmail: string;
    cardLast4?: string;
    upiId?: string;
  }) => {
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Transaction server rejection encountered.",
        );
      }

      setSubscription(data.state);
      setInvoices(data.invoices);
      setEmails(data.emails);
      setSelectedPlanForUpgrade(null);

      // Trigger appropriate toast based on email delivery status

      triggerToast(t('membership.toastPaymentEmailSent'), "success");

      // Auto transition to invoices / emails tab to verify delivery
      setActiveTab("emails");
      if (data.emails && data.emails.length > 0) {
        setSelectedEmail(data.emails[0]);
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Submit Internship Application
  const handleApplyToJob = async (jobId: string) => {
    setInternshipActionLoading(jobId);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId: jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed filing application.");
      }
      setSubscription(data.state);
      setAppliedIds(data.appliedInternshipIds);
      triggerToast(
        t('membership.toastApplicationSuccess'),
        "success",
      );
    } catch (err: any) {
      triggerToast(
        err.message || t('membership.toastApplicationFailed'),
        "error",
      );
    } finally {
      setInternshipActionLoading(null);
    }
  };

  // Helper matching current active plan limits
  const activePlanLimitInfo = PLANS_DETAILS.find(
    (p) => p.id === subscription.currentPlan,
  );
  const isTransactionPermitted =
    timeContext.isWithinWindow || timeContext.devBypassTimeRestriction;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      {/* Styled Frame Container following Geometric Balance spec */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Geometric Balance Header */}
        <header className="bg-white border-2 border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Geometric Rotating Logo */}
            <div className="w-9 h-9 bg-indigo-600 rounded-sm rotate-45 flex items-center justify-center shadow-md">
              <div className="w-3.5 h-3.5 bg-white -rotate-45"></div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight uppercase text-slate-900">
                {t('membership.membership')}
              </span>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none mt-0.5">
                {t('membership.geometricCore')}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            {[
              {
                id: "membership",
                label: t('membership.plans'),
                icon: <Compass className="w-4 h-4" />,
              },
              {
                id: "invoices",
                label: t('membership.invoices'),
                icon: <Receipt className="w-4 h-4" />,
                count: invoices.length,
              },
              {
                id: "emails",
                label: t('membership.emails'),
                icon: <Mail className="w-4 h-4" />,
                count: emails.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 rounded-lg cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Current Profile Summary */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-1">
                {t('membership.activeCredentials')}
              </p>
              <p className="text-xs font-extrabold text-slate-800 tracking-tight">
                {activePlanLimitInfo ? getPlanName(t, activePlanLimitInfo.id) : t('membership.freeTier')}
              </p>
            </div>
          </div>
        </header>

        {/* Informative Alert for Toast feedback (custom rendering) */}
        {toast && (
          <div
            className={`border-2 rounded-2xl p-4 flex gap-3 shadow-md animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-500/30 text-emerald-900"
                : "bg-rose-50 border-rose-500/30 text-rose-900"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
          </div>
        )}

        {/* Dynamic Content Switching Layout */}
        <div className="flex-1 min-h-[480px]">
          {/* 1. MEMBERSHIP PLANS WINDOW */}
          {activeTab === "membership" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {t('membership.premiumGrowth')}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {t('membership.professionalScaling')}
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
                  {t('membership.description')}
                </p>

                {/* Active user state box */}
                <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl inline-flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 mt-2 font-medium">
                  <div>
                    {t('membership.activePlan')}:{" "}
                    <strong className="text-indigo-600 uppercase font-black">
                      {activePlanLimitInfo ? getPlanName(t, activePlanLimitInfo.id) : t('membership.freeTier')}
                    </strong>
                  </div>
                  <div className="h-4 w-px bg-slate-300 hidden sm:block" />
                  <div>
                    {t('membership.applicationsApplied')}:{" "}
                    <strong className="text-slate-800">
                      {subscription.applicationsUsed} /{" "}
                      {activePlanLimitInfo?.applicationLimit === -1
                        ? "∞"
                        : activePlanLimitInfo?.applicationLimit}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pricing Cards Grid matching Geometric theme */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS_DETAILS.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    currentPlan={subscription.currentPlan}
                    onSelect={handleSelectUpgrade}
                    isWithinWindow={timeContext.isWithinWindow}
                    bypassActive={timeContext.devBypassTimeRestriction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. TRANS-COMPLIANT BILLING INVOICES */}
          {activeTab === "invoices" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {t('membership.invoiceLedgers')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('membership.trackPayments')}
                </p>
              </div>

              {invoices.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {t('membership.noTransactions')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('membership.noTransactionsDesc')}
                  </p>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 sm:px-6">{t('membership.invoiceId')}</th>
                          <th className="py-3 px-4">{t('membership.planName')}</th>
                          <th className="py-3 px-4">{t('membership.date')}</th>
                          <th className="py-3 px-4">{t('membership.gateway')}</th>
                          <th className="py-3 px-4">{t('membership.transactionId')}</th>
                          <th className="py-3 px-4">{t('membership.billingEmail')}</th>
                          <th className="py-3 px-4 text-right">{t('membership.amount')}</th>
                          <th className="py-3 px-4 sm:px-6 text-center">
                            {t('membership.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 sm:px-6 font-mono text-indigo-600 font-bold">
                              {inv.id}
                            </td>
                            <td className="py-3.5 px-4 text-slate-900 font-bold">
                              {inv.planName}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono">
                              {inv.date}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                  inv.paymentGateway === "STRIPE"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}
                              >
                                {inv.paymentGateway}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-mono">
                              {inv.transactionId}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {inv.email}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                              ₹{inv.amountINR}.00
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SIMULATED EMAIL INBOX / MAILROOM POSTBOX */}
          {activeTab === "emails" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-indigo-900 uppercase">
                      {t('membership.emailPostbox')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('membership.verifyDeliveries')}
                    </p>
                  </div>
                </div>
              </div>

              {emails.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {t('membership.mailboxVacant')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('membership.mailboxVacantDesc')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Email Headers Queue List */}
                  <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto">
                    {emails.map((mail) => (
                      <button
                        key={mail.id}
                        type="button"
                        onClick={() => setSelectedEmail(mail)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                          selectedEmail?.id === mail.id
                            ? "bg-indigo-50/80 border-indigo-500/70 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            {mail.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {mail.sentAt}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {mail.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {t('membership.to')}:{" "}
                          <span className="font-mono text-slate-650">
                            {mail.to}
                          </span>
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Active Email HTML Body Viewport */}
                  <div className="lg:col-span-7 bg-slate-100 rounded-2xl border-2 border-slate-200 p-4 min-h-[480px] flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
                        {t('membership.richHtmlViewport')}
                      </div>

                      {selectedEmail ? (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          {/* Simulated client headers */}
                          <div className="bg-slate-550 p-4 border-b border-slate-150 text-xs text-slate-650 bg-slate-50 space-y-1">
                            <div>
                              <strong>{t('membership.to')}:</strong> {selectedEmail.to}
                            </div>
                            <div>
                              <strong>{t('membership.subject')}:</strong> {selectedEmail.subject}
                            </div>
                            <div>
                              <strong>{t('membership.sent')}:</strong> {selectedEmail.sentAt}
                            </div>
                          </div>

                          {/* Inner Iframe for previewing complete body HTML accurately */}
                          <div className="p-4 overflow-y-auto bg-slate-50">
                            <div
                              className="bg-white rounded-lg p-0 scale-95 origin-top border border-slate-200/50"
                              dangerouslySetInnerHTML={{
                                __html: selectedEmail.body,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center h-[360px] flex flex-col justify-center">
                          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <h4 className="text-xs font-bold text-slate-700">
                            {t('membership.noMessageSelected')}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {t('membership.noMessageSelectedDesc')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 text-center font-mono mt-4">
                      {t('membership.simulatedDispatch')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Geometric Balance Footer conforming to specifications */}
        <footer className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-xs text-slate-500 mt-auto">
          <div className="flex flex-wrap gap-6 text-slate-400">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {t('membership.paymentProtocol')}
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {t('membership.stripeRazorpay')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {t('membership.invoiceDelivery')}
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {t('membership.emailDispatcher')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-600 px-4 py-2 border border-slate-200 rounded-full font-bold uppercase tracking-wider text-[10px]">
              {t('membership.nextTransactionWindow')}:{" "}
              <strong className="text-indigo-600 font-black">
                {t('membership.dailyIst')}
              </strong>
            </span>
          </div>
        </footer>
      </div>

      {/* Modern Payment Gateway Checkout Modal popup */}
      {selectedPlanForUpgrade && (
        <PaymentModal
          plan={selectedPlanForUpgrade}
          userEmail={subscription.email}
          timeContext={timeContext}
          onClose={() => setSelectedPlanForUpgrade(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}