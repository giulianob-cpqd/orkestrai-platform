import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Plus, Pencil, Trash2, Table2, Hammer, Play, Eye,
  Database, Server, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { datasets as initialDatasets } from "@/data/training";

export const Route = createFileRoute("/datasets")({
  head: () => ({ meta: [{ title: "Datasets · OrkestrAI" }] }),
  component: DatasetsPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────

type DatasetKind = "external" | "internal";

type ExternalStatus = "active" | "draft" | "error";
type InternalStatus = "completed" | "running" | "draft" | "failed";
type DatasetStatus = ExternalStatus | InternalStatus;

type BuildSource =
  | "executions"
  | "conversations"
  | "logs"
  | "rag-chunks"
  | "external-db"
  | "api";

interface TransformConfig {
  filter: boolean;
  filterCriteria: string;
  deduplicate: boolean;
  anonymizePii: boolean;
  annotate: boolean;
  split: boolean;
  splitTrain: number;
  splitVal: number;
  splitTest: number;
}

interface ExternalDataset {
  kind: "external";
  id: string;
  name: string;
  description: string;
  format: string;
  size: string;
  rows: number;
  path: string;
  tags: string[];
  status: ExternalStatus;
}

interface InternalDataset {
  kind: "internal";
  id: string;
  name: string;
  description: string;
  source: BuildSource;
  sourceLabel: string;
  transformLabel: string;
  outputFormat: string;
  outputName: string;
  tags: string[];
  status: InternalStatus;
  rowsGenerated?: number;
  createdAt: string;
}

type Dataset = ExternalDataset | InternalDataset;

// ─── Status colours ─────────────────────────────────────────────────────────

const statusColour: Record<DatasetStatus, string> = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
  completed: "border-success/40 text-success",
  running: "border-warning/40 text-warning",
  failed: "border-destructive/40 text-destructive",
};

// ─── Static data ────────────────────────────────────────────────────────────

const datasetFormats = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "jsonl", label: "JSONL (JSON Lines)" },
  { value: "parquet", label: "Parquet" },
  { value: "deltalake", label: "Delta Lake" },
  { value: "avro", label: "Apache Avro" },
  { value: "orc", label: "Apache ORC" },
  { value: "hdf5", label: "HDF5" },
  { value: "arrow", label: "Apache Arrow" },
  { value: "tfrecord", label: "TFRecord" },
  { value: "protobuf", label: "Protocol Buffers" },
  { value: "xml", label: "XML" },
  { value: "sql", label: "SQL Database" },
  { value: "excel", label: "Excel (XLSX)" },
  { value: "sqlite", label: "SQLite" },
];

const externalFromImport: ExternalDataset[] = initialDatasets.map((d) => ({
  kind: "external",
  id: d.id,
  name: d.name,
  description: (d as { description?: string }).description ?? "Dataset for training and fine-tuning",
  format: (d as { format?: string }).format ?? "CSV",
  size: d.size ?? "0 MB",
  rows: d.rows,
  path: (d as { path?: string }).path ?? `/datasets/${d.id}`,
  tags: Array.isArray((d as { tags?: string[] }).tags) ? (d as { tags: string[] }).tags : [],
  status: "active" as const,
}));

