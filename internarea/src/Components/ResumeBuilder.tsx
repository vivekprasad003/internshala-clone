import React, { useState } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Sparkles,
  User,
  BookOpen,
  Briefcase,
  Paperclip,
  Upload,
  Check,
  Crown,
  LayoutGrid,
  MapPin,
  Mail,
  Phone,
  Printer,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  Lock,
} from "lucide-react";
import { ResumeData, EducationItem, ExperienceItem } from "../types/types_r";
import { useLanguage } from '../context/LanguageContext';

interface ResumeBuilderProps {
  onCheckoutTrigger: (resumeId: string) => void;
  onSaveSuccess: (updated: ResumeData) => void;
  savedResumes: ResumeData[];
  onSelectResume: (resume: ResumeData) => void;
  activeResume: ResumeData | null;
  onDeleteResume: (id: string) => void;
}

const DEFAULT_RESUME: ResumeData = {
  id: "",
  name: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  photoUrl: null,
  qualifications: [{ id: "1", school: "", degree: "", grade: "", year: "" }],
  experience: [
    { id: "1", company: "", role: "", duration: "", description: "" },
  ],
  skills: [],
  isPremium: false,
  templateId: "shine",
  linkedin: "",
  certifications: [{ id: "1", name: "", institute: "", year: "" }],
  languages: [],
  softSkills: [],
  projects: [{ id: "1", company: "", title: "", description: "", tools: "" }],
};

