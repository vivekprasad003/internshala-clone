import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    email,
    resumeId,
  } = req.body;

  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature ||
    !email ||
    !resumeId
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Missing payment verification details",
      });
  }

  // Access shared mock storage inside the handler to ensure we have the latest reference
  if (!(global as any).resumes) {
    (global as any).resumes = [];
  }
  const resumesStore = (global as any).resumes;

  const resumeIndex = resumesStore.findIndex((r: any) => r.id === resumeId);

  if (resumeIndex > -1) {
    // Mark the resume as premium in the mock store
    resumesStore[resumeIndex] = {
      ...resumesStore[resumeIndex],
      isPremium: true,
    };
    return res.status(200).json({
      success: true,
      status: "success",
      message: "Payment verified and resume unlocked!",
      resume: resumesStore[resumeIndex],
    });
  }

  return res
    .status(404)
    .json({ success: false, message: "Resume not found for unlocking." });
}