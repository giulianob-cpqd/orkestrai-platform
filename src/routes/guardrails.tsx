import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  defaultGuardrails,
  defaultGuardrailEvents,
  ALL_KINDS,
  KIND_LABEL,
  KIND_DESCRIPTION,
  SCOPE_LABEL,
  ACTION_LABEL,
  type GuardrailRule,
  type GuardrailEvent,
  type GuardrailAction,
  type GuardrailSeverity,
} from "@/data/guardrails";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guardrails")({
  head: () => ({ meta: [{ title: "Guardrails · OrkestrAI" }] }),
  component: GuardrailsPage,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sevColor: Record<GuardrailSeverity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  warning:  "bg-amber-500/15 text-amber-500 border-amber-500/30",
  info:     "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const actionColor: Record<GuardrailAction, string> = {
  block:  "bg-destructive/15 text-destructive border-destructive/30",
  redact: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  warn:   "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

function SevIcon({ sev }: { sev: GuardrailSeverity }) {
  if (sev === "critical") return <ShieldX className="h-4 w-4 text-destructive" />;
  if (sev === "warning")  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Info className="h-4 w-4 text-sky-400" />;
}

function fmt(d: string) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function GuardrailsPage() {
  const [rules, setRules] = useState<GuardrailRule[]>(defaultGuardrails);
  const events = defaultGuardrailEvents;

  // ── Rules filters ──────────────────────────────────────────────────────────
  const [rulesQuery, setRulesQuery]     = useState("");
  const [kindFilter, setKindFilter]     = useState("all");

  // ── Violations filters ─────────────────────────────────────────────────────
  const [violQuery, setViolQuery]       = useState("");
  const [violSev, setViolSev]           = useState("all");
  const [violKind, setViolKind]         = useState("all");
  const [violAction, setViolAction]     = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<GuardrailEvent | null>(null);

  const filteredRules = useMemo(() =>
    rules.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (rulesQuery && !`${r.name} ${r.description} ${KIND_LABEL[r.kind]}`
        .toLowerCase().includes(rulesQuery.toLowerCase())) return false;
      return true;
    }),
    [rules, rulesQuery, kindFilter],
  );

  const filteredEvents = useMemo(() =>
    events.filter((e) => {
      if (violSev    !== "all" && e.severity !== violSev)    return false;
      if (violKind   !== "all" && e.kind     !== violKind)   return false;
      if (violAction !== "all" && e.action   !== violAction) return false;
      if (violQuery && !`${e.ruleName} ${e.source} ${e.executionId} ${e.snippet ?? ""}`
        .toLowerCase().includes(violQuery.toLowerCase())) return false;
      return true;
    }),
    [events, violQuery, violSev, violKind, violAction],
  );

  const kpis = useMemo(() => ({
    total:      rules.length,
    enabled:    rules.filter((r) => r.enabled).length,
    critical:   rules.filter((r) => r.severity === "critical" && r.enabled).length,
    violations: events.length,
  }), [rules, events]);

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
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
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={ShieldCheck}  label="Total rules"      value={kpis.total}      tone="info"     />
          <KpiCard icon={CheckCircle2} label="Enabled"          value={kpis.enabled}    tone="info"     />
          <KpiCard icon={ShieldX}      label="Critical active"  value={kpis.critical}   tone="critical" />
          <KpiCard icon={ShieldAlert}  label="Violations today" value={kpis.violations} tone="warning"  />
        </div>

        {/* Tabs — Violations first */}
        <Tabs defaultValue="violations">
          <TabsList>
            <TabsTrigger value="violations">Violations ({events.length})</TabsTrigger>
            <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          </TabsList>

          {/* ── Violations tab ── */}
          <TabsContent value="violations" className="space-y-4">

            {/* Filters bar — same pattern as Alerts */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search violations..."
                    className="pl-8"
                    value={violQuery}
                    onChange={(e) => setViolQuery(e.target.value)}
                  />
                </div>

                <Select value={violSev} onValueChange={setViolSev}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={violKind} onValueChange={setViolKind}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All kinds</SelectItem>
                    {ALL_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={violAction} onValueChange={setViolAction}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="redact">Redact</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
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
                    {filteredEvents.map((e) => (
                      <TableRow
                        key={e.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEvent(e)}
                      >
                        <TableCell>
                          <Badge variant="outline" className={sevColor[e.severity]}>
                            {e.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{e.ruleName}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {SCOPE_LABEL[e.scope]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {KIND_LABEL[e.kind]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("whitespace-nowrap", actionColor[e.action])}>
                            {ACTION_LABEL[e.action]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.source}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-primary">
                          {e.executionId}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmt(e.detectedAt)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                          {e.score !== undefined && (
                            <span className="mr-2 font-mono">
                              score: {e.score.toFixed(2)}
                            </span>
                          )}
                          {e.snippet && (
                            <span className="italic line-clamp-1">{e.snippet}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                          No violations match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Rules tab — switch only, no add/edit/delete ── */}
          <TabsContent value="rules" className="space-y-4">

            {/* Filters bar */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    className="pl-8"
                    value={rulesQuery}
                    onChange={(e) => setRulesQuery(e.target.value)}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Enable or disable each rule. All rules are pre-configured — contact your platform admin to adjust thresholds or policies.
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Enable</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Applies to</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((r) => (
                      <TableRow key={r.id} className={cn(!r.enabled && "opacity-50")}>
                        <TableCell>
                          <Switch
                            checked={r.enabled}
                            onCheckedChange={() => toggle(r.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                            {r.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {KIND_LABEL[r.kind]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {SCOPE_LABEL[r.scope]}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("whitespace-nowrap", actionColor[r.action])}
                          >
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
                              <div className="text-xs uppercase text-muted-foreground">
                                {r.applyTo}
                              </div>
                              <div className="text-sm">{r.targetLabel}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmt(r.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                          No guardrail rules match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Violation detail modal */}
      {selectedEvent && (
        <GuardrailViolationDetail
          event={selectedEvent}
          rule={rules.find((r) => r.id === selectedEvent.ruleId) ?? null}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </AppLayout>
  );
}

// ─── Violation Detail Modal ───────────────────────────────────────────────────

function GuardrailViolationDetail({
  event,
  rule,
  onClose,
}: {
  event: GuardrailEvent;
  rule: GuardrailRule | null;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={sevColor[event.severity]}>{event.severity}</Badge>
            <span>{event.ruleName}</span>
            <Badge variant="secondary" className="whitespace-nowrap">{KIND_LABEL[event.kind]}</Badge>
            <Badge variant="outline" className={actionColor[event.action]}>{ACTION_LABEL[event.action]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Main info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Scope</p>
              <p className="font-medium">{SCOPE_LABEL[event.scope]}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Source</p>
              <p className="font-medium">{event.source}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Execution ID</p>
              <p className="font-mono text-primary">{event.executionId}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Detected at</p>
              <p className="font-mono">{fmt(event.detectedAt)}</p>
            </div>
            {event.score !== undefined && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Score</p>
                <p className="font-mono font-semibold">{event.score.toFixed(3)}</p>
              </div>
            )}
          </div>

          {/* Offending fragment */}
          {event.snippet && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Detected fragment</p>
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-mono italic">
                {event.snippet}
              </div>
            </div>
          )}

          {/* Rule details */}
          {rule && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Guardrail rule</p>
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{rule.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className={sevColor[rule.severity]}>{rule.severity}</Badge>
                    <Badge variant="secondary">{KIND_LABEL[rule.kind]}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span><span className="font-mono">scope:</span> {SCOPE_LABEL[rule.scope]}</span>
                  <span><span className="font-mono">action:</span> {ACTION_LABEL[rule.action]}</span>
                  <span><span className="font-mono">applies to:</span> {rule.applyTo === "all" ? "All" : `${rule.applyTo} · ${rule.targetLabel}`}</span>
                  {rule.threshold !== undefined && (
                    <span><span className="font-mono">threshold:</span> {rule.threshold}</span>
                  )}
                  {rule.maxTokens !== undefined && (
                    <span><span className="font-mono">max tokens:</span> {rule.maxTokens.toLocaleString()}</span>
                  )}
                </div>
                {rule.kind === "compliance" && rule.compliancePolicy && (
                  <div className="rounded bg-muted/40 px-3 py-2 text-xs text-muted-foreground italic border border-border/50">
                    "{rule.compliancePolicy}"
                  </div>
                )}
                {rule.kind === "off_topic" && rule.topicDescription && (
                  <div className="rounded bg-muted/40 px-3 py-2 text-xs text-muted-foreground italic border border-border/50">
                    Allowed topics: "{rule.topicDescription}"
                  </div>
                )}
                {rule.kind === "blocked_terms" && rule.blockedTerms && rule.blockedTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rule.blockedTerms.map((t) => (
                      <Badge key={t.id} variant="secondary" className="font-mono text-[10px] gap-1">
                        {t.regex && <span className="text-muted-foreground">regex:</span>}
                        {t.value}
                      </Badge>
                    ))}
                  </div>
                )}
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
    tone === "critical" ? "text-destructive"
    : tone === "warning" ? "text-amber-500"
    : "text-sky-400";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`h-4 w-4 ${tint}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