const internalMock: InternalDataset[] = [
  {
    kind: "internal",
    id: "bld_001",
    name: "Support executions · last 30d",
    description: "Filtered and deduplicated execution traces from the support-router agent.",
    source: "executions",
    sourceLabel: "Executions · last 30 days",
    transformLabel: "Filter → Deduplicate → Split 80/10/10",
    outputFormat: "JSONL",
    outputName: "support-executions-30d-v1",
    tags: ["support", "executions"],
    status: "completed",
    rowsGenerated: 14_320,
    createdAt: "2026-05-15T09:00:00Z",
  },
  {
    kind: "internal",
    id: "bld_002",
    name: "Invoice agent conversations",
    description: "Anonymised conversation pairs from the invoice agent over the last 90 days.",
    source: "conversations",
    sourceLabel: "Conversations · invoice-agent · last 90 days",
    transformLabel: "Deduplicate → Anonymize PII → Annotate → Split 70/15/15",
    outputFormat: "JSONL",
    outputName: "invoice-conversations-v2",
    tags: ["conversations", "finance"],
    status: "running",
    createdAt: "2026-05-18T08:30:00Z",
  },
  {
    kind: "internal",
    id: "bld_003",
    name: "RAG chunks · internal docs",
    description: "Fixed-512 chunks from the internal-docs-pt RAG base, ready for embedding fine-tuning.",
    source: "rag-chunks",
    sourceLabel: "RAG Chunks · internal-docs-pt · fixed 512",
    transformLabel: "Filter → Deduplicate",
    outputFormat: "Parquet",
    outputName: "rag-internal-docs-draft",
    tags: ["rag", "embeddings"],
    status: "draft",
    createdAt: "2026-05-18T10:15:00Z",
  },
  {
    kind: "internal",
    id: "bld_004",
    name: "Error logs enrichment",
    description: "Error-level log entries annotated by LLM for root-cause classification.",
    source: "logs",
    sourceLabel: "Logs · error · last 7 days",
    transformLabel: "Filter → Annotate",
    outputFormat: "CSV",
    outputName: "error-logs-enriched-v1",
    tags: ["logs", "error"],
    status: "failed",
    createdAt: "2026-05-17T14:00:00Z",
  },
];

const initialAllDatasets: Dataset[] = [...internalMock, ...externalFromImport];

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultTransforms = (): TransformConfig => ({
  filter: false,
  filterCriteria: "",
  deduplicate: false,
  anonymizePii: false,
  annotate: false,
  split: true,
  splitTrain: 80,
  splitVal: 10,
  splitTest: 10,
});

// ─── Wizard state types ──────────────────────────────────────────────────────

interface WizardStep1 {
  type: DatasetKind;
  name: string;
  description: string;
  tags: string;
}

interface WizardStep2External {
  path: string;
  format: string;
}

interface WizardStep2Internal {
  source: BuildSource;
  // Executions
  execPeriod: string;
  execStatuses: string[];
  // Conversations
  convAgent: string;
  convPeriod: string;
  // Logs
  logLevel: string;
  logPeriod: string;
  // RAG Chunks
  ragBase: string;
  ragStrategy: string;
  // External DB
  dbName: string;
  dbQuery: string;
  // API
  apiName: string;
  apiMethod: string;
  apiEndpoint: string;
  // Transforms
  transforms: TransformConfig;
  outputFormat: string;
}

const defaultStep1 = (): WizardStep1 => ({
  type: "external",
  name: "",
  description: "",
  tags: "",
});

const defaultStep2External = (): WizardStep2External => ({
  path: "",
  format: "jsonl",
});

const defaultStep2Internal = (): WizardStep2Internal => ({
  source: "executions",
  execPeriod: "30d",
  execStatuses: ["success"],
  convAgent: "support-router",
  convPeriod: "30d",
  logLevel: "error",
  logPeriod: "7d",
  ragBase: "internal-docs-pt",
  ragStrategy: "fixed-512",
  dbName: "postgres-prod",
  dbQuery: "",
  apiName: "crm-api",
  apiMethod: "GET",
  apiEndpoint: "/customers",
  transforms: defaultTransforms(),
  outputFormat: "JSONL",
});

// ─── Helper functions ────────────────────────────────────────────────────────

function buildSourceLabel(s: WizardStep2Internal): string {
  switch (s.source) {
    case "executions":
      return `Executions · last ${s.execPeriod}`;
    case "conversations":
      return `Conversations · ${s.convAgent} · last ${s.convPeriod}`;
    case "logs":
      return `Logs · ${s.logLevel} · last ${s.logPeriod}`;
    case "rag-chunks":
      return `RAG Chunks · ${s.ragBase} · ${s.ragStrategy}`;
    case "external-db":
      return `External DB · ${s.dbName}`;
    case "api":
      return `API · ${s.apiName} ${s.apiMethod} ${s.apiEndpoint}`;
    default:
      return s.source;
  }
}

