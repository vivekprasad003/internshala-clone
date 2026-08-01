import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, resumeId } = req.body;

  if (!email || !resumeId) {
    return res.status(400).json({ success: false, message: 'Email and resumeId are required' });
  }

  // Simulate Razorpay order creation
  const orderId = 'order_mock_' + Math.random().toString(36).substring(2, 12);

  return res.status(200).json({ success: true, message: 'Checkout initialized', orderId, amount: 5000 });
}