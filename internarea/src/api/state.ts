import type { NextApiRequest, NextApiResponse } from 'next';

// Using global to persist mock state during development HMR
if (!(global as any).membershipState) {
  (global as any).membershipState = {
    currentPlan: 'FREE',
    applicationsUsed: 0,
    email: "",
    startDate: "2026-06-15",
    renewalDate: "2026-07-15",
    devBypassTimeRestriction: false,
  };
}

if (!(global as any).membershipInvoices) {
  (global as any).membershipInvoices = [];
}

if (!(global as any).membershipEmails) {
  (global as any).membershipEmails = [];
}

const getISTTimeContext = () => {
  const now = new Date();
  // Convert to IST (UTC + 5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const seconds = istDate.getSeconds();
  
  // Strict time window: 10:00 AM to 11:00 AM IST
  const isWithinWindow = hours >= 10 && hours < 11;
  return {
    currentISTTime: istDate.toLocaleTimeString('en-IN', { hour12: false }),
    isWithinWindow,
    istHours: hours,
    istMinutes: minutes,
    istSeconds: seconds,
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const timeContext = getISTTimeContext();
    
    // Mock data for internships used by the Explore Jobs tab
    const internships = [
      {
        id: 'INT-001',
        title: 'Full Stack Developer Intern',
        company: 'CloudScale AI',
        location: 'Remote / Bengaluru',
        stipend: '₹25,000',
        description: 'Work on production React architectures and Node.js microservices.',
        tags: ['React', 'TypeScript', 'Node.js'],
        logo: '☁️',
        requirements: ['Knowledge of React hooks', 'Understanding of REST APIs'],
        duration: '6 Months',
        type: 'Full-time',
        applicationsCount: 124
      },
      {
        id: 'INT-002',
        title: 'UI/UX Design Intern',
        company: 'Geometric Balance',
        location: 'Mumbai, MH',
        stipend: '₹15,000',
        description: 'Create balanced design systems following modern geometric principles.',
        tags: ['Figma', 'Tailwind', 'Design Systems'],
        logo: '📐',
        requirements: ['Portfolio of UI work', 'Adobe Creative Suite'],
        duration: '3 Months',
        type: 'Part-time',
        applicationsCount: 45
      }
    ];

    // Mock applied IDs
    if (!(global as any).appliedInternshipIds) {
      (global as any).appliedInternshipIds = [];
    }

    return res.status(200).json({
      state: (global as any).membershipState,
      invoices: (global as any).membershipInvoices,
      emails: (global as any).membershipEmails,
      internships: internships,
      appliedInternshipIds: (global as any).appliedInternshipIds,
      timeContext: timeContext
    });
  } catch (error) {
    console.error("API State Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error in membership state handler." 
    });
  }
}