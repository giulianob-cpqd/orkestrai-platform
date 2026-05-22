import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import {
  defaultGuardrails,
  defaultGuardrailEvents,
  KIND_LABEL,
  KIND_DESCRIPTION,
  SCOPE_LABEL,
  ACTION_LABEL,
  type GuardrailRule,
  type GuardrailKind,
  type GuardrailScope,
  type GuardrailAction,
  type GuardrailSeverity,
  type GuardrailApplyTo,
  type BlockedTerm,
} from "@/data/guardrails";
import { agentFlows, orchestrations } from "@/data/flows";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guardrails")({
  head: () => ({ meta: [{ title: "Guardrails · OrkestrAI" }] }),
  component: GuardrailsPage,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_KINDS: GuardrailKind[] = [
  "prompt_injection",
  "jailbreak",
  "pii_masking",
  "toxicity",
  "hallucination",
  "blocked_terms",
  "off_topic",
  "max_tokens",
  "compliance",
];

const sevColor: Record<GuardrailSeverity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const actionColor: Record<GuardrailAction, string> = {
  block: "bg-destructive/15 text-destructive border-destructive/30",
  redact: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  warn: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const SevIcon = ({ sev }: { sev: GuardrailSeverity }) => {
  if (sev === "critical") return <ShieldX className="h-4 w-4 text-destructive" />;
  if (sev === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Info className="h-4 w-4 text-sky-400" />;
};

function fmt(d: string) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function emptyRule(): GuardrailRule {
  return {
    id: `gr-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    description: "",
    enabled: true,
    kind: "prompt_injection",
    scope: "both",
    action: "block",
    severity: "critical",
    applyTo: "all",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function GuardrailsPage() {
  const [rules, setRules] = useState<GuardrailRule[]>(defaultGuardrails);
  const [events] = useState(defaultGuardrailEvents);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [editing, setEditing] = useState<GuardrailRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(
    () =>
      rules.filter((r) => {
        if (kindFilter !== "all" && r.kind !== kindFilter) return false;
        if (query && !`${r.name} ${r.description} ${KIND_LABEL[r.kind]}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [rules, query, kindFilter],
  );

  const kpis = useMemo(() => ({
    total: rules.length,
    enabled: rules.filter((r) => r.enabled).length,
    critical: rules.filter((r) => r.severity === "critical" && r.enabled).length,
    violations: events.length,
  }), [rules, events]);

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  function remove(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function openNew() {
    setEditing(emptyRule());
    setIsNew(true);
  }

  function openEdit(rule: GuardrailRule) {
    setEditing({ ...rule });
    setIsNew(false);
  }

  function save(rule: GuardrailRule) {
    setRules((prev) => {
      const exists = prev.some((r) => r.id === rule.id);
      const next = { ...rule, updatedAt: new Date().toISOString() };
      return exists ? prev.map((r) => (r.id === rule.id ? next : r)) : [next, ...prev];
    });
    setEditing(null);
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">

        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Guardrails</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Content policies, safety filters and compliance rules applied to every AI interaction.
            </p>
          </div>
          <Button size="sm" onClick={openNew} className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New guardrail
          </Button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={ShieldCheck} label="Total rules" value={kpis.total} tone="info" />
          <KpiCard icon={CheckCircle2} label="Enabled" value={kpis.enabled} tone="info" />
          <KpiCard icon={ShieldX} label="Critical active" value={kpis.critical} tone="critical" />
          <KpiCard icon={ShieldAlert} label="Violations today" value={kpis.violations} tone="warning" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rules">
          <TabsList>
            <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
            <TabsTrigger value="violations">Violations ({events.length})</TabsTrigger>
          </TabsList>

          {/* ── Rules tab ── */}
          <TabsContent value="rules" className="space-y-4">

            {/* Filters */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    className="pl-8"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Select value={kindFilter} onValueChange={setKindFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All kinds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All kinds</SelectItem>
                    {ALL_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">On</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Applies to</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id} className={cn(!r.enabled && "opacity-50")}>
                        <TableCell>
                          <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap">{KIND_LABEL[r.kind]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {SCOPE_LABEL[r.scope]}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("whitespace-nowrap", actionColor[r.action])}>
                            {ACTION_LABEL[r.action]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <SevIcon sev={r.severity} />
                            <span className="capitalize text-sm">{r.severity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {r.applyTo === "all" ? (
                            <Badge variant="outline" className="text-[10px]">All</Badge>
                          ) : (
                            <div>
                              <div className="text-xs uppercase text-muted-foreground">{r.applyTo}</div>
                              <div className="text-sm">{r.targetLabel}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmt(r.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                          No guardrail rules match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Violations tab ── */}
          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent violations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Action taken</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Execution</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <Badge variant="outline" className={sevColor[e.severity]}>{e.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{e.ruleName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{KIND_LABEL[e.kind]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={actionColor[e.action]}>
                            {ACTION_LABEL[e.action]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.source}</TableCell>
                        <TableCell className="font-mono text-xs text-primary">{e.executionId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmt(e.detectedAt)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          {e.score !== undefined && (
                            <span className="mr-2 font-mono">score: {e.score.toFixed(2)}</span>
                          )}
                          {e.snippet && (
                            <span className="italic line-clamp-1">{e.snippet}</span>
                          )}
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

      {/* Editor Dialog */}
      {editing && (
        <GuardrailEditor
          rule={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </AppLayout>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
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

// ─── Editor Dialog ────────────────────────────────────────────────────────────

function GuardrailEditor({
  rule,
  isNew,
  onClose,
  onSave,
}: {
  rule: GuardrailRule;
  isNew: boolean;
  onClose: () => void;
  onSave: (r: GuardrailRule) => void;
}) {
  const [draft, setDraft] = useState<GuardrailRule>({ ...rule });
  const [newTerm, setNewTerm] = useState("");
  const [newTermRegex, setNewTermRegex] = useState(false);

  const targetOptions = draft.applyTo === "agent"
    ? agentFlows.map((a) => ({ id: a.id, label: a.name }))
    : orchestrations.map((o) => ({ id: o.id, label: o.name }));

  function addTerm() {
    if (!newTerm.trim()) return;
    const term: BlockedTerm = {
      id: `bt-${Date.now()}`,
      value: newTerm.trim(),
      regex: newTermRegex,
    };
    setDraft((d) => ({ ...d, blockedTerms: [...(d.blockedTerms ?? []), term] }));
    setNewTerm("");
    setNewTermRegex(false);
  }

  function removeTerm(id: string) {
    setDraft((d) => ({ ...d, blockedTerms: (d.blockedTerms ?? []).filter((t) => t.id !== id) }));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "New guardrail" : "Edit guardrail"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          {/* Name */}
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Global Prompt Injection Shield"
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>

          {/* Kind */}
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select
              value={draft.kind}
              onValueChange={(v) => setDraft({ ...draft, kind: v as GuardrailKind })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {KIND_DESCRIPTION[draft.kind]}
            </p>
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Select
              value={draft.scope}
              onValueChange={(v) => setDraft({ ...draft, scope: v as GuardrailScope })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="input">Input only</SelectItem>
                <SelectItem value="output">Output only</SelectItem>
                <SelectItem value="both">Input &amp; Output</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <Label>Action on violation</Label>
            <Select
              value={draft.action}
              onValueChange={(v) => setDraft({ ...draft, action: v as GuardrailAction })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block — reject the request entirely</SelectItem>
                <SelectItem value="redact">Redact — mask or remove the offending fragment</SelectItem>
                <SelectItem value="warn">Warn — allow but log and alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-1.5">
            <Label>Severity</Label>
            <Select
              value={draft.severity}
              onValueChange={(v) => setDraft({ ...draft, severity: v as GuardrailSeverity })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply to */}
          <div className="space-y-1.5">
            <Label>Applies to</Label>
            <Select
              value={draft.applyTo}
              onValueChange={(v) => setDraft({ ...draft, applyTo: v as GuardrailApplyTo, targetId: undefined, targetLabel: undefined })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents &amp; orchestrations</SelectItem>
                <SelectItem value="agent">Specific agent</SelectItem>
                <SelectItem value="orchestration">Specific orchestration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target selector */}
          {draft.applyTo !== "all" && (
            <div className="space-y-1.5">
              <Label>Target {draft.applyTo}</Label>
              <Select
                value={draft.targetId ?? ""}
                onValueChange={(v) => {
                  const opt = targetOptions.find((o) => o.id === v);
                  setDraft({ ...draft, targetId: opt?.id, targetLabel: opt?.label });
                }}
              >
                <SelectTrigger><SelectValue placeholder={`Select ${draft.applyTo}`} /></SelectTrigger>
                <SelectContent>
                  {targetOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Kind-specific config */}
          {(draft.kind === "toxicity" || draft.kind === "hallucination") && (
            <div className="col-span-2 space-y-1.5">
              <Label>
                {draft.kind === "toxicity" ? "Toxicity threshold (0–1)" : "Groundedness threshold (0–1)"}
              </Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={draft.threshold ?? 0.7}
                onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })}
              />
              <p className="text-[11px] text-muted-foreground">
                {draft.kind === "toxicity"
                  ? "Violations triggered when score exceeds this value. Default: 0.75."
                  : "Violations triggered when score falls below this value. Default: 0.60."}
              </p>
            </div>
          )}

          {draft.kind === "max_tokens" && (
            <div className="col-span-2 space-y-1.5">
              <Label>Max tokens</Label>
              <Input
                type="number"
                min={1}
                value={draft.maxTokens ?? 1500}
                onChange={(e) => setDraft({ ...draft, maxTokens: Number(e.target.value) })}
              />
            </div>
          )}

          {draft.kind === "off_topic" && (
            <div className="col-span-2 space-y-1.5">
              <Label>Topic description</Label>
              <Textarea
                rows={3}
                value={draft.topicDescription ?? ""}
                onChange={(e) => setDraft({ ...draft, topicDescription: e.target.value })}
                placeholder="Describe the allowed topics for this agent, e.g. 'Data analysis, SQL queries, reporting and business intelligence.'"
              />
            </div>
          )}

          {draft.kind === "compliance" && (
            <div className="col-span-2 space-y-1.5">
              <Label>Compliance policy</Label>
              <Textarea
                rows={4}
                value={draft.compliancePolicy ?? ""}
                onChange={(e) => setDraft({ ...draft, compliancePolicy: e.target.value })}
                placeholder="Describe the compliance rule in natural language, e.g. 'Do not provide medical diagnoses or treatment recommendations.'"
              />
            </div>
          )}

          {draft.kind === "blocked_terms" && (
            <div className="col-span-2 space-y-3">
              <Label>Blocked terms</Label>
              {/* Existing terms */}
              {(draft.blockedTerms ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(draft.blockedTerms ?? []).map((t) => (
                    <Badge
                      key={t.id}
                      variant="secondary"
                      className="gap-1.5 pr-1 font-mono text-xs"
                    >
                      {t.regex && <span className="text-[9px] uppercase text-muted-foreground">regex</span>}
                      {t.value}
                      <button onClick={() => removeTerm(t.id)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {/* Add new term */}
              <div className="flex gap-2">
                <Input
                  className="font-mono text-xs flex-1"
                  placeholder="Term or regex pattern"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTerm(); } }}
                />
                <div className="flex items-center gap-1.5 rounded border px-2">
                  <Switch
                    id="regex-toggle"
                    checked={newTermRegex}
                    onCheckedChange={setNewTermRegex}
                  />
                  <Label htmlFor="regex-toggle" className="text-xs cursor-pointer">Regex</Label>
                </div>
                <Button type="button" variant="outline" onClick={addTerm}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Press Enter or click + to add. Enable Regex to use regular expression patterns.
              </p>
            </div>
          )}

          {/* Enabled toggle */}
          <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-border">
            <Switch
              id="enabled-toggle"
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
            />
            <Label htmlFor="enabled-toggle" className="cursor-pointer">
              {draft.enabled ? "Enabled — rule is active" : "Disabled — rule is inactive"}
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim()}
            className="bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            {isNew ? "Create guardrail" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
