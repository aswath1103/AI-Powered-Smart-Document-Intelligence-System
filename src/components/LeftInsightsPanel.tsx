import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckSquare, 
  Square, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  FileCheck2,
  FileUp,
  Layers
} from 'lucide-react';
import { DocumentData, CitationReference, ActionItem } from '../types';
import { DocumentReader } from './DocumentReader';

interface LeftInsightsPanelProps {
  document: DocumentData;
  activeCitation: CitationReference | null;
  onClearCitation: () => void;
  onCitationClick: (citation: CitationReference) => void;
  onToggleAction: (actionId: string) => void;
  onAddAction: (action: Omit<ActionItem, 'id'>) => void;
  onFileUpload: (file: File) => void;
  onSelectBenchmark: (docId: string) => void;
  allDocuments: DocumentData[];
}

export const LeftInsightsPanel: React.FC<LeftInsightsPanelProps> = ({
  document,
  activeCitation,
  onClearCitation,
  onCitationClick,
  onToggleAction,
  onAddAction,
  onFileUpload,
  onSelectBenchmark,
  allDocuments,
}) => {
  const [viewMode, setViewMode] = useState<'insights' | 'source'>('insights');
  const [isDragOver, setIsDragOver] = useState(false);
  const [actionFilter, setActionFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddAction, setShowAddAction] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDeadline, setNewActionDeadline] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);

  const actions = document.actions || [];
  const completedCount = actions.filter((a) => a.completed).length;
  const progressPercent = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0;

  const filteredActions = actions.filter((a) => {
    if (actionFilter === 'pending') return !a.completed;
    if (actionFilter === 'completed') return a.completed;
    return true;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleExportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Smart Document Intelligence//Actions//EN\n`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    actions.forEach((act) => {
      icsContent += `BEGIN:VEVENT\nUID:${act.id}-${Date.now()}@doc-intel.ai\nDTSTAMP:${now}\nSUMMARY:${act.title} [${document.title}]\nDESCRIPTION:${act.description || ''}\\nSource: ${act.sourceCitation || 'Document'}\nSTATUS:${act.completed ? 'COMPLETED' : 'NEEDS-ACTION'}\nEND:VEVENT\n`;
    });
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/\s+/g, '_')}_Deadlines.ics`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleCopyMarkdown = () => {
    const md = `### 📋 Action Plan: ${document.title}\n\n` +
      actions.map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] **${a.title}**${a.deadline ? ` (Due: ${a.deadline})` : ''}\n   - ${a.description}\n   - Citation: ${a.sourceCitation || 'Document'}`).join('\n\n');
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCreateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    onAddAction({
      title: newActionTitle.trim(),
      description: 'Manually added operational task.',
      deadline: newActionDeadline.trim() || undefined,
      priority: 'high',
      completed: false,
      sourceCitation: 'Manual Entry',
    });
    setNewActionTitle('');
    setNewActionDeadline('');
    setShowAddAction(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Top Segmented Navigation Header */}
      <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('insights')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'insights'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Document Insights</span>
          </button>
          <button
            onClick={() => setViewMode('source')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'source'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Source Document</span>
          </button>
        </div>

        {/* Quick Benchmark Switcher */}
        <select
          value={document.id}
          onChange={(e) => onSelectBenchmark(e.target.value)}
          className="bg-slate-800/90 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 max-w-[190px] truncate cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          title="Switch benchmark document"
        >
          {allDocuments.map((doc) => (
            <option key={doc.id} value={doc.id} className="bg-slate-900 text-slate-200">
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'source' ? (
          <DocumentReader
            document={document}
            activeCitation={activeCitation}
            onClearCitation={onClearCitation}
          />
        ) : (
          <div className="p-4 sm:p-5 space-y-5">
            
            {/* 1. Modern Upload Dropzone for PDF/DOCX Files */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative group rounded-xl p-4 sm:p-5 border-2 border-dashed transition-all text-center cursor-pointer ${
                isDragOver
                  ? 'border-indigo-400 bg-indigo-950/30 ring-4 ring-indigo-500/20'
                  : 'border-slate-750 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.json"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">
                    Drop your PDF / DOCX file here, or <span className="text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automated Firestore Vector chunking, risk radar & grounded extraction
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Document Summary Card */}
            <div className="bg-slate-850/80 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-100 truncate" title={document.title}>
                    {document.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {document.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {document.summary || 'Executive synthesis not yet generated for this file.'}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                <span>📄 {document.pages.length} Pages</span>
                <span>·</span>
                <span>⚡ {document.chunks.length} Vector Chunks</span>
                <span>·</span>
                <span>📁 {document.fileSize}</span>
              </div>
            </div>

            {/* 3. "Things You Should Know" Alert Cards (Visually Distinct) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Things You Should Know (Proactive Alerts)</span>
                </h3>
                <span className="text-[10px] text-slate-500">Auto-audited</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                
                {/* 🔴 RED/CORAL FOR DEADLINES & IMPORTANT DATES */}
                {document.proactiveAlerts?.deadlines.map((item, idx) => (
                  <div
                    key={`red-${idx}`}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 to-slate-900/90 border border-rose-500/40 hover:border-rose-400 shadow-sm space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline Alert</span>
                      </div>
                      <button
                        onClick={() => {
                          const m = item.citation.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
                          onCitationClick({ page: m ? parseInt(m[1], 10) : 1, section: m ? m[2] || '' : '' });
                        }}
                        className="text-[10px] font-mono text-rose-300 hover:text-white bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 cursor-pointer"
                      >
                        [ 📄 {item.citation} ]
                      </button>
                    </div>

                    <div className="text-xs font-bold text-white">
                      {item.title}
                    </div>
                    <div className="text-xs font-bold text-rose-300">
                      🚨 Due: {item.valueOrDate}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong>Why it matters:</strong> {item.whyItMatters}
                    </p>
                  </div>
                ))}

                {/* 🟡 AMBER FOR WARNINGS & FINANCIAL OBLIGATIONS */}
                {document.proactiveAlerts?.financials.map((item, idx) => (
                  <div
                    key={`amber-${idx}`}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-900/90 border border-amber-500/40 hover:border-amber-400 shadow-sm space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Financial Obligation & Warning</span>
                      </div>
                      <button
                        onClick={() => {
                          const m = item.citation.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
                          onCitationClick({ page: m ? parseInt(m[1], 10) : 1, section: m ? m[2] || '' : '' });
                        }}
                        className="text-[10px] font-mono text-amber-300 hover:text-white bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 cursor-pointer"
                      >
                        [ 📄 {item.citation} ]
                      </button>
                    </div>

                    <div className="text-xs font-bold text-white">
                      {item.title}
                    </div>
                    <div className="text-xs font-bold text-amber-300">
                      ⚠️ Amount: {item.valueOrDate}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong>Why it matters:</strong> {item.whyItMatters}
                    </p>
                  </div>
                ))}

                {/* 🟢 GREEN/EMERALD FOR SUCCESS & CRITERIA REQUIREMENTS */}
                {document.proactiveAlerts?.requirements.map((item, idx) => (
                  <div
                    key={`green-${idx}`}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 shadow-sm space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Required Eligibility Criteria</span>
                      </div>
                      <button
                        onClick={() => {
                          const m = item.citation.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
                          onCitationClick({ page: m ? parseInt(m[1], 10) : 1, section: m ? m[2] || '' : '' });
                        }}
                        className="text-[10px] font-mono text-emerald-300 hover:text-white bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40 cursor-pointer"
                      >
                        [ 📄 {item.citation} ]
                      </button>
                    </div>

                    <div className="text-xs font-bold text-white">
                      {item.title}
                    </div>
                    <div className="text-xs font-medium text-emerald-300">
                      Criteria: {item.criteria || item.valueOrDate}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong>Requirement rationale:</strong> {item.whyItMatters}
                    </p>
                  </div>
                ))}

              </div>
            </div>

            {/* 4. Interactive Action Plan Checklist */}
            <div className="bg-slate-850/80 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Action Plan Checklist</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {completedCount} of {actions.length} completed ({progressPercent}%)
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyMarkdown}
                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                    title="Copy Checklist as Markdown"
                  >
                    {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleExportICS}
                    className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg border border-indigo-500/40 cursor-pointer"
                    title="Export deadlines to .ICS calendar"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setShowAddAction(true)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Action items with real interactive checkboxes */}
              <div className="space-y-2">
                {filteredActions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No actions in this view.</p>
                ) : (
                  filteredActions.map((act) => (
                    <div
                      key={act.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                        act.completed
                          ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => onToggleAction(act.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                      >
                        {act.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-medium ${
                              act.completed ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {act.title}
                          </span>
                          {act.deadline && (
                            <span className="text-[10px] font-mono text-amber-400 font-semibold shrink-0">
                              {act.deadline}
                            </span>
                          )}
                        </div>

                        {act.sourceCitation && (
                          <button
                            onClick={() => {
                              const m = act.sourceCitation?.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
                              onCitationClick({ page: m ? parseInt(m[1], 10) : 1, section: m ? m[2] || '' : '' });
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline mt-0.5 cursor-pointer block text-left"
                          >
                            {act.sourceCitation}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Action Modal Inline */}
              {showAddAction && (
                <form onSubmit={handleCreateActionSubmit} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Action task title..."
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Due date (e.g. Oct 15, 2026)"
                      value={newActionDeadline}
                      onChange={(e) => setNewActionDeadline(e.target.value)}
                      className="flex-1 bg-slate-800 text-slate-100 text-xs rounded p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddAction(false)}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
