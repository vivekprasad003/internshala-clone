import type { NextApiRequest, NextApiResponse } from 'next';

if (!(global as any).otpStore) {
  (global as any).otpStore = new Map<string, { otp: string; expires: number }>();
}
const otpStore = (global as any).otpStore;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, otp } = req.body;
  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this email' });
  }

  if (Date.now() > storedData.expires) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, error: 'OTP has expired' });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ success: false, error: 'Invalid verification code' });
  }

  otpStore.delete(email); // One-time use: delete after success
  return res.status(200).json({ success: true });
}