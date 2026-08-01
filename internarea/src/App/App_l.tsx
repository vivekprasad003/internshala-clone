import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import OtpModal from "../Components/OtpModal";
import { LanguageCode } from "../types/types_l";
import { Globe, RefreshCw, Lock, ShieldAlert, ChevronRight, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface SettingsTranslation {
  badge: string;
  title: string;
  subtitle: string;
  gateLock: string;
  systemDefaultTitle: string;
  systemDefaultSubtitle: string;
  resetButtonText: string;
}

const settingsTranslations: Record<LanguageCode, SettingsTranslation> = {
  en: {
    badge: "LOCALIZATION ENGINE",
    title: "Language Settings",
    subtitle: "Choose your preferred interface language. Changes apply globally across all modules.",
    gateLock: "Gate Lock",
    systemDefaultTitle: "System Language Default",
    systemDefaultSubtitle: "Reset all active interface translations back to English and revoke active French location security authorization status instantly.",
    resetButtonText: "Reset System back to English",
  },
  es: {
    badge: "MOTOR DE LOCALIZACIÓN",
    title: "Ajustes de Idioma",
    subtitle: "Elija su idioma de interfaz preferido. Los cambios se aplican globalmente en todos los módulos.",
    gateLock: "Bloqueo de Entrada",
    systemDefaultTitle: "Idioma predeterminado del sistema",
    systemDefaultSubtitle: "Restablezca de inmediato todas las traducciones de la interfaz a inglés y revoque la autorización francesa.",
    resetButtonText: "Restablecer sistema a inglés",
  },
  hi: {
    badge: "लोकलैजेशन इंजन",
    title: "भाषा सेटिंग्स",
    subtitle: "अपनी पसंदीदा इंटरफ़ेस भाषा चुनें। बदलाव सभी मॉड्यूल में वैश्विक रूप से लागू होंगे।",
    gateLock: "गेट लॉक",
    systemDefaultTitle: "सिस्टम भाषा डिफ़ॉल्ट",
    systemDefaultSubtitle: "सभी सक्रिय अनुवादों को तुरंत अंग्रेजी में रीसेट करें और फ्रेंच सुरक्षा प्राधिकरण को तुरंत रद्द करें।",
    resetButtonText: "सिस्टम वापस अंग्रेजी में रीसेट करें",
  },
  pt: {
    badge: "MOTOR DE LOCALIZAÇÃO",
    title: "Configurações de Idioma",
    subtitle: "Escolha o seu idioma de interface preferido. As alterações aplicam-se globalmente a todos os módulos.",
    gateLock: "Bloqueio do Portal",
    systemDefaultTitle: "Idioma Padrão do Sistema",
    systemDefaultSubtitle: "Redefina instantaneamente todas as traduções da interface de volta para o inglês e revogue a autorização francesa.",
    resetButtonText: "Redefinir sistema para inglês",
  },
  zh: {
    badge: "本地化分发引擎",
    title: "语言设置",
    subtitle: "选择您首选的界面语言。更改将全局应用于所有模块。",
    gateLock: "安全锁",
    systemDefaultTitle: "系统默认语言",
    systemDefaultSubtitle: "立即将所有活动的界面翻译重置回英文，并瞬间撤销生效的法语本地安全访问授权。",
    resetButtonText: "重置系统为英文",
  },
  fr: {
    badge: "MOTEUR DE LOCALISATION",
    title: "Paramètres de Langue",
    subtitle: "Choisissez votre langue d'interface préférée. Les modifications s'appliquent globalement à tous les modules.",
    gateLock: "Portail Verrouillé",
    systemDefaultTitle: "Langue Système par Défaut",
    systemDefaultSubtitle: "Réinitialisez instantanément toutes les traductions de l'interface en anglais et révoquez l'autorisation de sécurité française.",
    resetButtonText: "Réinitialiser le système en anglais",
  },
};

const languagesList: { code: LanguageCode; label: string; englishLabel: string }[] = [
  { code: "en", label: "English", englishLabel: "ENGLISH" },
  { code: "es", label: "Español", englishLabel: "SPANISH" },
  { code: "hi", label: "हिन्दी", englishLabel: "HINDI" },
  { code: "pt", label: "Português", englishLabel: "PORTUGUESE" },
  { code: "zh", label: "中文", englishLabel: "CHINESE" },
  { code: "fr", label: "Français", englishLabel: "FRENCH" },
];

export default function App() {
  const { language: currentLanguage, setLanguage, isFrenchVerified, setFrenchVerified } = useLanguage();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);

  // Default testing target email obtained from user runtime metadata
  const defaultUserEmail = "";

  const handleLanguageSelect = (lang: LanguageCode) => {
    if (lang === "fr" && !isFrenchVerified) {
      setPendingLanguage("fr");
      setIsOtpModalOpen(true);
    } else {
      setLanguage(lang);
      setPendingLanguage(null);
    }
  };

  const handleVerificationSuccess = (email: string) => {
    setFrenchVerified(true);
    setLanguage("fr");
    setPendingLanguage(null);
  };

  const resetFrenchVerification = () => {
    setFrenchVerified(false);
    setLanguage("en");
    localStorage.removeItem("lingosafe_french_verified");
  };

  const activeTranslations = settingsTranslations[currentLanguage];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center selection:bg-indigo-100 selection:text-indigo-950 font-sans transition-colors duration-200 p-4 sm:p-8 relative">
      
      {/* Centered Dashboard Card Grid Module */}
      <div id="language-settings-main" className="w-full max-w-6xl bg-white rounded-[32px] border border-slate-200/70 shadow-xl shadow-slate-100/40 p-8 sm:p-12 transition-all duration-300">
        
        {/* Dynamic Header Layout */}
        <div className="text-left mb-8">
          {currentLanguage === "en" ? (
            /* English Pill layout as in mockup */
            <div className="space-y-2">
              <span className="inline-block bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                {activeTranslations.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {activeTranslations.title}
              </h1>
            </div>
          ) : (
            /* Localized Devanagari/etc layout featuring prominent blue globe icon on left */
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {activeTranslations.title}
              </h1>
            </div>
          )}
          
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed text-left">
            {activeTranslations.subtitle}
          </p>
        </div>

        {/* Separator block line */}
        <div className="border-b border-[#F1F5F9] my-6" />

        {/* Language Selection Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {languagesList.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isFrench = lang.code === "fr";
            const isLocked = isFrench && !isFrenchVerified;

            return (
              <button
                key={lang.code}
                id={`language-card-${lang.code}`}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`relative w-full text-left rounded-3xl p-6 transition-all duration-350 cursor-pointer overflow-hidden flex items-center justify-between group border-2 ${
                  isSelected
                    ? "border-[#4F46E5] ring-1 ring-[#4F46E5]/10 bg-white shadow-md shadow-indigo-50/50"
                    : isLocked
                    ? "border-amber-300/80 bg-white"
                    : "border-slate-200/85 hover:border-slate-300/90 bg-white hover:shadow-sm"
                }`}
              >
                
                {/* Visual Elements Group Left */}
                <div className="flex items-center">
                  
                  {/* Circle Flag/Globe Wrapper */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border ${
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-100 text-[#4F46E5]"
                      : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-slate-600"
                  }`}>
                    <Globe className="w-6 h-6" />
                  </div>

                  {/* Text labels */}
                  <div className="flex flex-col ml-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="text-[17px] font-bold text-[#0F172A] tracking-tight">
                        {lang.label}
                      </span>
                      {isLocked && (
                        <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                          <Lock className="w-2.5 h-2.5 text-[#B45309]" />
                          {activeTranslations.gateLock}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mt-0.5 font-semibold">
                      {lang.englishLabel}
                    </span>
                  </div>
                </div>

                {/* Accent locked watermark lock icon */}
                {isLocked && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none text-slate-900 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-20 h-20" />
                  </div>
                )}

                {/* Right Radio Indicator */}
                <div className="shrink-0 flex items-center justify-center ml-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full border-2 border-[#4F46E5] bg-white flex items-center justify-center transition-all duration-300">
                      <div className="w-3 h-3 bg-[#4F46E5] rounded-full" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border bg-white flex items-center justify-center transition-all duration-300 ${
                      isLocked ? "border-slate-200" : "border-slate-300"
                    }`} />
                  )}
                </div>

              </button>
            );
          })}
        </div>

        {/* Separator spacing */}
        <div className="my-8" />

        {/* Bottom Lock / Reset State Card Component matching Hindi mockup */}
        <div id="system-default-reset-card" className="bg-[#F8FAFC]/80 border border-slate-200/60 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-left">
          <div className="flex items-start sm:items-center space-x-4">
            
            {/* Round square grey Refresh container */}
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>

            {/* Default prompt text details */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                {activeTranslations.systemDefaultTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl text-left leading-relaxed">
                {activeTranslations.systemDefaultSubtitle}
              </p>
            </div>
          </div>

          {/* Reset Switch Actions */}
          <button
            onClick={resetFrenchVerification}
            className="w-full sm:w-auto bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] font-semibold px-6 py-3.5 rounded-2xl transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 shrink-0 shadow-sm cursor-pointer border border-[#E0E7FF]/50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>{activeTranslations.resetButtonText}</span>
          </button>
        </div>

      </div>



      {/* Dynamic OTP Verification Dialog */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <OtpModal
            isOpen={isOtpModalOpen}
            onClose={() => {
              setIsOtpModalOpen(false);
              setPendingLanguage(null);
            }}
            onVerificationSuccess={handleVerificationSuccess}
            userEmailInitial={defaultUserEmail}
          />
        )}
      </AnimatePresence>

    </div>
  );
}