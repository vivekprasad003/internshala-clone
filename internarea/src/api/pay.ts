import type { NextApiRequest, NextApiResponse } from 'next';
import { SubscriptionPlan, Invoice, OutgoingEmail } from '../types/types_m';
import * as nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.body.action === 'send_resume_email') {
    const { email: targetEmail, transactionId, selectedPlan, actualAmount, paymentDate } = req.body;
    const SENDER_EMAIL = process.env.MY_EMAIL?.replace(/['"]/g, '').trim();
    const SENDER_PASS = process.env.MY_PASSWORD?.replace(/['"]/g, '').trim();

    let emailSent = false;
    if (SENDER_EMAIL && SENDER_PASS) {
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

      const emailText = `Hello, 

Your Premium Resume payment has been successfully completed.

Transaction Details

Transaction ID: ${transactionId}

Resume Plan: ${selectedPlan}

Amount Paid: ₹${actualAmount}

Payment Gateway: Razorpay

Payment Status: Successful

Date: ${paymentDate}

Your premium resume generation has been successfully activated.

Thank you for using Intern Area.`;

      try {
        await transporter.sendMail({
          from: `"Internarea" <${SENDER_EMAIL}>`,
          to: targetEmail,
          subject: "Resume Premium Payment Successful",
          text: emailText,
        });
        emailSent = true;
      } catch (error) {
        console.error("Resume Premium Real Email Dispatch Failure:", error);
      }
    }

    if (!(global as any).resumeTransactions) {
      (global as any).resumeTransactions = [];
    }
    (global as any).resumeTransactions.push({
      transactionId,
      email: targetEmail,
      selectedPlan,
      actualAmount,
      status: "Successful",
      date: paymentDate,
      emailDelivered: emailSent
    });

    return res.status(200).json({ success: true, emailDelivered: emailSent });
  }

  const { 
    planId, 
    paymentGateway, 
    billingEmail, 
    resumeId, 
    email,
    razorpay_payment_id,
    upiId,
    amountINR 
  } = req.body;

  const activeEmail = billingEmail || email;
  const transactionId = razorpay_payment_id || upiId || `SIM-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  // SMTP Credentials (reused from OTP system)
  const SENDER_EMAIL = process.env.MY_EMAIL?.replace(/['"]/g, '').trim();
  const SENDER_PASS = process.env.MY_PASSWORD?.replace(/['"]/g, '').trim();

  // Access shared mock storage inside the handler to ensure we have the latest reference
  if (!(global as any).resumes) {
    (global as any).resumes = [];
  }
  if (!(global as any).membershipState) {
    (global as any).membershipState = {
      currentPlan: SubscriptionPlan.FREE,
      applicationsUsed: 0,
      email: activeEmail,
      startDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  // Ensure global membership stores are initialized
  if (!(global as any).membershipInvoices) {
    (global as any).membershipInvoices = [];
  }
  if (!(global as any).membershipEmails) {
    (global as any).membershipEmails = [];
  }

  // Define Price Mapping
  const PLAN_PRICES: Record<string, number> = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.BRONZE]: 100,
    [SubscriptionPlan.SILVER]: 300,
    [SubscriptionPlan.GOLD]: 1000,
  };

  // Handle Membership Plan Upgrade
  if (planId) {
    // 🔒 SERVER-SIDE TIME-LOCK: Validate IST window for all membership plan payments
    // Only membership plans (Bronze, Silver, Gold) are restricted — NOT resume payments
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + (3600000 * 5.5));
    const istHours = istDate.getHours();
    
    const isWithinWindow = istHours >= 10 && istHours < 11;
    const bypassEnabled = (global as any).membershipState?.devBypassTimeRestriction === true;
    
    if (!isWithinWindow && !bypassEnabled) {
      return res.status(403).json({
        success: false,
        error: "Payment window closed. Membership purchases are permitted only between 10:00 AM and 11:00 AM IST.",
        currentISTTime: istDate.toLocaleTimeString('en-IN', { hour12: false })
      });
    }
    
    const amount = amountINR !== undefined ? amountINR : (PLAN_PRICES[planId] || 0);
    
    // Update global state
    (global as any).membershipState = {
      ...(global as any).membershipState,
      currentPlan: planId,
      startDate: new Date().toISOString(),
      renewalDate: planId === SubscriptionPlan.FREE ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      planId: planId,
      planName: `${planId} Subscription Plan`,
      amountINR: amount,
      date: new Date().toISOString(),
      status: "PAID",
      paymentGateway: paymentGateway || "STRIPE",
      transactionId: transactionId,
      email: activeEmail,
    };

    (global as any).membershipInvoices.push(newInvoice);

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 2px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 45px; height: 45px; background-color: #4f46e5; border-radius: 8px; transform: rotate(45deg);">
               <div style="width: 18px; height: 18px; background-color: #ffffff; margin: 13.5px; transform: rotate(-45deg);"></div>
            </div>
            <h1 style="color: #1e1b4b; font-size: 22px; font-weight: 800; margin-top: 15px; text-transform: uppercase; letter-spacing: -0.02em;">Payment Successful</h1>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Your upgrade to the <strong>${planId}</strong> tier has been successfully verified. Your account quotas have been expanded, and premium features are now active.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
            <h3 style="margin-top: 0; color: #4f46e5; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Invoice Summary</h3>
            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Invoice ID:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 700;">${newInvoice.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Gateway:</td>
                <td style="padding: 6px 0; text-align: right;">${newInvoice.paymentGateway}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 10px 0 0 0; font-weight: 700; color: #1e1b4b;">Total Amount:</td>
                <td style="padding: 10px 0 0 0; text-align: right; color: #10b981; font-weight: 800; font-size: 16px;">₹${newInvoice.amountINR}.00</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px; font-style: italic;">
            This is an automated transactional message generated by the InternArea Security Gate.
          </p>
        </div>
      </body>
      </html>
    `;

    const newEmail: OutgoingEmail = {
      id: `EMAIL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      to: activeEmail,
      subject: `Subscription Activated: ${planId} Tier`,
      sentAt: new Date().toISOString(),
      body: emailBody,
      invoiceId: newInvoice.id,
    };

    (global as any).membershipEmails.unshift(newEmail);

    // Feature: Real Email Delivery via Nodemailer
    let emailSent = false;
    if (SENDER_EMAIL && SENDER_PASS) {
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

      const realEmailBody = `
Hello ${activeEmail},

We are pleased to confirm that your payment was successful.

Your membership plan details:
- Plan Name: ${newInvoice.planName}
- Invoice ID: ${newInvoice.id}
- Transaction ID: ${newInvoice.transactionId}
- Amount Paid: ₹${newInvoice.amountINR}.00
- Payment Date & Time: ${new Date(newInvoice.date).toLocaleString('en-IN')}

Your membership has been activated successfully and you can now access all premium features associated with the ${planId} tier.

Thank you for choosing InternArea!
      `.trim();

      try {
        await transporter.sendMail({
          from: `"Internarea" <${SENDER_EMAIL}>`,
          to: activeEmail,
          subject: "Membership Plan Activated Successfully",
          text: realEmailBody,
        });
        emailSent = true;
      } catch (error) {
        console.error("Real Email Dispatch Failure:", error);
        // Payment remains successful in the database even if SMTP fails
      }
    }

    return res.status(200).json({
      success: true,
      message: emailSent ? "Payment confirmation email sent successfully." : "Payment successful, but email delivery failed.",
      state: (global as any).membershipState,
      invoices: (global as any).membershipInvoices,
      emails: (global as any).membershipEmails
    });
  }

  // Handle Resume Unlock (Backward Compatibility)
  if (resumeId) {
    const resumesStore = (global as any).resumes;
    const resumeIndex = resumesStore.findIndex((r: any) => r.id === resumeId);

    if (resumeIndex > -1) {
      resumesStore[resumeIndex] = { ...resumesStore[resumeIndex], isPremium: true };

      const newInvoice: Invoice = {
        id: `INV-${Date.now()}-RESUME`,
        planId: SubscriptionPlan.BRONZE,
        planName: "Premium Resume Unlock",
        amountINR: 50,
        date: new Date().toISOString(),
        status: "PAID",
        paymentGateway: paymentGateway || "RAZORPAY",
        transactionId: transactionId,
        email: activeEmail,
      };

      (global as any).membershipInvoices.push(newInvoice);

      const emailBody = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 2px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; width: 45px; height: 45px; background-color: #10b981; border-radius: 8px; transform: rotate(45deg);">
                 <div style="width: 18px; height: 18px; background-color: #ffffff; margin: 13.5px; transform: rotate(-45deg);"></div>
              </div>
              <h1 style="color: #1e1b4b; font-size: 22px; font-weight: 800; margin-top: 15px; text-transform: uppercase;">Payment Verified</h1>
              <p style="color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: -10px; letter-spacing: 0.1em;">Premium Resume Unlocked</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6;">Hi there,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Great news! Your payment for the <strong>Premium Resume Unlock</strong> has been verified. Your professional CV profile is now fully authenticated and ready for applications.</p>
            
            <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7;">
              <h3 style="margin-top: 0; color: #059669; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Ledger Entry</h3>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Invoice:</td>
                  <td style="padding: 6px 0; text-align: right; font-family: monospace;">${newInvoice.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 6px 0; text-align: right; font-family: monospace;">${newInvoice.transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Amount:</td>
                  <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 800;">₹50.00 INR</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
              Verified Transaction • TLS 1.3 Certified
            </p>
          </div>
        </body>
        </html>
      `;

      const newEmail: OutgoingEmail = {
        id: `EMAIL-${Date.now()}-RESUME-UNLOCK`,
        to: activeEmail,
        subject: `Payment Successful: Your Premium Resume is Unlocked`,
        sentAt: new Date().toISOString(),
        body: emailBody,
        invoiceId: newInvoice.id,
      };

      (global as any).membershipEmails.unshift(newEmail);

      return res.status(200).json({
        success: true,
        state: (global as any).membershipState,
        invoices: (global as any).membershipInvoices,
        emails: (global as any).membershipEmails,
        resume: resumesStore[resumeIndex]
      });
    }
    return res.status(404).json({ success: false, message: 'Resume not found for unlocking.' });
  }

  return res.status(400).json({ success: false, message: 'Invalid payment request. planId or resumeId required.' });
}