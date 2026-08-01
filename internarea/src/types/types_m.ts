export enum SubscriptionPlan {
  FREE = "FREE",
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD"
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  priceINR: number;
  applicationLimit: number; // -1 for unlimited
  description: string;
  features: string[];
}

export interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  applicationsUsed: number;
  email: string;
  startDate: string | null;
  renewalDate: string | null;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  tags: string[];
  description: string;
  appliedAt?: string;
}

export interface Invoice {
  id: string;
  planId: SubscriptionPlan;
  planName: string;
  amountINR: number;
  date: string;
  status: "PAID" | "PENDING" | "FAILED";
  paymentGateway: "STRIPE" | "RAZORPAY";
  transactionId: string;
  email: string;
}

export interface OutgoingEmail {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  body: string;
  invoiceId?: string;
}

export interface SystemTimeState {
  currentISTTime: string;
  isWithinWindow: boolean;
  istHours: number;
  istMinutes: number;
  istSeconds: number;
}