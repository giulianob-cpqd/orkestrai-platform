export type IndexingStrategy =
  | "hybrid_search"
  | "semantic_chunking"
  | "parent_child"
  | "graph_rag";

export const STRATEGY_LABEL: Record<IndexingStrategy, string> = {
  hybrid_search: "Hybrid Search",
  semantic_chunking: "Semantic Chunking",
  parent_child: "Parent-Child Retrieval",
  graph_rag: "Graph RAG",
};

export const STRATEGY_DESC: Record<IndexingStrategy, string> = {
  hybrid_search: "Combina busca densa (vetorial) + esparsa (BM25) com re-ranking.",
  semantic_chunking: "Particiona documentos por similaridade semântica de sentenças.",
  parent_child: "Indexa chunks filhos pequenos e retorna o documento pai completo.",
  graph_rag: "Constrói grafo de entidades e relações para retrieval estrutural.",
};

export interface DocumentVersion {
  id: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  sizeKb: number;
  status: "indexed" | "processing" | "failed";
  notes?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: "pdf" | "md" | "html" | "docx" | "txt";
  pages: number;
  currentVersion: string;
  versions: DocumentVersion[];
}

export interface DocumentGroup {
  id: string;
  name: string;
  description: string;
  strategy: IndexingStrategy;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  vectorStore: string;
  createdAt: string;
  documents: KnowledgeDocument[];
}

