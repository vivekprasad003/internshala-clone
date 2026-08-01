import { User, ResetRecord } from '../types/types_f';

// Mock initial users for a rich, instantly usable demo experience
export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '555-0199',
    passwordHash: 'CyberdyneGenesis',
    createdAt: new Date().toISOString(),
  },
];

export function getStoredUsers(): User[] {
  const data = localStorage.getItem('app_users');
  if (!data) {
    localStorage.setItem('app_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem('app_users', JSON.stringify(users));
}

export function getResetRecords(): ResetRecord[] {
  const data = localStorage.getItem('reset_records');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveResetRecords(records: ResetRecord[]): void {
  localStorage.setItem('reset_records', JSON.stringify(records));
}

// Generate letter-only password (uppercase and lowercase letters, no numbers or special characters)
export function generateLetterOnlyPassword(length: number = 14): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const allChars = uppercaseChars + lowercaseChars;
  
  let password = '';
  
  // Guarantee at least one uppercase and one lowercase
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  
  for (let i = 2; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle characters so the first ones are not always uppercase/lowercase
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

// Formats date as YYYY-MM-DD in local timezone
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if a reset request has already been issued on the current date
export function checkResetRateLimit(contact: string): { limitExceeded: boolean; expiresAt: number | null } {
  const records = getResetRecords();
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const cleanContact = contact.trim().toLowerCase();

  // Check for any record within the last 24 hours for this specific contact
  const recentReset = records.find(
    (r) => r.contact.toLowerCase() === cleanContact && now - r.timestamp < TWENTY_FOUR_HOURS
  );

  if (!recentReset) return { limitExceeded: false, expiresAt: null };

  return { limitExceeded: true, expiresAt: recentReset.timestamp + TWENTY_FOUR_HOURS };
}


// Record a new password reset event
export function recordPasswordReset(contact: string): void {
  const records = getResetRecords();
  const today = getLocalDateString();
  const cleanContact = contact.trim().toLowerCase();

  const newRecord: ResetRecord = {
    contact: cleanContact,
    date: today,
    timestamp: Date.now(),
  };

  records.push(newRecord);
  saveResetRecords(records);
}

// Device/persisted reset-lock enforcement (24 hours)
export function getDeviceResetLock(deviceKey: string): { locked: boolean; expiresAt: number | null } {
  const now = Date.now();
  try {
    const data = localStorage.getItem('reset_lock_by_device');
    if (!data) return { locked: false, expiresAt: null };
    const parsed = JSON.parse(data) as Record<string, { expiresAt: number }>;
    const entry = parsed?.[deviceKey];
    if (!entry?.expiresAt) return { locked: false, expiresAt: null };
    if (now >= entry.expiresAt) return { locked: false, expiresAt: entry.expiresAt };
    return { locked: true, expiresAt: entry.expiresAt };
  } catch {
    return { locked: false, expiresAt: null };
  }
}

export function setDeviceResetLock(deviceKey: string, ttlMs: number): { expiresAt: number } {
  const expiresAt = Date.now() + ttlMs;
  let parsed: Record<string, { expiresAt: number }> = {};
  try {
    const data = localStorage.getItem('reset_lock_by_device');
    if (data) parsed = JSON.parse(data);
  } catch {}

  parsed[deviceKey] = { expiresAt };
  localStorage.setItem('reset_lock_by_device', JSON.stringify(parsed));
  return { expiresAt };
}

export function clearDeviceResetLockIfExpired(deviceKey: string): void {
  const now = Date.now();
  try {
    const data = localStorage.getItem('reset_lock_by_device');
    if (!data) return;
    const parsed = JSON.parse(data) as Record<string, { expiresAt: number }>;
    const entry = parsed?.[deviceKey];
    if (!entry?.expiresAt) return;
    if (now >= entry.expiresAt) {
      delete parsed[deviceKey];
      localStorage.setItem('reset_lock_by_device', JSON.stringify(parsed));
    }
  } catch {}
}


// Helper to remove rate limits for testing convenience (very useful for developers!)
export function clearResetLimitsForContact(contact: string): void {
  const records = getResetRecords();
  const cleanContact = contact.trim().toLowerCase();
  const updated = records.filter(r => r.contact.toLowerCase() !== cleanContact);
  saveResetRecords(updated);
}