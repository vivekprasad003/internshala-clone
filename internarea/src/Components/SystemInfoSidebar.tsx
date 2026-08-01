import React, { useEffect } from 'react';
import { 
  Monitor, 
  Laptop as LaptopIcon, 
  Smartphone, 
  ShieldAlert, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { DeviceType, OperatingSystem, BrowserType, SandboxTime } from '../types/types_s';
import { useLanguage } from '../context/LanguageContext';

interface SystemInfoSidebarProps {
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  os: OperatingSystem;
  setOs: (o: OperatingSystem) => void;
  browser: BrowserType;
  setBrowser: (b: BrowserType) => void;
  sandboxTime: SandboxTime;
  setSandboxTime: (st: SandboxTime) => void;
  // Stats counters
  totalLogs: number;
  authorizedLogs: number;
  blockedTimeLogs: number;
  blockedOtpLogs: number;
}

export const SystemInfoSidebar: React.FC<SystemInfoSidebarProps> = ({
  device,
  setDevice,
  os,
  setOs,
  browser,
  setBrowser,
  sandboxTime,
  setSandboxTime,
  totalLogs,
  authorizedLogs,
  blockedTimeLogs,
  blockedOtpLogs,
}) => {
  const { t } = useLanguage();
  // Constrain OS based on device selection
  useEffect(() => {
    if (device === 'Mobile') {
      if (os !== 'iOS' && os !== 'Android') {
        setOs('iOS');
      }
    } else {
      if (os === 'iOS' || os === 'Android') {
        setOs('macOS');
      }
    }
  }, [device]);

  // Handle Quick Time Preset Toggles
  const setTimePreset = (timeStr: string) => {
    setSandboxTime({
      enabled: true,
      timeString: timeStr,
    });
  };

  // Convert "HH:MM" minutes index to hours selector
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMins = parseInt(e.target.value);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const hrsString = hrs.toString().padStart(2, '0');
    const minsString = mins.toString().padStart(2, '0');
    setSandboxTime({
      ...sandboxTime,
      timeString: `${hrsString}:${minsString}`,
    });
  };

  const getSliderValue = () => {
    const [hrs, mins] = sandboxTime.timeString.split(':').map(Number);
    return hrs * 60 + mins;
  };

  const formatTimeString = (time24: string) => {
    const [hrs, mins] = time24.split(':').map(Number);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs % 12 || 12;
    const minsStr = mins.toString().padStart(2, '0');
    return `${hrs12}:${minsStr} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col space-y-6 h-full" id="system-info-sidebar">
      
      {/* Sidebar Header Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold rounded-full border border-indigo-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
              {t('systemInfo.title')}
            </span>
          </div>
        </div>
        <h2 className="text-xl font-display font-semibold tracking-tight text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          {t('systemInfo.title')}
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {t('systemInfo.deviceSimulator')}
        </p>
      </div>

      {/* Active Firewalls & Gates */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" id="active-firewalls-section">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1">
          🛡️ {t('systemInfo.activePolicies')}
        </h3>
        <div className="space-y-3.5">
          <div>
            <div className="text-xs font-semibold text-amber-600 font-sans">
              {t('systemInfo.browser')} Guardian Gate:
            </div>
            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {t('systemInfo.guardianGateDesc')}
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-2.5">
            <div className="text-xs font-semibold text-rose-600 font-sans">
              {t('systemInfo.mobileLocked')} Time Window:
            </div>
            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {t('systemInfo.mobileTimeWindowDesc').replace('{timeWindow}', '10:00 AM - 1:00 PM')}
            </div>
          </div>
        </div>
      </div>

      {/* Device Selector */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
          1. {t('systemInfo.deviceSimulator')} {t('systemInfo.device')}
        </h3>
        <div className="grid grid-cols-3 gap-2.5" id="device-selection-grid">
          {/* Workstation (Desktop) */}
          <button
            type="button"
            onClick={() => setDevice('Desktop')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
              device === 'Desktop'
                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold'
                : 'border-slate-100 hover:border-slate-200 text-slate-500'
            }`}
            id="device-btn-desktop"
          >
            <Monitor className="w-5 h-5 mb-1.5" />
            <span className="text-xs leading-none">{t('systemInfo.deviceWorkstation')}</span>
            <span className="text-[9px] font-mono opacity-60 mt-1">{t('systemInfo.deviceDesktop')}</span>
          </button>

          {/* Personal (Laptop) */}
          <button
            type="button"
            onClick={() => setDevice('Laptop')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
              device === 'Laptop'
                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold'
                : 'border-slate-100 hover:border-slate-200 text-slate-500'
            }`}
            id="device-btn-laptop"
          >
            <LaptopIcon className="w-5 h-5 mb-1.5" />
            <span className="text-xs leading-none">{t('systemInfo.devicePersonal')}</span>
            <span className="text-[9px] font-mono opacity-60 mt-1">{t('systemInfo.deviceLaptop')}</span>
          </button>

          {/* Mobile (Mobile) */}
          <button
            type="button"
            onClick={() => setDevice('Mobile')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
              device === 'Mobile'
                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold'
                : 'border-slate-100 hover:border-slate-200 text-slate-500'
            }`}
            id="device-btn-mobile"
          >
            <Smartphone className="w-5 h-5 mb-1.5" />
            <span className="text-xs leading-none">{t('systemInfo.deviceMobile')}</span>
            <span className="text-[9px] font-mono opacity-60 mt-1">{t('systemInfo.deviceMobile')}</span>
          </button>
        </div>
      </div>

      {/* Simulated Operating System */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
          2. {t('systemInfo.operatingSystem')}
        </h3>
        <div className="flex flex-wrap gap-2" id="os-selection-bar">
          {(['macOS', 'Windows', 'Linux', 'iOS', 'Android'] as OperatingSystem[]).map((osItem) => {
            // Mobile limits OS to iOS/Android, Desktop limits to macOS/Windows/Linux
            const isAllowed = device === 'Mobile' 
              ? (osItem === 'iOS' || osItem === 'Android')
              : (osItem === 'macOS' || osItem === 'Windows' || osItem === 'Linux');
            
            return (
              <button
                type="button"
                disabled={!isAllowed}
                onClick={() => isAllowed && setOs(osItem)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                  !isAllowed
                    ? 'opacity-30 bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                    : os === osItem
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                }`}
                key={osItem}
                id={`os-btn-${osItem.toLowerCase()}`}
              >
                {osItem}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Web Agent Browser */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
          3. {t('systemInfo.browser')}
        </h3>
        <div className="space-y-1.5" id="browser-selection-list">
          {(['Google Chrome', 'Apple Safari', 'Mozilla Firefox', 'Microsoft Edge'] as BrowserType[]).map((browserItem) => {
            const isChrome = browserItem === 'Google Chrome';
            const isSelected = browser === browserItem;
            return (
              <button
                type="button"
                onClick={() => setBrowser(browserItem)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 text-slate-800'
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
                key={browserItem}
                id={`browser-btn-${browserItem.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isChrome ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                  <span className="text-xs font-medium">{browserItem}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 italic">
                  {isChrome ? t('systemInfo.browserTriggersOtp') : t('systemInfo.browserSecureInstant')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Operating Time */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            4. {t('systemInfo.sandboxTime')}
          </h3>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <span className="text-[11px]">{t('systemInfo.enableSandbox')}</span>
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              checked={sandboxTime.enabled}
              onChange={(e) => setSandboxTime({ ...sandboxTime, enabled: e.target.checked })}
              id="enable-clock-checkbox"
            />
          </label>
        </div>

        {!sandboxTime.enabled ? (
          <div className="p-3 bg-slate-50 border border-slate-200/70 border-dashed rounded-lg text-xs text-slate-500 font-mono text-center">
            {t('systemInfo.currentTime')}
          </div>
        ) : (
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono font-medium">{t('systemInfo.sandboxTime')}</span>
              <span className="text-sm font-bold font-mono text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                {formatTimeString(sandboxTime.timeString)}
              </span>
            </div>

            {/* Range Slider for minute-by-minute accurate dialing */}
            <input
              type="range"
              min="0"
              max="1439"
              step="5"
              value={getSliderValue()}
              onChange={handleSliderChange}
              className="w-full uppercase accent-indigo-600 cursor-ew-resize h-1.5 bg-slate-200 rounded-lg appearance-none"
              id="sandbox-time-slider"
            />

            {/* Quick Presets */}
            <div className="flex gap-1.5 pt-1">
              {[
                { label: '09:30 AM', time: '09:30', isWork: true },
                { label: '11:15 AM', time: '11:15', isWork: true },
                { label: '12:45 PM', time: '12:45', isWork: true },
                { label: '02:30 PM', time: '14:30', isWork: false },
              ].map((preset) => (
                <button
                  type="button"
                  onClick={() => setTimePreset(preset.time)}
                  className={`flex-1 text-[10px] py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-slate-200 rounded font-semibold font-mono text-slate-600 cursor-pointer ${
                    sandboxTime.timeString === preset.time ? 'ring-2 ring-indigo-600 border-transparent text-indigo-700' : ''
                  }`}
                  key={preset.label}
                  id={`preset-btn-${preset.time.replace(':', '')}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Consolidated Health */}
      <div className="pt-3 border-t border-slate-100" id="consolidated-health-stats">
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e1b4b] font-bold mb-3 flex items-center gap-1.5">
          📊 {t('systemInfo.title')}
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Logs */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-between" id="stat-card-total-logs">
            <span className="text-[10px] font-mono tracking-wider text-slate-405 font-bold uppercase leading-tight">{t('systemInfo.totalLogs')}</span>
            <span className="text-3xl font-display font-semibold text-slate-800 mt-2 font-mono leading-none">{totalLogs}</span>
          </div>

          {/* Authorized */}
          <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex flex-col justify-between" id="stat-card-auth">
            <span className="text-[10px] font-mono tracking-wider text-emerald-600 font-bold uppercase leading-tight">{t('systemInfo.authorizedLogs')}</span>
            <span className="text-3xl font-display font-semibold text-emerald-700 mt-2 font-mono leading-none">{authorizedLogs}</span>
          </div>

          {/* Blocked - Time */}
          <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl flex flex-col justify-between" id="stat-card-blocked-time">
            <span className="text-[10px] font-mono tracking-wider text-rose-500 font-bold uppercase leading-tight">{t('systemInfo.blockedTime')}</span>
            <span className="text-3xl font-display font-semibold text-rose-700 mt-2 font-mono leading-none">{blockedTimeLogs}</span>
          </div>

          {/* Blocked - OTP */}
          <div className="bg-amber-50 border border-amber-150 p-3 rounded-xl flex flex-col justify-between" id="stat-card-blocked-otp">
            <span className="text-[10px] font-mono tracking-wider text-amber-500 font-bold uppercase leading-tight font-sans">{t('systemInfo.blockedOtp')}</span>
            <span className="text-3xl font-display font-semibold text-amber-700 mt-2 font-mono leading-none">{blockedOtpLogs}</span>
          </div>
        </div>
      </div>

    </div>
  );
};