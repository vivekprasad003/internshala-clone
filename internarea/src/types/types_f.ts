export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // Plain password for simulation simplicity, but labeled as passwordHash for security conventions
  createdAt: string;
}

export interface ResetRecord {
  contact: string; // email or phone
  date: string; // YYYY-MM-DD format
  timestamp: number; // millisecond timestamp
}

export interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
}