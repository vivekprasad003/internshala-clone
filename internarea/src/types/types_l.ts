export type LanguageCode = "en" | "es" | "hi" | "pt" | "zh" | "fr";

export interface NavigationLabels {
  brand: string;
  home: string;
  features: string;
  contact: string;
  securityConsole: string;
  selectLanguage: string;
}

export interface HeroLabels {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  securityNotice: string;
  securityAction: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
}

export interface FeatureLabels {
  heading: string;
  subheading: string;
  cards: FeatureItem[];
}

export interface ContactLabels {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  sendButton: string;
  successTitle: string;
  successMessage: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
}

export interface OtpLabels {
  title: string;
  description: string;
  enterOtp: string;
  verifyButton: string;
  sendingButton: string;
  emailPlaceholder: string;
  sendOtpButton: string;
  securityWarning: string;
  otpSentMessage: string;
  invalidOtp: string;
  sessionVerified: string;
  timerLabel: string;
  resendButton: string;
  verifyStepTitle: string;
}

export interface FooterLabels {
  tagline: string;
  copyright: string;
  terms: string;
  privacy: string;
}

export interface PremiumResumeUnlockLabels {
  razorpaySecurePro: string;
  paymentGatewayIntegration: string;
  cancel: string;
  verifyEmailIdentity: string;
  verifyEmailIdentityDescription: string;
  registeredStudentEmailAddress: string;
  emailPlaceholder: string;
  premiumResumeUnlockFee: string;
  oneTimeProcessingCharge: string;
  requestVerificationCode: string;
  enterVerificationCode: string;
  enterPasscodeSentTo: string;
  otpSentSuccessfully: string;
  goBack: string;
  verifyPasscode: string;
  resendOtpCode: string;
  didntReceiveOtp: string;
  sandboxOtp: string;
  above: string;
  otpIncorrectOrExpired: string;
  errorSendingOtp: string;
  verificationFailed: string;
  razorpayCheckoutProduct: string;
  singlePremiumResume: string;
  amountDue: string;
  selectPaymentMethod: string;
  upiQrCode: string;
  creditDebitCard: string;
  enterUpiId: string;
  upiSecure: string;
  razorpayStandardPopup: string;
  cardNumber: string;
  expiryDate: string;
  cvvGuard: string;
  payNowViaRazorpay: string;
  securedWithEncryption: string;
  authorizingPayments: string;
  authorizingPaymentsDescription: string;
  transactionSuccess: string;
  transactionSuccessDescription: string;
  closeAndPrintResume: string;
  pleaseEnterEmail: string;
}


export interface TranslationDictionary {
  navbar: NavigationLabels;
  hero: HeroLabels;
  features: FeatureLabels;
  contact: ContactLabels;
  otp: OtpLabels;
  footer: FooterLabels;
  premiumResumeUnlock: PremiumResumeUnlockLabels;
}

export interface OtpLog {
  email: string;
  otp: string;
  timestamp: number;
}