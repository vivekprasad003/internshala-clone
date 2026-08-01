import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Terminal, RefreshCw, Mail, ShieldAlert, Cpu, Layers, Timer, Clipboard, Check, Database } from "lucide-react";
import { OtpLog } from "../types/types_l";

export function DevConsole() {
  const [logs, setLogs] = useState<OtpLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<OtpLog | null>(null);

  const fetchSecurityLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dev-otp-logs");
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
        // Default select the latest log if none is selected
        if (data.logs.length > 0 && !selectedLog) {
          setSelectedLog(data.logs[0]);
        }
      }
    } catch (err) {
      console.error("Failed to query dev logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
    // Auto-refresh logs pool every 3 seconds for snappy updates
    const interval = setInterval(fetchSecurityLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 font-sans shadow-sm">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-605 border border-blue-100">
            <Terminal className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              LingoSafe Security &amp; SMTP Sandbox
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Real-time audit records &amp; validation logs
            </p>
          </div>
        </div>

        <button
          onClick={fetchSecurityLogs}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading && "animate-spin"}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Log List */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between px-1">
            <span>Transmission Feed</span>
            <span className="text-[10px] bg-slate-100 border border-slate-150 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">
              {logs.length} sent
            </span>
          </div>

          <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-2 max-h-[420px] overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="p-3 bg-white border border-slate-150 rounded-full text-slate-400">
                  <Database className="w-6 h-6 text-slate-400" />
                </div>
                <div className="max-w-[200px]">
                  <p className="text-xs font-semibold text-slate-700">No transmissions found</p>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                    Attempt to switch the language to French 🇫🇷 to trigger an SMTP OTP simulation log entry.
                  </p>
                </div>
              </div>
            ) : (
              logs.map((log, index) => {
                const isSelected = selectedLog?.timestamp === log.timestamp;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-300 text-slate-900 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wide flex items-center gap-1 ${
                        isSelected ? "text-blue-600" : "text-slate-500"
                      }`}>
                        <Mail className="w-3.5 h-3.5" />
                        SMTP COMPLETED
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <p className={`text-xs truncate font-semibold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      To: {log.email}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400">
                        Passcode: <strong className="text-blue-600 font-bold font-mono">{log.otp}</strong>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(log.otp);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition"
                      >
                        {copiedOtp === log.otp ? (
                          <Check className="w-3.5 h-3.5 text-green-600 font-bold" />
                        ) : (
                          <Clipboard className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Log Inspection Canvas */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>Inspector Node</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 h-full min-h-[300px] flex flex-col">
            {selectedLog ? (
              <div className="flex flex-col h-full space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div className="text-[11px] font-mono text-slate-500 space-y-1">
                    <p><strong>Class:</strong> LingoSafe.security.otp.TransmissionReport</p>
                    <p><strong>Method:</strong> POST /api/send-otp ➔ status 200</p>
                  </div>
                  <span className="bg-emerald-50 border border-green-200 text-green-800 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                    200 OK
                  </span>
                </div>

                {/* Email visual envelope (styled with simulated email view in crisp sleek paper) */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 font-mono text-xs flex-1 text-left shadow-sm">
                  <div className="border-b border-slate-100 pb-2.5 text-slate-500 space-y-1 text-[11px]">
                    <p><span className="text-slate-400 font-bold">From:</span> verification@lingosafe.secure</p>
                    <p><span className="text-slate-400 font-bold">To:</span> {selectedLog.email}</p>
                    <p><span className="text-slate-400 font-bold">Subject:</span> Security Key: French Language Verification</p>
                    <p><span className="text-slate-400 font-bold">Date:</span> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>

                  <div className="py-2.5 space-y-3 text-xs leading-relaxed text-slate-700">
                    <p>Hello LingoSafe User,</p>
                    
                    <p className="indent-4">
                      A security request to verify your email has been initiated to enable standard access to French-localized web content.
                    </p>
                    
                    <div className="my-5 p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <span className="text-[10px] font-sans text-slate-400 uppercase tracking-widest font-bold">Security OTP Code</span>
                      <span className="text-3xl font-bold tracking-widest text-blue-700 font-mono select-all">
                        {selectedLog.otp}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedLog.otp)}
                        className="flex items-center space-x-1 px-3 py-1 bg-white text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg font-sans text-[10.5px] transition cursor-pointer"
                      >
                        {copiedOtp === selectedLog.otp ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3 text-slate-400" />
                            <span>Copy verification passcode</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10.5px] text-slate-400 italic">
                      Disclaimer: This remains a secure virtual sandbox email transaction. No real-world networks were traversed.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5 text-left">
                  <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-blue-755">
                    <strong>Direct Sandbox Mode:</strong> To test the security flow instantly, click on French 🇫🇷, input any email address, retrieve the generated passcode <strong className="font-mono bg-blue-100 text-blue-800 px-1 rounded">{selectedLog.otp}</strong> here, and submit it inside the modal!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 py-20">
                <ShieldAlert className="w-8 h-8 text-slate-300 animate-bounce" />
                <p className="font-semibold text-slate-500">Select a logs report above to inspect its secure transaction body.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}