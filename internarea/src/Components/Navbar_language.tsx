import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Shield, ShieldCheck, Lock, ChevronDown, Check, Terminal, Cpu, MessageSquare } from "lucide-react";
import { LanguageCode, NavigationLabels } from "../types/types_l";

interface NavbarProps {
  currentLanguage: LanguageCode;
  labels: NavigationLabels;
  onLanguageSelect: (lang: LanguageCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isFrenchVerified: boolean;
}

const languagesList: Array<{ code: LanguageCode; label: string; flag: string; isSecured?: boolean }> = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷", isSecured: true },
];

export function Navbar({
  currentLanguage,
  labels,
  onLanguageSelect,
  activeTab,
  setActiveTab,
  isFrenchVerified,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getLanguageLabel = (code: LanguageCode) => {
    return languagesList.find((l) => l.code === code)?.label || code;
  };

  const getLanguageFlag = (code: LanguageCode) => {
    return languagesList.find((l) => l.code === code)?.flag || "🌐";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/System Title with Sleek Theme Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"
              >
                {isFrenchVerified && currentLanguage === "fr" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-white rounded-full"></div>
                )}
              </motion.div>
              {isFrenchVerified && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
            <span className="font-sans font-bold tracking-tight text-lg text-slate-900">
              {labels.brand}
            </span>
          </div>

          {/* Desktop Navigation Links - Styled exactly with Sleek theme aesthetics */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 relative ${
                activeTab === "home" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                {labels.home}
              </span>
              {activeTab === "home" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-10px] left-4 right-4 h-0.5 bg-blue-650"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("features")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 relative ${
                activeTab === "features" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {labels.features}
              </span>
              {activeTab === "features" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-10px] left-4 right-4 h-0.5 bg-blue-650"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 relative ${
                activeTab === "contact" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {labels.contact}
              </span>
              {activeTab === "contact" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-10px] left-4 right-4 h-0.5 bg-blue-650"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("securityConsole")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-150 relative ${
                activeTab === "securityConsole" ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                {labels.securityConsole}
              </span>
              {activeTab === "securityConsole" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-10px] left-4 right-4 h-0.5 bg-blue-650"
                />
              )}
            </button>
          </div>

          {/* Selector Segment - Sleek rounded pill style */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-250 bg-white text-sm font-semibold text-slate-700 hover:text-slate-900 focus:ring-4 focus:ring-blue-100 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 cursor-pointer"
            >
              <span className="text-base">{getLanguageFlag(currentLanguage)}</span>
              <span className="hidden sm:inline font-sans">{getLanguageLabel(currentLanguage)}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-20 overflow-hidden"
                  >
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-100 mb-1 flex justify-between items-center">
                      <span>{labels.selectLanguage}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase font-mono">6 Locales</span>
                    </div>

                    <div className="space-y-0.5">
                      {languagesList.map((lang) => {
                        const isSelected = currentLanguage === lang.code;
                        const requiresVerification = lang.code === "fr" && !isFrenchVerified;

                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              onLanguageSelect(lang.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group ${
                              isSelected ? "bg-slate-100 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-base" role="img" aria-label={lang.label}>
                                {lang.flag}
                              </span>
                              <span className="font-sans group-hover:text-blue-650 transition-colors">
                                {lang.label}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {requiresVerification ? (
                                <span className="flex items-center space-x-1 bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-md border border-amber-200/50 font-mono font-bold">
                                  <Lock className="w-3 h-3" />
                                  <span>OTP</span>
                                </span>
                              ) : lang.code === "fr" && isFrenchVerified ? (
                                <span className="flex items-center space-x-1 bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-md border border-green-200/50 font-mono font-bold">
                                  <ShieldCheck className="w-3 h-3 text-green-600" />
                                  <span>VERIFIED</span>
                                </span>
                              ) : null}

                              {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="md:hidden border-t border-slate-200 bg-white flex justify-around py-2 shrink-0 shadow-inner">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-semibold space-y-0.5 ${
            activeTab === "home" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{labels.home}</span>
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-semibold space-y-0.5 ${
            activeTab === "features" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{labels.features}</span>
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-semibold space-y-0.5 ${
            activeTab === "contact" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{labels.contact}</span>
        </button>
        <button
          onClick={() => setActiveTab("securityConsole")}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-semibold space-y-0.5 ${
            activeTab === "securityConsole" ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Console</span>
        </button>
      </div>
    </nav>
  );
}