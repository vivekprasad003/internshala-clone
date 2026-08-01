import React, { useEffect, useState } from 'react';
import ResumeBuilder from '../Components/ResumeBuilder';
import { ResumeData } from '../types/types_r';
import { useRouter } from 'next/router';
import OtpPaymentGate from '../Components/OtpPaymentGate';

export default function ResumePage() {
  const router = useRouter();
  const [savedResumes, setSavedResumes] = useState<ResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutResumeId, setCheckoutResumeId] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      if (res.ok) {
        const data = await res.json();
        const resumesList = Array.isArray(data) ? data : data.resumes || [];
        setSavedResumes(resumesList);
        
        if (resumesList.length > 0) {
          setActiveResume(prev => {
            if (!prev) return resumesList[0];
            return resumesList.find((r: ResumeData) => r.id === prev.id) || resumesList[0];
          });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSelectResume = (resume: ResumeData) => setActiveResume(resume);

  const handleDeleteResume = async (id: string) => {
    // attempt API delete, then update local state
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    setSavedResumes(prev => prev.filter(r => r.id !== id));
    if (activeResume?.id === id) setActiveResume(null);
  };

  const handleSaveSuccess = (updated: ResumeData) => {
    setSavedResumes(prev => {
      const exists = prev.some(r => r.id === updated.id);
      if (exists) return prev.map(r => (r.id === updated.id ? updated : r));
      return [updated, ...prev];
    });
    setActiveResume(updated);
  };

  const handleCheckoutTrigger = (resumeId: string) => {
    setCheckoutResumeId(resumeId);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResumeBuilder
          onCheckoutTrigger={handleCheckoutTrigger}
          onSaveSuccess={handleSaveSuccess}
          savedResumes={savedResumes}
          onSelectResume={handleSelectResume}
          activeResume={activeResume}
          onDeleteResume={handleDeleteResume}
        />

            {isCheckoutOpen && checkoutResumeId && (
              <OtpPaymentGate
                studentEmail={activeResume?.email || ''}
                resumeId={checkoutResumeId}
                onResumeUnlocked={fetchResumes}
                onClose={() => setIsCheckoutOpen(false)}
              />
            )}
      </div>
    </div>
  );
}