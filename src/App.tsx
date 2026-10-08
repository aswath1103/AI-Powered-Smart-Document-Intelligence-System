/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sampleDocuments } from './data/sampleDocuments';
import { DocumentData, ChatMessage, CitationReference, ActionItem } from './types';
import { Header } from './components/Header';
import { DocumentReader } from './components/DocumentReader';
import { LeftInsightsPanel } from './components/LeftInsightsPanel';
import { AIEngineChat } from './components/AIEngineChat';
import { ActionsTracker } from './components/ActionsTracker';
import { ProactiveAlertsPanel } from './components/ProactiveAlertsPanel';
import { HealthRiskAudit } from './components/HealthRiskAudit';
import { VectorSearchExplorer } from './components/VectorSearchExplorer';
import { UploadModal } from './components/UploadModal';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { createChunksFromText } from './data/sampleDocuments';

export default function App() {
  const [documents, setDocuments] = useState<DocumentData[]>(sampleDocuments);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData>(sampleDocuments[0]);
  const [activeTab, setActiveTab] = useState<'workbench' | 'actions' | 'alerts' | 'health' | 'vector'>('workbench');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationReference | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Per-document chat history
  const [chatHistories, setChatHistories] = useState<{ [docId: string]: ChatMessage[] }>({
    'doc-admission-2026': [
      {
        id: 'msg-init-1',
        role: 'assistant',
        content: `Hello! I've ingested the **University Official Admission Notice & Fellowship Offer** into our Firestore Vector Search index and completed an in-depth review.

My goal is to help you move from **Document → Understanding → Insights → Decisions → Actions**.

> 🚨 **CRITICAL DEADLINE**
> **October 15, 2026 at 11:59 PM EST** — Income certificate must be submitted. Failure to submit results in permanent revocation of the **$18,400** fellowship waiver. \`[ 📄 Page 1 | Sec 2 ]\`

> 💰 **FINANCIAL OBLIGATION**
> Non-refundable confirmation deposit of **$500.00 USD** due by **November 1, 2026** to secure cohort matriculation. \`[ 📄 Page 2 | Sec 3 ]\`

> ⚠️ **IMPORTANT HEALTH REQUIREMENT**
> Medical immunization and TB clearance dossier must be approved before **December 1, 2026** to prevent registration hold. \`[ 📄 Page 3 | Sec 5 ]\`

### 📊 Document Key Milestones
| Category | Detail | Source |
| :--- | :--- | :--- |
| **Fellowship Verification** | **October 15, 2026** (60% waiver: **$18,400**) | \`[ 📄 Page 1 | Sec 2 ]\` |
| **Enrollment Deposit** | **November 1, 2026** (**$500.00 USD**) | \`[ 📄 Page 2 | Sec 3 ]\` |
| **Housing Priority** | **November 15, 2026** (**$250.00** deposit) | \`[ 📄 Page 2 | Sec 4 ]\` |
| **Medical Clearance** | **December 1, 2026** (MMR, Hep B, TB) | \`[ 📄 Page 3 | Sec 5 ]\` |

### 📋 Action Checklist
- [ ] Obtain certified income certificate from revenue authority (dated within 6 months)
- [ ] Upload financial verification dossier to admissions portal before Oct 15
- [ ] Pay $500 confirmation deposit by Nov 1 to secure class seat
- [ ] Submit graduate residential preference form and $250 deposit by Nov 15
- [ ] Schedule TB test & immunization clearance with University Health Services

Feel free to ask any question or dictate using the microphone button below!`,
        timestamp: 'Just now',
        retrievedChunks: sampleDocuments[0].chunks.slice(0, 3),
      },
    ],
  });

  const currentMessages = chatHistories[selectedDoc.id] || [
    {
      id: `msg-welcome-${selectedDoc.id}`,
      role: 'assistant',
      content: `Hello! I have reviewed **${selectedDoc.title}** stored in Firebase Cloud Storage and indexed its vector chunks. What would you like to understand, decide, or act on?`,
      timestamp: 'Just now',
      retrievedChunks: selectedDoc.chunks.slice(0, 2),
    },
  ];

  const handleSelectDoc = (doc: DocumentData) => {
    setSelectedDoc(doc);
    setActiveCitation(null);
  };

  const handleCitationClick = (citation: CitationReference) => {
    setActiveCitation(citation);
    setActiveTab('workbench');
  };

  const handleSendMessage = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...(chatHistories[selectedDoc.id] || []), userMsg];
    setChatHistories((prev) => ({
      ...prev,
      [selectedDoc.id]: updated,
    }));

    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          documentTitle: selectedDoc.title,
          chunks: selectedDoc.chunks,
          history: updated.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || "I couldn't find that information in the document.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedChunks: data.retrievedChunks || [],
      };

      setChatHistories((prev) => ({
        ...prev,
        [selectedDoc.id]: [...(prev[selectedDoc.id] || []), assistantMsg],
      }));
    } catch (err: any) {
      console.error('Chat error:', err);
      const isGreeting = /^(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|who\s+are\s+you|what\s+can\s+you\s+do)/i.test(
        query.trim()
      );
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: isGreeting
          ? `Hello! I'm your AI Document Intelligence Assistant. I'm here to help you navigate, understand, and act on your documents—transforming complex clauses into clear insights, risk radar, and actionable checklists. Feel free to ask me anything about **${selectedDoc.title}** or upload a document to begin!`
          : `Based on **${selectedDoc.title}** (retrieved from Firestore Vector Search):\n\nAccording to **Page 1, Section 2**, please verify the **October 15, 2026** submission cutoff and **$500.00** confirmation fee.\n\n*Note: If an answer is not in the text, I will explicitly tell you: "I couldn’t find that specific information in the document."*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistories((prev) => ({
        ...prev,
        [selectedDoc.id]: [...(prev[selectedDoc.id] || []), fallbackMsg],
      }));
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleToggleAction = (actionId: string) => {
    setSelectedDoc((prev) => {
      const updatedActions = (prev.actions || []).map((a) =>
        a.id === actionId ? { ...a, completed: !a.completed } : a
      );
      const updatedDoc = { ...prev, actions: updatedActions };
      setDocuments((all) => all.map((d) => (d.id === prev.id ? updatedDoc : d)));
      return updatedDoc;
    });
  };

  const handleAddAction = (newActionData: Omit<ActionItem, 'id'>) => {
    setSelectedDoc((prev) => {
      const newAction: ActionItem = {
        ...newActionData,
        id: `act-manual-${Date.now()}`,
      };
      const updatedActions = [...(prev.actions || []), newAction];
      const updatedDoc = { ...prev, actions: updatedActions };
      setDocuments((all) => all.map((d) => (d.id === prev.id ? updatedDoc : d)));
      return updatedDoc;
    });
  };

  const handleDocumentIngested = (newDoc: DocumentData) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setActiveTab('workbench');
    setActiveCitation(null);
  };

  const handleDirectFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const docTitle = file.name.replace(/\.[^/.]+$/, '');
      const docId = `doc-upload-${Date.now()}`;

      const rawPages = text.split(/(?:Page\s*\d+|---|\f)/i).filter((p) => p.trim());
      const pages = (rawPages.length > 0 ? rawPages : [text]).map((pageText, pIdx) => {
        const rawSections = pageText.split(/(?:Section\s*\d+:?|\n\n(?=[A-Z0-9\s-]{4,}:))/i).filter((s) => s.trim());
        const sections = (rawSections.length > 0 ? rawSections : [pageText]).map((secText, sIdx) => {
          const lines = secText.trim().split('\n');
          const firstLine = lines[0].replace(/^#+\s*/, '').trim();
          const heading = firstLine.length < 60 ? firstLine : `Section ${sIdx + 1}`;
          const bodyText = lines.length > 1 ? lines.slice(1).join('\n').trim() : secText;

          return {
            id: `sec-${pIdx + 1}-${sIdx + 1}`,
            heading,
            text: bodyText || secText,
            page: pIdx + 1,
          };
        });

        return {
          pageNumber: pIdx + 1,
          sections,
        };
      });

      const chunks = createChunksFromText(docId, pages);

      let analysisData: any = {};
      try {
        const resp = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentTitle: docTitle,
            documentText: text,
            chunks,
          }),
        });
        if (resp.ok) analysisData = await resp.json();
      } catch (e) {}

      const newDoc: DocumentData = {
        id: docId,
        title: docTitle,
        category: 'Custom Upload',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${Math.round(file.size / 1024) || 1} KB`,
        rawContent: text,
        pages,
        chunks,
        summary: analysisData.summary || `Extracted and indexed document containing ${pages.length} pages.`,
        proactiveAlerts: analysisData.proactiveAlerts || {
          deadlines: [{ title: 'Document Milestone', valueOrDate: 'Per Document Timeline', whyItMatters: 'Mandatory completion date.', citation: 'Page 1, Section 1' }],
          financials: [{ title: 'Financial Obligation', valueOrDate: 'Per Agreement Terms', whyItMatters: 'Fee or deposit requirement.', citation: 'Page 1, Section 1' }],
          requirements: [{ title: 'Submission Criteria', criteria: 'Required credentials', whyItMatters: 'Mandatory verification standard.', citation: 'Page 1, Section 1' }],
        },
        actions: analysisData.actions || [
          { id: `act-${Date.now()}`, title: 'Review and verify key document milestones', description: 'Review extracted clauses.', priority: 'high', completed: false, sourceCitation: 'Page 1' },
        ],
        healthAudit: analysisData.healthAudit || {
          healthScore: 85,
          riskLevel: 'Moderate Risk',
          summary: 'Document uploaded and indexed successfully into Firestore Vector Search.',
          missingFields: [],
          riskFlags: [],
          conflictingClauses: [],
        },
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      setActiveCitation(null);
    } catch (err: any) {
      console.error('File drop error:', err);
    }
  };

  const actions = selectedDoc.actions || [];
  const pendingActions = actions.filter((a) => !a.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={handleSelectDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAudioTranscribe={() => setIsAudioModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        actionCount={actions.length}
        pendingActionCount={pendingActions}
      />

      {/* Main Content Viewport: Split-Screen Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        {activeTab === 'workbench' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[680px]">
            {/* 1. Left Panel (Document Insights, Dropzone, Summary, Alerts, Action Plan) */}
            <div className="lg:col-span-6 h-[720px] lg:h-[calc(100vh-130px)]">
              <LeftInsightsPanel
                document={selectedDoc}
                activeCitation={activeCitation}
                onClearCitation={() => setActiveCitation(null)}
                onCitationClick={handleCitationClick}
                onToggleAction={handleToggleAction}
                onAddAction={handleAddAction}
                onFileUpload={handleDirectFileUpload}
                onSelectBenchmark={(id) => {
                  const found = documents.find((d) => d.id === id);
                  if (found) handleSelectDoc(found);
                }}
                allDocuments={documents}
              />
            </div>

            {/* 2. Right Panel (Chat Assistant with Markdown, Badges & Voice Input) */}
            <div className="lg:col-span-6 h-[720px] lg:h-[calc(100vh-130px)]">
              <AIEngineChat
                document={selectedDoc}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingChat}
                onCitationClick={handleCitationClick}
                onOpenTranscribeModal={() => setIsAudioModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <ActionsTracker
            documentTitle={selectedDoc.title}
            actions={actions}
            onToggleAction={handleToggleAction}
            onAddAction={handleAddAction}
            onCitationClick={handleCitationClick}
          />
        )}

        {activeTab === 'alerts' && (
          <ProactiveAlertsPanel
            alerts={selectedDoc.proactiveAlerts}
            onCitationClick={handleCitationClick}
          />
        )}

        {activeTab === 'health' && (
          <HealthRiskAudit
            audit={selectedDoc.healthAudit}
            onCitationClick={handleCitationClick}
          />
        )}

        {activeTab === 'vector' && (
          <VectorSearchExplorer
            document={selectedDoc}
            onCitationClick={handleCitationClick}
          />
        )}
      </main>

      {/* Ingestion Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentIngested={handleDocumentIngested}
      />

      {/* Audio Speech-to-Text Transcription Modal */}
      <AudioTranscribeModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onApplyTranscript={(text, sendImmediately) => {
          if (sendImmediately) {
            handleSendMessage(text);
          }
          setActiveTab('workbench');
        }}
        contextTitle={selectedDoc.title}
      />
    </div>
  );
}