export default function ResumeBuilder({
  onCheckoutTrigger,
  onSaveSuccess,
  savedResumes,
  onSelectResume,
  activeResume,
  onDeleteResume,
}: ResumeBuilderProps) {
  const { t } = useLanguage();

  // Active resume being edited
  const [formData, setFormData] = useState<ResumeData>({
    ...DEFAULT_RESUME,
    id: activeResume?.id || "res_" + Math.random().toString(36).substring(2, 9),
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // tracks which field is enhancing
  const [dragActive, setDragActive] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  // Handle prop change
  React.useEffect(() => {
    if (activeResume) {
      // Ensure photoUrl is correctly mapped from either photoUrl or photoURL (Firebase convention)
      setFormData({
        ...DEFAULT_RESUME,
        ...activeResume,
        photoUrl:
          activeResume.photoUrl || (activeResume as any).photoURL || null,
      });
    } else {
      handleAddBlank();
    }
  }, [activeResume]);

  const handleAddBlank = () => {
    const newId = "res_" + Math.random().toString(36).substring(2, 9);
    const blank = {
      ...DEFAULT_RESUME,
      id: newId,
      name: "",
      email: "",
      isPremium: false,
    };
    setFormData(blank);
    onSelectResume(blank);
  };

  const handleFieldChange = (field: keyof ResumeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image Drag-and-Drop and Click Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(t('common.error'));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFieldChange("photoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Item Add/Delete for Qualifications
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: Math.random().toString(),
      school: "",
      degree: "",
      grade: "",
      year: "",
    };
    handleFieldChange("qualifications", [...formData.qualifications, newItem]);
  };

  const handleUpdateEducation = (
    id: string,
    field: keyof EducationItem,
    value: string,
  ) => {
    const updated = formData.qualifications.map((edu) => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    handleFieldChange("qualifications", updated);
  };

  const handleDeleteEducation = (id: string) => {
    const filtered = formData.qualifications.filter((edu) => edu.id !== id);
    handleFieldChange("qualifications", filtered);
  };

  // Dynamic Item Add/Delete for Experience
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: Math.random().toString(),
      company: "",
      role: "",
      duration: "",
      description: "",
    };
    handleFieldChange("experience", [...formData.experience, newItem]);
  };

  const handleUpdateExperience = (
    id: string,
    field: keyof ExperienceItem,
    value: string,
  ) => {
    const updated = formData.experience.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    handleFieldChange("experience", updated);
  };

  const handleDeleteExperience = (id: string) => {
    const filtered = formData.experience.filter((exp) => exp.id !== id);
    handleFieldChange("experience", filtered);
  };

  // Skills management
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      handleFieldChange("skills", [...formData.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    const filtered = formData.skills.filter((s) => s !== skillToDelete);
    handleFieldChange("skills", filtered);
  };

  // Certifications management
  const handleAddCertification = () => {
    const newItem = {
      id: Math.random().toString(),
      name: "",
      institute: "",
      year: "",
    };
    handleFieldChange("certifications", [
      ...(formData.certifications || []),
      newItem,
    ]);
  };

  const handleUpdateCertification = (
    id: string,
    field: string,
    value: string,
  ) => {
    const updated = (formData.certifications || []).map((cert) => {
      if (cert.id === id) {
        return { ...cert, [field]: value };
      }
      return cert;
    });
    handleFieldChange("certifications", updated);
  };

  const handleDeleteCertification = (id: string) => {
    const filtered = (formData.certifications || []).filter(
      (cert) => cert.id !== id,
    );
    handleFieldChange("certifications", filtered);
  };

  // Projects management
  const handleAddProject = () => {
    const newItem = {
      id: Math.random().toString(),
      title: "",
      company: "",
      description: "",
      tools: "",
    };
    handleFieldChange("projects", [...(formData.projects || []), newItem]);
  };

  const handleUpdateProject = (id: string, field: string, value: string) => {
    const updated = (formData.projects || []).map((proj) => {
      if (proj.id === id) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    handleFieldChange("projects", updated);
  };

  const handleDeleteProject = (id: string) => {
    const filtered = (formData.projects || []).filter((proj) => proj.id !== id);
    handleFieldChange("projects", filtered);
  };

  // Soft Skills management
  const handleAddSoftSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newSoftSkill.trim() &&
      !(formData.softSkills || []).includes(newSoftSkill.trim())
    ) {
      handleFieldChange("softSkills", [
        ...(formData.softSkills || []),
        newSoftSkill.trim(),
      ]);
      setNewSoftSkill("");
    }
  };

  const handleDeleteSoftSkill = (skillToDelete: string) => {
    const filtered = (formData.softSkills || []).filter(
      (s) => s !== skillToDelete,
    );
    handleFieldChange("softSkills", filtered);
  };

  // Languages management
  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newLanguage.trim() &&
      !(formData.languages || []).includes(newLanguage.trim())
    ) {
      handleFieldChange("languages", [
        ...(formData.languages || []),
        newLanguage.trim(),
      ]);
      setNewLanguage("");
    }
  };

  const handleDeleteLanguage = (langToDelete: string) => {
    const filtered = (formData.languages || []).filter(
      (l) => l !== langToDelete,
    );
    handleFieldChange("languages", filtered);
  };

  // Save Resume to Server
  const handleSaveResume = async () => {
    if (!formData.name.trim()) {
      setFeedbackMsg({ type: "error", text: t('resume.pleaseFillName') });
      return;
    }
    setIsSaving(true);
    setFeedbackMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          type: "success",
          text: t('resume.syncSuccess'),
        });
        onSaveSuccess(data.resume);
        setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.message || t('resume.syncError'),
        });
      }
    } catch (e) {
      setFeedbackMsg({ type: "error", text: t('resume.serverError') });
    } finally {
      setIsSaving(false);
    }
  };

  // AI professional enhancement (call server-side proxy secure Gemini API)
  const handleAIEnhance = async (
    field: "summary" | string,
    rawText: string,
    indexId?: string,
  ) => {
    // Allow summary to be generated from scratch if other fields exist
    if (!rawText.trim() && field !== "summary") {
      alert(t('resume.alertProvideText'));
      return;
    }
    setAiLoading(indexId || field);
    try {
      const res = await fetch("/api/enchanse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: field,
          text: rawText,
          // Provide context so the AI knows your background
          skills: formData.skills,
          qualifications: formData.qualifications,
          experience: formData.experience,
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        if (field === "summary") {
          handleFieldChange("summary", data.text);
        } else if (indexId && field === "experience-description") {
          const updated = formData.experience.map((exp) => {
            if (exp.id === indexId) {
              return { ...exp, description: data.text };
            }
            return exp;
          });
          handleFieldChange("experience", updated);
        }
      } else {
        alert(data.message || t('resume.alertAIEnhanceFailed'));
      }
    } catch (e) {
      alert(t('resume.alertAPICommFailed'));
    } finally {
      setAiLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Resume Profiles / Selection Sidebar (3 Cols) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-gray-900 text-sm uppercase tracking-wide">
              {t('resume.profiles')}
            </h4>
            <button
              id="new-profile-btn"
              onClick={handleAddBlank}
              className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('resume.newProfile')}
            </button>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {savedResumes.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-mono">
                {t('resume.noActiveProfile')}
              </div>
            ) : (
              savedResumes.map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectResume(res)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                    formData.id === res.id
                      ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-medium"
                      : "border-gray-150 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <p className="text-xs font-bold truncate">
                      {res.name || t('resume.untitledStudent')}
                    </p>
                    <span className="text-[10px] text-gray-400 capitalize block">
                      {res.templateId} {t('resume.title')}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {res.isPremium ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 text-emerald-600" />
                        {t('resume.premiumPlanName')}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[9px] font-semibold px-2 py-0.5 rounded-md">
                        {t('resume.free')}
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteResume(res.id)}
                      className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Template Style Choice */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <h4 className="font-display font-bold text-gray-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            {t('resume.resumeTemplate')}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              {
                id: "shine",
                label: t('resume.templateShine'),
                desc: t('resume.templateShineDesc'),
              },
              {
                id: "modern",
                label: t('resume.templateModern'),
                desc: t('resume.templateModernDesc'),
              },
              {
                id: "minimal",
                label: t('resume.templateMinimal'),
                desc: t('resume.templateMinimalDesc'),
              },
              {
                id: "elegant",
                label: t('resume.templateElegant'),
                desc: t('resume.templateElegantDesc'),
              },
              {
                id: "tech",
                label: t('resume.templateTech'),
                desc: t('resume.templateTechDesc'),
              },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                id={`template-select-${tmpl.id}`}
                onClick={() => handleFieldChange("templateId", tmpl.id)}
                className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                  formData.templateId === tmpl.id
                    ? "border-indigo-600 bg-indigo-50/20 text-indigo-900 shadow-2xs font-semibold"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{tmpl.label}</span>
                <span className="block text-[9px] text-gray-400 font-normal mt-0.5">
                  {tmpl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Workspace Form (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {t('resume.resumeDetails')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('resume.resumeDetailsDesc')}
          </p>
        </div>

        {feedbackMsg.text && (
          <div
            className={`p-3 rounded-xl text-sm border ${
              feedbackMsg.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        <div className="space-y-4 text-xs font-sans">
          {/* Section: Profile Photo */}
          <div>
            <span className="block font-semibold text-gray-700 mb-1.5 uppercase font-mono tracking-wider">
              {t('resume.studentProfilePhoto')}
            </span>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center relative ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/40"
                  : "border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              {formData.photoUrl ? (
                <div className="relative group">
                  <img
                    src={formData.photoUrl}
                    alt="Student thumbnail"
                    className="w-20 h-20 rounded-full object-cover border border-gray-100 shadow-xs"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  <button
                    onClick={() => handleFieldChange("photoUrl", null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all cursor-pointer shadow-xs"
                    title={t('resume.removeImage')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1 p-2">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="font-semibold text-indigo-600 block hover:underline">
                    {t('resume.clickDragPhoto')}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {t('resume.photoSupport')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Section: Core Personal Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-600 mb-1 uppercase font-mono text-[10px]">
                {t('resume.fullName')}
              </label>
              <input
                id="form-student-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder={t('resume.fullNamePlaceholder')}
                className="text-gray-700 w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400 outline-none transition-all text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1 uppercase font-mono text-[10px]">
                {t('resume.cityLocation')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder={t('resume.cityPlaceholder')}
                className="text-gray-700 w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400/80 outline-none transition-all text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-600 mb-1 uppercase font-mono text-[10px]">
                {t('resume.phoneContact')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder={t('resume.phonePlaceholder')}
                className="text-gray-700w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400/80 outline-none transition-all text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1 uppercase font-mono text-[10px]">
                {t('resume.registeredEmail')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder={t('resume.emailPlaceholder')}
                className="text-gray-700w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400 outline-none transition-all text-xs text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-600 mb-1 uppercase font-mono text-[10px]">
              {t('resume.linkedinUrl')}
            </label>
            <input
              type="text"
              value={formData.linkedin || ""}
              onChange={(e) => handleFieldChange("linkedin", e.target.value)}
              placeholder={t('resume.linkedinPlaceholder')}
              className="text-gray-700w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400 outline-none transition-all text-xs text-gray-800"
            />
          </div>

          {/* Section: Professional Summary */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-gray-600 uppercase font-mono text-[10px]">
                {t('resume.professionalSummary')}
              </label>
              <button
                id="ai-enhance-summary"
                onClick={() => handleAIEnhance("summary", formData.summary)}
                disabled={aiLoading === "summary"}
                className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-all cursor-pointer bg-indigo-50 px-2 py-0.5 rounded-md disabled:opacity-50"
              >
                {aiLoading === "summary" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                    {t('resume.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    {t('resume.aiWriteSummary')}
                  </>
                )}
              </button>
            </div>
            <textarea
              id="form-student-summary"
              rows={3}
              value={formData.summary}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              placeholder={t('resume.summaryPlaceholder')}
              className="text-gray-700 w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 placeholder:text-gray-400/80 outline-none transition-all font-sans leading-normal text-xs text-gray-850"
            />
          </div>

          {/* Section: Qualifications (Education) */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                {t('resume.qualifications')}
              </h4>
              <button
                id="add-edu-btn"
                onClick={handleAddEducation}
                className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-indigo-600 border border-gray-200 px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {t('resume.addSchool')}
              </button>
            </div>

            <div className="space-y-4">
              {formData.qualifications.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-3 bg-gray-50/50 rounded-xl border border-gray-150 space-y-2 relative"
                >
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 cursor-pointer"
                    title={t('resume.qualifications')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {t('resume.education')} #{idx + 1}
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) =>
                          handleUpdateEducation(
                            edu.id,
                            "school",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.eduSchoolPlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          handleUpdateEducation(
                            edu.id,
                            "degree",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.eduDegreePlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) =>
                          handleUpdateEducation(edu.id, "grade", e.target.value)
                        }
                        placeholder={t('resume.eduGradePlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) =>
                          handleUpdateEducation(edu.id, "year", e.target.value)
                        }
                        placeholder={t('resume.eduYearPlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Experience */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                {t('resume.workExperience')}
              </h4>
              <button
                id="add-exp-btn"
                onClick={handleAddExperience}
                className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-indigo-600 border border-gray-200 px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {t('resume.addWork')}
              </button>
            </div>

            <div className="space-y-4">
              {formData.experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-3 bg-gray-50/50 rounded-xl border border-gray-150 space-y-2 relative"
                >
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 cursor-pointer"
                    title={t('resume.workExperience')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {t('resume.experience')} #{idx + 1}
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          handleUpdateExperience(
                            exp.id,
                            "company",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.expCompanyPlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, "role", e.target.value)
                        }
                        placeholder={t('resume.expRolePlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) =>
                          handleUpdateExperience(
                            exp.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.expDurationPlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400 block font-mono">
                          {t('resume.jobDescription')}
                        </span>
                        <button
                          onClick={() =>
                            handleAIEnhance(
                              "experience-description",
                              exp.description,
                              exp.id,
                            )
                          }
                          disabled={aiLoading === exp.id}
                          className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          {aiLoading === exp.id ? (
                            <>
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              {t('resume.polishing')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                              {t('resume.aiRefineTasks')}
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) =>
                          handleUpdateExperience(
                            exp.id,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.expDescPlaceholder')}
                        className="text-gray-700 w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-[11px] font-sans placeholder:text-gray-400/80"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Technical Skills */}
          <div className="pt-2 border-t border-gray-100">
            <span className="block font-semibold text-gray-600 mb-1.5 uppercase font-mono">
              {t('resume.technicalSkills')}
            </span>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={t('resume.skillPlaceholder')}
                className="text-gray-700 flex-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-[11px] outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] px-3 rounded-lg transition-all cursor-pointer font-sans"
              >
                {t('resume.addSkill')}
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-100 border border-gray-200 text-gray-700 rounded-md py-0.5 px-2 flex items-center gap-1 font-mono text-[10px]"
                >
                  {skill}
                  <button
                    onClick={() => handleDeleteSkill(skill)}
                    className="text-gray-400 hover:text-red-500 font-semibold cursor-pointer text-[11px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Soft Skills */}
          <div className="pt-2 border-t border-gray-100">
            <span className="block font-semibold text-gray-600 mb-1.5 uppercase font-mono">
              {t('resume.softSkills')}
            </span>

            <form onSubmit={handleAddSoftSkill} className="flex gap-2">
              <input
                type="text"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                placeholder={t('resume.skillPlaceholder')}
                className="text-gray-700 flex-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-[11px] outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] px-3 rounded-lg transition-all cursor-pointer font-sans"
              >
                {t('resume.add')}
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {(formData.softSkills || []).map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-100 border border-purple-200 text-purple-700 rounded-md py-0.5 px-2 flex items-center gap-1 font-mono text-[10px]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleDeleteSoftSkill(skill)}
                    className="text-purple-450 hover:text-red-500 font-semibold cursor-pointer text-[11px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Languages */}
          <div className="pt-2 border-t border-gray-100">
            <span className="block font-semibold text-gray-600 mb-1.5 uppercase font-mono">
              {t('resume.languages')}
            </span>

            <form onSubmit={handleAddLanguage} className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder={t('resume.langPlaceholder')}
                className="text-gray-700 flex-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-[11px] outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] px-3 rounded-lg transition-all cursor-pointer font-sans"
              >
                {t('resume.add')}
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {(formData.languages || []).map((lang) => (
                <span
                  key={lang}
                  className="bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md py-0.5 px-2 flex items-center gap-1 font-mono text-[10px]"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleDeleteLanguage(lang)}
                    className="text-emerald-450 hover:text-red-500 font-semibold cursor-pointer text-[11px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Certifications */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="block font-semibold text-gray-600 uppercase font-mono">
                {t('resume.certifications')}
              </span>
              <button
                type="button"
                onClick={handleAddCertification}
                className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-indigo-600 border border-gray-200 px-2 py-1 rounded-md cursor-pointer transition-all"
              >
                {t('resume.addCertification')}
              </button>
            </div>

            <div className="space-y-3">
              {(formData.certifications || []).map((cert, idx) => (
                <div
                  key={cert.id}
                  className="p-3 bg-gray-50/50 rounded-xl border border-gray-150 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {t('resume.certificate')} #{idx + 1}
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          handleUpdateCertification(
                            cert.id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.certNamePlaceholder')}
                        className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cert.institute}
                        onChange={(e) =>
                          handleUpdateCertification(
                            cert.id,
                            "institute",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.certInstitutePlaceholder')}
                        className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cert.year}
                      onChange={(e) =>
                        handleUpdateCertification(
                          cert.id,
                          "year",
                          e.target.value,
                        )
                      }
                      placeholder={t('resume.certYearPlaceholder')}
                      className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Projects */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="block font-semibold text-gray-600 uppercase font-mono">
                {t('resume.projects')}
              </span>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-indigo-600 border border-gray-200 px-2 py-1 rounded-md cursor-pointer transition-all"
              >
                {t('resume.addProject')}
              </button>
            </div>

            <div className="space-y-3">
              {(formData.projects || []).map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-3 bg-gray-50/50 rounded-xl border border-gray-150 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {t('resume.project')} #{idx + 1}
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) =>
                          handleUpdateProject(proj.id, "title", e.target.value)
                        }
                        placeholder={t('resume.projectNamePlaceholder')}
                        className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={proj.company}
                        onChange={(e) =>
                          handleUpdateProject(
                            proj.id,
                            "company",
                            e.target.value,
                          )
                        }
                        placeholder={t('resume.projectCompanyPlaceholder')}
                        className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={proj.tools}
                      onChange={(e) =>
                        handleUpdateProject(proj.id, "tools", e.target.value)
                      }
                      placeholder={t('resume.projectToolsPlaceholder')}
                      className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px]"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) =>
                        handleUpdateProject(
                          proj.id,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder={t('resume.projectDescPlaceholder')}
                      className="text-gray-700 w-full px-2 py-1 border border-gray-200 rounded bg-white text-[10px] font-sans"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Workspace Actions */}
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              id="save-resume-btn"
              onClick={handleSaveResume}
              disabled={isSaving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('resume.saving')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('resume.saveValidate')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Canvas Resume Generator (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Purchasing details / unlock status */}
        <div
          className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between"
          id="resume-premium-card"
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-gray-400 font-mono">{t('resume.planStatus')}</span>
            {formData.isPremium ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
                {t('resume.premiumPlanName')}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                {t('resume.standardFree')}
              </span>
            )}
          </div>

          {formData.isPremium ? (
            <div className="py-1 space-y-3">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs leading-relaxed">
                🎉 <strong>{t('resume.premiumUnlocked')}</strong> {t('resume.premiumUnlockedDesc')}
              </div>
              <button
                id="print-resume-btn"
                onClick={handlePrint}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                {t('resume.exportPrint')}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <p className="text-xs text-gray-500 leading-relaxed text-left">
                {t('resume.premiumDesc')}{" "}
                <strong className="text-indigo-600">{t('resume.premiumPlan')}</strong>.
              </p>

              <div className="text-gray-700 flex justify-between items-center bg-gray-50 p-3 border border-gray-100 rounded-xl text-left">
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 block">
                    {t('resume.resumePurchase')}
                  </span>
                  {t('resume.oneTimeCheckout')}
                </div>
                <div className="text-xl font-bold font-display text-indigo-600">
                  ₹50
                </div>
              </div>

              <button
                id="unlock-premium-btn"
                onClick={async () => {
                  try {
                    await fetch("/api/resumes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(formData),
                    });
                  } catch (e) {
                    console.error("Auto-save resume error:", e);
                  }
                  onCheckoutTrigger(formData.id);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-indigo-200" />
                {t('resume.unlockPremium')}
              </button>
            </div>
          )}
        </div>

        {/* Live Resume Canvas Sheet Box */}
        <div className="bg-slate-100 p-4 rounded-2xl border border-gray-200 shadow-inner flex flex-col max-h-[700px] overflow-hidden">
          <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block mb-2 tracking-wider text-center">
            {t('resume.livePrintCanvas')}
          </span>

          {/* Actual resume template layouts */}
          {formData.templateId === "shine" ? (
            <div
              id="print-resume-canvas"
              className="shadow-lg bg-white border-8 border-[#fbc02d] text-left flex-1 min-h-[500px] text-xs font-sans overflow-y-auto leading-relaxed max-w-full p-0 flex flex-col relative"
            >
              {/* Header Dark Block */}
              <div className="bg-[#2d3748] text-white py-5 px-6 shrink-0 relative">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-widest font-display text-white">
                      {formData.name || t('resume.previewDefaultName')}
                    </h2>
                    <p className="text-[9px] text-[#fbc02d] font-mono tracking-wider uppercase mt-1">
                      {t('resume.title')}
                    </p>
                  </div>
                  {formData.photoUrl && (
                    <img
                      src={formData.photoUrl}
                      alt={formData.name || "Student photo"}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#fbc02d]"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              </div>

              {/* Grid content split columns */}
              <div className="grid grid-cols-12 flex-1 items-stretch">
                {/* Left Gray Sidebar */}
                <div className="col-span-4 bg-[#f4f6f8] p-4 border-r border-gray-200 flex flex-col space-y-4">
                  {/* Contact Info */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-0.5">
                      {t('resume.contactDetails')}
                    </h4>
                    <div className="space-y-2 text-[9px] text-gray-600">
                      <div className="flex items-center gap-1.5 break-all">
                        <Mail className="w-3 h-3 text-[#fbc02d] shrink-0" />
                        <span>{formData.email || "john@gmail.com"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#fbc02d] shrink-0" />
                        <span>{formData.phone || "+91 91234 56789"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#fbc02d] shrink-0" />
                        <span>{formData.location || "Mumbai, India"}</span>
                      </div>
                      {formData.linkedin && (
                        <div className="flex items-center gap-1.5 break-all">
                          <span className="text-[#fbc02d] font-mono font-bold text-[10px] shrink-0">
                            In
                          </span>
                          <span className="underline">{formData.linkedin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certifications list */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-0.5">
                      {t('resume.certifications')}
                    </h4>
                    <div className="space-y-1.5 text-[9px] text-gray-600 font-sans">
                      {formData.certifications &&
                      formData.certifications.some((c) => c.name.trim()) ? (
                        formData.certifications
                          .filter((c) => c.name.trim())
                          .map((cert) => (
                            <div key={cert.id} className="relative pl-2.5">
                              <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-[#fbc02d]"></span>
                              <span className="font-semibold text-gray-800 block">
                                {cert.name}
                              </span>
                              <span className="text-[8px] text-gray-500 leading-none">
                                {cert.institute} {cert.year && `| ${cert.year}`}
                              </span>
                            </div>
                          ))
                      ) : (
                        <div className="text-[8px] italic text-gray-400">
                          {t('resume.certNamePlaceholder')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Languages list */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-0.5">
                      {t('resume.languages')}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.languages && formData.languages.length > 0 ? (
                        formData.languages.map((lang) => (
                          <span
                            key={lang}
                            className="bg-white border border-gray-250 text-gray-700 rounded px-1.5 py-0.5 font-mono text-[8px]"
                          >
                            {lang}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="bg-white border border-gray-200 text-gray-700 rounded px-1.5 py-0.5 font-mono text-[8px]">
                            English (Fluent)
                          </span>
                          <span className="bg-white border border-gray-200 text-gray-700 rounded px-1.5 py-0.5 font-mono text-[8px]">
                            Hindi (Native)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right White Main column */}
                <div className="col-span-8 bg-white p-5 pr-4 flex flex-col space-y-4">
                  {/* Career Objective / Professional Summary */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#fbc02d] rounded-xs inline-block"></span>
                      {t('resume.careerObjective')}
                    </h4>
                    <p className="text-[9.5px] text-gray-600 leading-relaxed pl-3 font-sans">
                      {formData.summary ||
                        "Detail-oriented and highly motivated Computer Science student seeking an opportunity to apply analytical mindset and hands-on programming skills in an internship environment."}
                    </p>
                  </div>

                  {/* Key Skills (Tech & Soft) */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#fbc02d] rounded-xs inline-block"></span>
                      {t('resume.keySkills')}
                    </h4>
                    <div className="pl-3 grid grid-cols-2 gap-2">
                      <div>
                        <span className="block font-semibold text-gray-700 text-[8.5px] uppercase font-mono mb-1 text-[#2d3748]">
                          {t('resume.technical')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {formData.skills.length > 0 ? (
                            formData.skills.map((sk) => (
                              <span
                                key={sk}
                                className="text-[8px] bg-gray-100 border border-gray-200 text-gray-800 font-mono py-0.5 px-1.5 rounded w-max inline-block"
                              >
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-[8px] text-gray-400 italic">
                              {t('resume.noSkillsAdded')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block font-semibold text-gray-700 text-[8.5px] uppercase font-mono mb-1 text-[#2d3748]">
                          {t('resume.soft')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {formData.softSkills &&
                          formData.softSkills.length > 0 ? (
                            formData.softSkills.map((sk) => (
                              <span
                                key={sk}
                                className="text-[8px] bg-[#fdf3e7] border border-[#fbd4b7] text-amber-900 font-mono py-0.5 px-1.5 rounded w-max inline-block"
                              >
                                {sk}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="text-[8.5px] bg-[#fdf3e7] border border-[#fbd4b7] text-amber-900 font-mono py-0.5 px-1.5 rounded w-max inline-block">
                                Communication
                              </span>
                              <span className="text-[8.5px] bg-[#fdf3e7] border border-[#fbd4b7] text-amber-900 font-mono py-0.5 px-1.5 rounded w-max inline-block">
                                Problem-Solving
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Education qualifications */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#fbc02d] rounded-xs inline-block"></span>
                      {t('resume.educationAcademics')}
                    </h4>
                    <div className="pl-3 space-y-2.5">
                      {formData.qualifications.some((q) => q.school.trim()) ? (
                        formData.qualifications
                          .filter((q) => q.school.trim())
                          .map((edu) => (
                            <div
                              key={edu.id}
                              className="relative border-l-2 border-gray-200 pl-3.5 ml-1"
                            >
                              <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full border border-[#fbc02d] bg-white"></span>
                              <div className="flex justify-between items-start text-[9.5px]">
                                <div>
                                  <span className="font-bold text-gray-800">
                                    {edu.school}
                                  </span>
                                  <span className="block text-[8.5px] text-gray-500 leading-normal">
                                    {edu.degree}
                                  </span>
                                </div>
                                <div className="text-right text-[8.5px] tracking-wide shrink-0 font-mono font-bold text-[#2d3748]">
                                  {edu.year}{" "}
                                  {edu.grade && (
                                    <span className="block text-[#fbc02d] font-sans font-semibold">
                                      {edu.grade}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="relative border-l-2 border-gray-200 pl-3.5 ml-1">
                          <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full border border-[#fbc02d] bg-white"></span>
                          <div className="flex justify-between items-start text-[9.5px]">
                            <div>
                              <span className="font-bold text-gray-800">
                                {t('resume.educationAcademics')}
                              </span>
                              <span className="block text-[8.5px] text-gray-500 leading-normal">
                                B.Tech / Degree Programme
                              </span>
                            </div>
                            <div className="text-right text-[8.5px] font-mono font-bold text-[#2d3748]">
                              2023 - 2027
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#fbc02d] rounded-xs inline-block"></span>
                      {t('resume.experiencesInternships')}
                    </h4>
                    <div className="pl-3 space-y-3">
                      {formData.experience.some((e) => e.company.trim()) ? (
                        formData.experience
                          .filter((e) => e.company.trim())
                          .map((exp) => (
                            <div
                              key={exp.id}
                              className="relative border-l-2 border-gray-200 pl-3.5 ml-1"
                            >
                              <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full border border-[#fbc02d] bg-white"></span>
                              <div className="flex justify-between items-start text-[9.5px]">
                                <div>
                                  <span className="font-bold text-gray-800">
                                    {exp.company}
                                  </span>
                                  <span className="block text-[8.5px] text-[#fbc02d] font-semibold">
                                    {exp.role}
                                  </span>
                                </div>
                                <span className="font-mono text-[8.5px] text-gray-500 shrink-0">
                                  {exp.duration}
                                </span>
                              </div>
                              <p className="text-[8.5px] mt-1 text-gray-500 whitespace-pre-line leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          ))
                      ) : (
                        <div className="text-[8.5px] text-gray-400 italic">
                          {t('resume.noExperiences')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  {formData.projects &&
                    formData.projects.some((p) => p.title.trim()) && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-3.5 bg-[#fbc02d] rounded-xs inline-block"></span>
                          {t('resume.academicProjects')}
                        </h4>
                        <div className="pl-3 space-y-3">
                          {formData.projects
                            .filter((p) => p.title.trim())
                            .map((proj) => (
                              <div
                                key={proj.id}
                                className="relative border-l-2 border-gray-200 pl-3.5 ml-1"
                              >
                                <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full border border-[#fbc02d] bg-white"></span>
                                <div className="flex justify-between items-start text-[9.5px]">
                                  <div>
                                    <span className="font-bold text-gray-800">
                                      {proj.title}
                                    </span>
                                    {proj.company && (
                                      <span className="block text-[8.5px] text-gray-500 leading-none mb-1">
                                        {proj.company}
                                      </span>
                                    )}
                                  </div>
                                  {proj.tools && (
                                    <span className="text-[8.5px] bg-slate-50 border border-slate-200 text-slate-900 font-mono py-0.5 px-1 rounded shrink-0">
                                      {proj.tools}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[8.5px] mt-1 text-gray-500 whitespace-pre-line leading-relaxed">
                                  {proj.description}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Copyright footnote */}
                  <div className="text-[7.5px] text-gray-300 font-mono text-right mt-1">
                    © Shine.com. All rights reserved
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              id="print-resume-canvas"
              className={`shadow-lg bg-white p-6 border text-left flex-1 min-h-[480px] text-xs font-sans overflow-y-auto leading-relaxed max-w-full ${
                formData.templateId === "modern"
                  ? "border-indigo-600 bg-white"
                  : formData.templateId === "minimal"
                    ? "border-gray-300 font-serif"
                    : formData.templateId === "elegant"
                      ? "border-amber-600 tracking-wide font-sans"
                      : "border-emerald-600 font-mono bg-neutral-950 text-neutral-200"
              }`}
            >
              {/* Header section */}
              <div
                className={`mb-4 flex gap-3 pb-3 border-b ${
                  formData.templateId === "tech"
                    ? "border-emerald-800"
                    : "border-gray-200"
                }`}
              >
                {formData.photoUrl && (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-2xs"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="flex-1">
                  <h2
                    className={`font-display font-medium text-base tracking-tight ${
                      formData.templateId === "modern"
                        ? "text-indigo-950 font-bold"
                        : formData.templateId === "elegant"
                          ? "text-amber-950 font-semibold"
                          : formData.templateId === "tech"
                            ? "text-emerald-400 font-mono"
                            : "text-gray-900"
                    }`}
                  >
                    {formData.name || "Your Full Name"}
                  </h2>

                  <div className="flex flex-wrap gap-2 text-[9px] text-gray-700 mt-1">
                    <span className="flex items-center gap-0.5">
                      <Mail className="w-2.5 h-2.5" />
                      {formData.email}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Phone className="w-2.5 h-2.5" />
                      {formData.phone}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {formData.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <p
                  className={`text-[10px] ${formData.templateId === "tech" ? "text-neutral-300" : "text-gray-700"}`}
                >
                  {formData.summary ||
                    "Write a brief professional summary introducing yourself..."}
                </p>
              </div>

              {/* Qualifications / School */}
              <div className="mb-4">
                <h3
                  className={`font-display font-bold text-[10px] uppercase tracking-wide mb-1.5 pb-0.5 border-b ${
                    formData.templateId === "modern"
                      ? "text-indigo-800 border-indigo-100"
                      : formData.templateId === "elegant"
                        ? "text-amber-800 border-amber-100"
                        : formData.templateId === "tech"
                          ? "text-emerald-500 border-emerald-950"
                          : "text-gray-800 border-gray-100"
                  }`}
                >
                  {t('resume.educationAcademics')}
                </h3>
                <div className="space-y-1.5">
                  {formData.qualifications.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex justify-between items-start text-[10px]"
                    >
                      <div>
                        <strong
                          className={
                            formData.templateId === "tech"
                              ? "text-neutral-200"
                              : "text-gray-900"
                          }
                        >
                          {edu.school || "Institution"}
                        </strong>
                        <span className="block text-[9px] text-gray-700 leading-none">
                          {edu.degree || "Degree Title"}
                        </span>
                      </div>
                      <div className="text-right text-[9px]">
                        <span className="block font-mono font-bold text-gray-700">
                          {edu.year || "Duration"}
                        </span>
                        <span className="text-[9px] text-indigo-600 font-semibold">
                          {edu.grade || "GPA/Grade"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experiences */}
              <div className="mb-4">
                <h3
                  className={`font-display font-bold text-[10px] uppercase tracking-wide mb-1.5 pb-0.5 border-b ${
                    formData.templateId === "modern"
                      ? "text-indigo-800 border-indigo-100"
                      : formData.templateId === "elegant"
                        ? "text-amber-800 border-amber-100"
                        : formData.templateId === "tech"
                          ? "text-emerald-500 border-emerald-950"
                          : "text-gray-800 border-gray-100"
                  }`}
                >
                  {t('resume.experiencesInternships')}
                </h3>
                <div className="space-y-3">
                  {formData.experience.map((exp) => (
                    <div key={exp.id} className="text-[10px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong
                            className={
                              formData.templateId === "tech"
                                ? "text-neutral-200"
                                : "text-gray-900"
                            }
                          >
                            {exp.company || "Company"}
                          </strong>
                          <span className="block text-[9px] text-indigo-600 font-semibold leading-none">
                            {exp.role || "Role Name"}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-gray-700">
                          {exp.duration || "Duration"}
                        </span>
                      </div>
                      <p
                        className={`text-[9px] mt-1 ${formData.templateId === "tech" ? "text-neutral-300" : "text-gray-700"}`}
                      >
                        {exp.description ||
                          "Describe duties and completed milestones..."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill badge collections */}
              <div>
                <h3
                  className={`font-display font-bold text-[10px] uppercase tracking-wide mb-1.5 pb-0.5 border-b ${
                    formData.templateId === "modern"
                      ? "text-indigo-800 border-indigo-100"
                      : formData.templateId === "elegant"
                        ? "text-amber-800 border-amber-100"
                        : formData.templateId === "tech"
                          ? "text-emerald-500 border-emerald-950"
                          : "text-gray-800 border-gray-100"
                  }`}
                >
                  {t('resume.technicalSkills')}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {formData.skills.map((sk) => (
                    <span
                      key={sk}
                      className={`text-[8px] font-mono border rounded py-0.5 px-1.5 ${
                        formData.templateId === "tech"
                          ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
                          : "border-gray-200 bg-gray-50 text-gray-800"
                      }`}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}