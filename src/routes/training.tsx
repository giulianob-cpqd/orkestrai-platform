import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, Cpu, Database, Play, Square, Trash2, GitBranch, Gauge, DollarSign,
  CircleCheck, CircleAlert, Loader2, Clock, Plus, Search,
} from "lucide-react";
import {
  trainingJobs as initialJobs, datasets, gpuTypes,
  type TrainingJob, type TrainingKind, type TrainingStatus, type FrameworkKind,
} from "@/data/training";
import { models } from "@/data/models";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training · Inspire" }] }),
  component: TrainingPage,
});

const kindLabel: Record<TrainingKind, string> = {
  "llm-finetune": "LLM Fine-tune",
  "llm-lora": "LLM LoRA",
  "llm-rlhf": "LLM RLHF/DPO",
  "ml-classification": "ML Classification",
  "ml-regression": "ML Regression",
  "ml-forecasting": "ML Forecasting",
  "ml-clustering": "ML Clustering",
  "embeddings": "Embeddings",
};

const statusTone: Record<TrainingStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  queued: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  running: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  succeeded: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
  stopped: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

function StatusIcon({ s }: { s: TrainingStatus }) {
  if (s === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  if (s === "succeeded") return <CircleCheck className="h-3.5 w-3.5" />;
  if (s === "failed") return <CircleAlert className="h-3.5 w-3.5" />;
  if (s === "queued") return <Clock className="h-3.5 w-3.5" />;
  return <Square className="h-3.5 w-3.5" />;
}

function TrainingPage() {
  const [jobs, setJobs] = useState<TrainingJob[]>(initialJobs);
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => jobs.filter((j) =>
    (kindFilter === "all" || j.kind === kindFilter) &&
    (statusFilter === "all" || j.status === statusFilter) &&
    (q === "" || j.name.toLowerCase().includes(q.toLowerCase()) || j.dataset.toLowerCase().includes(q.toLowerCase()))
  ), [jobs, q, kindFilter, statusFilter]);

  const kpis = useMemo(() => ({
    total: jobs.length,
    running: jobs.filter((j) => j.status === "running").length,
    succeeded: jobs.filter((j) => j.status === "succeeded").length,
    cost: jobs.reduce((s, j) => s + j.costUsd, 0),
    gpuHours: jobs.reduce((s, j) => s + (j.durationMin / 60) * j.hardware.count, 0),
  }), [jobs]);

  function startJob(id: string) {
    setJobs((j) => j.map((x) => x.id === id ? { ...x, status: "running", progress: Math.max(x.progress, 5) } : x));
  }
  function stopJob(id: string) {
    setJobs((j) => j.map((x) => x.id === id ? { ...x, status: "stopped" } : x));
  }
  function removeJob(id: string) {
    setJobs((j) => j.filter((x) => x.id !== id));
  }

  function createJob(data: Partial<TrainingJob>) {
    const id = `trn_${String(jobs.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    setJobs((j) => [{
      id, name: data.name || "Untitled run",
      kind: (data.kind as TrainingKind) || "llm-lora",
      framework: (data.framework as FrameworkKind) || "peft",
      baseModel: data.baseModel,
      dataset: data.dataset || datasets[0].id,
      datasetRows: datasets.find((d) => d.id === data.dataset)?.rows || 0,
      hyperparams: data.hyperparams || { epochs: 3, batchSize: 16, learningRate: 2e-4, optimizer: "adamw", seed: 42 },
      hardware: data.hardware || { gpu: "A100 80GB", count: 4, nodes: 1 },
      status: "queued", progress: 0, metrics: {}, costUsd: 0, durationMin: 0,
      owner: "you", team: "Platform",
      createdAt: now, updatedAt: now, tags: [],
    }, ...j]);
    setOpen(false);
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Training</h1>
            <p className="text-sm text-muted-foreground">
              Fine-tune LLMs (full, LoRA, RLHF/DPO), treine modelos clássicos de Machine Learning e gere embeddings — com versionamento de artefatos e telemetria de custo.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New training run</Button>
            </DialogTrigger>
            <NewJobDialog onCreate={createJob} />
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <KPI label="Total runs" value={kpis.total} icon={GitBranch} />
          <KPI label="Running" value={kpis.running} icon={Loader2} tone="text-amber-400" />
          <KPI label="Succeeded" value={kpis.succeeded} icon={CircleCheck} tone="text-emerald-400" />
          <KPI label="Spend" value={`$${kpis.cost.toFixed(2)}`} icon={DollarSign} />
          <KPI label="GPU·hours" value={kpis.gpuHours.toFixed(1)} icon={Cpu} />
        </div>

        <Tabs defaultValue="runs">
          <TabsList>
            <TabsTrigger value="runs">Runs</TabsTrigger>
          </TabsList>

          <TabsContent value="runs" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search runs..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64 pl-8" />
              </div>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger className="w-52"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(kindLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {(["queued","running","succeeded","failed","stopped","draft"] as TrainingStatus[]).map((s) =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Base / Dataset</TableHead>
                      <TableHead>Hardware</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Metrics</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="w-32"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((j) => (
                      <TableRow key={j.id}>
                        <TableCell>
                          <div className="font-medium">{j.name}</div>
                          <div className="text-xs text-muted-foreground">{j.owner} · {j.team}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{kindLabel[j.kind]}</Badge>
                          <div className="mt-1 text-[11px] text-muted-foreground">{j.framework}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{j.baseModel || "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            <Database className="mr-1 inline h-3 w-3" />{j.dataset} · {j.datasetRows.toLocaleString()} rows
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{j.hardware.gpu}</div>
                          <div className="text-xs text-muted-foreground">{j.hardware.count}× · {j.hardware.nodes} node(s)</div>
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`gap-1 ${statusTone[j.status]}`}>
                              <StatusIcon s={j.status} />{j.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{j.progress}%</span>
                          </div>
                          <Progress value={j.progress} className="mt-2 h-1.5" />
                        </TableCell>
                        <TableCell className="text-xs">
                          {Object.entries(j.metrics).length === 0 && <span className="text-muted-foreground">—</span>}
                          {Object.entries(j.metrics).map(([k, v]) => (
                            <div key={k}><span className="text-muted-foreground">{k}:</span> {v}</div>
                          ))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">${j.costUsd.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{j.durationMin}m</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {j.status !== "running" && (
                              <Button size="icon" variant="ghost" onClick={() => startJob(j.id)} title="Start">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {j.status === "running" && (
                              <Button size="icon" variant="ghost" onClick={() => stopJob(j.id)} title="Stop">
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => removeJob(j.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function KPI({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; tone?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <Icon className={`h-5 w-5 ${tone ?? "text-muted-foreground"}`} />
      </CardContent>
    </Card>
  );
}

function NewJobDialog({ onCreate }: { onCreate: (j: Partial<TrainingJob>) => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<TrainingKind>("llm-lora");
  const [framework, setFramework] = useState<FrameworkKind>("peft");
  const [baseModel, setBaseModel] = useState<string>(models.filter((m) => m.type === "llm")[0]?.id || "");
  const [dataset, setDataset] = useState<string>(datasets[0].id);
  const [epochs, setEpochs] = useState(3);
  const [batch, setBatch] = useState(16);
  const [lr, setLr] = useState(0.0002);
  const [gpu, setGpu] = useState("A100 80GB");
  const [gpuCount, setGpuCount] = useState(4);
  const [notes, setNotes] = useState("");

  const isLlm = kind.startsWith("llm");
  const isMl = kind.startsWith("ml");
  const isEmbeddings = kind === "embeddings";

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> New training run</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="support-router · LoRA v5" /></div>
        <div>
          <Label>Task type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as TrainingKind)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(kindLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {(isLlm || isMl) && (
          <div>
            <Label>Framework</Label>
            <Select value={framework} onValueChange={(v) => setFramework(v as FrameworkKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {isLlm && (["transformers","trl","peft","unsloth","axolotl"] as FrameworkKind[]).map((f) =>
                  <SelectItem key={f} value={f}>{f}</SelectItem>)}
                {isMl && (["sklearn","xgboost","lightgbm","pytorch","tensorflow"] as FrameworkKind[]).map((f) =>
                  <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {(isLlm || isEmbeddings) && (
          <div className="col-span-2">
            <Label>Base model</Label>
            <Select value={baseModel} onValueChange={setBaseModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {isLlm && models.filter((m) => m.type === "llm").map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </SelectItem>
                ))}
                {isEmbeddings && models.filter((m) => m.type === "embedding").map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="col-span-2">
          <Label>Dataset</Label>
          <Select value={dataset} onValueChange={setDataset}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{datasets.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {d.rows.toLocaleString()} rows</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Epochs</Label><Input type="number" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} /></div>
        <div><Label>Batch size</Label><Input type="number" value={batch} onChange={(e) => setBatch(Number(e.target.value))} /></div>
        <div><Label>Learning rate</Label><Input type="number" step="0.00001" value={lr} onChange={(e) => setLr(Number(e.target.value))} /></div>
        <div>
          <Label>GPU</Label>
          <Select value={gpu} onValueChange={setGpu}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{gpuTypes.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label># GPUs</Label><Input type="number" value={gpuCount} onChange={(e) => setGpuCount(Number(e.target.value))} /></div>
        <div className="col-span-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hypothesis, expected uplift, eval plan…" /></div>
      </div>
      <DialogFooter>
        <Button
          onClick={() =>
            onCreate({
              name, kind, framework: (isLlm || isMl) ? framework : undefined, baseModel: (isLlm || isEmbeddings) ? baseModel : undefined, dataset,
              hyperparams: { epochs, batchSize: batch, learningRate: lr, optimizer: "adamw", seed: 42 },
              hardware: { gpu, count: gpuCount, nodes: 1 },
            })
          }
        >
          <Gauge className="mr-2 h-4 w-4" /> Queue run
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
