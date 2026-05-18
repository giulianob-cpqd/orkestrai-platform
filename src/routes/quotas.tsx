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

function QuotasPage() {
  const [rules, setRules] = useState<QuotaRule[]>(initialQuotas);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | QuotaScopeKind>("all");
  const [editing, setEditing] = useState<QuotaRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      if (scopeFilter !== "all" && r.scopeKind !== scopeFilter) return false;
      if (search && !`${r.name} ${r.scopeLabel} ${r.targetLabel}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [rules, search, scopeFilter]);

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
      return exists ? prev.map((r) => (r.id === editing.id ? next : r)) : [next, ...prev];
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
    <AppLayout title="Quotas & Rate Limits" subtitle="Configure usage caps and rate limits for flows and catalog services">
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
          <KpiCard label="Near limit (≥80%)" value={kpis.nearLimit} tone="warning" />
          <KpiCard label="Breached" value={kpis.breached} tone="destructive" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search by name, scope or target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as typeof scopeFilter)}>
              <TabsList>
                <TabsTrigger value="all">All scopes</TabsTrigger>
                <TabsTrigger value="user">Users</TabsTrigger>
                <TabsTrigger value="team">Teams</TabsTrigger>
                <TabsTrigger value="area">Areas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rules ({filtered.length})</CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const Icon = scopeIcon[r.scopeKind];
                  const pct = Math.min(100, (r.used / r.limit) * 100);
                  const tone =
                    pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary";
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        {r.description && (
                          <div className="text-xs text-muted-foreground">{r.description}</div>
                        )}
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
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(r.used)} / {formatNumber(r.limit)} {metricMeta[r.metric].unit}
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
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
                          <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
                          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No quotas match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
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
                  placeholder="e.g. Marketing — monthly token cap"
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
                <Select
                  value={editing.scopeKind}
                  onValueChange={(v) => {
                    const kind = v as QuotaScopeKind;
                    const first = scopeOptions[kind][0];
                    setEditing({ ...editing, scopeKind: kind, scopeId: first.id, scopeLabel: first.label });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select
                  value={editing.scopeId}
                  onValueChange={(v) => {
                    const opt = scopeOptions[editing.scopeKind].find((o) => o.id === v)!;
                    setEditing({ ...editing, scopeId: opt.id, scopeLabel: opt.label });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions[editing.scopeKind].map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Target kind</Label>
                <Select
                  value={editing.targetKind}
                  onValueChange={(v) => {
                    const kind = v as QuotaTargetKind;
                    const first = targetOptions[kind][0];
                    setEditing({ ...editing, targetKind: kind, targetId: first.id, targetLabel: first.label });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetKinds.map((k) => (
                      <SelectItem key={k} value={k} className="capitalize">
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target</Label>
                <Select
                  value={editing.targetId}
                  onValueChange={(v) => {
                    const opt = targetOptions[editing.targetKind].find((o) => o.id === v)!;
                    setEditing({ ...editing, targetId: opt.id, targetLabel: opt.label });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions[editing.targetKind].map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Metric</Label>
                <Select
                  value={editing.metric}
                  onValueChange={(v) => setEditing({ ...editing, metric: v as QuotaMetric })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metrics.map((m) => (
                      <SelectItem key={m} value={m}>
                        {metricMeta[m].label} ({metricMeta[m].unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Limit ({metricMeta[editing.metric].unit})</Label>
                <Input
                  type="number"
                  value={editing.limit}
                  onChange={(e) => setEditing({ ...editing, limit: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Period</Label>
                <Select
                  value={editing.period}
                  onValueChange={(v) => setEditing({ ...editing, period: v as QuotaPeriod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        Per {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>On exceed</Label>
                <Select
                  value={editing.action}
                  onValueChange={(v) => setEditing({ ...editing, action: v as QuotaAction })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Environment</Label>
                <Select
                  value={editing.environment}
                  onValueChange={(v) =>
                    setEditing({ ...editing, environment: v as QuotaRule["environment"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Dev</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Switch
                  checked={editing.enabled}
                  onCheckedChange={(v) => setEditing({ ...editing, enabled: v })}
                />
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
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>{isNew ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "warning" | "destructive";
}) {
  const color =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
      ? "text-amber-500"
      : tone === "primary"
      ? "text-primary"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className={`mt-1 text-3xl font-display font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
