import React, { useState } from 'react';
import { Search, Shield, ShieldAlert, ShieldCheck, Trash2, ArrowUpDown, Smartphone, Monitor, Laptop } from 'lucide-react';
import { LoginAttempt } from '../types/types_s';
import { useLanguage } from '../context/LanguageContext';

interface DynamicJournalProps {
  attempts: LoginAttempt[];
  onClearLogs: () => void;
}

type FilterOption = 'ALL' | 'AUTHORIZED' | 'BLOCKED' | 'FAILED';

export const DynamicJournal: React.FC<DynamicJournalProps> = ({
  attempts,
  onClearLogs,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterOption>('ALL');

  // Handle filtering
  const filteredAttempts = attempts.filter((log) => {
    // Search query constraint
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      log.email.toLowerCase().includes(query) ||
      log.browser.toLowerCase().includes(query) ||
      log.os.toLowerCase().includes(query) ||
      log.device.toLowerCase().includes(query) ||
      log.ip.includes(query) ||
      log.status.toLowerCase().includes(query) ||
      log.reason.toLowerCase().includes(query);

    // Status category filter constraint
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'AUTHORIZED') {
      return matchesSearch && log.status === 'AUTHORIZED';
    }
    if (statusFilter === 'BLOCKED') {
      return matchesSearch && (log.status === 'BLOCKED_TIME' || log.status === 'BLOCKED_OTP');
    }
    if (statusFilter === 'FAILED') {
      return matchesSearch && log.status === 'FAILED_CREDENTIALS';
    }
    return matchesSearch;
  });

  const getStatusBadge = (status: LoginAttempt['status']) => {
    switch (status) {
      case 'AUTHORIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {t('systemInfo.authorized')}
          </span>
        );
      case 'BLOCKED_TIME':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {t('systemInfo.blockedTime')}
          </span>
        );
      case 'BLOCKED_OTP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {t('systemInfo.blockedOtp')}
          </span>
        );
      case 'FAILED_CREDENTIALS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {t('systemInfo.failedBadge')}
          </span>
        );
      case 'OTP_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            {t('systemInfo.otpBadge')}
          </span>
        );
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Mobile':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'Laptop':
        return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatDateString = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="verification-journal-panel">
      
      {/* Journal Header section */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-display font-semibold text-slate-800">
            {t('systemInfo.loginAttempts')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('systemInfo.loginAttempts')}
          </p>
        </div>

        {/* Search controls */}
        <div className="flex flex-wrap items-center gap-2" id="journal-search-controls">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 w-[200px]"
              id="search-query-field"
            />
          </div>

          {/* Filter Option dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterOption)}
            className="p-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            id="status-filter-select"
          >
            <option value="ALL">{t('systemInfo.loginAttempts')}</option>
            <option value="AUTHORIZED">{t('systemInfo.authorized')}</option>
            <option value="BLOCKED">{t('systemInfo.blocked')}</option>
            <option value="FAILED">{t('systemInfo.filterFailed')}</option>
          </select>

          {/* Clear Logs */}
          {attempts.length > 0 && (
            <button
              onClick={onClearLogs}
              title={t('systemInfo.clearLogs')}
              className="p-1 px-2 text-rose-600 hover:bg-rose-50 border border-rose-100 font-mono text-[10px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              id="clear-logs-btn"
            >
              <Trash2 className="w-3 h-3" />
              {t('systemInfo.clearLogs')}
            </button>
          )}
        </div>
      </div>

      {/* Attempts Table */}
      <div className="overflow-x-auto" id="attempts-history-table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              <th className="p-4 px-5">{t('systemInfo.loginDate')}</th>
              <th className="p-4">{t('systemInfo.email')}</th>
              <th className="p-4">{t('systemInfo.device')}</th>
              <th className="p-4">{t('systemInfo.colIp')}</th>
              <th className="p-4 text-right pr-5">{t('systemInfo.authorized')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 font-sans" id="empty-table-state">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <ShieldAlert className="w-8 h-8 text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-500 mb-1 text-sm">{t('systemInfo.noAttempts')}</p>
                    <p className="text-xs text-slate-400 leading-relaxed text-center">
                      {t('systemInfo.login')} {t('systemInfo.loginAttempts')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAttempts.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors" id={`log-row-${log.id}`}>
                  {/* Logged Date & Time */}
                  <td className="p-4 px-5 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateString(log.timestamp)}
                  </td>

                  {/* Registered Account */}
                  <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                    {log.email}
                  </td>

                  {/* Metadata Profile info */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-650">
                        {getDeviceIcon(log.device)}
                        <span className="font-sans font-medium">{log.device}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                          {log.os}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {t('systemInfo.browser')}: <span className="text-indigo-600 font-medium">{log.browser}</span>
                      </div>
                      {log.reason && (
                        <div className="text-[10px] text-slate-400 line-clamp-1 italic max-w-[260px]">
                          {log.reason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Host IP Address */}
                  <td className="p-4 font-mono text-slate-500">
                    {log.ip}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-right pr-5 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics bar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-150 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold flex justify-between items-center px-5" id="journal-footer">
        <span>{t('systemInfo.totalLogs')} {filteredAttempts.length} OF {attempts.length} {t('systemInfo.loginAttempts')}</span>
        {filteredAttempts.length > 0 && <span className="text-indigo-600">{t('systemInfo.authorized')}</span>}
      </div>

    </div>
  );
};