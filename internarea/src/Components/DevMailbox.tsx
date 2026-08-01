import React, { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, ChevronDown, ChevronUp, Copy, Check, Eye } from 'lucide-react';
import { SimulatedEmail } from '../types/types_r';

export default function DevMailbox() {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMailId, setActiveMailId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMailbox = useCallback(async () => {
    try {
      const res = await fetch('/api/developer/mailbox');
      
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await res.json();
      const emailList = (data.emails || data.logs || []) as any[]; // Use any to allow dynamic property access
      if (Array.isArray(emailList)) {
        setEmails(emailList);
        // Auto select first email if there's any and none selected
        if (emailList.length > 0 && !activeMailId) {
          setActiveMailId(emailList[0].id);
        }
      }
    } catch (e) {
      console.error("Failed fetching dev mailbox:", e);
    }
  }, [activeMailId]);

  useEffect(() => {
    fetchMailbox();
    if (autoRefresh) {
      const interval = setInterval(fetchMailbox, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchMailbox]);

  const handleCopyOtp = (otp: string, id: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 text-slate-100 font-sans shadow-2xl relative">
      
      {/* Header bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 select-none transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Mail className="w-4.5 h-4.5 text-blue-400" />
            {emails.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {emails.length}
              </span>
            )}
          </div>
          <div>
            <span className="font-display font-medium text-xs tracking-wide uppercase text-slate-200">
              Developer Email Gateway Simulator
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Capturing virtual SMTP outputs live from server.ts ({emails.length} captured)
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh);
            }}
            className={`text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-semibold ${
              autoRefresh ? 'bg-blue-900/40 text-blue-400 border border-blue-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {autoRefresh ? '● Live polling' : 'Paused'}
          </button>
          
          <button
            onClick={fetchMailbox}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Sandbox Inbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="text-slate-500 hover:text-slate-200 p-0.5 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {isOpen && (
        <div className="h-64 grid grid-cols-12 border-t border-slate-800 overflow-hidden text-sm">
          
          {/* Email sidebar list */}
          <div className="col-span-4 border-r border-slate-800 overflow-y-auto bg-slate-950/70">
            {emails.length === 0 ? (
              <div className="opacity-40 text-xs p-6 text-center text-slate-400 font-mono">
                No outbound emails captured yet.<br/>
                Request an OTP in the checkout process to trigger.
              </div>
            ) : (
              emails.map((mail) => (
                <div
                  key={mail.id}
                  onClick={() => setActiveMailId(mail.id)}
                  className={`p-3.5 border-b border-slate-900 transition-all cursor-pointer text-left relative ${
                    activeMailId === mail.id 
                      ? 'bg-slate-800/80 border-l-2 border-blue-500' 
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 text-[11px] font-mono text-slate-500">
                    <span>To: {mail.to}</span>
                    <span>{new Date(mail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="font-semibold text-xs text-slate-200 truncate">{mail.subject}</p>
                  
                  {/* Badge key indicators */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-blue-900/60 text-blue-300 border border-blue-800/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                      OTP: {(mail as any).otp || (mail as any).otpCode}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">click to read HTML</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Email content pane */}
          <div className="col-span-8 overflow-y-auto bg-slate-900 flex flex-col p-4">
            {activeMailId && emails.some(m => m.id === activeMailId) ? (
              (() => {
                const activeMail = emails.find(m => m.id === activeMailId)!;
                return (
                  <div className="flex-1 flex flex-col">
                    {/* Dev Actions Header */}
                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between mb-4 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Security Payload Guard: </span>
                        <span className="text-emerald-400 font-bold font-mono">OTP Code = {activeMail.otp || activeMail.otpCode}</span>
                      </div>
                      <button
                        onClick={() => handleCopyOtp(activeMail.otp || activeMail.otpCode, activeMail.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-md font-sans font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedId === activeMail.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy OTP
                          </>
                        )}
                      </button>
                    </div>

                    {/* Simulated visual Email Render */}
                    <div className="bg-white text-gray-800 rounded-xl p-4 overflow-y-auto flex-1 flex justify-center max-h-[170px]">
                      <div className="w-full max-w-[420px] scale-90 origin-top text-[12px] leading-snug">
                        <div dangerouslySetInnerHTML={{ __html: activeMail.body }} />
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs opacity-30 text-slate-400 font-mono">
                Select an outbound notification log to preview payload output.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}