import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Columns3, Search, CheckCircle2, AlertTriangle, Loader2, UserCheck } from "lucide-react";
import {
  executions, executionsByEnv, STATUS_LABEL, TRIGGER_LABEL,
  type ExecutionStatus, type ExecutionLog, type Environment,
} from "@/data/executions";
import { orchestrations } from "@/data/flows";
import { useRequireAuth } from "@/lib/auth";
import { useEnvironmentContext } from "@/lib/EnvironmentContext";
import { ExecutionDetailModal } from "@/components/ExecutionDetailModal";

export const Route = createFileRoute("/executions/")({
  head: () => ({
    meta: [
      { title: "Executions · Inspire" },
      { name: "description", content: "Acompanhe execuções de fluxos de orquestração." },
    ],
  }),
  component: ExecutionsListPage,
});

const ALL_COLUMNS = [
  { key: "correlationId", label: "Correlation Id", always: true },
  { key: "flow", label: "Fluxo", always: true },
  { key: "version", label: "Versão" },
  { key: "status", label: "Status", always: true },
  { key: "trigger", label: "Acionamento" },
  { key: "startedAt", label: "Início" },
  { key: "endedAt", label: "Término" },
  { key: "duration", label: "Duração" },
  { key: "user", label: "Usuário" },
] as const;

type ColKey = typeof ALL_COLUMNS[number]["key"];

const PAGE_SIZE = 10;

function fmt(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}
function fmtDur(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}.${Math.floor((ms % 1000) / 100)}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function StatusBadge({ status }: { status: ExecutionStatus }) {
  const map = {
    success: { cls: "bg-success/15 text-success border-success/30", Icon: CheckCircle2 },
    error: { cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertTriangle },
    running: { cls: "bg-primary/15 text-primary border-primary/30", Icon: Loader2 },
    human_review: { cls: "bg-warning/15 text-warning border-warning/30", Icon: UserCheck },
  } as const;
  const { cls, Icon } = map[status];
  return (
    <Badge variant="outline" className={cls + " gap-1"}>
      <Icon className={"h-3 w-3 " + (status === "running" ? "animate-spin" : "")} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function ExecutionsListPage() {
  const ok = useRequireAuth();
  const { activeEnv } = useEnvironmentContext();
  const [identificationId, setIdentificationId] = useState("");
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [status, setStatus] = useState<"all" | ExecutionStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [cols, setCols] = useState<Set<ColKey>>(
    new Set<ColKey>(["correlationId", "flow", "version", "status", "trigger", "startedAt", "endedAt", "duration"])
  );
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  // Get executions for the selected environment
  const envExecutions = executionsByEnv[activeEnv as Environment] || executionsByEnv.dev;

  // Get unique versions for selected flow
  const versionsForFlow = useMemo(() => {
    if (!selectedFlowId) return [];
    const flowExecutions = envExecutions.filter((e) => {
      const flow = orchestrations.find((o) => o.name === e.flowName);
      return flow?.id === selectedFlowId;
    });
    return [...new Set(flowExecutions.map((e) => e.version))].sort().reverse();
  }, [selectedFlowId, envExecutions]);

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(from).getTime() : 0;
    const toTs = to ? new Date(to).getTime() + 86_400_000 : Number.MAX_SAFE_INTEGER;
    
    return envExecutions
      .filter((e) => !identificationId || e.correlationId.toLowerCase().includes(identificationId.toLowerCase()))
      .filter((e) => {
        if (!selectedFlowId) return true;
        const flow = orchestrations.find((o) => o.name === e.flowName);
        return flow?.id === selectedFlowId;
      })
      .filter((e) => !selectedVersion || e.version === selectedVersion)
      .filter((e) => status === "all" || e.status === status)
      .filter((e) => {
        const ts = new Date(e.startedAt).getTime();
        return ts >= fromTs && ts <= toTs;
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [identificationId, selectedFlowId, selectedVersion, status, from, to, envExecutions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (!ok) return null;

  function toggleCol(k: ColKey) {
    const next = new Set(cols);
    if (next.has(k)) next.delete(k); else next.add(k);
    setCols(next);
  }

  return (
    <>
      <AppLayout title="Executions" subtitle="Histórico e detalhes de execução de fluxos de orquestração">
        <div className="px-6 py-6 space-y-5">
          <PageHeader
            title="Execuções de Orquestrações"
            description="Busque, filtre e inspecione cada execução, com chamadas externas, agentes e interações humanas."
          />

          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Identification Id</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={identificationId}
                    onChange={(e) => { setIdentificationId(e.target.value); setPage(1); }}
                    placeholder="Buscar ID..."
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Fluxo</label>
                <Select value={selectedFlowId || "all"} onValueChange={(v) => { setSelectedFlowId(v === "all" ? "" : v); setSelectedVersion(""); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fluxo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os fluxos</SelectItem>
                    {orchestrations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Versão</label>
                <Select value={selectedVersion || "all"} onValueChange={(v) => { setSelectedVersion(v === "all" ? "" : v); setPage(1); }} disabled={!selectedFlowId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar versão..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as versões</SelectItem>
                    {versionsForFlow.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={status} onValueChange={(v) => { setStatus(v as never); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="running">Processando</SelectItem>
                    <SelectItem value="human_review">Avaliação humana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">De</label>
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Até</label>
                <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {filtered.length} execuções encontradas
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Columns3 className="h-4 w-4" /> Colunas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Adicionar colunas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_COLUMNS.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={cols.has(c.key)}
                      disabled={"always" in c ? c.always : false}
                      onCheckedChange={() => toggleCol(c.key)}
                    >
                      {c.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {ALL_COLUMNS.filter((c) => cols.has(c.key)).map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedExecution(e.id)}>
                    {ALL_COLUMNS.filter((c) => cols.has(c.key)).map((c) => (
                      <TableCell key={c.key} className="align-middle">
                        {renderCell(c.key, e)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {slice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={cols.size} className="text-center text-muted-foreground py-10">
                      Nenhuma execução com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(Math.max(1, current - 1))} className={current === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{current} / {totalPages}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setPage(Math.min(totalPages, current + 1))} className={current === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </AppLayout>

      {selectedExecution && (
        <ExecutionDetailModal
          executionId={selectedExecution}
          open={!!selectedExecution}
          onOpenChange={(open) => !open && setSelectedExecution(null)}
        />
      )}
    </>
  );
}

function renderCell(key: ColKey, e: ExecutionLog) {
  switch (key) {
    case "flow": return <span className="font-medium">{e.flowName}</span>;
    case "version": return <span className="text-muted-foreground">{e.version}</span>;
    case "status": return <StatusBadge status={e.status} />;
    case "trigger": return <span className="text-sm">{TRIGGER_LABEL[e.trigger]}</span>;
    case "startedAt": return <span className="text-sm tabular-nums">{fmt(e.startedAt)}</span>;
    case "endedAt": return <span className="text-sm tabular-nums">{fmt(e.endedAt)}</span>;
    case "duration": return <span className="text-sm tabular-nums">{fmtDur(e.durationMs)}</span>;
    case "correlationId": return <code className="text-xs">{e.correlationId}</code>;
    case "user": return <span className="text-sm">{e.user ?? "—"}</span>;
  }
}
