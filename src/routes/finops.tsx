import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DollarSign, Cpu, Brain, Plug, Bot, Workflow, Building2, Users, ChevronRight, Server, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { agentCostsByEnv, flowCostsByEnv, trainingCostsByEnv, formatUSD, formatUSDFine, sumCosts, totalOf, type FlowCost, type AgentCost, type CostBreakdown, type Environment, type TrainingCost } from "@/data/finops";
import { useEnvironmentContext } from "@/lib/EnvironmentContext";

export const Route = createFileRoute("/finops")({
  head: () => ({ meta: [{ title: "FinOps · Inspire" }] }),
  component: FinOpsPage,
});

type Period = "7d" | "30d" | "90d";

function aggregate(flows: FlowCost[]) {
  return sumCosts(flows.map((f) => f.costs));
}

function CostBar({ c, total }: { c: CostBreakdown; total: number }) {
  const t = total || 1;
  const k = (c.kubernetes / t) * 100;
  const l = (c.llm / t) * 100;
  const e = (c.externalApi / t) * 100;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="bg-chart-1" style={{ width: `${k}%` }} title={`K8s ${formatUSDFine(c.kubernetes)}`} />
      <div className="bg-chart-2" style={{ width: `${l}%` }} title={`LLM ${formatUSDFine(c.llm)}`} />
      <div className="bg-chart-3" style={{ width: `${e}%` }} title={`API ${formatUSDFine(c.externalApi)}`} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ?? "bg-primary/10 text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FinOpsPage() {
  const { activeEnv } = useEnvironmentContext();
  const [period, setPeriod] = useState<Period>("30d");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [openFlow, setOpenFlow] = useState<FlowCost | null>(null);
  const [openAgent, setOpenAgent] = useState<AgentCost | null>(null);

  // Get costs for the selected environment
  const agentCosts = agentCostsByEnv[activeEnv as Environment] || agentCostsByEnv.dev;
  const flowCosts = flowCostsByEnv[activeEnv as Environment] || flowCostsByEnv.dev;

  const multiplier = period === "7d" ? 0.25 : period === "90d" ? 3 : 1;

  const scaled = useMemo(
    () =>
      flowCosts.map((f) => ({
        ...f,
        invocations: Math.round(f.invocations * multiplier),
        costs: {
          kubernetes: f.costs.kubernetes * multiplier,
          llm: f.costs.llm * multiplier,
          externalApi: f.costs.externalApi * multiplier,
        },
        externalApis: f.externalApis.map((a) => ({ ...a, cost: a.cost * multiplier, calls: Math.round(a.calls * multiplier) })),
        llms: f.llms.map((l) => ({ ...l, cost: l.cost * multiplier, calls: Math.round(l.calls * multiplier), tokens: Math.round(l.tokens * multiplier) })),
      })),
    [multiplier, flowCosts],
  );

  const filtered = areaFilter === "all" ? scaled : scaled.filter((f) => f.area === areaFilter);

  const totals = aggregate(filtered);
  const totalCost = totalOf(totals);

  const byArea = useMemo(() => {
    const map = new Map<string, FlowCost[]>();
    for (const f of scaled) {
      if (!map.has(f.area)) map.set(f.area, []);
      map.get(f.area)!.push(f);
    }
    return [...map.entries()].map(([area, fs]) => ({ area, costs: aggregate(fs), flows: fs.length }));
  }, [scaled]);

  const byTeam = useMemo(() => {
    const map = new Map<string, FlowCost[]>();
    for (const f of filtered) {
      if (!map.has(f.team)) map.set(f.team, []);
      map.get(f.team)!.push(f);
    }
    return [...map.entries()].map(([team, fs]) => ({ team, area: fs[0].area, costs: aggregate(fs), flows: fs.length }));
  }, [filtered]);

  const byLLM = useMemo(() => {
    const map = new Map<string, { calls: number; tokens: number; cost: number }>();
    for (const f of filtered) {
      for (const l of f.llms) {
        const cur = map.get(l.name) ?? { calls: 0, tokens: 0, cost: 0 };
        cur.calls += l.calls;
        cur.tokens += l.tokens;
        cur.cost += l.cost;
        map.set(l.name, cur);
      }
    }
    return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.cost - a.cost);
  }, [filtered]);

  const byInfra = useMemo(() => {
    let cpu = 0, memory = 0, gpu = 0, storage = 0, network = 0;
    for (const f of filtered) {
      cpu += f.k8s.cpu * multiplier;
      memory += f.k8s.memory * multiplier;
      gpu += f.k8s.gpu * multiplier;
      storage += f.k8s.storage * multiplier;
      network += f.k8s.network * multiplier;
    }
    return { cpu, memory, gpu, storage, network };
  }, [filtered, multiplier]);

  const scaledAgentCosts = useMemo(() => {
    return agentCosts.map((a) => ({
      ...a,
      costs: {
        kubernetes: a.costs.kubernetes * multiplier,
        llm: a.costs.llm * multiplier,
        externalApi: a.costs.externalApi * multiplier,
      },
      invocations: Math.round(a.invocations * multiplier),
      tokensIn: Math.round(a.tokensIn * multiplier),
      tokensOut: Math.round(a.tokensOut * multiplier),
    }));
  }, [agentCosts, multiplier]);

  const areas = ["all", ...new Set(scaled.map((f) => f.area))];

  return (
    <AppLayout title="FinOps" subtitle="Custos consolidados por área, equipe, fluxo, agente, LLM e infraestrutura Kubernetes">
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">FinOps</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Custos consolidados por área, equipe, fluxo, agente, LLM e infraestrutura Kubernetes — do macro ao micro.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {areas.map((a) => <SelectItem key={a} value={a}>{a === "all" ? "Todas as áreas" : a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7d</SelectItem>
              <SelectItem value="30d">Últimos 30d</SelectItem>
              <SelectItem value="90d">Últimos 90d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={DollarSign} label="Custo total" value={formatUSD(totalCost)} hint={`${filtered.length} aplicações`} />
        <StatCard icon={Cpu} label="Kubernetes" value={formatUSD(totals.kubernetes)} hint={`${((totals.kubernetes / (totalCost || 1)) * 100).toFixed(1)}% do total`} accent="bg-chart-1/15 text-chart-1" />
        <StatCard icon={Brain} label="LLMs" value={formatUSD(totals.llm)} hint={`${((totals.llm / (totalCost || 1)) * 100).toFixed(1)}% do total`} accent="bg-chart-2/15 text-chart-2" />
        <StatCard icon={Plug} label="APIs externas" value={formatUSD(totals.externalApi)} hint={`${((totals.externalApi / (totalCost || 1)) * 100).toFixed(1)}% do total`} accent="bg-chart-3/15 text-chart-3" />
      </section>

      <Tabs defaultValue="areas">
        <TabsList>
          <TabsTrigger value="areas"><Building2 className="mr-1.5 h-3.5 w-3.5" />Áreas</TabsTrigger>
          <TabsTrigger value="teams"><Users className="mr-1.5 h-3.5 w-3.5" />Equipes</TabsTrigger>
          <TabsTrigger value="orchestrations"><Workflow className="mr-1.5 h-3.5 w-3.5" />Orquestrações</TabsTrigger>
          <TabsTrigger value="agents"><Bot className="mr-1.5 h-3.5 w-3.5" />Agentes</TabsTrigger>
          <TabsTrigger value="trainings"><Zap className="mr-1.5 h-3.5 w-3.5" />Trainings</TabsTrigger>
          <TabsTrigger value="llms"><Brain className="mr-1.5 h-3.5 w-3.5" />LLMs</TabsTrigger>
          <TabsTrigger value="infra"><Server className="mr-1.5 h-3.5 w-3.5" />Infraestrutura</TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por área</CardTitle><CardDescription>Quanto cada área da empresa está consumindo.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Área</TableHead><TableHead>Apps</TableHead><TableHead>K8s</TableHead><TableHead>LLM</TableHead><TableHead>API</TableHead><TableHead>Total</TableHead><TableHead className="w-48">Distribuição</TableHead></TableRow></TableHeader>
                <TableBody>
                  {byArea.sort((a, b) => totalOf(b.costs) - totalOf(a.costs)).map((r) => {
                    const t = totalOf(r.costs);
                    return (
                      <TableRow key={r.area}>
                        <TableCell className="font-medium">{r.area}</TableCell>
                        <TableCell>{r.flows}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.kubernetes)}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.llm)}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.externalApi)}</TableCell>
                        <TableCell className="font-semibold">{formatUSDFine(t)}</TableCell>
                        <TableCell><CostBar c={r.costs} total={t} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por equipe</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Equipe</TableHead><TableHead>Área</TableHead><TableHead>Apps</TableHead><TableHead>K8s</TableHead><TableHead>LLM</TableHead><TableHead>API</TableHead><TableHead>Total</TableHead><TableHead className="w-48">Distribuição</TableHead></TableRow></TableHeader>
                <TableBody>
                  {byTeam.sort((a, b) => totalOf(b.costs) - totalOf(a.costs)).map((r) => {
                    const t = totalOf(r.costs);
                    return (
                      <TableRow key={r.team}>
                        <TableCell className="font-medium">{r.team}</TableCell>
                        <TableCell><Badge variant="secondary">{r.area}</Badge></TableCell>
                        <TableCell>{r.flows}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.kubernetes)}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.llm)}</TableCell>
                        <TableCell>{formatUSDFine(r.costs.externalApi)}</TableCell>
                        <TableCell className="font-semibold">{formatUSDFine(t)}</TableCell>
                        <TableCell><CostBar c={r.costs} total={t} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestrations" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por orquestração</CardTitle><CardDescription>Cada orquestração é uma aplicação no cluster: Kubecost + APIs pagas (LLMs são contabilizados nos agentes).</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Fluxo</TableHead><TableHead>Equipe</TableHead><TableHead>Execuções</TableHead><TableHead>K8s</TableHead><TableHead>Agentes</TableHead><TableHead>API</TableHead><TableHead>Total</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.sort((a, b) => totalOf(b.costs) - totalOf(a.costs)).map((f) => {
                    const agentCostTotal = f.agentCosts.reduce((sum, ac) => sum + ac.cost, 0);
                    const t = totalOf(f.costs) + agentCostTotal;
                    return (
                      <TableRow key={f.id} className="cursor-pointer" onClick={() => setOpenFlow(f)}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.team}</TableCell>
                        <TableCell>{f.invocations.toLocaleString()}</TableCell>
                        <TableCell>{formatUSDFine(f.costs.kubernetes)}</TableCell>
                        <TableCell>{formatUSDFine(agentCostTotal)}</TableCell>
                        <TableCell>{formatUSDFine(f.costs.externalApi)}</TableCell>
                        <TableCell className="font-semibold">{formatUSDFine(t)}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por agente</CardTitle><CardDescription>Agentes chamados pelos orquestradores — granularidade fina.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Agente</TableHead><TableHead>Equipe</TableHead><TableHead>LLM principal</TableHead><TableHead>Invocações</TableHead><TableHead>Tokens in</TableHead><TableHead>Tokens out</TableHead><TableHead>K8s</TableHead><TableHead>LLM</TableHead><TableHead>Total</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {scaledAgentCosts.map((a) => {
                    const sc = { kubernetes: a.costs.kubernetes, llm: a.costs.llm, externalApi: a.costs.externalApi };
                    const t = totalOf(sc);
                    return (
                      <TableRow key={a.id} className="cursor-pointer" onClick={() => setOpenAgent({ ...a, costs: sc, invocations: a.invocations })}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.team}</TableCell>
                        <TableCell><Badge variant="outline">{a.topLLM}</Badge></TableCell>
                        <TableCell>{a.invocations.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{a.tokensIn.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{a.tokensOut.toLocaleString()}</TableCell>
                        <TableCell>{formatUSDFine(sc.kubernetes)}</TableCell>
                        <TableCell>{formatUSDFine(sc.llm)}</TableCell>
                        <TableCell className="font-semibold">{formatUSDFine(t)}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainings" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por treinamento</CardTitle><CardDescription>Custos de treinamento de modelos (LLM, ML e embeddings).</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Treinamento</TableHead><TableHead>Tipo</TableHead><TableHead>Equipe</TableHead><TableHead>Status</TableHead><TableHead>GPU</TableHead><TableHead>Duração</TableHead><TableHead>Custo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(trainingCostsByEnv[activeEnv as Environment] || trainingCostsByEnv.dev).sort((a, b) => b.costUsd - a.costUsd).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell><Badge variant="outline" className="font-normal">{t.kind}</Badge></TableCell>
                      <TableCell>{t.team}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "succeeded" ? "default" : t.status === "running" ? "secondary" : t.status === "failed" ? "destructive" : "outline"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{t.gpuCount > 0 ? `${t.gpuCount}× ${t.gpuType}` : "CPU"}</TableCell>
                      <TableCell className="text-sm">{t.durationMin}m</TableCell>
                      <TableCell className="font-semibold">{formatUSDFine(t.costUsd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llms" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Custo por LLM</CardTitle><CardDescription>Consumo agregado por provedor / modelo.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Modelo</TableHead><TableHead>Chamadas</TableHead><TableHead>Tokens</TableHead><TableHead>Custo</TableHead><TableHead className="w-64">Share</TableHead></TableRow></TableHeader>
                <TableBody>
                  {byLLM.map((l) => (
                    <TableRow key={l.name}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.calls.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{l.tokens.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">{formatUSDFine(l.cost)}</TableCell>
                      <TableCell><Progress value={(l.cost / (totals.llm || 1)) * 100} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infra" className="mt-4">
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard icon={Cpu} label="CPU" value={formatUSD(byInfra.cpu)} accent="bg-chart-1/15 text-chart-1" />
            <StatCard icon={Server} label="Memory" value={formatUSD(byInfra.memory)} accent="bg-chart-1/15 text-chart-1" />
            <StatCard icon={Cpu} label="GPU" value={formatUSD(byInfra.gpu)} accent="bg-chart-2/15 text-chart-2" />
            <StatCard icon={Server} label="Storage" value={formatUSD(byInfra.storage)} accent="bg-chart-3/15 text-chart-3" />
            <StatCard icon={Server} label="Network" value={formatUSD(byInfra.network)} accent="bg-chart-3/15 text-chart-3" />
          </div>
          <Card className="mt-4">
            <CardHeader><CardTitle>Detalhamento Kubernetes por aplicação</CardTitle><CardDescription>Estilo Kubecost: CPU, Memória, GPU, Storage e Network.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Aplicação</TableHead><TableHead>Namespace</TableHead><TableHead>CPU</TableHead><TableHead>Mem</TableHead><TableHead>GPU</TableHead><TableHead>Storage</TableHead><TableHead>Network</TableHead><TableHead>Total K8s</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.app}</TableCell>
                      <TableCell><code className="text-xs text-muted-foreground">{f.namespace}</code></TableCell>
                      <TableCell>{formatUSDFine(f.k8s.cpu * multiplier)}</TableCell>
                      <TableCell>{formatUSDFine(f.k8s.memory * multiplier)}</TableCell>
                      <TableCell>{f.k8s.gpu > 0 ? formatUSDFine(f.k8s.gpu * multiplier) : "—"}</TableCell>
                      <TableCell>{formatUSDFine(f.k8s.storage * multiplier)}</TableCell>
                      <TableCell>{formatUSDFine(f.k8s.network * multiplier)}</TableCell>
                      <TableCell className="font-semibold">{formatUSDFine(f.costs.kubernetes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!openFlow} onOpenChange={(o) => !o && setOpenFlow(null)}>
        <DialogContent className="max-w-3xl">
          {openFlow && (
            <>
              <DialogHeader>
                <DialogTitle>{openFlow.name}</DialogTitle>
                <DialogDescription>
                  <code>{openFlow.namespace}/{openFlow.app}</code> · {openFlow.team} · {openFlow.area}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <StatCard icon={Cpu} label="K8s" value={formatUSDFine(openFlow.costs.kubernetes)} accent="bg-chart-1/15 text-chart-1" />
                <StatCard icon={Plug} label="APIs" value={formatUSDFine(openFlow.costs.externalApi)} accent="bg-chart-3/15 text-chart-3" />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Agentes utilizados</h4>
                  <div className="flex flex-wrap gap-2">
                    {openFlow.agentIds.map((id) => {
                      const a = scaledAgentCosts.find((x) => x.id === id);
                      if (!a) return null;
                      return <Badge key={id} variant="secondary"><Bot className="mr-1 h-3 w-3" />{a.name}</Badge>;
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Custo por agente</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Agente</TableHead><TableHead>Custo</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {openFlow.agentCosts.map((ac, i) => (
                        <TableRow key={i}><TableCell>{ac.agentName}</TableCell><TableCell className="font-semibold">{formatUSDFine(ac.cost)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">APIs externas pagas</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Serviço</TableHead><TableHead>Chamadas</TableHead><TableHead>Custo</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {openFlow.externalApis.map((a, i) => (
                        <TableRow key={i}><TableCell>{a.name}</TableCell><TableCell>{a.calls.toLocaleString()}</TableCell><TableCell>{formatUSDFine(a.cost)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Link to="/orchestrations/$id/edit" params={{ id: openFlow.id }} className="text-sm text-primary hover:underline">Abrir orquestração →</Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!openAgent} onOpenChange={(o) => !o && setOpenAgent(null)}>
        <DialogContent className="max-w-2xl">
          {openAgent && (
            <>
              <DialogHeader>
                <DialogTitle>{openAgent.name}</DialogTitle>
                <DialogDescription>{openAgent.team} · LLM principal: {openAgent.topLLM}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-3">
                <StatCard icon={Cpu} label="K8s" value={formatUSDFine(openAgent.costs.kubernetes)} accent="bg-chart-1/15 text-chart-1" />
                <StatCard icon={Brain} label="LLM" value={formatUSDFine(openAgent.costs.llm)} accent="bg-chart-2/15 text-chart-2" />
                <StatCard icon={DollarSign} label="Total" value={formatUSDFine(totalOf(openAgent.costs))} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Invocações</p><p className="font-display text-xl font-bold">{openAgent.invocations.toLocaleString()}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Tokens in</p><p className="font-display text-xl font-bold">{Math.round(openAgent.tokensIn * multiplier).toLocaleString()}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Tokens out</p><p className="font-display text-xl font-bold">{Math.round(openAgent.tokensOut * multiplier).toLocaleString()}</p></CardContent></Card>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">LLMs utilizados</h4>
                <Table>
                  <TableHeader><TableRow><TableHead>Modelo</TableHead><TableHead>Chamadas</TableHead><TableHead>Tokens</TableHead><TableHead>Custo</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {openAgent.llms.map((l, i) => (
                      <TableRow key={i}><TableCell>{l.name}</TableCell><TableCell>{l.calls.toLocaleString()}</TableCell><TableCell>{l.tokens.toLocaleString()}</TableCell><TableCell className="font-semibold">{formatUSDFine(l.cost)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <Link to="/agents/$id" params={{ id: openAgent.id }} className="text-sm text-primary hover:underline">Abrir agente →</Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}