export const initialGroups: DocumentGroup[] = [
  {
    id: "grp_internal_docs",
    name: "Internal Docs",
    description: "Documentação interna de produto e engenharia.",
    strategy: "hybrid_search",
    embeddingModel: "text-embedding-3-large",
    chunkSize: 800,
    chunkOverlap: 120,
    vectorStore: "pgvector",
    createdAt: "2025-03-12T10:00:00Z",
    documents: [
      {
        id: "doc_arch_overview",
        name: "Architecture Overview.pdf",
        type: "pdf",
        pages: 42,
        currentVersion: "v3",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-01-08T14:00:00Z", uploadedBy: "ana.silva", sizeKb: 2840, status: "indexed", notes: "Versão inicial" },
          { id: "v2", version: "v2", uploadedAt: "2025-02-20T09:30:00Z", uploadedBy: "leo.fernandes", sizeKb: 3120, status: "indexed", notes: "Adiciona seção de eventos" },
          { id: "v3", version: "v3", uploadedAt: "2025-04-30T16:10:00Z", uploadedBy: "ana.silva", sizeKb: 3380, status: "indexed", notes: "Atualiza diagramas" },
        ],
      },
      {
        id: "doc_sec_policy",
        name: "Security Policy.md",
        type: "md",
        pages: 12,
        currentVersion: "v2",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-02-01T11:00:00Z", uploadedBy: "carlos.mendes", sizeKb: 32, status: "indexed" },
          { id: "v2", version: "v2", uploadedAt: "2025-04-15T08:20:00Z", uploadedBy: "carlos.mendes", sizeKb: 41, status: "indexed", notes: "RBAC + auditoria" },
        ],
      },
      {
        id: "doc_api_guide",
        name: "API Reference Guide.pdf",
        type: "pdf",
        pages: 156,
        currentVersion: "v2",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-01-15T10:00:00Z", uploadedBy: "leo.fernandes", sizeKb: 5240, status: "indexed" },
          { id: "v2", version: "v2", uploadedAt: "2025-05-01T14:30:00Z", uploadedBy: "leo.fernandes", sizeKb: 5680, status: "indexed", notes: "Adiciona endpoints v2" },
        ],
      },
      {
        id: "doc_deployment",
        name: "Deployment Guide.md",
        type: "md",
        pages: 28,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-03-20T11:15:00Z", uploadedBy: "joao.silva", sizeKb: 156, status: "indexed", notes: "Guia de deploy em produção" },
        ],
      },
      {
        id: "doc_db_schema",
        name: "Database Schema.html",
        type: "html",
        pages: 34,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-04-05T09:45:00Z", uploadedBy: "marina.costa", sizeKb: 892, status: "indexed" },
        ],
      },
      {
        id: "doc_testing",
        name: "Testing Strategy.txt",
        type: "txt",
        pages: 18,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-04-10T13:20:00Z", uploadedBy: "carlos.mendes", sizeKb: 124, status: "indexed", notes: "Unit, integration e E2E" },
        ],
      },
    ],
  },
  {
    id: "grp_legal_corpus",
    name: "Legal Corpus",
    description: "Contratos, NDAs e cláusulas padrão.",
    strategy: "parent_child",
    embeddingModel: "text-embedding-3-large",
    chunkSize: 400,
    chunkOverlap: 80,
    vectorStore: "qdrant",
    createdAt: "2025-02-02T09:00:00Z",
    documents: [
      {
        id: "doc_msa",
        name: "Master Service Agreement.docx",
        type: "docx",
        pages: 28,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-02-02T09:00:00Z", uploadedBy: "mariana.lopes", sizeKb: 184, status: "indexed" },
        ],
      },
      {
        id: "doc_nda",
        name: "Non-Disclosure Agreement.pdf",
        type: "pdf",
        pages: 8,
        currentVersion: "v2",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-01-20T10:00:00Z", uploadedBy: "mariana.lopes", sizeKb: 156, status: "indexed" },
          { id: "v2", version: "v2", uploadedAt: "2025-04-25T15:30:00Z", uploadedBy: "mariana.lopes", sizeKb: 168, status: "indexed", notes: "Atualiza cláusulas de confidencialidade" },
        ],
      },
      {
        id: "doc_terms",
        name: "Terms of Service.md",
        type: "md",
        pages: 16,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-03-01T08:00:00Z", uploadedBy: "mariana.lopes", sizeKb: 92, status: "indexed" },
        ],
      },
      {
        id: "doc_privacy",
        name: "Privacy Policy.html",
        type: "html",
        pages: 12,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-03-15T09:30:00Z", uploadedBy: "mariana.lopes", sizeKb: 78, status: "indexed", notes: "LGPD compliant" },
        ],
      },
    ],
  },
  {
    id: "grp_research",
    name: "Research Papers",
    description: "Papers acadêmicos para o agente Researcher.",
    strategy: "graph_rag",
    embeddingModel: "voyage-3-large",
    chunkSize: 1024,
    chunkOverlap: 200,
    vectorStore: "neo4j + pinecone",
    createdAt: "2024-12-10T13:00:00Z",
    documents: [
      {
        id: "doc_rag_survey",
        name: "RAG Survey 2024.pdf",
        type: "pdf",
        pages: 48,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-01-10T14:00:00Z", uploadedBy: "prof.silva", sizeKb: 3240, status: "indexed", notes: "Comprehensive RAG overview" },
        ],
      },
      {
        id: "doc_llm_agents",
        name: "LLM-based Agents.pdf",
        type: "pdf",
        pages: 52,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-02-05T11:20:00Z", uploadedBy: "prof.santos", sizeKb: 3680, status: "indexed" },
        ],
      },
      {
        id: "doc_embeddings",
        name: "Embeddings Benchmark.pdf",
        type: "pdf",
        pages: 36,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-03-08T10:15:00Z", uploadedBy: "prof.oliveira", sizeKb: 2140, status: "indexed", notes: "Comparação de modelos" },
        ],
      },
      {
        id: "doc_vector_db",
        name: "Vector Databases Study.pdf",
        type: "pdf",
        pages: 44,
        currentVersion: "v1",
        versions: [
          { id: "v1", version: "v1", uploadedAt: "2025-04-02T13:45:00Z", uploadedBy: "prof.costa", sizeKb: 2890, status: "indexed" },
        ],
      },
    ],
  },
];
