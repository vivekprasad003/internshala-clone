import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Persisted lock store (survives server restart). Minimal footprint.
// We avoid adding new infrastructure/models.
import fs from 'fs';
import path from 'path';

type LockEntry = { expiresAt: number };

function getLocksFilePath() {
  return path.join(process.cwd(), '.next', 'reset_locks.json');
}

function loadLocks(): Record<string, LockEntry> {
  try {
    const fp = getLocksFilePath();
    if (!fs.existsSync(fp)) return {};
    const raw = fs.readFileSync(fp, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, LockEntry>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocks(locks: Record<string, LockEntry>) {
  try {
    const fp = getLocksFilePath();
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(locks), 'utf8');
  } catch {
    // If persistence fails, still enforce lock in-memory for current process.
  }
}

// In-memory cache for current process.
const globalAny = global as any;
if (!globalAny.__resetLocksCache) globalAny.__resetLocksCache = loadLocks();
const lockCache: Record<string, LockEntry> = globalAny.__resetLocksCache;

function cleanupExpiredLocks() {
  const now = Date.now();
  let changed = false;
  for (const [k, v] of Object.entries(lockCache)) {
    if (!v?.expiresAt || now >= v.expiresAt) {
      delete lockCache[k];
      changed = true;
    }
  }
  if (changed) saveLocks(lockCache);
}

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function getClientKey(req: NextApiRequest) {
  // “Per terminal/device” – we approximate via IP + user-agent.
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown-ip';
  const ua = (req.headers['user-agent'] as string | undefined) || 'unknown-ua';
  return `fp_device_${sha256(`${ip}|${ua}`)}`;
}

function getContactKey(contact: string) {
  const clean = (contact || '').trim().toLowerCase();
  return `fp_contact_${sha256(clean)}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { contact, action } = req.body as { contact?: string; action?: string };

  // For this existing Forgot Password implementation, the frontend uses this API as the reset endpoint.
  // We enforce the rate-limit/lock server-side for any successful reset attempt.
  if (!contact || typeof contact !== 'string') {
    return res.status(400).json({ success: false, error: 'contact is required' });
  }

  cleanupExpiredLocks();

  const contactKey = getContactKey(contact);
  const deviceKey = getClientKey(req);

  const now = Date.now();
  const contactLock = lockCache[contactKey];
  const deviceLock = lockCache[deviceKey];

  const contactLocked = !!contactLock && now < contactLock.expiresAt;
  const deviceLocked = !!deviceLock && now < deviceLock.expiresAt;

  if (contactLocked || deviceLocked) {
    const expiresAt = Math.min(
      contactLocked ? contactLock.expiresAt : Number.POSITIVE_INFINITY,
      deviceLocked ? deviceLock.expiresAt : Number.POSITIVE_INFINITY
    );

  return res.status(429).json({
      success: false,
      locked: true,
      reason: 'Reset Rate Limit Hit',
      expiresAt,
      // Provide explicit fields so the UI can match exact copy.
      message:
        'Reset Rate Limit Hit\nYou can use this option only once per day.\nSafety Notice: System policies allow resetting passwords only once per 24 hours per terminal.',
      contactLocked,
      deviceLocked,
    });
  }

  // If the frontend wants to check lock status without performing reset.
  // action === 'check'
  if (action === 'check') {
    return res.status(200).json({
      success: true,
      locked: false,
      expiresAt: null,
    });
  }

  // Treat any call as a “successful reset attempt” for locking purposes.
  // The actual password mutation stays in the existing frontend mock DB.
  // The key requirement here is: repeated resets must be rejected by server.
  const lockExpiresAt = now + TWENTY_FOUR_HOURS;
  lockCache[contactKey] = { expiresAt: lockExpiresAt };
  lockCache[deviceKey] = { expiresAt: lockExpiresAt };
  saveLocks(lockCache);

  return res.status(200).json({
    success: true,
    locked: false,
    expiresAt: lockExpiresAt,
  });
}
