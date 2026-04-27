import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";

export const Route = createFileRoute("/rags")({
  head: () => ({ meta: [{ title: "RAGs · Synapse" }] }),
  component: RAGsPage,
});

const rags: CatalogItem[] = [
  { id: "rag/internal-docs", name: "Internal Docs", description: "Engineering wiki, RFCs, runbooks. Updated nightly.", tags: ["pgvector", "hybrid"], meta: [{ label: "Chunks", value: "12,840" }, { label: "Embed", value: "text-3-large" }], status: "active", icon: Database, accent: "primary" },
  { id: "rag/product-kb", name: "Product Knowledge", description: "Help center, release notes, FAQs.", tags: ["pinecone", "BM25+vec"], meta: [{ label: "Chunks", value: "4,213" }, { label: "Recall@5", value: "92%" }], status: "active", icon: Database, accent: "accent" },
  { id: "rag/legal-corpus", name: "Legal Corpus", description: "Contracts, policies, compliance docs.", tags: ["qdrant", "ACL"], meta: [{ label: "Chunks", value: "28,901" }, { label: "Tenants", value: "5" }], status: "draft", icon: Database, accent: "warning" },
  { id: "rag/code-search", name: "Code Search", description: "Monorepo code embeddings for semantic lookup.", tags: ["weaviate", "AST-aware"], meta: [{ label: "Files", value: "18k" }, { label: "Repos", value: "9" }], status: "active", icon: Database, accent: "info" },
  { id: "rag/customer-tickets", name: "Customer Tickets", description: "5y of support transcripts and resolutions.", tags: ["pgvector", "PII-redacted"], meta: [{ label: "Chunks", value: "94,210" }, { label: "Refresh", value: "hourly" }], status: "active", icon: Database, accent: "success" },
  { id: "rag/research-papers", name: "Research Papers", description: "ArXiv ML papers, abstracts and figures.", tags: ["pinecone", "multimodal"], meta: [{ label: "Papers", value: "32k" }, { label: "Embed", value: "matryoshka" }], status: "error", icon: Database, accent: "destructive" },
];

function RAGsPage() {
  return (
    <AppLayout title="RAGs" subtitle="Retrieval-augmented generation indexes">
      <div className="p-6">
        <PageHeader title="RAG Indexes" description="Vector and hybrid stores wired into agents.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New index
          </Button>
        </PageHeader>
        <CatalogGrid items={rags} />
      </div>
    </AppLayout>
  );
}
