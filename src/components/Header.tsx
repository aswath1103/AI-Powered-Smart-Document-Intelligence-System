import React from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckSquare, 
  ShieldAlert, 
  Database, 
  Bell, 
  Layers,
  ChevronDown,
  Mic
} from 'lucide-react';
import { DocumentData } from '../types';

interface HeaderProps {
  documents: DocumentData[];
  selectedDoc: DocumentData;
  onSelectDoc: (doc: DocumentData) => void;
  onOpenUpload: () => void;
  onOpenAudioTranscribe: () => void;
  activeTab: 'workbench' | 'actions' | 'alerts' | 'health' | 'vector';
  setActiveTab: (tab: 'workbench' | 'actions' | 'alerts' | 'health' | 'vector') => void;
  actionCount: number;
  pendingActionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onOpenUpload,
  onOpenAudioTranscribe,
  activeTab,
  setActiveTab,
  actionCount,
  pendingActionCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Architecture Tag */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white truncate">
                  Smart Document Intelligence
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                  Firebase Vector Search
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Document → Understanding → Insights → Decisions → Actions
              </p>
            </div>
          </div>

          {/* Document Selector & Upload */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <select
                value={selectedDoc.id}
                onChange={(e) => {
                  const found = documents.find((d) => d.id === e.target.value);
                  if (found) onSelectDoc(found);
                }}
                className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-2 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-slate-900 text-slate-100 py-1">
                    {doc.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenAudioTranscribe}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
              title="Transcribe speech with microphone using gemini-3.5-transcribe"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Transcribe Voice</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
              title="Upload new document"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Ingest Document</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'workbench'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Workbench & Grounded AI
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'actions'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Action Checklist
            {pendingActionCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                {pendingActionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'alerts'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            Things You Should Know
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'health'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Health & Risk Audit
          </button>

          <button
            onClick={() => setActiveTab('vector')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === 'vector'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            Firestore Vector Chunks
          </button>
        </div>
      </div>
    </header>
  );
};
