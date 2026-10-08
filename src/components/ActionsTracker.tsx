import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Filter,
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import { ActionItem, CitationReference } from '../types';

interface ActionsTrackerProps {
  documentTitle: string;
  actions: ActionItem[];
  onToggleAction: (id: string) => void;
  onAddAction: (action: Omit<ActionItem, 'id'>) => void;
  onCitationClick: (citation: CitationReference) => void;
}

export const ActionsTracker: React.FC<ActionsTrackerProps> = ({
  documentTitle,
  actions,
  onToggleAction,
  onAddAction,
  onCitationClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');

  const completedCount = actions.filter((a) => a.completed).length;
  const progressPercent = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0;

  const filteredActions = actions.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    if (filter === 'high') return item.priority === 'high';
    return true;
  });

  // Export to standard iCalendar (.ics) format
  const handleExportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Smart Document Intelligence//Actions//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    actions.forEach((act) => {
      // Basic event generation
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:${act.id}-${Date.now()}@document-intelligence.ai\n`;
      icsContent += `DTSTAMP:${now}\n`;
      icsContent += `SUMMARY:${act.title} [${documentTitle}]\n`;
      icsContent += `DESCRIPTION:${act.description || ''}\\nSource: ${act.sourceCitation || 'Document'}\n`;
      icsContent += `STATUS:${act.completed ? 'COMPLETED' : 'NEEDS-ACTION'}\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.replace(/\s+/g, '_')}_Action_Deadlines.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMarkdown = () => {
    const md = `### Action Checklist: ${documentTitle}\n\n` +
      actions.map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] **${a.title}**${a.deadline ? ` (Due: ${a.deadline})` : ''}\n   - ${a.description}\n   - Citation: ${a.sourceCitation || 'General'}`).join('\n\n');

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddAction({
      title: newTitle.trim(),
      description: newDesc.trim(),
      deadline: newDeadline.trim() || undefined,
      priority: newPriority,
      completed: false,
      sourceCitation: 'Manual Entry',
    });
    setNewTitle('');
    setNewDesc('');
    setNewDeadline('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-lg space-y-6">
      
      {/* Header and Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Document-to-Action Checklist
            </h2>
            <span className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded font-medium">
              Capability 1
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Transforming clauses and requirements into trackable operational steps.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleExportICS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/40 transition-colors cursor-pointer"
            title="Download .ics calendar events for these deadlines"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Calendar (.ICS)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Filter Pills */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">
              Checklist Progress: {completedCount} of {actions.length} completed
            </span>
            <span className="font-mono text-indigo-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['all', 'pending', 'completed', 'high'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                filter === mode
                  ? 'bg-slate-750 text-white border border-slate-650'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {mode === 'high' ? 'High Priority' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <BookmarkCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No actions matching current filter.</p>
          </div>
        ) : (
          filteredActions.map((action, index) => (
            <div
              key={action.id}
              className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
                action.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleAction(action.id)}
                className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                {action.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                )}
              </button>

              {/* Action Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 font-medium">
                      #{index + 1}
                    </span>
                    <h3
                      className={`text-sm font-semibold ${
                        action.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {action.title}
                    </h3>
                  </div>

                  {/* Priority Tag */}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      action.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : action.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {action.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {action.description}
                </p>

                {/* Footer Meta: Deadlines, Requirements, Source Citations */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {action.deadline && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Due: <strong>{action.deadline}</strong></span>
                    </div>
                  )}

                  {action.requiredDocuments && action.requiredDocuments.length > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Requires: {action.requiredDocuments.join(', ')}</span>
                    </div>
                  )}

                  {action.sourceCitation && (
                    <button
                      onClick={() => {
                        const m = action.sourceCitation?.match(/Page\s*(\d+)(?:,\s*Section\s*(.*))?/i);
                        if (m) {
                          onCitationClick({
                            page: parseInt(m[1], 10),
                            section: m[2] || '',
                          });
                        }
                      }}
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      <span>{action.sourceCitation}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Add Custom Action Item</h3>
            <form onSubmit={handleCreateAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Request certified income transcript"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs border border-slate-700 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description / Specifics
                </label>
                <textarea
                  placeholder="Specific details or submission portal address"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs border border-slate-700 focus:ring-1 focus:ring-indigo-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Deadline Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Oct 15, 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs border border-slate-700 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs border border-slate-700 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
