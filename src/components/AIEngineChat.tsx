import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckSquare, 
  ShieldAlert, 
  Database, 
  FileCheck2, 
  ArrowRight, 
  Copy, 
  Check, 
  Layers,
  HelpCircle,
  Clock,
  DollarSign,
  Mic,
  Square,
  Loader2,
  Radio
} from 'lucide-react';
import { DocumentData, ChatMessage, CitationReference, ActionItem } from '../types';

interface AIEngineChatProps {
  document: DocumentData;
  messages: ChatMessage[];
  onSendMessage: (query: string) => Promise<void>;
  isLoading: boolean;
  onCitationClick: (citation: CitationReference) => void;
  onAddExtractedActions?: (actions: ActionItem[]) => void;
  onOpenTranscribeModal?: () => void;
}

export const AIEngineChat: React.FC<AIEngineChatProps> = ({
  document,
  messages,
  onSendMessage,
  isLoading,
  onCitationClick,
  onAddExtractedActions,
  onOpenTranscribeModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedChunkMsgId, setExpandedChunkMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In-line microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const startInlineRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await transcribeAudioBlob(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access failed:', err);
      alert('Microphone access denied or unavailable. Please check browser permissions.');
      setIsRecording(false);
    }
  };

  const stopInlineRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const resp = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: blob.type || mimeType || 'audio/webm',
        }),
      });

      if (!resp.ok) {
        throw new Error('Transcription server error');
      }

      const data = await resp.json();
      if (data.transcript) {
        setInputText((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const query = inputText.trim();
    setInputText('');
    await onSendMessage(query);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Parse text into rendered markdown-like elements with clickable citations, tables, callouts & checklists
  const renderFormattedMessage = (content: string) => {
    // Helper to format inline text (bolding, source badges, code)
    const renderInlineFormatted = (raw: string) => {
      // Split for bold markdown **text**
      const boldParts = raw.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          const boldContent = bPart.slice(2, -2);
          return (
            <strong key={bIdx} className="font-semibold text-amber-300">
              {boldContent}
            </strong>
          );
        }

        // Match Source Badges like `[ 📄 Page 3 | Sec 2 ]` or `[ 📄 Page 1 ]` or `Page 1, Section 2` or `[Page 1, Section 2]`
        const citationBadgeRegex = /(?:`?\[\s*📄?\s*Page\s*(\d+)(?:\s*(?:\||,)\s*(?:Sec\s*|Section\s*)?([^\]`]+))?\s*\]`?|Page\s*(\d+)(?:,\s*Section\s*([^.,;\n\]]+))?)/gi;
        const subParts = bPart.split(citationBadgeRegex);

        // If split didn't find citations, return normal text
        if (subParts.length === 1) {
          return <span key={bIdx}>{bPart}</span>;
        }

        // Re-parse with regex match iterator for precision
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        const matches = [...bPart.matchAll(citationBadgeRegex)];

        matches.forEach((m, mIdx) => {
          const matchStart = m.index ?? 0;
          if (matchStart > lastIndex) {
            elements.push(<span key={`txt-${mIdx}`}>{bPart.slice(lastIndex, matchStart)}</span>);
          }

          const pageNum = parseInt(m[1] || m[3] || '1', 10);
          const sectionName = (m[2] || m[4] || '').trim();
          const badgeLabel = `📄 Page ${pageNum}${sectionName ? ` | Sec ${sectionName}` : ''}`;

          elements.push(
            <button
              key={`badge-${mIdx}`}
              type="button"
              onClick={() => onCitationClick({ page: pageNum, section: sectionName })}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 text-[11px] font-mono bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 rounded transition-colors cursor-pointer align-baseline shadow-sm"
              title="Click to jump and highlight in document reader"
            >
              <span>[ {badgeLabel} ]</span>
            </button>
          );

          lastIndex = matchStart + m[0].length;
        });

        if (lastIndex < bPart.length) {
          elements.push(<span key="tail">{bPart.slice(lastIndex)}</span>);
        }

        return <span key={bIdx}>{elements}</span>;
      });
    };

    // Pre-process into structured blocks: tables, blockquotes/callouts, checklists, paragraphs
    const lines = content.split('\n');
    const blocks: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Markdown Table Detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          // Parse header and rows (skipping delimiter row with :---)
          const parseRow = (r: string) =>
            r
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim());

          const headerCells = parseRow(tableLines[0]);
          const dataRows = tableLines
            .slice(1)
            .filter((r) => !r.includes('---'))
            .map(parseRow);

          blocks.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-slate-750 bg-slate-900/90 shadow-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/90 border-b border-slate-700 text-slate-200">
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 font-semibold tracking-wide text-indigo-300">
                        {renderInlineFormatted(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-850/60 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-300">
                          {renderInlineFormatted(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 2. Callout Cards (Blockquotes `>`)
      if (line.trim().startsWith('>')) {
        const calloutLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          calloutLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }

        const calloutText = calloutLines.join('\n');
        const isAlert = calloutText.includes('🚨') || calloutText.toLowerCase().includes('critical');
        const isWarning = calloutText.includes('⚠️') || calloutText.toLowerCase().includes('requirement');

        blocks.push(
          <div
            key={`callout-${i}`}
            className={`my-3 p-3.5 rounded-xl border-l-4 shadow-md transition-all ${
              isAlert
                ? 'bg-rose-950/25 border-rose-500 text-rose-200'
                : isWarning
                ? 'bg-amber-950/25 border-amber-500 text-amber-200'
                : 'bg-indigo-950/25 border-indigo-500 text-indigo-200'
            }`}
          >
            {calloutLines.map((cLine, cIdx) => (
              <div key={cIdx} className="text-xs sm:text-sm leading-relaxed">
                {renderInlineFormatted(cLine)}
              </div>
            ))}
          </div>
        );
        continue;
      }

      // 3. Action Plan Checklists (`- [ ]` or `- [x]`)
      const checkMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (checkMatch) {
        const isChecked = checkMatch[1].toLowerCase() === 'x';
        const taskText = checkMatch[2];

        blocks.push(
          <div key={`check-${i}`} className="flex items-start gap-2.5 my-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="mt-0.5 text-indigo-400 shrink-0">
              {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-400" />}
            </span>
            <div className={`text-xs sm:text-sm flex-1 ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {renderInlineFormatted(taskText)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 4. Headers (`### ...`, `## ...`, `# ...`)
      if (line.startsWith('#')) {
        const cleanHeader = line.replace(/^#{1,3}\s+/, '');
        blocks.push(
          <h4 key={`header-${i}`} className="font-semibold text-slate-100 text-sm mt-3 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {renderInlineFormatted(cleanHeader)}
          </h4>
        );
        i++;
        continue;
      }

      // 5. Numbered List (`1. ...`)
      const orderMatch = line.match(/^(\d+\.)\s*(.*)$/);
      if (orderMatch) {
        blocks.push(
          <div key={`order-${i}`} className="flex items-start gap-2 pl-1 py-0.5">
            <span className="font-mono text-indigo-400 font-semibold text-xs shrink-0 mt-0.5">
              {orderMatch[1]}
            </span>
            <div className="flex-1 text-xs sm:text-sm">
              {renderInlineFormatted(orderMatch[2])}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 6. Regular Bullet List (`- ...` or `* ...`)
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^[-*]\s+/, '');
        blocks.push(
          <div key={`bullet-${i}`} className="flex items-start gap-2 pl-2 py-0.5">
            <span className="text-amber-400 shrink-0 mt-1 text-xs">•</span>
            <div className="flex-1 text-xs sm:text-sm">
              {renderInlineFormatted(bulletText)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 7. Regular Paragraph or Empty line
      if (!line.trim()) {
        blocks.push(<div key={`spacer-${i}`} className="h-1" />);
      } else {
        blocks.push(
          <p key={`para-${i}`} className="text-xs sm:text-sm leading-relaxed">
            {renderInlineFormatted(line)}
          </p>
        );
      }
      i++;
    }

    return <div className="space-y-1.5 text-slate-200">{blocks}</div>;
  };

  const quickPrompts = [
    {
      label: 'Extract Action Checklist',
      icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />,
      query: 'What are my next steps based on this document? Extract clear, actionable steps formatted as a checklist.',
    },
    {
      label: '3 Things You Should Know',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      query: 'Summarize the document and provide 3 Things You Should Know covering Deadlines & Dates, Financial obligations, and Required criteria.',
    },
    {
      label: 'Health & Risk Audit',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      query: 'Audit this document for health and risk flags. Point out missing fields, conflicting information, or sections that require human attention.',
    },
    {
      label: 'Financials & Penalties',
      icon: <DollarSign className="w-3.5 h-3.5 text-blue-400" />,
      query: 'What are all the financial obligations, deposits, fees, and penalties stipulated in this document?',
    },
    {
      label: 'Critical Deadlines',
      icon: <Clock className="w-3.5 h-3.5 text-purple-400" />,
      query: 'What are all the strict deadlines, cutoffs, and notification windows in this document?',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      
      {/* AI Persona Header */}
      <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Document Intelligence Engine</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium">
                <FileCheck2 className="w-3 h-3" />
                Grounded Truth
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Querying Firestore Vector Chunks · Zero Hallucination Mode
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>{document.chunks.length} Vector Embeddings</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-4 transition-all ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-850/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[11px] text-slate-400">
                <span className="font-semibold text-indigo-300">
                  {msg.role === 'user' ? 'You' : 'Document Intelligence AI'}
                </span>
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content */}
              {renderFormattedMessage(msg.content)}

              {/* Assistant Footer: Firestore Vector Chunks Drawer */}
              {msg.role === 'assistant' && msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
                  <button
                    onClick={() =>
                      setExpandedChunkMsgId(
                        expandedChunkMsgId === msg.id ? null : msg.id
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-medium"
                  >
                    <Database className="w-3 h-3" />
                    <span>
                      {expandedChunkMsgId === msg.id ? 'Hide' : 'Inspect'} {msg.retrievedChunks.length} Firestore Vector Chunks Used
                    </span>
                  </button>

                  {expandedChunkMsgId === msg.id && (
                    <div className="mt-2 space-y-2 bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
                      {msg.retrievedChunks.map((chunk, cIdx) => (
                        <div
                          key={chunk.chunkId}
                          className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-indigo-300 mb-1">
                            <span className="font-mono">
                              Chunk #{cIdx + 1}: Page {chunk.pageNumber} · {chunk.sectionTitle}
                            </span>
                            <span className="font-mono text-emerald-400">
                              Sim: {chunk.similarityScore}
                            </span>
                          </div>
                          <p className="text-slate-400 line-clamp-2 italic">
                            "{chunk.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-850 border border-slate-800 rounded-xl rounded-tl-none p-4 max-w-[85%]">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Retrieving Firestore Vector Search context & grounding facts...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-900/80 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Quick Queries:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(qp.query)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs rounded-full border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
          >
            {qp.icon}
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Recording or Transcribing Status Banner */}
      {isRecording && (
        <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-medium">
              Listening to microphone... ({recordSeconds < 10 ? `00:0${recordSeconds}` : `00:${recordSeconds}`})
            </span>
            <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 text-rose-200">
              gemini-3.5-transcribe
            </span>
          </div>
          <button
            type="button"
            onClick={stopInlineRecording}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>Stop & Transcribe</span>
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="px-4 py-2 bg-indigo-500/15 border-t border-indigo-500/30 flex items-center gap-2 text-xs text-indigo-300">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Transcribing voice with <strong>gemini-3.5-transcribe</strong>...</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isRecording
              ? 'Recording speech from microphone...'
              : `Ask the Document Intelligence AI about "${document.title.slice(0, 26)}..."`
          }
          disabled={isLoading || isRecording || isTranscribing}
          className="flex-1 bg-slate-800/90 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-lg px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={isRecording ? stopInlineRecording : startInlineRecording}
          disabled={isLoading || isTranscribing}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
          } disabled:opacity-50`}
          title={isRecording ? 'Stop recording & transcribe' : 'Dictate with microphone (gemini-3.5-transcribe)'}
        >
          {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4 text-amber-400" />}
        </button>

        {onOpenTranscribeModal && (
          <button
            type="button"
            onClick={onOpenTranscribeModal}
            disabled={isLoading || isRecording || isTranscribing}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-medium cursor-pointer shrink-0"
            title="Open Audio Studio with file upload & player"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audio Studio</span>
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !inputText.trim() || isRecording || isTranscribing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 font-medium text-xs sm:text-sm shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
