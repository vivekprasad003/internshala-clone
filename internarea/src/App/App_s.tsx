import { useState, useEffect } from 'react';
import { SystemInfoSidebar } from '../Components/SystemInfoSidebar';
import { UserEntryGate } from '../Components/UserEntryGate';
import { DynamicJournal } from '../Components/DynamicJournal';
import { ActivePolicies } from '../Components/ActivePolicies';
import { DeviceType, OperatingSystem, BrowserType, UserProfile, LoginAttempt, SandboxTime } from '../types/types_s';
import { useLanguage } from '../context/LanguageContext';

// Initial pre-seeded users
const PRE_SEEDED_USERS: UserProfile[] = [
  {
    email: 'demo@example.com',
    fullName: 'Demo Representative',
    passwordHash: 'password123',
    enrolledAt: '03/12/2026',
  }
];

export default function App() {
  const { t } = useLanguage();
  // Simulator state configurations
  const [device, setDevice] = useState<DeviceType>('Laptop');
  const [os, setOs] = useState<OperatingSystem>('macOS');
  const [browser, setBrowser] = useState<BrowserType>('Google Chrome');
  
  // Custom Time Setup
  const [sandboxTime, setSandboxTime] = useState<SandboxTime>({
    enabled: false,
    timeString: '11:00', // Default within 10:00 AM - 01:00 PM mobile allowance
  });

  // Current real device clock representation (ticks every minute if sandbox disabled)
  const [deviceTime, setDeviceTime] = useState<string>('12:00');

  useEffect(() => {
    const updateRealDeviceTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setDeviceTime(`${hrs}:${mins}`);
    };
    
    // Initial and periodic update
    updateRealDeviceTime();
    const interval = setInterval(updateRealDeviceTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to extract active simulation clock 24-hour string (either sandbox or real device clock)
  const getCurrentTime24 = (): string => {
    if (sandboxTime.enabled) {
      return sandboxTime.timeString;
    }
    return deviceTime;
  };

  // States initialized with defaults for SSR compatibility
  const [users, setUsers] = useState<UserProfile[]>(PRE_SEEDED_USERS);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted data on client-side mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUsers = localStorage.getItem('gatekeeper_users');
        if (storedUsers) setUsers(JSON.parse(storedUsers));

        const storedAttempts = localStorage.getItem('gatekeeper_attempts');
        if (storedAttempts) setAttempts(JSON.parse(storedAttempts));
      } catch (e) {
        console.error('Failed to restore portal state:', e);
      }
      setIsInitialized(true);
    }
  }, []);

  // Persist states only after initialization to avoid overwriting storage with empty defaults
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('gatekeeper_users', JSON.stringify(users));
    }
  }, [users, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('gatekeeper_attempts', JSON.stringify(attempts));
    }
  }, [attempts, isInitialized]);

  // Handlers
  const handleEnrollUser = (newUser: UserProfile) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleRecordAttempt = (newAttempt: Omit<LoginAttempt, 'id' | 'timestamp'>) => {
    const log: LoginAttempt = {
      ...newAttempt,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    setAttempts((prev) => [log, ...prev]);
  };

  const handleClearLogs = () => {
    setAttempts([]);
  };

  const handleSuccessAuth = () => {
    // Optional additional side-effects for successful access verification
  };

  // Metrics aggregators
  const totalLogs = attempts.length;
  const authorizedLogs = attempts.filter(a => a.status === 'AUTHORIZED').length;
  const blockedTimeLogs = attempts.filter(a => a.status === 'BLOCKED_TIME').length;
  const blockedOtpLogs = attempts.filter(a => a.status === 'BLOCKED_OTP' || a.status === 'FAILED_CREDENTIALS').length;

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 selection:bg-indigo-100 p-4 md:p-8" id="root-portal-view">
      <div className="max-w-[1536px] mx-auto w-full">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="dashboard-grid-container">
          
          {/* Left Column: Sandbox Simulator Settings (Width: 3 lg cols / 4 md-ish cols) */}
          <div className="lg:col-span-4 xl:col-span-3" id="left-column-wrapper">
            <SystemInfoSidebar
              device={device}
              setDevice={setDevice}
              os={os}
              setOs={setOs}
              browser={browser}
              setBrowser={setBrowser}
              sandboxTime={sandboxTime}
              setSandboxTime={setSandboxTime}
              totalLogs={totalLogs}
              authorizedLogs={authorizedLogs}
              blockedTimeLogs={blockedTimeLogs}
              blockedOtpLogs={blockedOtpLogs}
            />
          </div>

          {/* Center Column: Access Gates and Logs (Width: 5-6 cols) */}
          <div className="lg:col-span-8 xl:col-span-6 flex flex-col gap-6" id="center-column-wrapper">
            <UserEntryGate
              device={device}
              os={os}
              browser={browser}
              getCurrentTime24={getCurrentTime24}
              users={users}
              onEnrollUser={handleEnrollUser}
              onRecordAttempt={handleRecordAttempt}
              onSuccessAuth={handleSuccessAuth}
            />
            
            <DynamicJournal
              attempts={attempts}
              onClearLogs={handleClearLogs}
            />
          </div>

          {/* Right Column: Policies and Timeline (Width: 3 cols) */}
          <div className="lg:col-span-12 xl:col-span-3" id="right-column-wrapper">
            <ActivePolicies
              currentSimulatedTime={getCurrentTime24()}
              isMobileLocked={device === 'Mobile'}
            />
          </div>

        </div>

      </div>
    </div>
  );
}