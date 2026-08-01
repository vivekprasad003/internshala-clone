import React from 'react';
import { Mail, Clock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ActivePoliciesProps {
  currentSimulatedTime: string; // HH:MM
  isMobileLocked: boolean;
}

export const ActivePolicies: React.FC<ActivePoliciesProps> = ({
  currentSimulatedTime,
  isMobileLocked,
}) => {
  const { t } = useLanguage();
  // Convert current simulated time formatted string to hours and minutes for cursor positioning
  const [currentHour, currentMin] = currentSimulatedTime.split(':').map(Number);
  const simMinutesSince9AM = (currentHour * 60 + currentMin) - (9 * 60);
  const totalMinutes9to3 = 6 * 60; // 9:00 AM to 3:00 PM (360 minutes)
  
  // Calculate vertical percentage for simulated cursor on the timeline (only if within bounds of 9am to 3am)
  const showTimeIndicator = simMinutesSince9AM >= 0 && simMinutesSince9AM <= totalMinutes9to3;
  const indicatorPercentage = showTimeIndicator ? (simMinutesSince9AM / totalMinutes9to3) * 100 : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full" id="active-policies-panel">
      {/* Deep Blue Header */}
      <div className="bg-[#1e1b4b] p-5 text-white">
        <h2 className="text-xs uppercase tracking-widest font-mono text-indigo-300 font-bold mb-1">
          {t('systemInfo.activePolicies')}
        </h2>
        <p className="font-display text-lg font-semibold tracking-tight">
          {t('systemInfo.title')}
        </p>
      </div>

      <div className="p-5 flex-1 flex flex-col space-y-6">
        {/* Enforced Rules List */}
        <div className="space-y-4">
          {/* Chrome OTP Rule */}
          <div className="flex gap-3.5 items-start p-4 bg-slate-50 rounded-xl border border-slate-100" id="policy-chrome-otp">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                {t('systemInfo.chromeOtpRule')}
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('systemInfo.chromeOtpDesc')}
              </p>
            </div>
          </div>

          {/* Mobile Time Window */}
          <div className="flex gap-3.5 items-start p-4 bg-slate-50 rounded-xl border border-slate-100" id="policy-mobile-window">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                {t('systemInfo.mobileLocked')}
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('systemInfo.timeRestricted')}
              </p>
            </div>
          </div>
        </div>

        {/* Access Timeline Grid */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {t('systemInfo.currentTime')}
          </h3>

          {/* Timeline Map Container */}
          <div className="relative flex-1 min-h-[300px] border-l border-slate-200 ml-2" id="access-timeline-map">
            
            {/* Hour ticks line */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 hover:cursor-default">
              {[
                { label: '09:00 AM', hourStr: '09' },
                { label: '10:00 AM', hourStr: '10' },
                { label: '11:00 AM', hourStr: '11' },
                { label: '12:00 PM', hourStr: '12' },
                { label: '01:00 PM', hourStr: '13' },
                { label: '02:00 PM', hourStr: '14' },
                { label: '03:00 PM', hourStr: '15' },
              ].map((tick, idx) => (
                <div key={idx} className="relative flex items-center h-0">
                  {/* Tick line */}
                  <div className="absolute left-0 w-2.5 border-t border-slate-300 -translate-y-1/2"></div>
                  {/* Dot */}
                  <div className="absolute left-[-3px] w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  {/* Time label */}
                  <span className="absolute left-4 font-mono text-[11px] leading-none text-slate-400 font-medium -translate-y-1/2">
                    {tick.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Authorized Highlighted Block */}
            <div 
              className="absolute left-[1px] right-2 bg-indigo-50 hover:bg-indigo-100/70 transition-colors border-l-2 border-indigo-600 rounded-r-lg flex flex-col justify-center items-center px-4 shadow-xs"
              style={{
                top: '16.67%',
                bottom: '33.33%',
              }}
              id="mobile-authorized-stripe"
            >
              <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold uppercase rotate-0 text-center tracking-normal">
                {t('systemInfo.authorized')}
              </span>
              <span className="text-[9px] font-mono text-indigo-400 mt-0.5">
                10:00 AM - 01:00 PM
              </span>
            </div>

            {/* Active Time Cursor */}
            {indicatorPercentage !== null && (
              <div 
                className="absolute left-0 right-[-8px] border-t-2 border-dashed border-rose-500 z-10 transition-all duration-300"
                style={{ top: `${indicatorPercentage}%` }}
                id="timeline-time-cursor"
              >
                {/* Simulated time indicator tag */}
                <div className="absolute right-0 -top-2 px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[9px] font-bold rounded shadow-xs uppercase">
                  {currentSimulatedTime}
                </div>
              </div>
            )}
          </div>

          {/* Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed italic" id="timeline-footnote">
            * {t('systemInfo.mobileLocked')} {t('systemInfo.timeRestricted')}
          </div>
        </div>
      </div>
    </div>
  );
};