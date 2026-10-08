import React from 'react';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  FileCheck, 
  AlertTriangle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ProactiveAlerts, CitationReference } from '../types';

interface ProactiveAlertsPanelProps {
  alerts?: ProactiveAlerts;
  onCitationClick: (citation: CitationReference) => void;
}

export const ProactiveAlertsPanel: React.FC<ProactiveAlertsPanelProps> = ({
  alerts,
  onCitationClick,
}) => {
  if (!alerts) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No proactive alerts generated yet.</p>
      </div>
    );
  }

  const parseCitation = (citStr: string): CitationReference => {
    const m = citStr.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
    return {
      page: m ? parseInt(m[1], 10) : 1,
      section: m ? m[2]?.trim() || '' : '',
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-lg space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            Things You Should Know (Proactive Alerts)
          </h2>
          <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-medium">
            Capability 2
          </span>
        </div>
        <p className="text-xs text-slate-400">
          The 3 critical insight vectors every document recipient must know before signing or acting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vector 1: Deadlines & Dates */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-4 pb-2 border-b border-slate-800">
              <Calendar className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">
                1. Deadlines & Dates
              </h3>
            </div>

            <div className="space-y-4">
              {alerts.deadlines.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {item.title}
                  </div>
                  <div className="text-sm font-bold text-amber-300 mb-2">
                    {item.valueOrDate}
                  </div>
                  <div className="bg-slate-950/60 rounded p-2 text-xs text-slate-300 mb-2 border-l-2 border-amber-500">
                    <span className="font-semibold text-amber-400/90 block mb-0.5">Why it matters:</span>
                    {item.whyItMatters}
                  </div>
                  <button
                    onClick={() => onCitationClick(parseCitation(item.citation))}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    <span>{item.citation}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vector 2: Financial Obligations & Amounts */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-4 pb-2 border-b border-slate-800">
              <DollarSign className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">
                2. Financial Obligations & Amounts
              </h3>
            </div>

            <div className="space-y-4">
              {alerts.financials.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {item.title}
                  </div>
                  <div className="text-sm font-bold text-emerald-300 mb-2">
                    {item.valueOrDate}
                  </div>
                  <div className="bg-slate-950/60 rounded p-2 text-xs text-slate-300 mb-2 border-l-2 border-emerald-500">
                    <span className="font-semibold text-emerald-400/90 block mb-0.5">Why it matters:</span>
                    {item.whyItMatters}
                  </div>
                  <button
                    onClick={() => onCitationClick(parseCitation(item.citation))}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    <span>{item.citation}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vector 3: Required Documents & Specific Criteria */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-4 pb-2 border-b border-slate-800">
              <FileCheck className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">
                3. Required Documents & Criteria
              </h3>
            </div>

            <div className="space-y-4">
              {alerts.requirements.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs font-mono text-indigo-300 mb-2">
                    {item.criteria}
                  </div>
                  <div className="bg-slate-950/60 rounded p-2 text-xs text-slate-300 mb-2 border-l-2 border-indigo-500">
                    <span className="font-semibold text-indigo-400/90 block mb-0.5">Why it matters:</span>
                    {item.whyItMatters}
                  </div>
                  <button
                    onClick={() => onCitationClick(parseCitation(item.citation))}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    <span>{item.citation}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
