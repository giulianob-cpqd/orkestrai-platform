import { createFileRoute } from "@tanstack/react-router";
import { Database, BookOpen, Eye, Trash2, Library } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";
import { initialGroups } from "@/data/knowledge";
import { createInternalRAG, externalRAGs } from "@/data/rags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rags")({
  head: () => ({ meta: [{ title: "RAGs · OrkestrAI" }] }),
  component: RAGsPage,
});

const envFields: EnvFieldDef[] = [
  { key: "store", label: "Vector store", placeholder: "pgvector | pinecone | qdrant | weaviate" },
  { key: "endpoint", label: "Endpoint", placeholder: "https://vector.svc" },
  { key: "indexName", label: "Index / collection", placeholder: "docs-prod" },
  { key: "embedModel", label: "Embedding model", placeholder: "text-embedding-3-large" },
  { key: "apiKey", label: "API key", type: "password" },
];

function RAGsPage() {
  // Criar RAGs internas a partir das bases de conhecimento
  const internalRAGs = initialGroups.map((group) =>
    createInternalRAG(
      group.id,
      group.name,
      group.strategy,
      group.vectorStore,
      group.embeddingModel
    )
  );

  // Converter RAGs para CatalogEntry
  const allRAGs: CatalogEntry[] = [
    ...internalRAGs.map((rag) => ({
      id: rag.id,
      name: rag.name,
      description: rag.description,
      tags: rag.tags,
      status: rag.status as "active" | "draft" | "error",
      envs: rag.envs,
      _internal: true,
      _knowledgeGroupId: rag.knowledgeGroupId,
    })),
    ...externalRAGs.map((rag) => ({
      id: rag.id,
      name: rag.name,
      description: rag.description,
      tags: rag.tags,
      status: rag.status as "active" | "draft" | "error",
      envs: rag.envs,
      _internal: false,
    })),
  ];

  return (
    <CatalogManager
      title="RAGs"
      subtitle="Retrieval-augmented generation indexes"
      description="Vector and hybrid stores wired into agents. 3 internal (linked to knowledge bases) + 3 external."
      newButtonLabel="New index"
      icon={Library}
      envFields={envFields}
      initialItems={allRAGs}
      isViewOnly={(item: any) => item._internal}
      renderCustomBadge={(item: any) => {
        if (item._internal) {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-[10px] border-primary/40 text-primary">
                <BookOpen className="h-2.5 w-2.5" />
                internal
              </Badge>
              <Badge variant="outline" className="gap-1 text-[10px] border-success/40 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                active
              </Badge>
            </div>
          );
        }
        return (
          <Badge variant="outline" className="gap-1 text-[10px] border-success/40 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            active
          </Badge>
        );
      }}
      renderCustomActions={(item: any, onEdit, onDelete) => {
        const group = item._internal ? initialGroups.find((g) => g.id === item._knowledgeGroupId) : null;
        return (
          <div className="flex items-center justify-between w-full gap-2">
            {group && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  {group.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {item._internal ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={onEdit}
                  title="Visualizar configuração (somente leitura)"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={onEdit}
                  >
                    <Eye className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
