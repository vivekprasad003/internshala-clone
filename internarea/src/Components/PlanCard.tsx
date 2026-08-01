import React from "react";
import { Check, Compass, Award, Gem, Flame } from "lucide-react";
import { SubscriptionPlan, PlanConfig } from "../types/types_m";
import { useLanguage } from '../context/LanguageContext';

export function getPlanName(t: (key: string) => string, id: SubscriptionPlan): string {
  switch (id) {
    case SubscriptionPlan.FREE: return t('membership.planFreeName');
    case SubscriptionPlan.BRONZE: return t('membership.planBronzeName');
    case SubscriptionPlan.SILVER: return t('membership.planSilverName');
    case SubscriptionPlan.GOLD: return t('membership.planGoldName');
    default: return t('membership.planFreeName');
  }
}

function getPlanDesc(t: (key: string) => string, id: SubscriptionPlan): string {
  switch (id) {
    case SubscriptionPlan.FREE: return t('membership.planFreeDesc');
    case SubscriptionPlan.BRONZE: return t('membership.planBronzeDesc');
    case SubscriptionPlan.SILVER: return t('membership.planSilverDesc');
    case SubscriptionPlan.GOLD: return t('membership.planGoldDesc');
    default: return t('membership.planFreeDesc');
  }
}

function getPlanFeatures(t: (key: string) => string, id: SubscriptionPlan): string[] {
  switch (id) {
    case SubscriptionPlan.FREE:
      return [
        t('membership.planFreeFeature1'),
        t('membership.planFreeFeature2'),
        t('membership.planFreeFeature3')
      ];
    case SubscriptionPlan.BRONZE:
      return [
        t('membership.planBronzeFeature1'),
        t('membership.planBronzeFeature2'),
        t('membership.planBronzeFeature3'),
        t('membership.planBronzeFeature4')
      ];
    case SubscriptionPlan.SILVER:
      return [
        t('membership.planSilverFeature1'),
        t('membership.planSilverFeature2'),
        t('membership.planSilverFeature3'),
        t('membership.planSilverFeature4')
      ];
    case SubscriptionPlan.GOLD:
      return [
        t('membership.planGoldFeature1'),
        t('membership.planGoldFeature2'),
        t('membership.planGoldFeature3'),
        t('membership.planGoldFeature4')
      ];
    default: return [];
  }
}

export const PLANS_DETAILS: PlanConfig[] = [
  {
    id: SubscriptionPlan.FREE,
    name: "Free Plan",
    priceINR: 0,
    applicationLimit: 1,
    description: "Ideal for freshers starting to explore early roles.",
    features: [
      "Submit up to 1 internship / month",
      "Standard application review queues",
      "Basic candidate dashboard access"
    ]
  },
  {
    id: SubscriptionPlan.BRONZE,
    name: "Bronze Plan",
    priceINR: 100,
    applicationLimit: 3,
    description: "Perfect for active students applying for selected roles.",
    features: [
      "Submit up to 3 internships / month",
      "Fast-tracked application review routing",
      "Profile view statistics by companies",
      "Standout CV accent badge"
    ]
  },
  {
    id: SubscriptionPlan.SILVER,
    name: "Silver Plan",
    priceINR: 300,
    applicationLimit: 5,
    description: "Advanced match coverage for competitive internships.",
    features: [
      "Submit up to 5 internships / month",
      "Direct chat channels with hiring managers",
      "Resume match-score compatibility analytics",
      "Notification triggers for fresh matched postings"
    ]
  },
  {
    id: SubscriptionPlan.GOLD,
    name: "Gold Plan",
    priceINR: 1000,
    applicationLimit: -1,
    description: "Uncapped scaling for career-driven applicants.",
    features: [
      "Unlimited internship submissions",
      "Featured talent ranking position in recruiter lists",
      "One-on-one resume revision call (1 / mo)",
      "Designated 24/7 priority mentorship chat"
    ]
  }
];

interface PlanCardProps {
  key?: any;
  plan: PlanConfig;
  currentPlan: SubscriptionPlan;
  onSelect: (plan: PlanConfig) => void;
  isWithinWindow: boolean;
  bypassActive: boolean;
}

