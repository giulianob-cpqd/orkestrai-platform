import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/rags")({
  head: () => ({ meta: [{ title: "RAGs · Inspire" }] }),
  component: RAGsPage,
});

const envFields: EnvFieldDef[] = [
  { key: "store", label: "Vector store", placeholder: "pgvector | pinecone | qdrant | weaviate" },
  { key: "endpoint", label: "Endpoint", placeholder: "https://vector.svc" },
  { key: "indexName", label: "Index / collection", placeholder: "docs-prod" },
  { key: "embedModel", label: "Embedding model", placeholder: "text-embedding-3-large" },
  { key: "apiKey", label: "API key", type: "password" },
];

const initial: CatalogEntry[] = [
  {
    id: "internal-docs",
    name: "Internal Docs",
    description: "Engineering wiki, RFCs, runbooks. Updated nightly.",
    tags: ["pgvector", "hybrid"],
    status: "active",
    envs: {
      dev: { store: "pgvector", endpoint: "postgres://dev/vec", indexName: "docs_dev", embedModel: "text-embedding-3-large", apiKey: "" },
      staging: { store: "pgvector", endpoint: "postgres://stg/vec", indexName: "docs_stg", embedModel: "text-embedding-3-large", apiKey: "" },
      production: { store: "pgvector", endpoint: "postgres://prod/vec", indexName: "docs_prod", embedModel: "text-embedding-3-large", apiKey: "" },
    },
  },
  {
    id: "product-kb",
    name: "Product Knowledge",
    description: "Help center, release notes, FAQs.",
    tags: ["pinecone", "BM25+vec"],
    status: "active",
    envs: {
      dev: { store: "pinecone", endpoint: "https://dev.pinecone.io", indexName: "kb-dev", embedModel: "text-embedding-3-small", apiKey: "pc-dev-***" },
      staging: { store: "pinecone", endpoint: "https://stg.pinecone.io", indexName: "kb-stg", embedModel: "text-embedding-3-small", apiKey: "pc-stg-***" },
      production: { store: "pinecone", endpoint: "https://prod.pinecone.io", indexName: "kb-prod", embedModel: "text-embedding-3-large", apiKey: "pc-prod-***" },
    },
  },
  {
    id: "legal-corpus",
    name: "Legal Corpus",
    description: "Contracts, policies, compliance docs.",
    tags: ["qdrant", "ACL"],
    status: "draft",
    envs: {
      dev: { store: "qdrant", endpoint: "http://qdrant-dev:6333", indexName: "legal", embedModel: "text-embedding-3-large", apiKey: "" },
      staging: { store: "", endpoint: "", indexName: "", embedModel: "", apiKey: "" },
      production: { store: "", endpoint: "", indexName: "", embedModel: "", apiKey: "" },
    },
  },
];

function RAGsPage() {
  return (
    <CatalogManager
      title="RAGs"
      subtitle="Retrieval-augmented generation indexes"
      description="Vector and hybrid stores wired into agents."
      newButtonLabel="New index"
      icon={Database}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