function buildTransformLabel(t: TransformConfig): string {
  const steps: string[] = [];
  if (t.filter) steps.push("Filter");
  if (t.deduplicate) steps.push("Deduplicate");
  if (t.anonymizePii) steps.push("Anonymize PII");
  if (t.annotate) steps.push("Annotate");
  if (t.split)
    steps.push(`Split ${t.splitTrain}/${t.splitVal}/${t.splitTest}`);
  return steps.length > 0 ? steps.join(" → ") : "No transforms";
}

// ─── Main component ──────────────────────────────────────────────────────────

function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>(initialAllDatasets);

  // Expanded row state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [editId, setEditId] = useState<string | null>(null); // null = new

  const [step1, setStep1] = useState<WizardStep1>(defaultStep1());
  const [step2Ext, setStep2Ext] = useState<WizardStep2External>(defaultStep2External());
  const [step2Int, setStep2Int] = useState<WizardStep2Internal>(defaultStep2Internal());

  // ── Open wizard ──────────────────────────────────────────────────────────

  const openNew = () => {
    setEditId(null);
    setStep1(defaultStep1());
    setStep2Ext(defaultStep2External());
    setStep2Int(defaultStep2Internal());
    setWizardStep(1);
    setWizardOpen(true);
  };

  const openEdit = (ds: Dataset) => {
    setEditId(ds.id);
    setStep1({
      type: ds.kind,
      name: ds.name,
      description: ds.description,
      tags: ds.tags ? ds.tags.join(", ") : "",
    });
    if (ds.kind === "external") {
      setStep2Ext({ path: ds.path, format: ds.format });
      setStep2Int(defaultStep2Internal());
    } else {
      setStep2Int({
        source: ds.source,
        execPeriod: "30d",
        execStatuses: ["success"],
        convAgent: "support-router",
        convPeriod: "30d",
        logLevel: "error",
        logPeriod: "7d",
        ragBase: "internal-docs-pt",
        ragStrategy: "fixed-512",
        dbName: "postgres-prod",
        dbQuery: "",
        apiName: "crm-api",
        apiMethod: "GET",
        apiEndpoint: "/customers",
        transforms: defaultTransforms(),
        outputFormat: ds.outputFormat,
      });
      setStep2Ext(defaultStep2External());
    }
    setWizardStep(2);
    setWizardOpen(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleRegisterOrCreate = () => {
    if (!step1.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const tags = step1.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (step1.type === "external") {
      if (!step2Ext.path.trim()) {
        toast.error("Path is required");
        return;
      }
      const ds: ExternalDataset = {
        kind: "external",
        id: editId ?? step1.name.toLowerCase().replace(/\s+/g, "-"),
        name: step1.name,
        description: step1.description,
        format: step2Ext.format,
        size: "—",
        rows: 0,
        path: step2Ext.path,
        tags,
        status: "draft",
      };
      if (editId) {
        setDatasets((prev) => prev.map((d) => (d.id === editId ? ds : d)));
        toast.success(`"${ds.name}" updated`);
      } else {
        setDatasets((prev) => [ds, ...prev]);
        toast.success(`"${ds.name}" registered`);
      }
    } else {
      const ds: InternalDataset = {
        kind: "internal",
        id: editId ?? `bld_${Date.now()}`,
        name: step1.name,
        description: step1.description,
        source: step2Int.source,
        sourceLabel: buildSourceLabel(step2Int),
        transformLabel: buildTransformLabel(step2Int.transforms),
        outputFormat: step2Int.outputFormat,
        outputName: step1.name.toLowerCase().replace(/[\s·]+/g, "-"),
        tags,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      if (editId) {
        setDatasets((prev) => prev.map((d) => (d.id === editId ? ds : d)));
        toast.success(`"${ds.name}" updated`);
      } else {
        setDatasets((prev) => [ds, ...prev]);
        toast.success(`Build job "${ds.name}" created`);
      }
    }
    setWizardOpen(false);
  };

  const handleDelete = (id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    toast.success("Dataset removed");
  };

  const handleRun = (id: string) => {
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === id && d.kind === "internal" ? { ...d, status: "running" } : d,
      ),
    );
    toast.success("Build job started");
  };

  const toggleExecStatus = (s: string) => {
    setStep2Int((prev) => ({
      ...prev,
      execStatuses: prev.execStatuses.includes(s)
        ? prev.execStatuses.filter((x) => x !== s)
        : [...prev.execStatuses, s],
    }));
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout title="Datasets" subtitle="Training datasets for model fine-tuning">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Datasets</h1>
            <p className="text-sm text-muted-foreground">
              All datasets — external registrations and internally built from platform sources.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openNew}
            className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New dataset
          </Button>
        </div>

        {/* Expandable table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead>Dataset</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size / Rows</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((ds) => {
                const isExpanded = expandedId === ds.id;
                const Icon = ds.kind === "internal" ? Hammer : Table2;
                return (
                  <>
                    <TableRow
                      key={ds.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                    >
                      <TableCell className="w-10">
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <div className="leading-tight">
                            <p className="font-semibold text-sm">{ds.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{ds.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ds.kind === "internal" ? (
                          <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">internal</Badge>
                        ) : (
                          <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">external</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1.5 text-[10px]", statusColour[ds.status])}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {ds.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ds.kind === "external" ? ds.format.toUpperCase() : ds.outputFormat}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ds.kind === "external"
                          ? ds.rows > 0 ? `${ds.size} · ${ds.rows.toLocaleString()} rows` : ds.size
                          : ds.rowsGenerated !== undefined ? `${ds.rowsGenerated.toLocaleString()} rows` : "—"
                        }
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {ds.kind === "internal" && (ds.status === "draft" || ds.status === "failed") && (
                            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => handleRun(ds.id)}>
                              <Play className="h-3 w-3" /> Run
                            </Button>
                          )}
                          {ds.kind === "internal" && ds.status === "completed" && (
                            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => toast.info(`Viewing ${ds.outputName}`)}>
                              <Eye className="h-3 w-3" /> View
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => openEdit(ds)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(ds.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t border-border/50 bg-muted/20 p-6">
                            {ds.kind === "external" ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4 text-sm">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Path</p>
                                    <p className="mt-1 font-mono text-xs break-all">{ds.path}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Format</p>
                                    <p className="mt-1 font-medium">{ds.format.toUpperCase()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</p>
                                    <p className="mt-1 font-medium">{ds.size}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rows</p>
                                    <p className="mt-1 font-medium">{ds.rows > 0 ? ds.rows.toLocaleString() : "—"}</p>
                                  </div>
                                </div>
                                {ds.description && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{ds.description}</p>
                                  </div>
                                )}
                                {ds.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {ds.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4 text-sm">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Source</p>
                                    <p className="mt-1 font-mono text-xs">{ds.sourceLabel}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Transforms</p>
                                    <p className="mt-1 text-xs">{ds.transformLabel}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Output</p>
                                    <p className="mt-1 font-medium">{ds.outputFormat}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rows generated</p>
                                    <p className="mt-1 font-medium">{ds.rowsGenerated !== undefined ? ds.rowsGenerated.toLocaleString() : "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Output name</p>
                                    <p className="mt-1 font-mono text-xs">{ds.outputName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Created</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {new Date(ds.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
                                {ds.description && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{ds.description}</p>
                                  </div>
                                )}
                                {ds.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {ds.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
              {datasets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Database className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    No datasets yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* ── Wizard dialog ────────────────────────────────────────────────── */}
      <Dialog open={wizardOpen} onOpenChange={(o) => !o && setWizardOpen(false)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId
                ? step1.type === "external"
                  ? "Edit external dataset"
                  : "Edit internal dataset"
                : wizardStep === 1
                  ? "New dataset — Step 1 of 2"
                  : step1.type === "external"
                    ? "New dataset — External config"
                    : "New dataset — Internal config"}
            </DialogTitle>
          </DialogHeader>

          {wizardStep === 1 && (
            <WizardStep1Panel
              state={step1}
              onChange={setStep1}
              onNext={(s) => {
                if (!s.name.trim()) {
                  toast.error("Name is required");
                  return;
                }
                setStep1(s);
                setWizardStep(2);
              }}
              onCancel={() => setWizardOpen(false)}
            />
          )}

          {wizardStep === 2 && step1.type === "external" && (
            <WizardStep2ExternalPanel
              state={step2Ext}
              onChange={setStep2Ext}
              isEdit={!!editId}
              onBack={() => setWizardStep(1)}
              onCancel={() => setWizardOpen(false)}
              onSubmit={handleRegisterOrCreate}
            />
          )}

          {wizardStep === 2 && step1.type === "internal" && (
            <WizardStep2InternalPanel
              state={step2Int}
              onChange={setStep2Int}
              isEdit={!!editId}
              onBack={() => setWizardStep(1)}
              onCancel={() => setWizardOpen(false)}
              onSubmit={handleRegisterOrCreate}
              toggleExecStatus={toggleExecStatus}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// ─── Wizard panels ───────────────────────────────────────────────────────────

function WizardStep1Panel({
  state,
  onChange,
  onNext,
  onCancel,
}: {
  state: WizardStep1;
  onChange: (s: WizardStep1) => void;
  onNext: (s: WizardStep1) => void;
  onCancel: () => void;
}) {
  // Keep local copy so Next always gets the latest values
  const [local, setLocal] = useState<WizardStep1>(state);

  const update = (patch: Partial<WizardStep1>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Type selection */}
        <div>
          <Label className="mb-2 block text-xs uppercase tracking-widest">
            Dataset type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "external" as DatasetKind,
                  icon: <Server className="h-5 w-5" />,
                  title: "External",
                  desc: "Register a dataset from an external path (S3, GCS, local, database)",
                },
                {
                  value: "internal" as DatasetKind,
                  icon: <Hammer className="h-5 w-5" />,
                  title: "Internal",
                  desc: "Build a dataset from internal platform sources",
                },
              ] as { value: DatasetKind; icon: React.ReactNode; title: string; desc: string }[]
            ).map(({ value, icon, title, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ type: value })}
                className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all focus:outline-none ${
                  local.type === value
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="text-primary">{icon}</span>
                <span className="font-semibold">{title}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <Label className="text-xs uppercase tracking-widest">Name</Label>
          <Input
            value={local.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. Customer Support Tickets"
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-xs uppercase tracking-widest">Description</Label>
          <Textarea
            value={local.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="What does this dataset contain?"
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Tags */}
        <div>
          <Label className="text-xs uppercase tracking-widest">
            Tags (comma-separated)
          </Label>
          <Input
            value={local.tags}
            onChange={(e) => update({ tags: e.target.value })}
            placeholder="e.g. production, labeled, balanced"
            className="mt-1"
          />
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={() => onNext(local)}>
          Next →
        </Button>
      </DialogFooter>
    </>
  );
}

function WizardStep2ExternalPanel({
  state,
  onChange,
  isEdit,
  onBack,
  onCancel,
  onSubmit,
}: {
  state: WizardStep2External;
  onChange: (s: WizardStep2External) => void;
  isEdit: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div>
          <Label className="text-xs uppercase tracking-widest">Path</Label>
          <Input
            value={state.path}
            onChange={(e) => onChange({ ...state, path: e.target.value })}
            placeholder="s3://bucket/name or /data/datasets/name"
            className="mt-1 font-mono text-sm"
          />
        </div>

        <div>
          <Label className="text-xs uppercase tracking-widest">Format</Label>
          <Select
            value={state.format}
            onValueChange={(v) => onChange({ ...state, format: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {datasetFormats.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Dataset information
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <strong>Size</strong> and <strong>Rows</strong> are read-only — they will be populated automatically after ingestion.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-4">
        {!isEdit && (
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        )}
        {isEdit && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={onSubmit}>Register</Button>
      </DialogFooter>
    </>
  );
}

function WizardStep2InternalPanel({
  state,
  onChange,
  isEdit,
  onBack,
  onCancel,
  onSubmit,
  toggleExecStatus,
}: {
  state: WizardStep2Internal;
  onChange: (s: WizardStep2Internal) => void;
  isEdit: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  toggleExecStatus: (s: string) => void;
}) {
  const t = state.transforms;
  const setT = (patch: Partial<TransformConfig>) =>
    onChange({ ...state, transforms: { ...t, ...patch } });

  return (
    <>
      <div className="space-y-5">
        {/* ── Source ────────────────────────────────────────────────────── */}
        <details open className="rounded-lg border border-border">
          <summary className="cursor-pointer select-none rounded-t-lg bg-muted/30 px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted/50">
            Source
          </summary>
          <div className="space-y-4 p-4">
            <div>
              <Label className="text-xs uppercase tracking-widest">Source type</Label>
              <Select
                value={state.source}
                onValueChange={(v) => onChange({ ...state, source: v as BuildSource })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executions">Executions</SelectItem>
                  <SelectItem value="conversations">Conversations</SelectItem>
                  <SelectItem value="logs">Logs</SelectItem>
                  <SelectItem value="rag-chunks">RAG Chunks</SelectItem>
                  <SelectItem value="external-db">External DB</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Executions config */}
            {state.source === "executions" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">Period</Label>
                  <Select
                    value={state.execPeriod}
                    onValueChange={(v) => onChange({ ...state, execPeriod: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-widest">
                    Status filter
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["success", "error", "human_review"].map((s) => (
                      <label
                        key={s}
                        className="flex cursor-pointer items-center gap-1.5"
                      >
                        <input
                          type="checkbox"
                          checked={state.execStatuses.includes(s)}
                          onChange={() => toggleExecStatus(s)}
                          className="rounded"
                        />
                        <span className="text-xs">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversations config */}
            {state.source === "conversations" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">Agent</Label>
                  <Select
                    value={state.convAgent}
                    onValueChange={(v) => onChange({ ...state, convAgent: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support-router">support-router</SelectItem>
                      <SelectItem value="invoice-agent">invoice-agent</SelectItem>
                      <SelectItem value="onboarding-bot">onboarding-bot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest">Period</Label>
                  <Select
                    value={state.convPeriod}
                    onValueChange={(v) => onChange({ ...state, convPeriod: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Logs config */}
            {state.source === "logs" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">Level</Label>
                  <Select
                    value={state.logLevel}
                    onValueChange={(v) => onChange({ ...state, logLevel: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">info</SelectItem>
                      <SelectItem value="warn">warn</SelectItem>
                      <SelectItem value="error">error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest">Period</Label>
                  <Select
                    value={state.logPeriod}
                    onValueChange={(v) => onChange({ ...state, logPeriod: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* RAG Chunks config */}
            {state.source === "rag-chunks" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">RAG Base</Label>
                  <Select
                    value={state.ragBase}
                    onValueChange={(v) => onChange({ ...state, ragBase: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal-docs-pt">internal-docs-pt</SelectItem>
                      <SelectItem value="product-kb">product-kb</SelectItem>
                      <SelectItem value="legal-docs">legal-docs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest">
                    Chunking strategy
                  </Label>
                  <Select
                    value={state.ragStrategy}
                    onValueChange={(v) => onChange({ ...state, ragStrategy: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed-256">Fixed 256 tokens</SelectItem>
                      <SelectItem value="fixed-512">Fixed 512 tokens</SelectItem>
                      <SelectItem value="recursive">Recursive splitter</SelectItem>
                      <SelectItem value="semantic">Semantic chunking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* External DB config */}
            {state.source === "external-db" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">Database</Label>
                  <Select
                    value={state.dbName}
                    onValueChange={(v) => onChange({ ...state, dbName: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres-prod">postgres-prod</SelectItem>
                      <SelectItem value="mysql-analytics">mysql-analytics</SelectItem>
                      <SelectItem value="bigquery-dw">bigquery-dw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest">SQL Query</Label>
                  <Textarea
                    value={state.dbQuery}
                    onChange={(e) => onChange({ ...state, dbQuery: e.target.value })}
                    placeholder="SELECT * FROM conversations WHERE created_at > NOW() - INTERVAL '30 days'"
                    rows={3}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* API config */}
            {state.source === "api" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">API</Label>
                  <Select
                    value={state.apiName}
                    onValueChange={(v) => onChange({ ...state, apiName: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crm-api">crm-api</SelectItem>
                      <SelectItem value="billing-api">billing-api</SelectItem>
                      <SelectItem value="analytics-api">analytics-api</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest">Method</Label>
                  <Select
                    value={state.apiMethod}
                    onValueChange={(v) => onChange({ ...state, apiMethod: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs uppercase tracking-widest">Endpoint</Label>
                  <Input
                    value={state.apiEndpoint}
                    onChange={(e) => onChange({ ...state, apiEndpoint: e.target.value })}
                    placeholder="/v1/customers"
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </details>

        {/* ── Transformations ────────────────────────────────────────────── */}
        <details open className="rounded-lg border border-border">
          <summary className="cursor-pointer select-none rounded-t-lg bg-muted/30 px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted/50">
            Transformations
          </summary>
          <div className="space-y-3 p-4">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <Switch
                checked={t.filter}
                onCheckedChange={(v) => setT({ filter: v })}
              />
              <Label className="text-sm">Filter</Label>
              {t.filter && (
                <Input
                  value={t.filterCriteria}
                  onChange={(e) => setT({ filterCriteria: e.target.value })}
                  placeholder='e.g. length > 50 AND status = "success"'
                  className="h-7 flex-1 text-xs"
                />
              )}
            </div>

            {/* Deduplicate */}
            <div className="flex items-center gap-2">
              <Switch
                checked={t.deduplicate}
                onCheckedChange={(v) => setT({ deduplicate: v })}
              />
              <Label className="text-sm">Deduplicate</Label>
            </div>

            {/* Anonymize PII */}
            <div className="flex items-center gap-2">
              <Switch
                checked={t.anonymizePii}
                onCheckedChange={(v) => setT({ anonymizePii: v })}
              />
              <Label className="text-sm">Anonymize PII</Label>
            </div>

            {/* Annotate */}
            <div className="flex items-center gap-2">
              <Switch
                checked={t.annotate}
                onCheckedChange={(v) => setT({ annotate: v })}
              />
              <Label className="text-sm">
                Annotate{" "}
                <span className="text-xs text-muted-foreground">(LLM-based labeling)</span>
              </Label>
            </div>

            {/* Split */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={t.split}
                  onCheckedChange={(v) => setT({ split: v })}
                />
                <Label className="text-sm">Split train / val / test</Label>
              </div>
              {t.split && (
                <div className="space-y-3 pl-8">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="text-xs text-muted-foreground">Train</span>
                      <span className="font-mono text-xs">{t.splitTrain}%</span>
                    </div>
                    <Slider
                      value={[t.splitTrain]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([v]) => {
                        const remaining = 100 - v;
                        const val = Math.round(remaining / 2);
                        setT({ splitTrain: v, splitVal: val, splitTest: remaining - val });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                      Val:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {t.splitVal}%
                      </span>
                    </div>
                    <div>
                      Test:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {t.splitTest}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </details>

        {/* ── Output format ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-widest">Output format</Label>
            <Select
              value={state.outputFormat}
              onValueChange={(v) => onChange({ ...state, outputFormat: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JSONL">JSONL</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="Parquet">Parquet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-4">
        {!isEdit && (
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        )}
        {isEdit && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={onSubmit}>{isEdit ? "Save" : "Create job"}</Button>
      </DialogFooter>
    </>
  );
}