export default function PlanCard({ plan, currentPlan, onSelect, isWithinWindow, bypassActive }: PlanCardProps) {
  const { t } = useLanguage();
  const isCurrent = currentPlan === plan.id;
  const isFree = plan.id === SubscriptionPlan.FREE;

  // Visual Styling Map for Plans
  const getThemeStyles = (id: SubscriptionPlan) => {
    switch (id) {
      case SubscriptionPlan.FREE:
        return {
          cardBorder: "border-slate-200 hover:border-slate-300",
          accentColor: "bg-slate-100 text-slate-800",
          headerBg: "bg-slate-50",
          buttonColor: isCurrent 
            ? "bg-slate-100 text-slate-500 cursor-default" 
            : "bg-slate-800 hover:bg-slate-900 text-white shadow-sm",
          icon: <Compass className="w-5 h-5 text-slate-500" />
        };
      case SubscriptionPlan.BRONZE:
        return {
          cardBorder: isCurrent ? "border-amber-500 ring-2 ring-amber-500/10" : "border-slate-200 hover:border-amber-300",
          accentColor: "bg-amber-100 text-amber-800",
          headerBg: "bg-amber-50/50",
          buttonColor: isCurrent 
            ? "bg-emerald-100 text-emerald-800 cursor-default border border-emerald-200" 
            : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow",
          icon: <Award className="w-5 h-5 text-amber-650" />
        };
      case SubscriptionPlan.SILVER:
        return {
          cardBorder: isCurrent ? "border-indigo-400 ring-2 ring-indigo-400/10" : "border-slate-200 hover:border-indigo-200",
          accentColor: "bg-indigo-100 text-indigo-800",
          headerBg: "bg-indigo-50/40",
          buttonColor: isCurrent 
            ? "bg-emerald-100 text-emerald-800 cursor-default border border-emerald-200" 
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow",
          icon: <Gem className="w-5 h-5 text-indigo-500" />
        };
      case SubscriptionPlan.GOLD:
        return {
          cardBorder: isCurrent ? "border-rose-500 ring-4 ring-rose-500/10" : "border-slate-200 hover:border-rose-300 shadow-md hover:shadow-lg",
          accentColor: "bg-rose-100 text-rose-800 font-bold",
          headerBg: "bg-rose-50/50",
          buttonColor: isCurrent 
            ? "bg-emerald-100 text-emerald-800 cursor-default border border-emerald-200" 
            : "bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg animate-card-glow",
          icon: <Flame className="w-5 h-5 text-rose-500" />
        };
    }
  };

  const style = getThemeStyles(plan.id);
  const transactionPossible = isWithinWindow || bypassActive;

  // Use translated plan name, description, and features
  const translatedPlanName = getPlanName(t, plan.id);
  const translatedPlanDesc = getPlanDesc(t, plan.id);
  const translatedFeatures = getPlanFeatures(t, plan.id);

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl border transition-all duration-300 ${style.cardBorder}`}>
      {/* Plan Header */}
      <div className={`p-6 rounded-t-2xl border-b border-slate-100 ${style.headerBg}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {style.icon}
            <h3 className="text-lg font-bold text-slate-900">{translatedPlanName}</h3>
          </div>
          {isCurrent && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
              {t('resume.activeTier')}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 pr-4">{translatedPlanDesc}</p>
      </div>

      {/* Pricing / Plan Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-900">
              ₹{plan.priceINR}
            </span>
            <span className="text-slate-500 text-sm font-medium">{t('membership.perMonth')}</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('membership.plans')}
            </div>
            <ul className="space-y-3">
              {(translatedFeatures.length > 0 ? translatedFeatures : plan.features).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isCurrent ? (
            <button className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-center ${style.buttonColor} disabled:opacity-80`} disabled>
              {t('resume.installedTiers')}
            </button>
          ) : (
            <button
              onClick={() => onSelect(plan)}
              disabled={!transactionPossible && !isFree}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-center transition-all duration-200 ${
                !transactionPossible && !isFree
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none"
                  : `cursor-pointer ${style.buttonColor}`
              }`}
            >
              {isFree ? t('resume.downgradeFree') : t('resume.subscribeGateway')}
            </button>
          )}

          {!transactionPossible && !isFree && !isCurrent && (
            <p className="text-center text-[10px] text-amber-600 mt-2 font-medium">
              {t('resume.windowLocked')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}