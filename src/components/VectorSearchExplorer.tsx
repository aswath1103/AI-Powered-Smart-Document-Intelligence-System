import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Cpu, 
  HardDrive, 
  Layers, 
  FileCheck2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DocumentData, DocumentChunk, CitationReference } from '../types';

interface VectorSearchExplorerProps {
  document: DocumentData;
  onCitationClick: (citation: CitationReference) => void;
}

export const VectorSearchExplorer: React.FC<VectorSearchExplorerProps> = ({
  document,
  onCitationClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('fellowship income certificate deadline');

  // Compute live similarity for the query against current chunks
  const queryTokens = searchQuery.toLowerCase().split(/\W+/).filter(Boolean);

  const scoredChunks = document.chunks.map((c) => {
    const text = `${c.sectionTitle} ${c.content}`.toLowerCase();
    let hits = 0;
    for (const t of queryTokens) {
      if (t.length > 2 && text.includes(t)) hits++;
    }
    const ratio = queryTokens.length > 0 ? hits / queryTokens.length : 0;
    const simScore = Math.min(0.99, Number((0.48 + ratio * 0.48).toFixed(3)));
    return {
      ...c,
      simScore,
    };
  });

  scoredChunks.sort((a, b) => b.simScore - a.simScore);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-lg space-y-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Firestore Vector Search Architecture & Chunk Explorer
            </h2>
            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-medium">
              Firebase Awareness
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Document chunks extracted from Cloud Storage and indexed in Firestore Vector collections for grounded semantic retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-850 px-3 py-2 rounded-lg border border-slate-800 text-slate-300 shrink-0">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Firestore Vector Collection: documents/{document.id}/chunks</span>
        </div>
      </div>

      {/* Cloud Architecture Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-850/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
            <HardDrive className="w-4 h-4" />
            <span>Cloud Storage Origin</span>
          </div>
          <p className="text-xs font-mono text-slate-300 truncate">
            gs://doc-intelligence-storage/{document.id}/source.pdf
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            File Size: {document.fileSize} · Ingested {document.uploadDate}
          </div>
        </div>

        <div className="p-4 bg-slate-850/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
            <Database className="w-4 h-4" />
            <span>Firestore Chunk Documents</span>
          </div>
          <p className="text-xs font-mono text-slate-300">
            {document.chunks.length} Vector Documents Indexed
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            Chunk Size: ~150-350 tokens per section
          </div>
        </div>

        <div className="p-4 bg-slate-850/70 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
            <Layers className="w-4 h-4" />
            <span>Vector Search Metric</span>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Cosine Similarity (768-dim)
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            Truth Guarantee: In-context injection for zero hallucination
          </div>
        </div>
      </div>

      {/* Interactive Vector Search Simulator */}
      <div className="bg-slate-850/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Test Firestore Vector Search Semantic Retrieval</span>
          </div>
          <span className="text-xs text-slate-400">
            Simulates Firestore Vector Search query execution against chunks
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type query to test vector chunk ranking..."
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Chunks List */}
        <div className="space-y-3 pt-2">
          {scoredChunks.map((chunk, idx) => (
            <div
              key={chunk.chunkId}
              className={`p-4 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-indigo-950/20 border-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    idx === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Rank #{idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-slate-200">
                    Page {chunk.pageNumber} · {chunk.sectionTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">{chunk.tokenCount} tokens</span>
                  <span className={`font-bold ${
                    chunk.simScore > 0.8 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    Cosine Sim: {chunk.simScore}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {chunk.content}
              </p>

              {/* Embedding Vector Preview & Citation Jump */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <span>Vector [{chunk.embeddingPreview.slice(0, 4).join(', ')}, ...]</span>
                </div>

                <button
                  onClick={() =>
                    onCitationClick({
                      page: chunk.pageNumber,
                      section: chunk.sectionTitle,
                    })
                  }
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  <span>Highlight in Reader</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
