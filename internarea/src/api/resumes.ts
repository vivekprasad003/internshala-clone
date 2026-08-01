import type { NextApiRequest, NextApiResponse } from 'next';

// Mock in-memory storage for development
if (!(global as any).resumes) {
  (global as any).resumes = [];
}
const resumesStore = (global as any).resumes;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return list of resumes
    return res.status(200).json(resumesStore);
  }

  if (req.method === 'POST') {
    const resume = req.body;
    if (!resume || !resume.id) {
      return res.status(400).json({ success: false, message: 'Invalid resume data' });
    }

    const index = resumesStore.findIndex((r: any) => r.id === resume.id);
    if (index > -1) {
      resumesStore[index] = resume;
    } else {
      resumesStore.unshift(resume);
    }
    return res.status(200).json({ success: true, status: 'success', resume });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}