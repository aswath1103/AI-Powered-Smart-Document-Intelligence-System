import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  ExternalLink, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { DocumentData, CitationReference } from '../types';

interface DocumentReaderProps {
  document: DocumentData;
  activeCitation?: CitationReference | null;
  onClearCitation?: () => void;
  onAskAboutSection?: (sectionHeading: string, text: string) => void;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({
  document,
  activeCitation,
  onClearCitation,
  onAskAboutSection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-scroll when activeCitation changes
  useEffect(() => {
    if (activeCitation) {
      // Find matching section key
      const key = `page-${activeCitation.page}-${activeCitation.section.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const targetElement = sectionRefs.current[key];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeCitation]);

  const filteredPages = document.pages.filter((p) =>
    selectedPage === 'all' ? true : p.pageNumber === selectedPage
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      
      {/* Top Document Controls Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-100 truncate" title={document.title}>
            {document.title}
          </h2>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
            {document.pages.length} Pages · {document.chunks.length} Firestore Chunks
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Page Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 hidden sm:inline">Page:</span>
            <button
              onClick={() => setSelectedPage('all')}
              className={`px-2 py-1 rounded text-xs cursor-pointer ${
                selectedPage === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {document.pages.map((p) => (
              <button
                key={p.pageNumber}
                onClick={() => setSelectedPage(p.pageNumber)}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  selectedPage === p.pageNumber
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Active Citation Notification Banner */}
      {activeCitation && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Focused Citation: <strong>Page {activeCitation.page}, {activeCitation.section}</strong>
            </span>
          </div>
          <button
            onClick={onClearCitation}
            className="text-amber-400 hover:text-amber-200 text-xs underline cursor-pointer"
          >
            Clear Highlight
          </button>
        </div>
      )}

      {/* Document Body & Pages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/40">
        {filteredPages.map((page) => (
          <div
            key={page.pageNumber}
            className="relative bg-slate-900/90 border border-slate-800/90 rounded-lg p-5 sm:p-7 shadow-sm transition-all"
          >
            {/* Page Header Ribbon */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-[11px] text-slate-500">
                Document Page {page.pageNumber} of {document.pages.length}
              </span>
              <span className="text-[11px] text-slate-500">
                {document.category}
              </span>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {page.sections.map((section) => {
                const secKey = `page-${page.pageNumber}-${section.heading.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                const isCited =
                  activeCitation &&
                  activeCitation.page === page.pageNumber &&
                  (activeCitation.section.toLowerCase().includes(section.heading.toLowerCase()) ||
                    section.heading.toLowerCase().includes(activeCitation.section.toLowerCase()));

                // Highlight search term if present
                const renderTextWithHighlights = (content: string) => {
                  if (!searchTerm.trim()) return content;
                  const parts = content.split(new RegExp(`(${searchTerm})`, 'gi'));
                  return parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                      <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 rounded">
                        {part}
                      </mark>
                    ) : (
                      part
                    )
                  );
                };

                return (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionRefs.current[secKey] = el;
                    }}
                    className={`group rounded-lg p-3.5 transition-all ${
                      isCited
                        ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-lg shadow-amber-500/5'
                        : 'hover:bg-slate-850/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400">§ {section.heading}</span>
                        {isCited && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-normal">
                            Cited in Grounded Context
                          </span>
                        )}
                      </h3>

                      {onAskAboutSection && (
                        <button
                          onClick={() => onAskAboutSection(section.heading, section.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                          title="Ask AI to analyze this clause"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Ask AI</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {renderTextWithHighlights(section.text)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
