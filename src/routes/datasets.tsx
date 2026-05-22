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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Table2, Hammer, Play, Eye } from "lucide-react";
import { toast } from "sonner";
import { datasets as initialDatasets } from "@/data/training";

export const Route = createFileRoute("/datasets")({
  head: () => ({ meta: [{ title: "Datasets · OrkestrAI" }] }),
  component: DatasetsPage,
});

// ─── External Datasets types ───────────────────────────────────────────────

interface DatasetEntry {
  id: string;
  name: string;
  description: string;
  format: string;
  size: string;
  rows: number;
  path: string;
  tags: string[];
  status: "active" | "draft" | "error";
}

const externalStatusMap: Record<DatasetEntry["status"], string> = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

// ─── Build Dataset types ───────────────────────────────────────────────────

type BuildJobStatus = "draft" | "running" | "completed" | "failed";
type BuildSource = "executions" | "conversations" | "logs" | "rag-chunks" | "external-db" | "api";

const buildStatusMap: Record<BuildJobStatus, string> = {
  draft: "border-border text-muted-foreground",
  running: "border-warning/40 text-warning",
  completed: "border-success/40 text-success",
  failed: "border-destructive/40 text-destructive",
};

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

interface BuildJob {
  id: string;
  name: string;
  status: BuildJobStatus;
  source: BuildSource;
  sourceLabel: string;
  transformLabel: string;
  outputFormat: string;
  outputName: string;
  rowsGenerated?: number;
  createdAt: string;
}

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

const mockBuildJobs: BuildJob[] = [
  {
    id: "bld_001",
    name: "Support executions · last 30d",
    status: "completed",
    source: "executions",
    sourceLabel: "Executions · last 30 days",
    transformLabel: "Filter → Deduplicate → Split 80/10/10",
    outputFormat: "JSONL",
    outputName: "support-executions-30d-v1",
    rowsGenerated: 14_320,
    createdAt: "2026-05-15T09:00:00Z",
  },
  {
    id: "bld_002",
    name: "Invoice agent conversations",
    status: "running",
    source: "conversations",
    sourceLabel: "Conversations · invoice-agent · last 90 days",
    transformLabel: "Deduplicate → Anonymize PII → Annotate → Split 70/15/15",
    outputFormat: "JSONL",
    outputName: "invoice-conversations-v2",
    createdAt: "2026-05-18T08:30:00Z",
  },
  {
    id: "bld_003",
    name: "RAG chunks · internal docs",
    status: "draft",
    source: "rag-chunks",
    sourceLabel: "RAG Chunks · internal-docs-pt · fixed 512",
    transformLabel: "Filter → Deduplicate",
    outputFormat: "Parquet",
    outputName: "rag-internal-docs-draft",
    createdAt: "2026-05-18T10:15:00Z",
  },
  {
    id: "bld_004",
    name: "Error logs enrichment",
    status: "failed",
    source: "logs",
    sourceLabel: "Logs · error · last 7 days",
    transformLabel: "Filter → Annotate",
    outputFormat: "CSV",
    outputName: "error-logs-enriched-v1",
    createdAt: "2026-05-17T14:00:00Z",
  },
];

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

const generateRandomSize = (): { size: string; rows: number } => {
  const rows = Math.floor(Math.random() * 5_000_000) + 10_000; // 10k to 5M rows
  const sizeGb = (rows * 0.000008).toFixed(1); // Approximate: ~8 bytes per row
  return {
    rows,
    size: `${sizeGb} GB`,
  };
};

