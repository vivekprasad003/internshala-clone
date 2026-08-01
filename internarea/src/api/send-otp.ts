import type { NextApiRequest, NextApiResponse } from 'next';
import * as nodemailer from 'nodemailer';

// Global storage to persist between HMR/API calls in development
if (!(global as any).otpStore) {
  (global as any).otpStore = new Map<string, { otp: string; expires: number }>();
}
const otpStore = (global as any).otpStore;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  // Sanitize environment variables to remove potential quotes or trailing spaces
  const SENDER_EMAIL = process.env.MY_EMAIL?.replace(/['"]/g, '').trim();
  const SENDER_PASS = process.env.MY_PASSWORD?.replace(/['"]/g, '').trim();

  if (!SENDER_EMAIL || !SENDER_PASS) {
    return res.status(500).json({ success: false, error: 'Server configuration error: Missing SMTP credentials' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email.trim(), { otp, expires });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Internarea" <${SENDER_EMAIL}>`,
      to: email,
      subject: "Authentication Security Verification Code ",
      text: `Your verification code is: ${otp}. This code expires in 5 minutes.`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email. Please check SMTP configuration.' 
    });
  }
}