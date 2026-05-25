import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Play,
  Pencil,
} from "lucide-react";
import {
  defaultSuites,
  defaultRuns,
  METRIC_LABEL,
  METRIC_DESC,
  TARGET_LABEL,
  JUDGE_LABEL,
  ALL_METRICS,
  type EvalSuite,
  type EvalRun,
  type EvalMetric,
  type EvalStatus,
  type EvalTarget,
  type EvalJudge,
} from "@/data/evaluation";
import { agentFlows, orchestrations } from "@/data/flows";

export const Route = createFileRoute("/evaluation")({
  component: EvaluationPage,
  head: () => ({ meta: [{ title: "Evaluation · OrkestrAI" }] }),
});

// ─── Color helpers ─────────────────────────────────────────────────────────────

const statusColor: Record<EvalStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  queued: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  running: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const judgeColor: Record<EvalJudge, string> = {
  llm: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  heuristic: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  human: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const targetColor: Record<EvalTarget, string> = {
  agent: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  orchestration: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  rag: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  model: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function pct(score: number) {
  return `${Math.round(score * 100)}%`;
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ClipboardCheck;
  label: string;
  value: number;
  tone: "critical" | "warning" | "info";
}) {
  const tint =
    tone === "critical" ? "text-destructive" : tone === "warning" ? "text-amber-500" : "text-sky-400";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${tint}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function EvaluationPage() {
  const [suites, setSuites] = useState<EvalSuite[]>(defaultSuites);
  const [runs] = useState<EvalRun[]>(defaultRuns);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EvalSuite | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<EvalSuite | null>(null);
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null);

  const summary = useMemo(() => {
    const total = suites.length;
    const active = suites.filter((s) => s.enabled).length;
    const passing = suites.filter(
      (s) => s.lastRun && s.lastRun.metrics.every((m) => m.passed),
    ).length;
    const failing = suites.filter(
      (s) => s.lastRun && s.lastRun.metrics.some((m) => !m.passed),
    ).length;
    return { total, active, passing, failing };
  }, [suites]);

  function saveSuite(suite: EvalSuite) {
    setSuites((prev) => {
      const exists = prev.some((s) => s.id === suite.id);
      return exists ? prev.map((s) => (s.id === suite.id ? suite : s)) : [suite, ...prev];
    });
    setEditing(null);
    setCreating(false);
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Evaluation</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Automated quality measurement for AI model outputs
            </p>
          </div>
          <Button size="sm" onClick={() => setCreating(true)}>
            <ClipboardCheck className="h-4 w-4 mr-1" /> New suite
          </Button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={ClipboardCheck} label="Total suites" value={summary.total} tone="info" />
          <KpiCard icon={CheckCircle2} label="Active suites" value={summary.active} tone="info" />
          <KpiCard icon={TrendingUp} label="Passing" value={summary.passing} tone="info" />
          <KpiCard icon={AlertTriangle} label="Failing" value={summary.failing} tone="critical" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="suites">
          <TabsList>
            <TabsTrigger value="suites">Suites</TabsTrigger>
            <TabsTrigger value="history">Run history</TabsTrigger>
          </TabsList>

          {/* Suites Tab */}
          <TabsContent value="suites">
            <Card className="border-border bg-card/80 backdrop-blur-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enable</TableHead>
                      <TableHead>Suite</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Judge</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Last result</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suites.map((s) => (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedSuite(s)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={s.enabled}
                            onCheckedChange={(v) =>
                              setSuites((prev) =>
                                prev.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={targetColor[s.targetKind]}>
                            {TARGET_LABEL[s.targetKind]}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.targetLabel}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{s.datasetLabel}</div>
                          <div className="text-xs text-muted-foreground">{s.samplesCount} samples</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={judgeColor[s.judge]}>
                            {JUDGE_LABEL[s.judge]}
                          </Badge>
                          {s.judgeModel && (
                            <div className="text-xs text-muted-foreground mt-0.5">{s.judgeModel}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{s.schedule ?? "manual"}</TableCell>
                        <TableCell>
                          {s.lastRun ? (
                            <div className="flex flex-wrap gap-1">
                              {s.lastRun.metrics.map((m) => (
                                <span
                                  key={m.metric}
                                  title={`${METRIC_LABEL[m.metric]}: ${pct(m.score)} (threshold ${pct(m.threshold)})`}
                                  className={`text-[11px] font-mono font-semibold ${m.passed ? "text-emerald-500" : "text-destructive"}`}
                                >
                                  {pct(m.score)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3 mr-1" /> Run now
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(s)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {suites.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No evaluation suites yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Run History Tab */}
          <TabsContent value="history">
            <Card className="border-border bg-card/80 backdrop-blur-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Suite</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Samples</TableHead>
                      <TableHead>Judge</TableHead>
                      <TableHead>Triggered by</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((r) => {
                      const passRatio =
                        r.totalSamples > 0 ? r.passedSamples / r.totalSamples : 0;
                      return (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedRun(r)}
                        >
                          <TableCell>
                            <div className="font-medium">{r.suiteName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${statusColor[r.status]} ${r.status === "running" ? "animate-pulse" : ""}`}
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {r.passedSamples}/{r.totalSamples}
                            </div>
                            {r.totalSamples > 0 && (
                              <div className="w-20 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${passRatio * 100}%` }}
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={judgeColor[r.judge]}>
                              {JUDGE_LABEL[r.judge]}
                            </Badge>
                            {r.judgeModel && (
                              <div className="text-xs text-muted-foreground mt-0.5">{r.judgeModel}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{r.triggeredBy}</TableCell>
                          <TableCell className="text-sm">{r.environment}</TableCell>
                          <TableCell className="text-sm">
                            {r.durationMin != null ? `${r.durationMin}m` : "—"}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {fmt(r.startedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {runs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No runs yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {(creating || editing) && (
          <SuiteEditor
            suite={editing}
            onClose={() => { setEditing(null); setCreating(false); }}
            onSave={saveSuite}
          />
        )}

        <SuiteDetailModal suite={selectedSuite} onClose={() => setSelectedSuite(null)} />
        <RunDetailModal run={selectedRun} onClose={() => setSelectedRun(null)} />
      </div>
    </AppLayout>
  );
}

// ─── Suite Detail Modal ────────────────────────────────────────────────────────

function SuiteDetailModal({
  suite,
  onClose,
}: {
  suite: EvalSuite | null;
  onClose: () => void;
}) {
  if (!suite) return null;
  const lr = suite.lastRun;

  return (
    <Dialog open={!!suite} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className={targetColor[suite.targetKind]}>
              {TARGET_LABEL[suite.targetKind]}
            </Badge>
            <span>{suite.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Description */}
          <p className="text-muted-foreground">{suite.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Target</p>
              <p className="font-medium">{suite.targetLabel}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Dataset</p>
              <p className="font-medium">{suite.datasetLabel}</p>
              <p className="text-xs text-muted-foreground">{suite.samplesCount} samples</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Judge</p>
              <Badge variant="outline" className={judgeColor[suite.judge]}>
                {JUDGE_LABEL[suite.judge]}
              </Badge>
              {suite.judgeModel && (
                <span className="ml-2 text-xs text-muted-foreground">{suite.judgeModel}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Schedule</p>
              <p className="font-medium">{suite.schedule ?? "manual"}</p>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Metrics</p>
            <div className="space-y-1.5">
              {suite.metrics.map((m) => (
                <div key={m} className="flex flex-col rounded-md border border-border bg-muted/20 px-3 py-2">
                  <span className="font-medium">{METRIC_LABEL[m]}</span>
                  <span className="text-xs text-muted-foreground">{METRIC_DESC[m]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last run result */}
          {lr && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Last run result</p>
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusColor[lr.status]}>{lr.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {lr.passedSamples}/{lr.totalSamples} samples passed
                  </span>
                  {lr.durationMin != null && (
                    <span className="text-xs text-muted-foreground">{lr.durationMin}m</span>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lr.metrics.map((m) => (
                      <TableRow key={m.metric}>
                        <TableCell>{METRIC_LABEL[m.metric]}</TableCell>
                        <TableCell
                          className={`font-mono font-semibold ${m.passed ? "text-emerald-500" : "text-destructive"}`}
                        >
                          {pct(m.score)}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {pct(m.threshold)}
                        </TableCell>
                        <TableCell>
                          {m.passed ? (
                            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                              pass
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                              fail
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Run Detail Modal ──────────────────────────────────────────────────────────

function RunDetailModal({
  run,
  onClose,
}: {
  run: EvalRun | null;
  onClose: () => void;
}) {
  if (!run) return null;

  return (
    <Dialog open={!!run} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${statusColor[run.status]} ${run.status === "running" ? "animate-pulse" : ""}`}
            >
              {run.status}
            </Badge>
            <span>{run.suiteName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Judge</p>
              <Badge variant="outline" className={judgeColor[run.judge]}>
                {JUDGE_LABEL[run.judge]}
              </Badge>
              {run.judgeModel && (
                <span className="ml-2 text-xs text-muted-foreground">{run.judgeModel}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Environment</p>
              <p className="font-medium">{run.environment}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Triggered by</p>
              <p className="font-medium">{run.triggeredBy}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{run.durationMin != null ? `${run.durationMin}m` : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Started</p>
              <p className="font-mono">{fmt(run.startedAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Completed</p>
              <p className="font-mono">{fmt(run.completedAt)}</p>
            </div>
          </div>

          {/* Samples progress */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Samples</p>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{run.passedSamples}/{run.totalSamples} passed</span>
              {run.totalSamples > 0 && (
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(run.passedSamples / run.totalSamples) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metrics table */}
          {run.metrics.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Metrics</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {run.metrics.map((m) => (
                    <TableRow key={m.metric}>
                      <TableCell>{METRIC_LABEL[m.metric]}</TableCell>
                      <TableCell
                        className={`font-mono font-semibold ${m.passed ? "text-emerald-500" : "text-destructive"}`}
                      >
                        {pct(m.score)}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {pct(m.threshold)}
                      </TableCell>
                      <TableCell>
                        {m.passed ? (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                            pass
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                            fail
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Suite Editor (Create / Edit) ─────────────────────────────────────────────

const BLANK_SUITE: Omit<EvalSuite, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  targetKind: "agent",
  targetId: "",
  targetLabel: "",
  metrics: [],
  judge: "llm",
  judgeModel: "",
  datasetId: "",
  datasetLabel: "",
  samplesCount: 50,
  schedule: undefined,
  enabled: true,
};

function SuiteEditor({
  suite,
  onClose,
  onSave,
}: {
  suite: EvalSuite | null;
  onClose: () => void;
  onSave: (s: EvalSuite) => void;
}) {
  const [draft, setDraft] = useState<EvalSuite>(
    suite ?? {
      ...BLANK_SUITE,
      id: `eval_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );

  function toggleMetric(m: EvalMetric) {
    setDraft((d) => ({
      ...d,
      metrics: d.metrics.includes(m)
        ? d.metrics.filter((x) => x !== m)
        : [...d.metrics, m],
    }));
  }

  const targetOptions = useMemo(() => {
    if (draft.targetKind === "agent") return agentFlows.map((a) => ({ id: a.id, label: a.name }));
    if (draft.targetKind === "orchestration") return orchestrations.map((o) => ({ id: o.id, label: o.name }));
    return [];
  }, [draft.targetKind]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{suite ? "Edit suite" : "New evaluation suite"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <div className="col-span-2">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Suite name"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What does this suite evaluate?"
              />
            </div>

            {/* Target kind */}
            <div>
              <Label>Target kind</Label>
              <Select
                value={draft.targetKind}
                onValueChange={(v) =>
                  setDraft({ ...draft, targetKind: v as EvalTarget, targetId: "", targetLabel: "" })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="orchestration">Orchestration</SelectItem>
                  <SelectItem value="rag">RAG Index</SelectItem>
                  <SelectItem value="model">Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target label */}
            <div>
              <Label>Target</Label>
              {targetOptions.length > 0 ? (
                <Select
                  value={draft.targetId}
                  onValueChange={(v) => {
                    const opt = targetOptions.find((o) => o.id === v);
                    setDraft({ ...draft, targetId: v, targetLabel: opt?.label ?? v });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select target" /></SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={draft.targetLabel}
                  onChange={(e) => setDraft({ ...draft, targetLabel: e.target.value, targetId: e.target.value })}
                  placeholder="Target identifier"
                />
              )}
            </div>

            {/* Dataset */}
            <div>
              <Label>Dataset</Label>
              <Input
                value={draft.datasetLabel}
                onChange={(e) => setDraft({ ...draft, datasetLabel: e.target.value, datasetId: e.target.value })}
                placeholder="Dataset label"
              />
            </div>

            {/* Samples count */}
            <div>
              <Label>Samples count</Label>
              <Input
                type="number"
                min={1}
                value={draft.samplesCount}
                onChange={(e) => setDraft({ ...draft, samplesCount: Number(e.target.value) })}
              />
            </div>

            {/* Judge */}
            <div>
              <Label>Judge</Label>
              <Select
                value={draft.judge}
                onValueChange={(v) => setDraft({ ...draft, judge: v as EvalJudge })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="llm">LLM-as-Judge</SelectItem>
                  <SelectItem value="heuristic">Heuristic</SelectItem>
                  <SelectItem value="human">Human Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Judge model — only when judge=llm */}
            {draft.judge === "llm" && (
              <div>
                <Label>Judge model</Label>
                <Input
                  value={draft.judgeModel ?? ""}
                  onChange={(e) => setDraft({ ...draft, judgeModel: e.target.value })}
                  placeholder="e.g. GPT-5, Gemini 2.5 Pro"
                />
              </div>
            )}

            {/* Schedule */}
            <div>
              <Label>Schedule</Label>
              <Select
                value={draft.schedule ?? "manual"}
                onValueChange={(v) =>
                  setDraft({ ...draft, schedule: v === "manual" ? undefined : v })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="on_deploy">On deploy</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enabled */}
            <div className="flex items-center gap-2 pt-5">
              <Switch
                id="suite-enabled"
                checked={draft.enabled}
                onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
              />
              <Label htmlFor="suite-enabled">Enabled</Label>
            </div>

            {/* Metrics checklist */}
            <div className="col-span-2">
              <Label className="mb-2 block">Metrics</Label>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {ALL_METRICS.map((m) => (
                  <div
                    key={m}
                    className="flex items-start gap-2 rounded-md border border-border px-3 py-2 bg-muted/20"
                  >
                    <Switch
                      id={`metric-${m}`}
                      checked={draft.metrics.includes(m)}
                      onCheckedChange={() => toggleMetric(m)}
                      className="mt-0.5"
                    />
                    <div>
                      <Label htmlFor={`metric-${m}`} className="cursor-pointer font-medium">
                        {METRIC_LABEL[m]}
                      </Label>
                      <p className="text-xs text-muted-foreground">{METRIC_DESC[m]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString() })}
            disabled={!draft.name || draft.metrics.length === 0}
          >
            Save suite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
