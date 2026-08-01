import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Send, CheckCircle2, ShieldCheck, HeartHandshake, AlertCircle } from "lucide-react";
import { ContactLabels } from "../types/types_l";

interface ContactProps {
  labels: ContactLabels;
}

export function ContactPage({ labels }: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setValidationError("Please write a complete inquiry message.");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending translated contact form to support desk
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column info */}
        <div className="md:col-span-5 bg-slate-50/80 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 w-fit">
              <HeartHandshake className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">LingoSafe Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Each submission is automatically routed through localization filters. Our internationalization experts respond inside your chosen localized language context.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 space-y-3 font-mono text-[11px] text-slate-400">
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>TLS 1.3 Certified Channels</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>support@lingosafe.secure</span>
            </p>
          </div>
        </div>

        {/* Right column Form content (crisp white sleek card component) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-center min-h-[400px] shadow-sm">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-5 text-left"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {labels.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed">
                    {labels.subtitle}
                  </p>
                </div>

                {validationError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-2.5 px-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans uppercase tracking-wider">
                    {labels.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={labels.namePlaceholder}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50/50 border border-slate-200 p-3 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans uppercase tracking-wider">
                    {labels.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={labels.emailPlaceholder}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50/50 border border-slate-200 p-3 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans uppercase tracking-wider">
                    {labels.messageLabel}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={labels.messagePlaceholder}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50/50 border border-slate-200 p-3 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-sans resize-none"
                  />
                </div>

                {/* Submit Trigger */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-sans font-semibold hover:bg-blue-700 py-3.5 rounded-xl transition text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{labels.sendButton}</span>
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <CheckCircle2 className="w-10 h-10 animate-pulse text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {labels.successTitle}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mt-2 leading-relaxed px-4">
                  {labels.successMessage}
                </p>

                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className="mt-6 text-xs text-blue-600 hover:text-blue-700 hover:underline transition font-mono font-bold cursor-pointer"
                >
                  Submit Another Form
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}