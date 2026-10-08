export interface DocumentSection {
  id: string;
  heading: string;
  text: string;
  page: number;
}

export interface DocumentPage {
  pageNumber: number;
  sections: DocumentSection[];
}

export interface DocumentChunk {
  chunkId: string;
  docId: string;
  pageNumber: number;
  sectionTitle: string;
  content: string;
  embeddingPreview: number[];
  tokenCount: number;
  similarityScore?: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  requiredDocuments?: string[];
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  sourceCitation?: string;
}

export interface ProactiveAlertItem {
  title: string;
  valueOrDate?: string;
  criteria?: string;
  whyItMatters: string;
  citation: string;
}

export interface ProactiveAlerts {
  deadlines: ProactiveAlertItem[];
  financials: ProactiveAlertItem[];
  requirements: ProactiveAlertItem[];
}

export interface MissingField {
  field: string;
  consequence: string;
  recommendation: string;
}

export interface RiskFlag {
  title: string;
  section: string;
  severity: 'warning' | 'caution' | 'alert';
  cautionaryExplanation: string;
  citation: string;
}

export interface ConflictingClause {
  clauseA: string;
  clauseB: string;
  problem: string;
  caution: string;
}

export interface DocumentHealthAudit {
  healthScore: number; // 0 - 100
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' | 'High Risk';
  summary: string;
  missingFields: MissingField[];
  riskFlags: RiskFlag[];
  conflictingClauses: ConflictingClause[];
}

export interface DocumentData {
  id: string;
  title: string;
  category: 'Education / Admissions' | 'Legal / Lease' | 'Enterprise / SaaS' | 'Healthcare / Insurance' | 'Custom Upload';
  uploadDate: string;
  fileSize: string;
  rawContent: string;
  pages: DocumentPage[];
  chunks: DocumentChunk[];
  summary?: string;
  proactiveAlerts?: ProactiveAlerts;
  actions?: ActionItem[];
  healthAudit?: DocumentHealthAudit;
}

export interface CitationReference {
  page: number;
  section: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  retrievedChunks?: DocumentChunk[];
  citations?: CitationReference[];
  isGrounded?: boolean;
  actionsExtracted?: ActionItem[];
}
