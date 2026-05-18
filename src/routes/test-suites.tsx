import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FlaskConical,
  Plus,
  Play,
  Pencil,
  Trash2,
  Search,
  Workflow,
  Bot,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Shield,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  initialTestSuites,
  type TestCase,
  type TestKind,
  type TestStatus,
  type TestSuite,
  type TestTargetKind,
} from "@/data/testSuites";
import { toast } from "sonner";

export const Route = createFileRoute("/test-suites")({
  component: TestSuitesPage,
});

const targetMeta: Record<TestTargetKind, { label: string; icon: typeof Workflow; color: string }> = {
  orchestration: { label: "Orchestration", icon: Workflow, color: "text-primary" },
  agent: { label: "Agent", icon: Bot, color: "text-accent" },
  rag: { label: "RAG", icon: Database, color: "text-warning" },
};

const kindMeta: Record<TestKind, { label: string; icon: typeof Sparkles; color: string }> = {
  functional: { label: "Functional", icon: CheckCircle2, color: "text-primary" },
  quality: { label: "Quality", icon: Sparkles, color: "text-accent" },
  guardrails: { label: "Guardrails", icon: Shield, color: "text-warning" },
  performance: { label: "Performance", icon: Zap, color: "text-success" },
};

const statusMeta: Record<TestStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  passed: { label: "Passed", className: "border-success/40 text-success bg-success/10", icon: CheckCircle2 },
  failed: { label: "Failed", className: "border-destructive/40 text-destructive bg-destructive/10", icon: XCircle },
  running: { label: "Running", className: "border-primary/40 text-primary bg-primary/10", icon: Loader2 },
  skipped: { label: "Skipped", className: "border-muted-foreground/40 text-muted-foreground bg-muted/30", icon: Clock },
  pending: { label: "Pending", className: "border-muted-foreground/40 text-muted-foreground bg-muted/30", icon: Clock },
};

