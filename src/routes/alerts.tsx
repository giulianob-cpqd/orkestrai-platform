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
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleDot,
  Cpu,
  Activity,
  DollarSign,
  Zap,
  Shield,
  Clock,
  Plus,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  defaultRules,
  defaultEvents,
  CATEGORY_LABEL,
  METRIC_LABEL,
  type AlertRule,
  type AlertEvent,
  type AlertSeverity,
  type AlertStatus,
  type AlertCategory,
  type MetricKind,
  type ComparisonOp,
  type ChannelKind,
} from "@/data/alerts";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

const sevColor: Record<AlertSeverity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const statusColor: Record<AlertStatus, string> = {
  firing: "bg-destructive/15 text-destructive border-destructive/30",
  acknowledged: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  silenced: "bg-muted text-muted-foreground border-border",
};

const categoryIcon: Record<AlertCategory, typeof Cpu> = {
  infrastructure: Cpu,
  application: Activity,
  cost: DollarSign,
  llm: Zap,
  security: Shield,
  sla: Clock,
};

const METRICS: MetricKind[] = [
  "cpu","memory","disk","pods","network","gpu","tokens","cost","latency",
  "error_rate","queue_depth","human_task_backlog","rag_freshness","auth_failures",
];

const CHANNELS: ChannelKind[] = ["email","slack","teams","pagerduty","webhook"];

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [events, setEvents] = useState<AlertEvent[]>(defaultEvents);
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<AlertRule | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AlertEvent | null>(null);

  const summary = useMemo(() => {
    const firing = events.filter((e) => e.status === "firing").length;
    const ack = events.filter((e) => e.status === "acknowledged").length;
    const critical = events.filter((e) => e.severity === "critical" && e.status !== "resolved").length;
    const enabled = rules.filter((r) => r.enabled).length;
    return { firing, ack, critical, enabled };
  }, [events, rules]);

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        if (sevFilter !== "all" && e.severity !== sevFilter) return false;
        if (catFilter !== "all" && e.category !== catFilter) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (query && !`${e.ruleName} ${e.source} ${e.message}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [events, sevFilter, catFilter, statusFilter, query],
  );

  function setEventStatus(id: string, status: AlertStatus) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status, ackBy: status === "acknowledged" ? "you" : e.ackBy, resolvedAt: status === "resolved" ? new Date().toISOString() : e.resolvedAt }
          : e,
      ),
    );
  }

  function saveRule(rule: AlertRule) {
    setRules((prev) => {
      const exists = prev.some((r) => r.id === rule.id);
      return exists ? prev.map((r) => (r.id === rule.id ? rule : r)) : [rule, ...prev];
    });
    setEditing(null);
    setCreating(false);
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Infrastructure, application, cost & LLM signals
            </p>
          </div>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> New rule
          </Button>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={AlertTriangle} label="Firing" value={summary.firing} tone="critical" />
          <KpiCard icon={CircleDot} label="Acknowledged" value={summary.ack} tone="warning" />
          <KpiCard icon={Bell} label="Critical open" value={summary.critical} tone="critical" />
          <KpiCard icon={CheckCircle2} label="Active rules" value={summary.enabled} tone="info" />
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active alerts</TabsTrigger>
            <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    className="pl-8"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Select value={sevFilter} onValueChange={setSevFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="firing">Firing</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="silenced">Silenced</SelectItem>
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
                      <TableHead>Alert</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((e) => {
                      const Icon = categoryIcon[e.category];
                      return (
                        <TableRow
                          key={e.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedEvent(e)}
                        >
                          <TableCell>
                            <Badge variant="outline" className={sevColor[e.severity]}>{e.severity}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{e.ruleName}</div>
                            <div className="text-xs text-muted-foreground">{e.message}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              {CATEGORY_LABEL[e.category]}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {e.value.toLocaleString()} {e.unit}
                            <div className="text-muted-foreground">/ {e.threshold.toLocaleString()}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.source}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{fmt(e.startedAt)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor[e.status]}>{e.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {e.status === "firing" && (
                              <Button size="sm" variant="outline" onClick={(ev) => { ev.stopPropagation(); setEventStatus(e.id, "acknowledged"); }}>Ack</Button>
                            )}
                            {e.status !== "resolved" && (
                              <Button size="sm" variant="outline" onClick={(ev) => { ev.stopPropagation(); setEventStatus(e.id, "resolved"); }}>Resolve</Button>
                            )}
                            {e.status !== "silenced" && e.status !== "resolved" && (
                              <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); setEventStatus(e.id, "silenced"); }}>Silence</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No alerts match these filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Switch
                            checked={r.enabled}
                            onCheckedChange={(v) =>
                              setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.description}</div>
                        </TableCell>
                        <TableCell className="text-sm">{METRIC_LABEL[r.metric]}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.condition.op} {r.condition.threshold} {r.condition.unit} · {r.condition.window}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sevColor[r.severity]}>{r.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {r.channels.map((c) => (
                              <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {(editing || creating) && (
          <RuleEditor
            rule={editing}
            onClose={() => {
              setEditing(null);
              setCreating(false);
            }}
            onSave={saveRule}
          />
        )}

        <AlertEventDetail
          event={selectedEvent}
          rule={selectedEvent ? rules.find((r) => r.id === selectedEvent.ruleId) ?? null : null}
          onClose={() => setSelectedEvent(null)}
          onStatusChange={(id, status) => { setEventStatus(id, status); setSelectedEvent(null); }}
        />
      </div>
    </AppLayout>
  );
}

// ─── Alert Event Detail Modal ─────────────────────────────────────────────────

function AlertEventDetail({
  event,
  rule,
  onClose,
  onStatusChange,
}: {
  event: AlertEvent | null;
  rule: AlertRule | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
}) {
  if (!event) return null;
  const Icon = categoryIcon[event.category];

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className={sevColor[event.severity]}>{event.severity}</Badge>
            <span>{event.ruleName}</span>
            <Badge variant="outline" className={statusColor[event.status]}>{event.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Main info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Category</p>
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{CATEGORY_LABEL[event.category]}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Source</p>
              <p className="font-medium">{event.source}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Value / Threshold</p>
              <p className="font-mono font-semibold">
                {event.value.toLocaleString()} {event.unit}
                <span className="text-muted-foreground font-normal"> / {event.threshold.toLocaleString()}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Started at</p>
              <p className="font-mono">{fmt(event.startedAt)}</p>
            </div>
            {event.ackBy && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Acknowledged by</p>
                <p>{event.ackBy}</p>
              </div>
            )}
            {event.resolvedAt && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Resolved at</p>
                <p className="font-mono">{fmt(event.resolvedAt)}</p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Message</p>
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
              {event.message}
            </div>
          </div>

          {/* Rule details */}
          {rule && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Rule definition</p>
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{rule.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                  <Badge variant="outline" className={sevColor[rule.severity]}>{rule.severity}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span><span className="font-mono">condition:</span> {rule.condition.op} {rule.condition.threshold} {rule.condition.unit} / {rule.condition.window}</span>
                  <span><span className="font-mono">cooldown:</span> {rule.cooldown}</span>
                  <span><span className="font-mono">scope:</span> {rule.scope.type}{rule.scope.value ? ` · ${rule.scope.value}` : ""}</span>
                  <span><span className="font-mono">channels:</span> {rule.channels.join(", ")}</span>
                </div>
                {rule.runbook && (
                  <a
                    href={rule.runbook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" /> View runbook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          {event.status === "firing" && (
            <Button variant="outline" onClick={() => onStatusChange(event.id, "acknowledged")}>Acknowledge</Button>
          )}
          {event.status !== "resolved" && (
            <Button variant="outline" onClick={() => onStatusChange(event.id, "resolved")}>Mark resolved</Button>
          )}
          {event.status !== "silenced" && event.status !== "resolved" && (
            <Button variant="ghost" onClick={() => onStatusChange(event.id, "silenced")}>Silence</Button>
          )}
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
  icon: typeof Cpu;
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

function RuleEditor({
  rule,
  onClose,
  onSave,
}: {
  rule: AlertRule | null;
  onClose: () => void;
  onSave: (r: AlertRule) => void;
}) {
  const [draft, setDraft] = useState<AlertRule>(
    rule ?? {
      id: `rule-${Date.now()}`,
      name: "",
      description: "",
      enabled: true,
      category: "infrastructure",
      metric: "cpu",
      scope: { type: "global" },
      condition: { op: ">", threshold: 80, unit: "%", window: "5m" },
      severity: "warning",
      channels: ["email"],
      cooldown: "15m",
      createdAt: new Date().toISOString(),
    },
  );

  function toggleChannel(c: ChannelKind) {
    setDraft((d) => ({
      ...d,
      channels: d.channels.includes(c) ? d.channels.filter((x) => x !== c) : [...d.channels, c],
    }));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit rule" : "New alert rule"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as AlertCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Metric</Label>
              <Select value={draft.metric} onValueChange={(v) => setDraft({ ...draft, metric: v as MetricKind })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METRICS.map((m) => (
                    <SelectItem key={m} value={m}>{METRIC_LABEL[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Operator</Label>
              <Select
                value={draft.condition.op}
                onValueChange={(v) => setDraft({ ...draft, condition: { ...draft.condition, op: v as ComparisonOp } })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[">",">=","<","<=","=="].map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Threshold</Label>
              <Input
                type="number"
                value={draft.condition.threshold}
                onChange={(e) =>
                  setDraft({ ...draft, condition: { ...draft.condition, threshold: Number(e.target.value) } })
                }
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                value={draft.condition.unit}
                onChange={(e) => setDraft({ ...draft, condition: { ...draft.condition, unit: e.target.value } })}
              />
            </div>

            <div>
              <Label>Window</Label>
              <Input
                value={draft.condition.window}
                onChange={(e) => setDraft({ ...draft, condition: { ...draft.condition, window: e.target.value } })}
                placeholder="5m"
              />
            </div>

            <div>
              <Label>Severity</Label>
              <Select value={draft.severity} onValueChange={(v) => setDraft({ ...draft, severity: v as AlertSeverity })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cooldown</Label>
              <Input
                value={draft.cooldown}
                onChange={(e) => setDraft({ ...draft, cooldown: e.target.value })}
                placeholder="15m"
              />
            </div>

            <div className="col-span-2">
              <Label>Scope</Label>
              <div className="flex gap-2">
                <Select
                  value={draft.scope.type}
                  onValueChange={(v) => setDraft({ ...draft, scope: { type: v as AlertRule["scope"]["type"], value: draft.scope.value } })}
                >
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="namespace">Namespace</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
                {draft.scope.type !== "global" && (
                  <Input
                    placeholder="Target identifier"
                    value={draft.scope.value ?? ""}
                    onChange={(e) => setDraft({ ...draft, scope: { ...draft.scope, value: e.target.value } })}
                  />
                )}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Notification channels</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CHANNELS.map((c) => (
                  <Badge
                    key={c}
                    variant={draft.channels.includes(c) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleChannel(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Runbook URL (optional)</Label>
              <Input
                value={draft.runbook ?? ""}
                onChange={(e) => setDraft({ ...draft, runbook: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={!draft.name}>Save rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
