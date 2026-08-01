import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Reset all global mock variables related to membership testing
  (global as any).membershipState = {
  };
  (global as any).membershipInvoices = [];
  (global as any).membershipEmails = [];
  (global as any).appliedInternshipIds = [];

  return res.status(200).json({ success: true, message: "Testing state reset." });
}