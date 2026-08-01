import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Send, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  FileBadge,
  Crown,
  Search,
  ChevronRight,
  Sparkles,
  Upload
} from 'lucide-react';
import { Internship, ResumeData, Application } from '../types/types_r';

interface InternshipListProps {
  internships: Internship[];
  resumes: ResumeData[];
  applications: Application[];
  onSubmitApplication: (internshipId: string, resumeId: string) => Promise<boolean>;
  isLoading: boolean;
  onUploadSuccess?: (newResume: ResumeData) => void;
}

export default function InternshipList({
  internships,
  resumes,
  applications,
  onSubmitApplication,
  isLoading,
  onUploadSuccess
}: InternshipListProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  
  // Apply module selected resume profile state
  const [targetResumeId, setTargetResumeId] = useState('');
  const [appMessage, setAppMessage] = useState({ type: '', text: '' });

  // Custom states and refs for Resume Upload and fast AI Parsing
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAppMessage({ type: '', text: '' });

    const reader = new FileReader();
    const isText = file.type === "text/plain";
    
    reader.onload = async (event) => {
      try {
        const fileData = event.target?.result as string;
        
        const response = await fetch('/api/resumes/upload-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: fileData
          })
        });
        
        const data = await response.json();
        if (response.ok && data.status === "success") {
          setAppMessage({ 
            type: 'success', 
            text: `Resume "${file.name}" uploaded and parsed successfully! Style preset "Shine" applied.` 
          });
          if (onUploadSuccess) {
            onUploadSuccess(data.resume);
          }
          setTargetResumeId(data.resume.id);
        } else {
          setAppMessage({ 
            type: 'error', 
            text: data.message || "Failed to parse the uploaded resume." 
          });
        }
      } catch (err: any) {
        console.error("Resume upload error:", err);
        setAppMessage({ type: 'error', text: "Error uploading and parsing your resume." });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setAppMessage({ type: 'error', text: "Failed to read the selected file." });
      setIsUploading(false);
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // Filter listings based on user query
  const filteredListings = internships.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.skillsRequired.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  React.useEffect(() => {
    if (internships.length > 0 && !selectedInternship) {
      setSelectedInternship(internships[0]);
    }
  }, [internships]);

  // Handle active submission
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppMessage({ type: '', text: '' });

    if (!targetResumeId) {
      setAppMessage({ type: 'error', text: 'Please select a resume profile to attach first.' });
      return;
    }

    if (!selectedInternship) return;

    const selectedResume = resumes.find(r => r.id === targetResumeId);
    if (!selectedResume) return;

    // Premium Lock: Resume must be paid to submit applications
    if (!selectedResume.isPremium) {
      setAppMessage({ 
        type: 'error', 
        text: 'Standard Free resumes cannot be attached to applications. Please purchase the ₹50 Premium Plan first!' 
      });
      return;
    }

    const success = await onSubmitApplication(selectedInternship.id, targetResumeId);
    if (success) {
      setAppMessage({ type: 'success', text: 'Successfully applied! Your verified Premium Resume has been attached.' });
      setTimeout(() => setAppMessage({ type: '', text: '' }), 5000);
    } else {
      setAppMessage({ type: 'error', text: 'You have already applied or an error occurred.' });
    }
  };

  const getApplicationForSelected = () => {
    if (!selectedInternship) return null;
    return applications.find(app => app.internshipId === selectedInternship.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      
      {/* Search and Listings Panel (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Simple Search Prefaces */}
        <div className="relative">
          <input
            id="search-internships-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role, company, or skills..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-150 rounded-2xl text-xs outline-none focus:border-indigo-500 transition-all shadow-2xs text-gray-800"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Listings Collection */}
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-xs text-gray-400 font-mono">
              No matching internships located.
            </div>
          ) : (
            filteredListings.map((internship) => {
              const appliedRecord = applications.find(a => a.internshipId === internship.id);
              const isActive = selectedInternship?.id === internship.id;

              return (
                <div
                  key={internship.id}
                  onClick={() => {
                    setSelectedInternship(internship);
                    setAppMessage({ type: '', text: '' });
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5 hover:shadow-xs relative ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-2xs' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100 shrink-0">
                    {internship.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-gray-950 text-sm tracking-tight truncate">
                      {internship.title}
                    </h4>
                    <span className="text-gray-500 font-sans text-xs font-semibold block">{internship.company}</span>
                    
                    <div className="flex items-center gap-3 text-gray-400 text-[10px] mt-2 font-medium">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {internship.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3 text-gray-400" />
                        {internship.stipend}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {internship.skillsRequired.slice(0, 3).map(sk => (
                        <span key={sk} className="bg-gray-100 text-gray-600 font-mono text-[9px] px-1.5 py-0.5 rounded border border-gray-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {appliedRecord && (
                    <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 font-bold font-sans text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Applied
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Internship Detailed Spec & Application Form (7 Cols) */}
      <div className="lg:col-span-7">
        {selectedInternship ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
            
            {/* Detailed Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl border border-gray-100">
                {selectedInternship.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-gray-900 text-lg leading-tight tracking-tight">
                  {selectedInternship.title}
                </h3>
                <span className="font-semibold text-indigo-600 text-sm block">{selectedInternship.company}</span>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3 font-sans">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selectedInternship.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {selectedInternship.duration} ({selectedInternship.type})
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {selectedInternship.stipend}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Info Badget */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3.5 text-xs text-center font-sans">
              <div className="border-r border-gray-100">
                <span className="text-gray-400 block font-semibold mb-0.5">APPLICANTS RATE</span>
                <span className="font-bold text-gray-800 flex items-center justify-center gap-1 font-mono">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {selectedInternship.applicationsCount} students
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">QUALIFICATION ROLE</span>
                <span className="font-bold text-gray-800 flex items-center justify-center gap-1">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  B.Tech / MCA / CSE Focus
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-gray-900 text-xs uppercase tracking-wide">Role Description</h4>
              <p className="text-gray-600 text-xs leading-relaxed font-sans">{selectedInternship.description}</p>
            </div>

            {/* Requirements Bulletins */}
            <div className="space-y-2 text-xs">
              <h4 className="font-display font-semibold text-gray-900 uppercase tracking-wide">Internship Requirements</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600 font-sans">
                {selectedInternship.requirements.map((req, idx) => (
                  <li key={idx} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>

            {/* Application Gateway Trigger Form */}
            <div className="pt-5 border-t border-gray-100 space-y-4">
              <h4 className="font-display font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileBadge className="w-4 h-4 text-indigo-500" />
                Submit Application Portal
              </h4>

              {appMessage.text && (
                <div className={`p-4 rounded-xl text-xs border leading-relaxed ${
                  appMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {appMessage.type === 'success' ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                      <span>{appMessage.text}</span>
                    </div>
                  ) : (
                    <span>{appMessage.text}</span>
                  )}
                </div>
              )}

              {/* Check if student has already applied */}
              {getApplicationForSelected() ? (
                (() => {
                  const userApp = getApplicationForSelected()!;
                  return (
                    <div className="bg-emerald-50/55 text-emerald-800 p-4 border border-emerald-100 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold font-sans">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Application Status: Under Active Review</span>
                      </div>
                      <p className="opacity-80">
                        You successfully submitted your resume on <strong className="text-gray-700 font-mono">{userApp.appliedDate}</strong>. The company recruiters will contact you via email if shortlisted for direct interviews!
                      </p>
                    </div>
                  );
                })()
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  
                  {/* Select profile segment */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs space-y-3">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200/60 pb-3 mb-3">
                        <div>
                          <label className="block font-semibold text-gray-700 uppercase font-mono">Select Resume to Attach</label>
                          <p className="text-[10px] text-gray-450 leading-relaxed mt-0.5">Select a saved template, or click upload to parse a new file.</p>
                        </div>
                        
                        <div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-3xs cursor-pointer ${
                              isUploading 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-400 cursor-wait' 
                                : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-600 hover:text-indigo-700'
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                Parsing CV...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 font-bold" />
                                Upload & Parse Raw CV
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {resumes.length === 0 ? (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 inline-block">
                          ⚠️ You must create and save at least one resume profile in the <strong>Resume Creation</strong> section first.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto">
                          {resumes.map(res => (
                            <label 
                              key={res.id} 
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                targetResumeId === res.id 
                                  ? 'border-indigo-600 bg-white text-indigo-900 font-semibold' 
                                  : 'border-gray-200 hover:bg-gray-100/50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="apply-resume"
                                  value={res.id}
                                  checked={targetResumeId === res.id}
                                  onChange={() => {
                                    setTargetResumeId(res.id);
                                    setAppMessage({ type: '', text: '' });
                                  }}
                                  className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <span className="block text-xs font-bold leading-normal">{res.name}</span>
                                  <span className="block text-[10px] text-gray-400 font-normal">Style: {res.templateId}</span>
                                </div>
                              </div>

                              <div>
                                {res.isPremium ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                                    <Crown className="w-2.5 h-2.5 text-emerald-600" />
                                    PREMIUM UNLOCKED
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-500 text-[9px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3 text-gray-400" />
                                    Standard Free
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    id="submit-internship-apply-btn"
                    type="submit"
                    disabled={isLoading || resumes.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Application (Attach resume)
                  </button>
                </form>
              )}

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-xs opacity-50 text-gray-400 font-mono">
            Select an internship listing from the left panel to review qualifications and apply.
          </div>
        )}
      </div>

    </div>
  );
}