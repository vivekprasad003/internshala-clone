export type DeviceType = 'Desktop' | 'Laptop' | 'Mobile';

export type OperatingSystem = 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android';

export type BrowserType = 'Google Chrome' | 'Apple Safari' | 'Mozilla Firefox' | 'Microsoft Edge';

export interface UserProfile {
  email: string;
  passwordHash: string; // we'll store simple password for demonstration
  enrolledAt: string;
  fullName: string;
}

export interface LoginAttempt {
  id: string;
  timestamp: string; // ISO string
  email: string;
  device: DeviceType;
  os: OperatingSystem;
  browser: BrowserType;
  ip: string;
  status: 'AUTHORIZED' | 'BLOCKED_TIME' | 'BLOCKED_OTP' | 'OTP_PENDING' | 'FAILED_CREDENTIALS';
  reason: string;
}

export interface SandboxTime {
  enabled: boolean;
  timeString: string; // HH:MM
}