import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  Gauge,
  Plus,
  Pencil,
  Trash2,
  Users,
  User,
  Building2,
  Search,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import {
  initialQuotas,
  metricMeta,
  scopeOptions,
  targetOptions,
  type QuotaAction,
  type QuotaMetric,
  type QuotaPeriod,
  type QuotaRule,
  type QuotaScopeKind,
  type QuotaTargetKind,
} from "@/data/quotas";
export const Route = createFileRoute("/quotas")({
  component: QuotasPage,
});

// --- Constants ---------------------------------------------------------------

const scopeIcon: Record<QuotaScopeKind, typeof User> = {
  user: User,
  team: Users,
  area: Building2,
};

const periodOptions: QuotaPeriod[] = ["minute", "hour", "day", "month"];
const actionOptions: QuotaAction[] = ["block", "warn", "throttle"];
const targetKinds: QuotaTargetKind[] = [
  "global",
  "flow",
  "agent",
  "llm",
  "api",
  "mcp",
  "rag",
];
const metrics: QuotaMetric[] = [
  "tokens",
  "requests",
  "cost_usd",
  "executions",
  "concurrent_runs",
  "storage_gb",
  "cpu_cores",
  "memory_gb",
  "gpu_hours",
];

// --- Helpers -----------------------------------------------------------------

