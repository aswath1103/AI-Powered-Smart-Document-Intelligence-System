import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle, 
  FileWarning, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { DocumentHealthAudit, CitationReference } from '../types';

interface HealthRiskAuditProps {
  audit?: DocumentHealthAudit;
  onCitationClick: (citation: CitationReference) => void;
}

export const HealthRiskAudit: React.FC<HealthRiskAuditProps> = ({
  audit,
  onCitationClick,
}) => {
  if (!audit) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No health audit generated yet.</p>
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-lg space-y-7">
      
      {/* Header & Health Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Document Health & Risk Radar
            </h2>
            <span className="px-2 py-0.5 text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded font-medium">
              Capability 4
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated scrutiny for missing fields, hidden penalties, and clauses requiring human legal attention.
          </p>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-bold ${getScoreColor(audit.healthScore)}`}>
            <span className="text-lg leading-none">{audit.healthScore}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">/ 100</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Risk Profile: <span className="text-amber-400">{audit.riskLevel}</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-[200px] truncate">
              {audit.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Cautionary Language Compliance Banner */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2.5">
        <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-200">Professional Cautionary Standards:</strong>
          These insights highlight areas that may require your attention rather than providing definitive legal rulings. Always review flagged sections with qualified counsel.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Flags & Hidden Penalties */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Clauses Requiring Attention & Hidden Penalties</span>
          </div>

          <div className="space-y-3">
            {audit.riskFlags.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-lg text-xs text-slate-400 text-center border border-slate-800">
                No acute risk penalties identified.
              </div>
            ) : (
              audit.riskFlags.map((risk, idx) => (
                <div
                  key={idx}
                  className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-200">
                      {risk.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        risk.severity === 'alert'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/90 p-2.5 rounded border-l-2 border-amber-500">
                    "{risk.cautionaryExplanation}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 text-[11px] font-mono">
                      Location: {risk.section}
                    </span>
                    <button
                      onClick={() => onCitationClick(parseCitation(risk.citation))}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      <span>{risk.citation}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Fields & Information Gaps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <FileWarning className="w-4 h-4" />
            <span>Missing Fields & Critical Information Gaps</span>
          </div>

          <div className="space-y-3">
            {audit.missingFields.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-lg text-xs text-slate-400 text-center border border-slate-800">
                All expected baseline contract fields are present.
              </div>
            ) : (
              audit.missingFields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Missing: {field.field}</span>
                  </div>

                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Consequence:</strong> {field.consequence}
                  </div>

                  <div className="bg-slate-900 p-2 rounded text-xs text-indigo-300">
                    <strong className="text-indigo-200">Action:</strong> {field.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