function TestSuitesPage() {
  const [suites, setSuites] = useState<TestSuite[]>(initialTestSuites);
  const [search, setSearch] = useState("");
  const [filterTarget, setFilterTarget] = useState<TestTargetKind | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TestStatus | "all">("all");
  const [editing, setEditing] = useState<TestSuite | null>(null);
  const [editingCase, setEditingCase] = useState<{ suiteId: string; testCase: TestCase | null } | null>(null);

  const filtered = useMemo(() => {
    return suites.filter((s) => {
      if (filterTarget !== "all" && s.targetKind !== filterTarget) return false;
      if (filterStatus !== "all" && s.lastStatus !== filterStatus) return false;
      if (search && !`${s.name} ${s.targetName} ${s.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [suites, search, filterTarget, filterStatus]);

  const kpis = useMemo(() => {
    const totalCases = suites.reduce((acc, s) => acc + s.cases.length, 0);
    const passed = suites.reduce((a, s) => a + s.passed, 0);
    const failed = suites.reduce((a, s) => a + s.failed, 0);
    const passRate = passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0;
    return { totalSuites: suites.length, totalCases, passed, failed, passRate };
  }, [suites]);

  const runSuite = (id: string) => {
    setSuites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lastRunAt: new Date().toISOString(),
              lastStatus: "running" as TestStatus,
              cases: s.cases.map((c) => ({ ...c, lastStatus: "running" as TestStatus })),
            }
          : s,
      ),
    );
    toast.info(`Suite "${suites.find((s) => s.id === id)?.name}" em execução…`);
    setTimeout(() => {
      setSuites((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const cases = s.cases.map((c) => {
            const ok = Math.random() > 0.18;
            return {
              ...c,
              lastStatus: (ok ? "passed" : "failed") as TestStatus,
              lastDurationMs: Math.round(200 + Math.random() * 4000),
              lastRunAt: new Date().toISOString(),
            };
          });
          const passed = cases.filter((c) => c.lastStatus === "passed").length;
          const failed = cases.filter((c) => c.lastStatus === "failed").length;
          return {
            ...s,
            cases,
            passed,
            failed,
            lastRunAt: new Date().toISOString(),
            lastStatus: (failed === 0 ? "passed" : "failed") as TestStatus,
          };
        }),
      );
      toast.success("Execução concluída");
    }, 1400);
  };

  const deleteSuite = (id: string) => {
    setSuites((prev) => prev.filter((s) => s.id !== id));
    toast.success("Suite removida");
  };

  const saveSuite = (next: TestSuite) => {
    setSuites((prev) => {
      const exists = prev.some((s) => s.id === next.id);
      return exists ? prev.map((s) => (s.id === next.id ? next : s)) : [next, ...prev];
    });
    setEditing(null);
    toast.success("Suite salva");
  };

  const saveCase = (suiteId: string, c: TestCase) => {
    setSuites((prev) =>
      prev.map((s) => {
        if (s.id !== suiteId) return s;
        const exists = s.cases.some((x) => x.id === c.id);
        const cases = exists ? s.cases.map((x) => (x.id === c.id ? c : x)) : [...s.cases, c];
        return { ...s, cases };
      }),
    );
    setEditingCase(null);
    toast.success("Caso de teste salvo");
  };

  const removeCase = (suiteId: string, caseId: string) => {
    setSuites((prev) =>
      prev.map((s) => (s.id === suiteId ? { ...s, cases: s.cases.filter((c) => c.id !== caseId) } : s)),
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Test Suites</h1>
            <p className="text-sm text-muted-foreground">
              Configure suítes funcionais, de qualidade, guardrails e desempenho para fluxos, agentes e RAGs.
            </p>
          </div>
          <Button
            onClick={() =>
              setEditing({
                id: `ts-${Date.now()}`,
                name: "",
                description: "",
                targetKind: "orchestration",
                targetId: "",
                targetName: "",
                version: "v1.0.0",
                environment: "staging",
                schedule: "manual",
                cases: [],
                passed: 0,
                failed: 0,
                owner: "",
                tags: [],
                createdAt: new Date().toISOString(),
              })
            }
            className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New Suite
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <KpiCard label="Suites" value={kpis.totalSuites} icon={FlaskConical} />
          <KpiCard label="Test cases" value={kpis.totalCases} icon={CheckCircle2} />
          <KpiCard label="Passed" value={kpis.passed} icon={CheckCircle2} accent="text-success" />
          <KpiCard label="Failed" value={kpis.failed} icon={XCircle} accent="text-destructive" />
          <KpiCard label="Pass rate" value={`${kpis.passRate}%`} icon={Sparkles} accent="text-primary" />
        </div>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por suite, alvo ou tag…"
                className="pl-9"
              />
            </div>
            <Select value={filterTarget} onValueChange={(v) => setFilterTarget(v as typeof filterTarget)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alvos</SelectItem>
                <SelectItem value="orchestration">Orchestration</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="rag">RAG</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Nenhuma suite encontrada.
              </div>
            ) : (
              filtered.map((s) => (
                <SuiteRow
                  key={s.id}
                  suite={s}
                  onRun={() => runSuite(s.id)}
                  onEdit={() => setEditing(s)}
                  onDelete={() => deleteSuite(s.id)}
                  onAddCase={() =>
                    setEditingCase({
                      suiteId: s.id,
                      testCase: null,
                    })
                  }
                  onEditCase={(c) => setEditingCase({ suiteId: s.id, testCase: c })}
                  onRemoveCase={(cid) => removeCase(s.id, cid)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {editing && (
        <SuiteEditor suite={editing} onClose={() => setEditing(null)} onSave={saveSuite} />
      )}
      {editingCase && (
        <CaseEditor
          initial={editingCase.testCase}
          onClose={() => setEditingCase(null)}
          onSave={(c) => saveCase(editingCase.suiteId, c)}
        />
      )}
    </AppLayout>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "text-foreground",
}: {
  label: string;
  value: string | number;
  icon: typeof FlaskConical;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`mt-1 font-display text-2xl font-bold ${accent}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${accent}`} />
      </CardContent>
    </Card>
  );
}

function SuiteRow({
  suite,
  onRun,
  onEdit,
  onDelete,
  onAddCase,
  onEditCase,
  onRemoveCase,
}: {
  suite: TestSuite;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCase: () => void;
  onEditCase: (c: TestCase) => void;
  onRemoveCase: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const TargetIcon = targetMeta[suite.targetKind].icon;
  const StatusIcon = suite.lastStatus ? statusMeta[suite.lastStatus].icon : Clock;
  const total = suite.passed + suite.failed;
  const rate = total > 0 ? (suite.passed / total) * 100 : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 p-3">
        <CollapsibleTrigger className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-muted ${targetMeta[suite.targetKind].color}`}>
          <TargetIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{suite.name}</p>
            <Badge variant="outline" className="font-mono text-[10px]">{suite.version}</Badge>
            {suite.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {targetMeta[suite.targetKind].label}: {suite.targetName} • {suite.cases.length} casos • owner {suite.owner || "—"}
          </p>
        </div>
        <div className="flex w-44 flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-xs">
            <StatusIcon className={`h-3.5 w-3.5 ${suite.lastStatus === "running" ? "animate-spin" : ""}`} />
            <span>{suite.passed}/{total} passed</span>
          </div>
          <Progress value={rate} className="h-1.5 w-full" />
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onRun} className="gap-1">
            <Play className="h-3.5 w-3.5" /> Run
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="border-t border-border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Test cases</p>
            <Button size="sm" variant="outline" onClick={onAddCase} className="gap-1">
              <Plus className="h-3 w-3" /> Add case
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suite.cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                    Nenhum caso de teste ainda.
                  </TableCell>
                </TableRow>
              ) : (
                suite.cases.map((c) => {
                  const KIcon = kindMeta[c.kind].icon;
                  const SIcon = c.lastStatus ? statusMeta[c.lastStatus].icon : Clock;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          {!c.enabled && <Badge variant="outline" className="text-[10px]">disabled</Badge>}
                        </div>
                        {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${kindMeta[c.kind].color}`}>
                          <KIcon className="h-3 w-3" /> {kindMeta[c.kind].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px]">{c.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        {c.lastStatus ? (
                          <Badge variant="outline" className={`gap-1 ${statusMeta[c.lastStatus].className}`}>
                            <SIcon className={`h-3 w-3 ${c.lastStatus === "running" ? "animate-spin" : ""}`} />
                            {statusMeta[c.lastStatus].label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.lastDurationMs ? `${c.lastDurationMs}ms` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => onEditCase(c)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveCase(c.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {suite.lastRunAt && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> Última execução {new Date(suite.lastRunAt).toLocaleString()}
              {suite.schedule && suite.schedule !== "manual" && <> • schedule {suite.schedule}</>}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SuiteEditor({
  suite,
  onClose,
  onSave,
}: {
  suite: TestSuite;
  onClose: () => void;
  onSave: (s: TestSuite) => void;
}) {
  const [draft, setDraft] = useState<TestSuite>(suite);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{suite.name ? "Editar suite" : "Nova suite"}</DialogTitle>
          <DialogDescription>Configure metadados, alvo e agendamento da suíte.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de alvo</Label>
            <Select
              value={draft.targetKind}
              onValueChange={(v) => setDraft({ ...draft, targetKind: v as TestTargetKind })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="orchestration">Orchestration</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="rag">RAG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do alvo</Label>
            <Input
              value={draft.targetName}
              onChange={(e) => setDraft({ ...draft, targetName: e.target.value, targetId: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Versão</Label>
            <Input value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Schedule</Label>
            <Select
              value={draft.schedule ?? "manual"}
              onValueChange={(v) => setDraft({ ...draft, schedule: v as TestSuite["schedule"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="on_deploy">On deploy</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Owner</Label>
            <Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Tags (separadas por vírgula)</Label>
            <Input
              value={draft.tags.join(", ")}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(draft)} disabled={!draft.name || !draft.targetName}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CaseEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: TestCase | null;
  onClose: () => void;
  onSave: (c: TestCase) => void;
}) {
  const [draft, setDraft] = useState<TestCase>(
    initial ?? {
      id: `tc-${Date.now()}`,
      name: "",
      kind: "functional",
      input: "",
      severity: "medium",
      enabled: true,
    },
  );

  const updateMetric = (idx: number, patch: Partial<NonNullable<TestCase["metrics"]>[number]>) => {
    setDraft((d) => {
      const metrics = [...(d.metrics ?? [])];
      metrics[idx] = { ...metrics[idx], ...patch };
      return { ...d, metrics };
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar caso de teste" : "Novo caso de teste"}</DialogTitle>
          <DialogDescription>Defina input, expectativas e critérios por tipo de teste.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as TestKind })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="functional">Functional</SelectItem>
                <SelectItem value="quality">Quality (LLM-judge)</SelectItem>
                <SelectItem value="guardrails">Guardrails</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Severidade</Label>
            <Select value={draft.severity} onValueChange={(v) => setDraft({ ...draft, severity: v as TestCase["severity"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Input</Label>
            <Textarea
              rows={3}
              className="font-mono text-xs"
              value={draft.input}
              onChange={(e) => setDraft({ ...draft, input: e.target.value })}
            />
          </div>
          {draft.kind === "functional" && (
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Output esperado</Label>
              <Textarea
                rows={2}
                className="font-mono text-xs"
                value={draft.expected ?? ""}
                onChange={(e) => setDraft({ ...draft, expected: e.target.value })}
              />
            </div>
          )}
          {draft.kind === "quality" && (
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Métricas (LLM-as-judge)</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      metrics: [...(draft.metrics ?? []), { metric: "faithfulness", threshold: 0.8 }],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              {(draft.metrics ?? []).map((m, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Select value={m.metric} onValueChange={(v) => updateMetric(idx, { metric: v as typeof m.metric })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faithfulness">Faithfulness</SelectItem>
                      <SelectItem value="answer_relevancy">Answer relevancy</SelectItem>
                      <SelectItem value="context_precision">Context precision</SelectItem>
                      <SelectItem value="context_recall">Context recall</SelectItem>
                      <SelectItem value="groundedness">Groundedness</SelectItem>
                      <SelectItem value="coherence">Coherence</SelectItem>
                      <SelectItem value="toxicity">Toxicity</SelectItem>
                      <SelectItem value="bias">Bias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={m.threshold}
                    onChange={(e) => updateMetric(idx, { threshold: Number(e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDraft({ ...draft, metrics: (draft.metrics ?? []).filter((_, i) => i !== idx) })
                    }
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {draft.kind === "guardrails" && (
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Regras de guardrails</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["no_pii", "no_secrets", "no_prompt_injection", "no_jailbreak", "no_hallucination", "no_offtopic", "max_tokens", "blocked_terms"] as const).map((rule) => {
                  const active = (draft.guardrails ?? []).some((g) => g.rule === rule);
                  return (
                    <label
                      key={rule}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-xs ${active ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            guardrails: e.target.checked
                              ? [...(draft.guardrails ?? []), { rule }]
                              : (draft.guardrails ?? []).filter((g) => g.rule !== rule),
                          })
                        }
                      />
                      <span className="font-mono">{rule}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {draft.kind === "performance" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">P95 latência (ms)</Label>
                <Input
                  type="number"
                  value={draft.performance?.p95LatencyMs ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, performance: { ...draft.performance, p95LatencyMs: Number(e.target.value) } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Latência máxima (ms)</Label>
                <Input
                  type="number"
                  value={draft.performance?.maxLatencyMs ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, performance: { ...draft.performance, maxLatencyMs: Number(e.target.value) } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Throughput mín (rps)</Label>
                <Input
                  type="number"
                  value={draft.performance?.minThroughputRps ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, performance: { ...draft.performance, minThroughputRps: Number(e.target.value) } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Concorrência</Label>
                <Input
                  type="number"
                  value={draft.performance?.concurrency ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, performance: { ...draft.performance, concurrency: Number(e.target.value) } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Iterações</Label>
                <Input
                  type="number"
                  value={draft.performance?.iterations ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, performance: { ...draft.performance, iterations: Number(e.target.value) } })
                  }
                />
              </div>
            </>
          )}
          <div className="col-span-2 space-y-2 rounded-md border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">RAG (opcional)</Label>
              <span className="text-[10px] text-muted-foreground">Use quando o caso testar retrieval</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Query"
                value={draft.rag?.query ?? ""}
                onChange={(e) => setDraft({ ...draft, rag: { ...draft.rag, query: e.target.value } })}
              />
              <Input
                placeholder="Docs esperados (ids, vírgula)"
                value={draft.rag?.expectedDocs?.join(", ") ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    rag: { ...draft.rag, query: draft.rag?.query ?? "", expectedDocs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                  })
                }
              />
              <Input
                type="number"
                step="0.05"
                placeholder="Min recall"
                value={draft.rag?.minRecall ?? ""}
                onChange={(e) => setDraft({ ...draft, rag: { ...draft.rag, query: draft.rag?.query ?? "", minRecall: Number(e.target.value) } })}
              />
              <Input
                type="number"
                step="0.05"
                placeholder="Min precision"
                value={draft.rag?.minPrecision ?? ""}
                onChange={(e) => setDraft({ ...draft, rag: { ...draft.rag, query: draft.rag?.query ?? "", minPrecision: Number(e.target.value) } })}
              />
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft({ ...draft, enabled: v })} />
            <Label className="text-xs">Habilitado</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(draft)} disabled={!draft.name || !draft.input}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