const initialItems: DatasetEntry[] = initialDatasets.map((d) => ({
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

function DatasetsPage() {
  // ── External Datasets state ──────────────────────────────────────────────
  const [items, setItems] = useState(initialItems);
  const [editItem, setEditItem] = useState<DatasetEntry | null>(null);
  const [isNew, setIsNew] = useState(false);

  // ── Build Dataset state ──────────────────────────────────────────────────
  const [buildJobs, setBuildJobs] = useState<BuildJob[]>(mockBuildJobs);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [editBuildJob, setEditBuildJob] = useState<BuildJob | null>(null);
  const [isBuildNew, setIsBuildNew] = useState(false);

  // Wizard form state
  const [bjName, setBjName] = useState("");
  const [bjSource, setBjSource] = useState<BuildSource>("executions");
  // Executions config
  const [bjExecPeriod, setBjExecPeriod] = useState("30d");
  const [bjExecStatuses, setBjExecStatuses] = useState<string[]>(["success"]);
  // Conversations config
  const [bjConvAgent, setBjConvAgent] = useState("support-router");
  const [bjConvPeriod, setBjConvPeriod] = useState("30d");
  // Logs config
  const [bjLogLevel, setBjLogLevel] = useState("error");
  const [bjLogPeriod, setBjLogPeriod] = useState("7d");
  // RAG Chunks config
  const [bjRagBase, setBjRagBase] = useState("internal-docs-pt");
  const [bjRagStrategy, setBjRagStrategy] = useState("fixed-512");
  // External DB config
  const [bjDbName, setBjDbName] = useState("postgres-prod");
  const [bjDbQuery, setBjDbQuery] = useState("");
  // API config
  const [bjApiName, setBjApiName] = useState("crm-api");
  const [bjApiEndpoint, setBjApiEndpoint] = useState("/customers");
  const [bjApiMethod, setBjApiMethod] = useState("GET");
  // Transforms
  const [transforms, setTransforms] = useState<TransformConfig>(defaultTransforms());
  // Output
  const [bjOutputFormat, setBjOutputFormat] = useState("JSONL");

  const openNew = () => {
    const randomData = generateRandomSize();
    setEditItem({ 
      id: "", 
      name: "", 
      description: "", 
      format: "CSV", 
      size: randomData.size, 
      rows: randomData.rows, 
      path: "", 
      tags: [], 
      status: "draft" 
    });
    setIsNew(true);
  };

  const openEdit = (item: DatasetEntry) => {
    setEditItem({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editItem || !editItem.name.trim()) { toast.error("Name is required"); return; }
    if (isNew) {
      const id = editItem.name.toLowerCase().replace(/\s+/g, "-");
      setItems([{ ...editItem, id }, ...items]);
      toast.success(`"${editItem.name}" registered`);
    } else {
      setItems(items.map((i) => (i.id === editItem.id ? editItem : i)));
      toast.success(`"${editItem.name}" updated`);
    }
    setEditItem(null);
  };

  const remove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success("Removed");
  };

  // ── Build job helpers ────────────────────────────────────────────────────

  const resetBuildForm = () => {
    setBjName("");
    setBjSource("executions");
    setBjExecPeriod("30d");
    setBjExecStatuses(["success"]);
    setBjConvAgent("support-router");
    setBjConvPeriod("30d");
    setBjLogLevel("error");
    setBjLogPeriod("7d");
    setBjRagBase("internal-docs-pt");
    setBjRagStrategy("fixed-512");
    setBjDbName("postgres-prod");
    setBjDbQuery("");
    setBjApiName("crm-api");
    setBjApiEndpoint("/customers");
    setBjApiMethod("GET");
    setTransforms(defaultTransforms());
    setBjOutputFormat("JSONL");
  };

  const openNewBuildJob = () => {
    resetBuildForm();
    setEditBuildJob(null);
    setIsBuildNew(true);
    setBuildDialogOpen(true);
  };

  const openEditBuildJob = (job: BuildJob) => {
    setEditBuildJob(job);
    setBjName(job.name);
    setBjSource(job.source);
    setBjOutputFormat(job.outputFormat);
    setIsBuildNew(false);
    setBuildDialogOpen(true);
  };

  const buildSourceLabel = (): string => {
    switch (bjSource) {
      case "executions": return `Executions · last ${bjExecPeriod}`;
      case "conversations": return `Conversations · ${bjConvAgent} · last ${bjConvPeriod}`;
      case "logs": return `Logs · ${bjLogLevel} · last ${bjLogPeriod}`;
      case "rag-chunks": return `RAG Chunks · ${bjRagBase} · ${bjRagStrategy}`;
      case "external-db": return `External DB · ${bjDbName}`;
      case "api": return `API · ${bjApiName} ${bjApiMethod} ${bjApiEndpoint}`;
      default: return bjSource;
    }
  };

  const buildTransformLabel = (): string => {
    const steps: string[] = [];
    if (transforms.filter) steps.push("Filter");
    if (transforms.deduplicate) steps.push("Deduplicate");
    if (transforms.anonymizePii) steps.push("Anonymize PII");
    if (transforms.annotate) steps.push("Annotate");
    if (transforms.split) steps.push(`Split ${transforms.splitTrain}/${transforms.splitVal}/${transforms.splitTest}`);
    return steps.length > 0 ? steps.join(" → ") : "No transforms";
  };

  const saveBuildJob = () => {
    if (!bjName.trim()) { toast.error("Name is required"); return; }
    const outputName = bjName.toLowerCase().replace(/\s+/g, "-").replace(/[·\s]/g, "-");
    if (isBuildNew) {
      const newJob: BuildJob = {
        id: `bld_${Date.now()}`,
        name: bjName,
        status: "draft",
        source: bjSource,
        sourceLabel: buildSourceLabel(),
        transformLabel: buildTransformLabel(),
        outputFormat: bjOutputFormat,
        outputName,
        createdAt: new Date().toISOString(),
      };
      setBuildJobs([newJob, ...buildJobs]);
      toast.success(`Build job "${bjName}" created`);
    } else if (editBuildJob) {
      setBuildJobs(buildJobs.map((j) =>
        j.id === editBuildJob.id
          ? { ...j, name: bjName, source: bjSource, sourceLabel: buildSourceLabel(), transformLabel: buildTransformLabel(), outputFormat: bjOutputFormat, outputName }
          : j
      ));
      toast.success(`"${bjName}" updated`);
    }
    setBuildDialogOpen(false);
  };

  const runBuildJob = (id: string) => {
    setBuildJobs(buildJobs.map((j) => j.id === id ? { ...j, status: "running" } : j));
    toast.success("Build job started");
  };

  const removeBuildJob = (id: string) => {
    setBuildJobs(buildJobs.filter((j) => j.id !== id));
    toast.success("Build job removed");
  };

  const toggleExecStatus = (s: string) => {
    setBjExecStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <AppLayout title="Datasets" subtitle="Training datasets for model fine-tuning">
      <div className="p-6">
        <Tabs defaultValue="external">
          {/* Header with tabs */}
          <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Datasets</h1>
              <p className="text-sm text-muted-foreground">Manage external datasets and build new ones from internal sources.</p>
            </div>
            <TabsList>
              <TabsTrigger value="external" className="gap-1.5">
                <Table2 className="h-3.5 w-3.5" /> External Datasets
              </TabsTrigger>
              <TabsTrigger value="build" className="gap-1.5">
                <Hammer className="h-3.5 w-3.5" /> Build Dataset
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: External Datasets */}
          <TabsContent value="external">
            <div className="mb-5 flex justify-end">
              <Button size="sm" onClick={openNew} className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> Register dataset
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/0 text-primary">
                    <Table2 className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-base font-semibold">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.id}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`gap-1.5 ${externalStatusMap[item.status]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {item.status}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

              <p className="text-xs text-muted-foreground mt-2 truncate font-mono">{item.path}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px] font-normal">{item.format}</Badge>
                <Badge variant="secondary" className="text-[10px] font-normal">{item.size}</Badge>
                <Badge variant="secondary" className="text-[10px] font-normal">{item.rows.toLocaleString()} rows</Badge>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-12">
                <Table2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No datasets registered yet</p>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Build Dataset */}
          <TabsContent value="build">
            <div className="mb-5 flex justify-end">
              <Button size="sm" onClick={openNewBuildJob} className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New build job
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {buildJobs.map((job) => (
                <Card key={job.id} className="group relative overflow-hidden border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/0 text-primary">
                        <Hammer className="h-5 w-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="font-display text-base font-semibold">{job.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{job.id}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`gap-1.5 ${buildStatusMap[job.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {job.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground font-mono">{job.sourceLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{job.transformLabel}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] font-normal">{job.outputFormat}</Badge>
                    {job.rowsGenerated !== undefined && (
                      <Badge variant="secondary" className="text-[10px] font-normal">{job.rowsGenerated.toLocaleString()} rows</Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                    {(job.status === "draft" || job.status === "failed") && (
                      <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-xs" onClick={() => runBuildJob(job.id)}>
                        <Play className="h-3.5 w-3.5" /> Run
                      </Button>
                    )}
                    {job.status === "completed" && (
                      <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-xs" onClick={() => toast.info(`Viewing ${job.outputName}`)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={() => openEditBuildJob(job)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive" onClick={() => removeBuildJob(job.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {buildJobs.length === 0 && (
              <div className="text-center py-12">
                <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No build jobs yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Register dataset" : "Edit dataset"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-widest">Name</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} placeholder="e.g. Customer Support Tickets" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Description</Label>
                <Textarea value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} placeholder="Dataset description..." rows={3} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Path</Label>
                <Input value={editItem.path} onChange={(e) => setEditItem({ ...editItem, path: e.target.value })} placeholder="e.g. s3://bucket/datasets/name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Format</Label>
                <Select value={editItem.format} onValueChange={(v) => setEditItem({ ...editItem, format: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {datasetFormats.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Dataset Information (Read-only)</Label>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{editItem.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="font-medium">{editItem.rows.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Tags (comma-separated)</Label>
                <Input value={editItem.tags.join(", ")} onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="e.g. production, labeled, balanced" className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Register" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Build Job Dialog */}
      <Dialog open={buildDialogOpen} onOpenChange={(o) => !o && setBuildDialogOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isBuildNew ? "New build job" : "Edit build job"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-xs uppercase tracking-widest">Name</Label>
              <Input value={bjName} onChange={(e) => setBjName(e.target.value)} placeholder="e.g. Support executions · last 30d" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Source</Label>
              <Select value={bjSource} onValueChange={(v) => setBjSource(v as BuildSource)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Source config</p>
              {bjSource === "executions" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Period</Label>
                    <Select value={bjExecPeriod} onValueChange={setBjExecPeriod}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest mb-2 block">Status filter</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["success", "error", "human_review"].map((s) => (
                        <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={bjExecStatuses.includes(s)} onChange={() => toggleExecStatus(s)} className="rounded" />
                          <span className="text-xs">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {bjSource === "conversations" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Agent</Label>
                    <Select value={bjConvAgent} onValueChange={setBjConvAgent}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support-router">support-router</SelectItem>
                        <SelectItem value="invoice-agent">invoice-agent</SelectItem>
                        <SelectItem value="onboarding-bot">onboarding-bot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Period</Label>
                    <Select value={bjConvPeriod} onValueChange={setBjConvPeriod}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {bjSource === "logs" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Level</Label>
                    <Select value={bjLogLevel} onValueChange={setBjLogLevel}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">info</SelectItem>
                        <SelectItem value="warn">warn</SelectItem>
                        <SelectItem value="error">error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Period</Label>
                    <Select value={bjLogPeriod} onValueChange={setBjLogPeriod}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {bjSource === "rag-chunks" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">RAG Base</Label>
                    <Select value={bjRagBase} onValueChange={setBjRagBase}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal-docs-pt">internal-docs-pt</SelectItem>
                        <SelectItem value="product-kb">product-kb</SelectItem>
                        <SelectItem value="legal-docs">legal-docs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Chunking strategy</Label>
                    <Select value={bjRagStrategy} onValueChange={setBjRagStrategy}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              {bjSource === "external-db" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Database</Label>
                    <Select value={bjDbName} onValueChange={setBjDbName}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgres-prod">postgres-prod</SelectItem>
                        <SelectItem value="mysql-analytics">mysql-analytics</SelectItem>
                        <SelectItem value="bigquery-dw">bigquery-dw</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest">SQL Query</Label>
                    <Textarea value={bjDbQuery} onChange={(e) => setBjDbQuery(e.target.value)} placeholder="SELECT * FROM conversations WHERE created_at > NOW() - INTERVAL '30 days'" rows={3} className="mt-1 font-mono text-xs" />
                  </div>
                </div>
              )}
              {bjSource === "api" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest">API</Label>
                    <Select value={bjApiName} onValueChange={setBjApiName}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crm-api">crm-api</SelectItem>
                        <SelectItem value="billing-api">billing-api</SelectItem>
                        <SelectItem value="analytics-api">analytics-api</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest">Method</Label>
                    <Select value={bjApiMethod} onValueChange={setBjApiMethod}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs uppercase tracking-widest">Endpoint</Label>
                    <Input value={bjApiEndpoint} onChange={(e) => setBjApiEndpoint(e.target.value)} placeholder="/v1/customers" className="mt-1 font-mono text-xs" />
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Transformations</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={transforms.filter} onCheckedChange={(v) => setTransforms({ ...transforms, filter: v })} />
                  <Label className="text-sm">Filter</Label>
                  {transforms.filter && (
                    <Input value={transforms.filterCriteria} onChange={(e) => setTransforms({ ...transforms, filterCriteria: e.target.value })} placeholder='e.g. length > 50 AND status = "success"' className="text-xs h-7 flex-1" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={transforms.deduplicate} onCheckedChange={(v) => setTransforms({ ...transforms, deduplicate: v })} />
                  <Label className="text-sm">Deduplicate</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={transforms.anonymizePii} onCheckedChange={(v) => setTransforms({ ...transforms, anonymizePii: v })} />
                  <Label className="text-sm">Anonymize PII</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={transforms.annotate} onCheckedChange={(v) => setTransforms({ ...transforms, annotate: v })} />
                  <Label className="text-sm">Annotate <span className="text-xs text-muted-foreground">(LLM-based labeling)</span></Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={transforms.split} onCheckedChange={(v) => setTransforms({ ...transforms, split: v })} />
                    <Label className="text-sm">Split train / val / test</Label>
                  </div>
                  {transforms.split && (
                    <div className="pl-8 space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Train</span>
                          <span className="text-xs font-mono">{transforms.splitTrain}%</span>
                        </div>
                        <Slider
                          value={[transforms.splitTrain]}
                          min={0} max={100} step={5}
                          onValueChange={([v]) => {
                            const remaining = 100 - v;
                            const val = Math.round(remaining / 2);
                            setTransforms({ ...transforms, splitTrain: v, splitVal: val, splitTest: remaining - val });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <div>Val: <span className="font-mono font-semibold text-foreground">{transforms.splitVal}%</span></div>
                        <div>Test: <span className="font-mono font-semibold text-foreground">{transforms.splitTest}%</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-widest">Output format</Label>
                <Select value={bjOutputFormat} onValueChange={setBjOutputFormat}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSONL">JSONL</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="Parquet">Parquet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Output name</Label>
                <Input
                  value={bjName ? bjName.toLowerCase().replace(/[\s·]+/g, "-") : ""}
                  readOnly
                  className="mt-1 font-mono text-xs bg-muted/50 text-muted-foreground"
                  placeholder="auto-generated"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuildDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveBuildJob}>{isBuildNew ? "Create job" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
