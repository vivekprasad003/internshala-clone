export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  photoUrl: string | null;
  qualifications: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  isPremium: boolean; // True if premium payment has been made (₹50)
  templateId: 'modern' | 'minimal' | 'elegant' | 'tech' | 'shine';
  linkedin?: string;
  certifications?: CertificationItem[];
  languages?: string[];
  softSkills?: string[];
  projects?: ProjectItem[];
}

export interface CertificationItem {
  id: string;
  name: string;
  institute: string;
  year: string;
}

export interface ProjectItem {
  id: string;
  company: string;
  title: string;
  description: string;
  tools: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  grade: string;
  year: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  stipend: string;
  duration: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  applicationsCount: number;
}

export interface SimulatedEmail {
  otpCode: string;
  id: string;
  to: string;
  subject: string;
  body: string;
  otp: string;
  date: string;
}

export interface Application {
  id: string;
  internshipId: string;
  resumeId: string;
  appliedDate: string;
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Accepted' | 'Declined';
}