import type { IndexingStrategy } from "./knowledge";

export type RAGType = "internal" | "external";

export interface RAGEntry {
  id: string;
  name: string;
  description: string;
  type: RAGType;
  tags: string[];
  status: "active" | "draft" | "error";
  // Para RAGs internas
  knowledgeGroupId?: string;
  strategy?: IndexingStrategy;
  vectorStore?: string;
  embeddingModel?: string;
  // Configurações por ambiente
  envs: Record<"dev" | "staging" | "production", RAGConfig>;
}

export interface RAGConfig {
  store: string;
  endpoint: string;
  indexName: string;
  embedModel: string;
  apiKey: string;
}

// Mapeamento de estratégias para vector stores padrão
export const STRATEGY_VECTOR_STORE: Record<IndexingStrategy, string> = {
  hybrid_search: "pgvector",
  semantic_chunking: "pinecone",
  parent_child: "qdrant",
  graph_rag: "neo4j + pinecone",
};

// Mapeamento de estratégias para nomes de índices
export const STRATEGY_INDEX_PREFIX: Record<IndexingStrategy, string> = {
  hybrid_search: "hybrid",
  semantic_chunking: "semantic",
  parent_child: "parent_child",
  graph_rag: "graph",
};

export function createInternalRAG(
  groupId: string,
  groupName: string,
  strategy: IndexingStrategy,
  vectorStore: string,
  embeddingModel: string
): RAGEntry {
  const indexPrefix = STRATEGY_INDEX_PREFIX[strategy];
  const groupSlug = groupName.toLowerCase().replace(/\s+/g, "-");

  return {
    id: `internal-${groupId}`,
    name: groupName,
    description: `Internal RAG for ${groupName} knowledge base using ${strategy} strategy.`,
    type: "internal",
    tags: [vectorStore, strategy],
    status: "active",
    knowledgeGroupId: groupId,
    strategy,
    vectorStore,
    embeddingModel,
    envs: {
      dev: {
        store: vectorStore,
        endpoint: `${vectorStore}-dev.svc`,
        indexName: `${indexPrefix}_${groupSlug}_dev`,
        embedModel: embeddingModel,
        apiKey: "",
      },
      staging: {
        store: vectorStore,
        endpoint: `${vectorStore}-stg.svc`,
        indexName: `${indexPrefix}_${groupSlug}_stg`,
        embedModel: embeddingModel,
        apiKey: "",
      },
      production: {
        store: vectorStore,
        endpoint: `${vectorStore}-prod.svc`,
        indexName: `${indexPrefix}_${groupSlug}_prod`,
        embedModel: embeddingModel,
        apiKey: "",
      },
    },
  };
}

export const externalRAGs: RAGEntry[] = [
  {
    id: "external-product-kb",
    name: "Product Knowledge",
    description: "Help center, release notes, FAQs.",
    type: "external",
    tags: ["pinecone", "BM25+vec"],
    status: "active",
    envs: {
      dev: {
        store: "pinecone",
        endpoint: "https://dev.pinecone.io",
        indexName: "kb-dev",
        embedModel: "text-embedding-3-small",
        apiKey: "pc-dev-***",
      },
      staging: {
        store: "pinecone",
        endpoint: "https://stg.pinecone.io",
        indexName: "kb-stg",
        embedModel: "text-embedding-3-small",
        apiKey: "pc-stg-***",
      },
      production: {
        store: "pinecone",
        endpoint: "https://prod.pinecone.io",
        indexName: "kb-prod",
        embedModel: "text-embedding-3-large",
        apiKey: "pc-prod-***",
      },
    },
  },
  {
    id: "external-web-search",
    name: "Web Search Index",
    description: "Real-time web search results indexed daily.",
    type: "external",
    tags: ["weaviate", "web"],
    status: "active",
    envs: {
      dev: {
        store: "weaviate",
        endpoint: "http://weaviate-dev:8080",
        indexName: "WebSearch",
        embedModel: "text2vec-openai",
        apiKey: "",
      },
      staging: {
        store: "weaviate",
        endpoint: "http://weaviate-stg:8080",
        indexName: "WebSearch",
        embedModel: "text2vec-openai",
        apiKey: "",
      },
      production: {
        store: "weaviate",
        endpoint: "https://weaviate-prod.svc",
        indexName: "WebSearch",
        embedModel: "text2vec-openai",
        apiKey: "***",
      },
    },
  },
  {
    id: "external-arxiv",
    name: "ArXiv Papers",
    description: "Academic papers from ArXiv for research agents.",
    type: "external",
    tags: ["qdrant", "academic"],
    status: "active",
    envs: {
      dev: {
        store: "qdrant",
        endpoint: "http://qdrant-dev:6333",
        indexName: "arxiv",
        embedModel: "text-embedding-3-large",
        apiKey: "",
      },
      staging: {
        store: "qdrant",
        endpoint: "http://qdrant-stg:6333",
        indexName: "arxiv",
        embedModel: "text-embedding-3-large",
        apiKey: "",
      },
      production: {
        store: "qdrant",
        endpoint: "https://qdrant-prod.svc:6333",
        indexName: "arxiv",
        embedModel: "text-embedding-3-large",
        apiKey: "***",
      },
    },
  },
];
