import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Plus,
  Upload,
  FileText,
  Settings2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Zap,
  Pencil,
  Trash2,
  ChevronDown,
  Link as LinkIcon,
  Database,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import {
  initialGroups,
  STRATEGY_LABEL,
  STRATEGY_DESC,
  type DocumentGroup,
  type IndexingStrategy,
  type KnowledgeDocument,
  type DocumentVersion,
} from "@/data/knowledge";
import { createInternalRAG } from "@/data/rags";
import { useRequireAuth, useAuth } from "@/lib/auth";
import { useEnvironment } from "@/lib/EnvironmentContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge · OrkestrAI" },
      { name: "description", content: "Gestão e versionamento de documentos para indexação." },
    ],
  }),
  component: KnowledgePage,
});

const STRATEGIES: IndexingStrategy[] = ["hybrid_search", "semantic_chunking", "parent_child", "graph_rag"];

interface IndexingPipeline {
  id: string;
  documentId: string;
  documentName: string;
  status: "idle" | "running" | "completed" | "failed";
  steps: PipelineStep[];
}

interface PipelineStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  duration?: number;
}

function KnowledgePage() {
  const ok = useRequireAuth();
  const { user } = useAuth();
  const { activeEnv } = useEnvironment();
  const [groups, setGroups] = useState<DocumentGroup[]>(initialGroups);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [pipeline, setPipeline] = useState<IndexingPipeline | null>(null);
  const [editingGroup, setEditingGroup] = useState<DocumentGroup | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [internalRAGs, setInternalRAGs] = useState<Map<string, string>>(
    new Map(groups.map((g) => [g.id, `internal-${g.id}`]))
  );
  const [ragViewOpen, setRagViewOpen] = useState(false);
  const [selectedRagGroupId, setSelectedRagGroupId] = useState<string | null>(null);
  const [selectedGroupForDoc, setSelectedGroupForDoc] = useState<DocumentGroup | null>(null);

  if (!ok) return null;

  function createGroup(g: Omit<DocumentGroup, "id" | "createdAt" | "documents">) {
    const id = `grp_${Date.now()}`;
    const ragId = `internal-${id}`;
    setGroups((prev) => [...prev, { ...g, id, createdAt: new Date().toISOString(), documents: [] }]);
    setInternalRAGs((prev) => new Map(prev).set(id, ragId));
    toast.success("Grupo criado com RAG interna");
  }

  function updateGroup(id: string, g: Omit<DocumentGroup, "id" | "createdAt" | "documents">) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? { ...group, ...g }
          : group
      )
    );
    toast.success("Grupo atualizado");
  }

  function deleteGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (expandedGroupId === id) {
      setExpandedGroupId(null);
    }
    toast.success("Grupo removido");
  }

  function uploadDoc(name: string, type: KnowledgeDocument["type"], notes: string) {
    if (!selectedGroupForDoc) return;

    // Criar pipeline de indexação
    const docId = `doc_${Date.now()}`;
    const newPipeline: IndexingPipeline = {
      id: `pipeline_${Date.now()}`,
      documentId: docId,
      documentName: name,
      status: "running",
      steps: [
        { id: "s1", name: "Parsing", status: "running", progress: 0 },
        { id: "s2", name: "Chunking", status: "pending", progress: 0 },
        { id: "s3", name: "Embedding", status: "pending", progress: 0 },
        { id: "s4", name: "Indexing", status: "pending", progress: 0 },
        { id: "s5", name: "Validation", status: "pending", progress: 0 },
      ],
    };

    setPipeline(newPipeline);
    setPipelineOpen(true);

    // Simular execução do pipeline
    let currentStep = 0;
    const stepDurations = [2000, 1500, 3000, 2000, 1000];

    const executeStep = () => {
      if (currentStep >= newPipeline.steps.length) {
        // Pipeline completo
        setPipeline((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                steps: prev.steps.map((s) => ({ ...s, status: "completed", progress: 100 })),
              }
            : null
        );

        // Adicionar documento ao grupo
        setTimeout(() => {
          const newVersion: DocumentVersion = {
            id: `v${Date.now()}`,
            version: "v1",
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.email.split("@")[0] ?? "user",
            sizeKb: 100 + Math.floor(Math.random() * 3000),
            status: "indexed",
            notes,
          };

          const doc: KnowledgeDocument = {
            id: docId,
            name,
            type,
            pages: 1 + Math.floor(Math.random() * 60),
            currentVersion: "v1",
            versions: [newVersion],
          };

          setGroups((prev) =>
            prev.map((g) =>
              g.id === selectedGroupForDoc.id ? { ...g, documents: [...g.documents, doc] } : g
            )
          );

          toast.success("Documento indexado com sucesso");
          setPipelineOpen(false);
          setDocOpen(false);
        }, 500);

        return;
      }

      const step = newPipeline.steps[currentStep];
      const duration = stepDurations[currentStep];

      // Atualizar step para running
      setPipeline((prev) =>
        prev
          ? {
              ...prev,
              steps: prev.steps.map((s, i) =>
                i === currentStep ? { ...s, status: "running", progress: 0 } : s
              ),
            }
          : null
      );

      // Simular progresso
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 40;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Marcar como completo
          setPipeline((prev) =>
            prev
              ? {
                  ...prev,
                  steps: prev.steps.map((s, i) =>
                    i === currentStep
                      ? { ...s, status: "completed", progress: 100, duration: duration / 1000 }
                      : s
                  ),
                }
              : null
          );

          currentStep++;
          setTimeout(executeStep, 500);
        } else {
          setPipeline((prev) =>
            prev
              ? {
                  ...prev,
                  steps: prev.steps.map((s, i) =>
                    i === currentStep ? { ...s, progress } : s
                  ),
                }
              : null
          );
        }
      }, 100);
    };

    executeStep();
  }

  return (
    <AppLayout title="Knowledge" subtitle="Documentos · Versionamento · Indexação">
      <div className="p-6 space-y-6">
        <PageHeader title="Knowledge & Documentos" description="Cadastre grupos, escolha a estratégia de indexação e gerencie versões dos documentos.">
          <Button
            size="sm"
            onClick={() => {
              setEditingGroup(null);
              setGroupOpen(true);
            }}
            className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add Group
          </Button>
        </PageHeader>

        {/* Resumo de Informações */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Knowledge Groups</p>
                <p className="mt-1 text-2xl font-semibold">{groups.length}</p>
              </div>
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Documents</p>
                <p className="mt-1 text-2xl font-semibold">{groups.reduce((sum, g) => sum + g.documents.length, 0)}</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Internal RAGs</p>
                <p className="mt-1 text-2xl font-semibold">{internalRAGs.size}</p>
              </div>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Versions</p>
                <p className="mt-1 text-2xl font-semibold">{groups.reduce((sum, g) => sum + g.documents.reduce((docSum, d) => docSum + d.versions.length, 0), 0)}</p>
              </div>
              <GitBranch className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Tabela de grupos */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead className="text-right">Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const isExpanded = expandedGroupId === group.id;
                return (
                  <>
                    <TableRow key={group.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="w-12">
                        <button
                          onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{group.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {group.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {STRATEGY_LABEL[group.strategy]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{group.documents.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 px-2 text-xs text-primary hover:text-primary"
                            onClick={() => {
                              setSelectedRagGroupId(group.id);
                              setRagViewOpen(true);
                            }}
                            title="Ver RAG interna"
                          >
                            <Database className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 px-2 text-xs"
                            onClick={() => {
                              setEditingGroup(group);
                              setGroupOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => deleteGroup(group.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Linha expandida com detalhes */}
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-muted/30 border-t border-border/50 p-6 space-y-6">
                            {/* Configuração do grupo */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3">Configuração</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Estratégia</p>
                                  <p className="font-medium mt-1">{STRATEGY_LABEL[group.strategy]}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{STRATEGY_DESC[group.strategy]}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Embedding</p>
                                  <p className="font-medium mt-1">{group.embeddingModel}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Vector Store</p>
                                  <p className="font-medium mt-1">{group.vectorStore}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Chunks</p>
                                  <p className="font-medium mt-1">{group.chunkSize} / overlap {group.chunkOverlap}</p>
                                </div>
                              </div>
                            </div>

                            {/* Documentos */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" /> Documentos ({group.documents.length})
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedGroupForDoc(group);
                                    setDocOpen(true);
                                  }}
                                  className="gap-1.5"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Adicionar
                                </Button>
                              </div>

                              {group.documents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhum documento cadastrado neste grupo.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {group.documents.map((doc) => {
                                    const isDocExpanded = expandedDocs.has(doc.id);
                                    const activeVersion = doc.versions.find((v) => v.version === doc.currentVersion);
                                    return (
                                      <Collapsible
                                        key={doc.id}
                                        open={isDocExpanded}
                                        onOpenChange={(open) => {
                                          setExpandedDocs((prev) => {
                                            const next = new Set(prev);
                                            if (open) {
                                              next.add(doc.id);
                                            } else {
                                              next.delete(doc.id);
                                            }
                                            return next;
                                          });
                                        }}
                                      >
                                        <Card className="p-0 overflow-hidden bg-background border-border/50 flex flex-col">
                                          {/* Header do documento */}
                                          <CollapsibleTrigger asChild>
                                            <button className="w-full flex items-start justify-between p-4 hover:bg-muted/40 transition-colors text-left">
                                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <ChevronRight
                                                  className={cn(
                                                    "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5",
                                                    isDocExpanded && "rotate-90"
                                                  )}
                                                />
                                                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-semibold text-sm truncate">{doc.name}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {doc.pages} páginas · {doc.versions.length} versão{doc.versions.length !== 1 ? "s" : ""}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <Badge variant="outline" className="uppercase text-[10px]">
                                                  {doc.type}
                                                </Badge>
                                                {activeVersion && (
                                                  <Badge variant="secondary" className="text-[10px]">
                                                    {activeVersion.version}
                                                  </Badge>
                                                )}
                                              </div>
                                            </button>
                                          </CollapsibleTrigger>

                                          {/* Versões */}
                                          <CollapsibleContent className="border-t border-border/50">
                                            <div className="space-y-2 p-4">
                                              {doc.versions.map((v) => {
                                                const isActive = v.version === doc.currentVersion;
                                                return (
                                                  <div
                                                    key={v.id}
                                                    className={cn(
                                                      "flex items-start justify-between p-3 rounded-lg border transition-colors gap-3",
                                                      isActive
                                                        ? "bg-primary/10 border-primary/40"
                                                        : "bg-background border-border hover:border-primary/30"
                                                    )}
                                                  >
                                                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                                                      {/* Primeira linha: versão, tamanho, usuário, data/hora */}
                                                      <div className="flex items-center gap-3 flex-wrap">
                                                        <Badge
                                                          variant={isActive ? "default" : "secondary"}
                                                          className="text-[10px]"
                                                        >
                                                          {v.version}
                                                        </Badge>
                                                        {isActive && (
                                                          <Badge variant="outline" className="gap-1 text-[10px] border-success/40 text-success">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            ativo
                                                          </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                          {(v.sizeKb / 1024).toFixed(2)} MB
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                          Por {v.uploadedBy}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                          {new Date(v.uploadedAt).toLocaleString("pt-BR")}
                                                        </span>
                                                      </div>
                                                      {/* Segunda linha: observações */}
                                                      {v.notes && (
                                                        <div className="text-xs text-foreground/70 italic">
                                                          "{v.notes}"
                                                        </div>
                                                      )}
                                                    </div>

                                                    {!isActive && (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs gap-1.5 shrink-0"
                                                        onClick={() => {
                                                          setGroups((prev) =>
                                                            prev.map((g) =>
                                                              g.id === group.id
                                                                ? {
                                                                    ...g,
                                                                    documents: g.documents.map((d) =>
                                                                      d.id === doc.id
                                                                        ? { ...d, currentVersion: v.version }
                                                                        : d
                                                                    ),
                                                                  }
                                                                : g
                                                            )
                                                          );
                                                          toast.success(`Versão ${v.version} ativada`);
                                                        }}
                                                      >
                                                        Ativar
                                                      </Button>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </CollapsibleContent>
                                        </Card>
                                      </Collapsible>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Modal de pipeline de indexação */}
        <Dialog open={pipelineOpen} onOpenChange={setPipelineOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Pipeline de Indexação
              </DialogTitle>
              <DialogDescription>
                {pipeline?.documentName} está sendo processado
              </DialogDescription>
            </DialogHeader>

            {pipeline && (
              <div className="space-y-6">
                {/* Status geral */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {pipeline.status === "running" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {pipeline.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {pipeline.status === "failed" && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-medium text-sm capitalize">{pipeline.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pipeline.steps.filter((s) => s.status === "completed").length} / {pipeline.steps.length}
                  </span>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {pipeline.steps.map((step, idx) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {step.status === "pending" && (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          {step.status === "running" && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                          {step.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          {step.status === "failed" && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-sm font-medium">{step.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.duration && (
                            <span className="text-xs text-muted-foreground">{step.duration.toFixed(1)}s</span>
                          )}
                          <span className="text-xs text-muted-foreground">{Math.round(step.progress)}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            step.status === "completed" && "bg-success",
                            step.status === "running" && "bg-primary",
                            step.status === "pending" && "bg-muted-foreground/30",
                            step.status === "failed" && "bg-destructive"
                          )}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalhes técnicos */}
                {pipeline.status === "completed" && (
                  <Card className="p-3 bg-success/5 border-success/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-success">Indexação concluída</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Documento processado e disponível para busca semântica
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de criar/editar grupo */}
        <GroupDialog
          open={groupOpen}
          onOpenChange={setGroupOpen}
          onSubmit={(g) => {
            if (editingGroup) {
              updateGroup(editingGroup.id, g);
            } else {
              createGroup(g);
            }
            setEditingGroup(null);
          }}
          initialData={editingGroup}
        />

        {/* Modal de adicionar documento */}
        {selectedGroupForDoc && (
          <DocDialog
            open={docOpen}
            onOpenChange={setDocOpen}
            onSubmit={uploadDoc}
            existingNames={selectedGroupForDoc.documents.map((d) => d.name)}
            existingDocs={selectedGroupForDoc.documents}
          />
        )}

        {/* Modal de visualização da RAG interna */}
        <Dialog open={ragViewOpen} onOpenChange={setRagViewOpen}>
          <DialogContent className="max-w-2xl">
            {selectedRagGroupId && (() => {
              const group = groups.find((g) => g.id === selectedRagGroupId);
              if (!group) return null;
              const rag = createInternalRAG(
                group.id,
                group.name,
                group.strategy,
                group.vectorStore,
                group.embeddingModel
              );
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      {rag.name}
                    </DialogTitle>
                    <DialogDescription>{rag.description}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Informações gerais */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-sm mb-3">Informações Gerais</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">ID</p>
                          <p className="font-medium mt-1">{rag.id}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Tipo</p>
                          <Badge variant="outline" className="gap-1 text-[10px] border-primary/40 text-primary mt-1">
                            <LinkIcon className="h-2.5 w-2.5" />
                            internal
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Status</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">
                            {rag.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Estratégia</p>
                          <p className="font-medium mt-1">{STRATEGY_LABEL[rag.strategy!]}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Configuração */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-sm mb-3">Configuração</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Vector Store</p>
                          <p className="font-medium mt-1">{rag.vectorStore}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Embedding Model</p>
                          <p className="font-medium mt-1">{rag.embeddingModel}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Ambiente selecionado */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-sm mb-3">Configuração - {activeEnv.charAt(0).toUpperCase() + activeEnv.slice(1)}</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Store</p>
                          <p className="font-medium mt-1">{rag.envs[activeEnv].store}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Endpoint</p>
                          <p className="font-medium mt-1 break-all">{rag.envs[activeEnv].endpoint}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Index / Collection</p>
                          <p className="font-medium mt-1">{rag.envs[activeEnv].indexName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Embedding Model</p>
                          <p className="font-medium mt-1">{rag.envs[activeEnv].embedModel}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Tags */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-sm mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {rag.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function GroupDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSubmit: (g: Omit<DocumentGroup, "id" | "createdAt" | "documents">) => void;
  initialData?: DocumentGroup | null;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [strategy, setStrategy] = useState<IndexingStrategy>(initialData?.strategy ?? "hybrid_search");
  const [embeddingModel, setEmbeddingModel] = useState(initialData?.embeddingModel ?? "text-embedding-3-large");
  const [vectorStore, setVectorStore] = useState(initialData?.vectorStore ?? "pgvector");
  const [chunkSize, setChunkSize] = useState(initialData?.chunkSize ?? 800);
  const [chunkOverlap, setChunkOverlap] = useState(initialData?.chunkOverlap ?? 120);

  function submit() {
    if (!name.trim()) return;
    onSubmit({ name, description, strategy, embeddingModel, vectorStore, chunkSize, chunkOverlap });
    setName("");
    setDescription("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> {initialData ? "Editar grupo" : "Novo grupo de documentos"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Atualize as configurações do grupo." : "Defina nome e estratégia de indexação. Documentos podem ser adicionados depois."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Internal Docs"
              />
            </div>
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Estratégia de indexação</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as IndexingStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STRATEGY_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">{STRATEGY_DESC[strategy]}</p>
            </div>
            <div>
              <Label>Embedding</Label>
              <Input value={embeddingModel} onChange={(e) => setEmbeddingModel(e.target.value)} />
            </div>
            <div>
              <Label>Vector store</Label>
              <Input value={vectorStore} onChange={(e) => setVectorStore(e.target.value)} />
            </div>
            <div>
              <Label>Chunk size</Label>
              <Input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Chunk overlap</Label>
              <Input
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {initialData ? "Atualizar" : "Criar grupo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocDialog({
  open,
  onOpenChange,
  onSubmit,
  existingNames,
  existingDocs,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSubmit: (name: string, type: KnowledgeDocument["type"], notes: string) => void;
  existingNames: string[];
  existingDocs: KnowledgeDocument[];
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [name, setName] = useState("");
  const [type, setType] = useState<KnowledgeDocument["type"]>("pdf");
  const [notes, setNotes] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  function submit() {
    if (mode === "new") {
      if (!name.trim() || !file) return;
      onSubmit(name, type, notes);
    } else {
      const doc = existingDocs.find((d) => d.id === selectedDocId);
      if (!doc || !file) return;
      onSubmit(doc.name, doc.type, notes);
    }
    setName("");
    setNotes("");
    setSelectedDocId("");
    setFile(null);
    setMode("new");
    onOpenChange(false);
  }

  const selectedDoc = existingDocs.find((d) => d.id === selectedDocId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
          <DialogDescription>
            Escolha entre fazer upload de um novo documento ou atualizar um existente.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs para novo/existente */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setMode("new")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              mode === "new"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Novo documento
          </button>
          <button
            onClick={() => setMode("existing")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              mode === "existing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Atualizar existente
          </button>
        </div>

        <div className="space-y-4">
          {mode === "new" ? (
            <>
              <div>
                <Label>Anexar arquivo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        if (!name) setName(f.name);
                      }
                    }}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.md,.html,.docx,.txt"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    {file ? (
                      <div className="space-y-1">
                        <Upload className="h-8 w-8 mx-auto text-primary" />
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="font-medium text-sm">Clique para selecionar ou arraste um arquivo</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, Markdown, HTML, DOCX ou TXT
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <Label>Nome do arquivo</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="documento.pdf"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as KnowledgeDocument["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="md">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Selecione um documento</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um documento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {existingDocs.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <span>{doc.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            v{doc.versions.length}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDoc && (
                  <Card className="mt-3 p-3 bg-muted/30">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedDoc.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {selectedDoc.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Páginas: {selectedDoc.pages}</div>
                        <div>Versões: {selectedDoc.versions.length}</div>
                        <div>
                          Última atualização:{" "}
                          {new Date(
                            selectedDoc.versions[selectedDoc.versions.length - 1].uploadedAt
                          ).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <div>
                <Label>Anexar arquivo atualizado</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                    className="hidden"
                    id="file-input-existing"
                    accept=".pdf,.md,.html,.docx,.txt"
                  />
                  <label htmlFor="file-input-existing" className="cursor-pointer">
                    {file ? (
                      <div className="space-y-1">
                        <Upload className="h-8 w-8 mx-auto text-primary" />
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="font-medium text-sm">Clique para selecionar ou arraste um arquivo</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, Markdown, HTML, DOCX ou TXT
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Notas da versão</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={
                mode === "new"
                  ? "Ex: Documento inicial"
                  : "Ex: Atualiza seção 3 e 4"
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={mode === "new" ? !name.trim() || !file : !selectedDocId || !file}
          >
            {mode === "new" ? "Fazer upload" : "Criar nova versão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