function emptyRule(): QuotaRule {
  return {
    id: `q-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    description: "",
    enabled: true,
    scopeKind: "team",
    scopeId: scopeOptions.team[0].id,
    scopeLabel: scopeOptions.team[0].label,
    targetKind: "global",
    targetId: "*",
    targetLabel: "All resources",
    metric: "cost_usd",
    limit: 1000,
    used: 0,
    period: "month",
    action: "warn",
    environment: "production",
    updatedAt: new Date().toISOString(),
  };
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function usagePct(r: QuotaRule) {
  return Math.min(100, (r.used / r.limit) * 100);
}

function barColor(pct: number) {
  if (pct >= 100) return "bg-destructive";
  if (pct >= 80) return "bg-amber-500";
  return "bg-primary";
}

// --- Detail Modal ------------------------------------------------------------

function QuotaDetailModal({
  rule,
  onClose,
}: {
  rule: QuotaRule | null;
  onClose: () => void;
}) {
  if (!rule) return null;
  const pct = usagePct(rule);
  const color = barColor(pct);
  const isBreached = pct >= 100;
  const isNear = pct >= 80 && pct < 100;
  const Icon = scopeIcon[rule.scopeKind];

  return (
    <Dialog open={!!rule} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBreached ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            {rule.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {rule.description && (
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          )}

          <Separator />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Usage</span>
              <span
                className={
                  isBreached
                    ? "text-destructive font-semibold"
                    : isNear
                    ? "text-amber-500 font-semibold"
                    : "text-muted-foreground"
                }
              >
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(rule.used)} / {formatNumber(rule.limit)}{" "}
              {metricMeta[rule.metric].unit} per {rule.period}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Scope</div>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="capitalize">{rule.scopeKind}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span>{rule.scopeLabel}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Target</div>
              <div>
                <span className="capitalize">{rule.targetKind}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span>{rule.targetLabel}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Metric</div>
              <Badge variant="outline">{metricMeta[rule.metric].label}</Badge>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Period</div>
              <span className="capitalize">Per {rule.period}</span>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">On exceed</div>
              <Badge
                variant={
                  rule.action === "block"
                    ? "destructive"
                    : rule.action === "throttle"
                    ? "secondary"
                    : "outline"
                }
              >
                {rule.action}
              </Badge>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Environment</div>
              <Badge variant="outline" className="capitalize">
                {rule.environment}
              </Badge>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Status</div>
              <Badge variant={rule.enabled ? "default" : "secondary"}>
                {rule.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-0.5">Last updated</div>
              <span className="text-muted-foreground">
                {new Date(rule.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---------------------------------------------------------------

function QuotasPage() {
  const [rules, setRules] = useState<QuotaRule[]>(initialQuotas);

  // Exceeded tab state
  const [excSearch, setExcSearch] = useState("");
  const [excScope, setExcScope] = useState<"all" | QuotaScopeKind>("all");
  const [detailRule, setDetailRule] = useState<QuotaRule | null>(null);

  // Rules tab state
  const [rulesSearch, setRulesSearch] = useState("");
  const [rulesScope, setRulesScope] = useState<"all" | QuotaScopeKind>("all");

  // Editor state
  const [editing, setEditing] = useState<QuotaRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  // KPIs
  const kpis = useMemo(() => {
    const total = rules.length;
    const enabled = rules.filter((r) => r.enabled).length;
    const breached = rules.filter((r) => r.used / r.limit >= 1).length;
    const nearLimit = rules.filter((r) => {
      const p = r.used / r.limit;
      return p >= 0.8 && p < 1;
    }).length;
    return { total, enabled, breached, nearLimit };
  }, [rules]);

  // Exceeded tab: only rules >= 80% usage
  const exceededRules = useMemo(() => {
    return rules.filter((r) => {
      const pct = r.used / r.limit;
      if (pct < 0.8) return false;
      if (excScope !== "all" && r.scopeKind !== excScope) return false;
      if (
        excSearch &&
        !`${r.name} ${r.scopeLabel} ${r.targetLabel}`
          .toLowerCase()
          .includes(excSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rules, excSearch, excScope]);

  // Rules tab: all rules with filters
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (rulesScope !== "all" && r.scopeKind !== rulesScope) return false;
      if (
        rulesSearch &&
        !`${r.name} ${r.scopeLabel} ${r.targetLabel}`
          .toLowerCase()
          .includes(rulesSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rules, rulesSearch, rulesScope]);

  function openNew() {
    setEditing(emptyRule());
    setIsNew(true);
  }

  function openEdit(rule: QuotaRule) {
    setEditing({ ...rule });
    setIsNew(false);
  }

  function save() {
    if (!editing) return;
    setRules((prev) => {
      const exists = prev.some((r) => r.id === editing.id);
      const next = { ...editing, updatedAt: new Date().toISOString() };
      return exists
        ? prev.map((r) => (r.id === editing.id ? next : r))
        : [next, ...prev];
    });
    setEditing(null);
  }

  function remove(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function toggle(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }

  return (
    <AppLayout
      title="Quotas & Rate Limits"
      subtitle="Configure usage caps and rate limits for flows and catalog services"
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Quotas & Rate Limits"
            description="Manage quotas and rate limits for users, teams, and areas."
          />
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New quota
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiCard label="Total quotas" value={kpis.total} />
          <KpiCard label="Enabled" value={kpis.enabled} tone="primary" />
          <KpiCard label="Near limit (>=80%)" value={kpis.nearLimit} tone="warning" />
          <KpiCard label="Breached" value={kpis.breached} tone="destructive" />
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="exceeded">
          <TabsList>
            <TabsTrigger value="exceeded" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Exceeded
              {kpis.nearLimit + kpis.breached > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {kpis.nearLimit + kpis.breached}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              Rules
            </TabsTrigger>
          </TabsList>

          {/* ---- EXCEEDED TAB ---- */}
          <TabsContent value="exceeded" className="mt-4 space-y-4">
            <Card>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search by name, scope or target..."
                    value={excSearch}
                    onChange={(e) => setExcSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={excScope}
                  onValueChange={(v) => setExcScope(v as typeof excScope)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All scopes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Near limit &amp; Breached ({exceededRules.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quota</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Env</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exceededRules.map((r) => {
                      const Icon = scopeIcon[r.scopeKind];
                      const pct = usagePct(r);
                      const color = barColor(pct);
                      const isBreached = pct >= 100;
                      return (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => setDetailRule(r)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {isBreached ? (
                                <ShieldAlert className="h-3.5 w-3.5 text-destructive shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                              <div>
                                <div className="font-medium">{r.name}</div>
                                {r.description && (
                                  <div className="text-xs text-muted-foreground">{r.description}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs uppercase text-muted-foreground">{r.scopeKind}</div>
                                <div className="text-sm">{r.scopeLabel}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs uppercase text-muted-foreground">{r.targetKind}</div>
                            <div className="text-sm">{r.targetLabel}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{metricMeta[r.metric].label}</Badge>
                          </TableCell>
                          <TableCell className="min-w-[160px]">
                            <div className={`text-xs font-medium ${isBreached ? "text-destructive" : "text-amber-500"}`}>
                              {pct.toFixed(0)}% &mdash; {formatNumber(r.used)} / {formatNumber(r.limit)} {metricMeta[r.metric].unit}
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{r.period}</TableCell>
                          <TableCell>
                            <Badge variant={r.action === "block" ? "destructive" : r.action === "throttle" ? "secondary" : "outline"}>
                              {r.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{r.environment}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {exceededRules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No quotas near limit or breached.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- RULES TAB ---- */}
          <TabsContent value="rules" className="mt-4 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search by name, scope or target..."
                    value={rulesSearch}
                    onChange={(e) => setRulesSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={rulesScope}
                  onValueChange={(v) => setRulesScope(v as typeof rulesScope)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All scopes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rules ({filteredRules.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Enable</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Env</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((r) => {
                      const Icon = scopeIcon[r.scopeKind];
                      const pct = usagePct(r);
                      const color = barColor(pct);
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Switch
                              checked={r.enabled}
                              onCheckedChange={() => toggle(r.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{r.name}</div>
                            {r.description && (
                              <div className="text-xs text-muted-foreground">
                                {r.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs uppercase text-muted-foreground">
                                  {r.scopeKind}
                                </div>
                                <div className="text-sm">{r.scopeLabel}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs uppercase text-muted-foreground">
                              {r.targetKind}
                            </div>
                            <div className="text-sm">{r.targetLabel}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{metricMeta[r.metric].label}</Badge>
                          </TableCell>
                          <TableCell className="min-w-[160px]">
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(r.used)} / {formatNumber(r.limit)}{" "}
                              {metricMeta[r.metric].unit}
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{r.period}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.action === "block"
                                  ? "destructive"
                                  : r.action === "throttle"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {r.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {r.environment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(r)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(r.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredRules.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center text-muted-foreground py-8"
                        >
                          No quotas match the current filters.
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


      {/* Detail Modal */}
      <QuotaDetailModal rule={detailRule} onClose={() => setDetailRule(null)} />

      {/* Editor Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "New quota" : "Edit quota"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Marketing - monthly token cap"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Scope kind</Label>
                <Select value={editing.scopeKind} onValueChange={(v) => { const kind = v as QuotaScopeKind; const first = scopeOptions[kind][0]; setEditing({ ...editing, scopeKind: kind, scopeId: first.id, scopeLabel: first.label }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select value={editing.scopeId} onValueChange={(v) => { const opt = scopeOptions[editing.scopeKind].find((o) => o.id === v)!; setEditing({ ...editing, scopeId: opt.id, scopeLabel: opt.label }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {scopeOptions[editing.scopeKind].map((o) => (<SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target kind</Label>
                <Select value={editing.targetKind} onValueChange={(v) => { const kind = v as QuotaTargetKind; const first = targetOptions[kind][0]; setEditing({ ...editing, targetKind: kind, targetId: first.id, targetLabel: first.label }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {targetKinds.map((k) => (<SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target</Label>
                <Select value={editing.targetId} onValueChange={(v) => { const opt = targetOptions[editing.targetKind].find((o) => o.id === v)!; setEditing({ ...editing, targetId: opt.id, targetLabel: opt.label }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {targetOptions[editing.targetKind].map((o) => (<SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Metric</Label>
                <Select value={editing.metric} onValueChange={(v) => setEditing({ ...editing, metric: v as QuotaMetric })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {metrics.map((m) => (<SelectItem key={m} value={m}>{metricMeta[m].label} ({metricMeta[m].unit})</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Limit ({metricMeta[editing.metric].unit})</Label>
                <Input type="number" value={editing.limit} onChange={(e) => setEditing({ ...editing, limit: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Select value={editing.period} onValueChange={(v) => setEditing({ ...editing, period: v as QuotaPeriod })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((p) => (<SelectItem key={p} value={p} className="capitalize">Per {p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>On exceed</Label>
                <Select value={editing.action} onValueChange={(v) => setEditing({ ...editing, action: v as QuotaAction })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((a) => (<SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Environment</Label>
                <Select value={editing.environment} onValueChange={(v) => setEditing({ ...editing, environment: v as QuotaRule["environment"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Dev</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
                <Label className="mb-2">Enabled</Label>
              </div>
              {!isNew && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Current usage</Label>
                  <Progress value={Math.min(100, (editing.used / editing.limit) * 100)} className="mt-2" />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(editing.used)} / {formatNumber(editing.limit)} {metricMeta[editing.metric].unit}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// --- KPI Card ----------------------------------------------------------------

function KpiCard({ label, value, tone }: { label: string; value: number; tone?: "primary" | "warning" | "destructive" }) {
  const color = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-amber-500" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className={`mt-1 text-3xl font-display font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
