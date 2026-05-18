import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  GitBranch,
  Box,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Container,
  GitCommit,
  Server,
  Cpu,
  MemoryStick,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KubernetesEnvDialog,
  type DeployEnvDetail,
} from "./KubernetesEnvDialog";
import { EnvironmentDetailPanel } from "./EnvironmentDetailPanel";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  cluster: string;
  namespace: string;
  status: "running" | "success" | "failed" | "pending";
  stages: { name: string; state: "done" | "active" | "idle" | "error" }[];
  replicas: string;
  image: string;
  env: string;
}

interface PipelineRun {
  id: string;
  trigger: string;
  commit: string;
  message: string;
  author: string;
  duration: string;
  status: "success" | "failed" | "running";
  when: string;
  env: string;
}

const statusBadge = {
  running: "border-info/40 text-info",
  success: "border-success/40 text-success",
  failed: "border-destructive/40 text-destructive",
  pending: "border-warning/40 text-warning",
};

const stageColor = {
  done: "bg-success/80",
  active: "bg-info/80 animate-pulse",
  idle: "bg-muted",
  error: "bg-destructive/80",
};

const healthBadge = {
  healthy: "border-success/40 text-success",
  degraded: "border-warning/40 text-warning",
  down: "border-destructive/40 text-destructive",
};

const runStatus = {
  success: { className: "border-success/40 text-success", Icon: CheckCircle2 },
  failed: { className: "border-destructive/40 text-destructive", Icon: AlertTriangle },
  running: { className: "border-info/40 text-info", Icon: Clock },
};

// Infrastructure metrics data
const cpuData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  usage: Math.round(30 + Math.sin(i / 3) * 20 + Math.random() * 15),
  max: 80,
}));

const memoryData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  usage: Math.round(45 + Math.cos(i / 4) * 15 + Math.random() * 12),
  max: 90,
}));

const podsData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  active: Math.round(8 + Math.sin(i / 2.5) * 3 + Math.random() * 2),
  max: 12,
}));

const tooltipStyle = {
  background: "oklch(0.22 0.022 260 / 95%)",
  border: "1px solid oklch(0.32 0.02 260)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};

export interface PipelineSectionProps {
  flowName: string;
  flowId?: string;
  environment?: string;
  mode?: "agent" | "orchestration";
  flowStatus?: "active" | "draft" | "error" | "deploying";
}

export function PipelineSection({ flowName, environment = "dev", flowStatus }: PipelineSectionProps) {
  const pipelines: Pipeline[] = flowStatus === "deploying" ? [
    {
      id: "p-deploy",
      name: `${flowName} · deploy`,
      branch: "main",
      cluster: "dev-us-east",
      namespace: "agents-dev",
      status: "running",
      stages: [
        { name: "Build", state: "done" },
        { name: "Test", state: "done" },
        { name: "Push", state: "active" },
        { name: "Deploy", state: "idle" },
      ],
      replicas: "1 / 1",
      image: `synapse/${flowName}:0.1.0`,
      env: "dev",
    },
  ] : [
    {
      id: "p-001",
      name: `${flowName} · prod`,
      branch: "main",
      cluster: "prod-eu-west",
      namespace: "agents-prod",
      status: "success",
      stages: [
        { name: "Build", state: "done" },
        { name: "Test", state: "done" },
        { name: "Push", state: "done" },
        { name: "Deploy", state: "done" },
      ],
      replicas: "4 / 4",
      image: `synapse/${flowName}:0.4.0`,
      env: "production",
    },
    {
      id: "p-002",
      name: `${flowName} · staging`,
      branch: "feat/router",
      cluster: "stg-eu-west",
      namespace: "agents-stg",
      status: "running",
      stages: [
        { name: "Build", state: "done" },
        { name: "Test", state: "done" },
        { name: "Push", state: "active" },
        { name: "Deploy", state: "idle" },
      ],
      replicas: "2 / 3",
      image: `synapse/${flowName}:0.5.0-rc1`,
      env: "staging",
    },
    {
      id: "p-003",
      name: `${flowName} · dev`,
      branch: "develop",
      cluster: "dev-us-east",
      namespace: "agents-dev",
      status: "running",
      stages: [
        { name: "Build", state: "done" },
        { name: "Test", state: "active" },
        { name: "Push", state: "idle" },
        { name: "Deploy", state: "idle" },
      ],
      replicas: "1 / 1",
      image: `synapse/${flowName}:0.5.0-rc2`,
      env: "dev",
    },
  ];

  const runs: PipelineRun[] = [
    { id: "run_2841", trigger: "git push", commit: "a3f12c4", message: "fix: retry on 429 from web search", author: "ana.silva", duration: "3m 12s", status: "success", when: "8m ago", env: "production" },
    { id: "run_2840", trigger: "git push", commit: "9b1e8d2", message: "feat: add multilingual classifier", author: "leo.fernandes", duration: "4m 02s", status: "running", when: "12m ago", env: "staging" },
    { id: "run_2839", trigger: "manual", commit: "7e44a91", message: "chore: bump base image to 1.32", author: "mariana.lopes", duration: "2m 48s", status: "success", when: "1h ago", env: "production" },
    { id: "run_2838", trigger: "schedule", commit: "55ab02f", message: "test: add eval rubric snapshot", author: "ci-bot", duration: "1m 19s", status: "failed", when: "2h ago", env: "staging" },
    { id: "run_2837", trigger: "git push", commit: "31cd9a0", message: "refactor: extract router config", author: "ana.silva", duration: "3m 41s", status: "success", when: "5h ago", env: "dev" },
    { id: "run_2836", trigger: "git push", commit: "2f5b3c1", message: "fix: memory leak in agent loop", author: "leo.fernandes", duration: "2m 15s", status: "success", when: "3h ago", env: "dev" },
  ];

  // Filter pipelines and runs by environment
  const filteredPipelines = flowStatus === "deploying" 
    ? pipelines 
    : pipelines.filter((p) => p.env === environment);
  const filteredRuns = runs.filter((r) => r.env === environment);

  return (
    <div className="space-y-8">
      {/* ===================== CI/CD PIPELINE ===================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base font-semibold">CI/CD Pipeline</p>
            <p className="text-xs text-muted-foreground">
              Build, test e push de imagens para o registry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <GitBranch className="h-3.5 w-3.5" /> Connect repo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active pipelines", value: String(filteredPipelines.length), icon: Container, accent: "text-info" },
            { label: "Runs (24h)", value: String(filteredRuns.length), icon: GitCommit, accent: "text-accent" },
            { label: "Success rate", value: filteredRuns.length > 0 ? `${Math.round((filteredRuns.filter(r => r.status === "success").length / filteredRuns.length) * 100)}%` : "—", icon: CheckCircle2, accent: "text-success" },
            { label: "Avg duration", value: "3m 04s", icon: Clock, accent: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-border bg-card/80 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={cn("h-7 w-7", s.accent)} />
              </div>
            </Card>
          ))}
        </div>

        {/* Pipelines */}
        <div>
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Active pipelines · {environment}
          </p>
          <div className="space-y-3">
            {filteredPipelines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active pipelines for {environment}</p>
            ) : (
              filteredPipelines.map((p) => (
              <Card key={p.id} className="border-border bg-card/80 p-5 backdrop-blur-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-semibold">{p.name}</p>
                      <Badge variant="outline" className={cn("gap-1", statusBadge[p.status])}>
                        {p.status === "running" && <Clock className="h-3 w-3" />}
                        {p.status === "success" && <CheckCircle2 className="h-3 w-3" />}
                        {p.status === "failed" && <AlertTriangle className="h-3 w-3" />}
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {p.cluster} / {p.namespace} · {p.branch}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Replicas
                      </p>
                      <p className="text-sm font-semibold">{p.replicas}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Image
                      </p>
                      <p className="font-mono text-xs">{p.image}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {p.stages.map((s, i) => (
                    <div key={s.name} className="flex flex-1 items-center gap-2">
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          {s.name}
                        </span>
                        <div className={cn("h-1.5 rounded-full", stageColor[s.state])} />
                      </div>
                      {i < p.stages.length - 1 && <div className="h-px w-2 bg-border" />}
                    </div>
                  ))}
                </div>
              </Card>
            ))
            )}
          </div>
        </div>

        {/* Recent runs */}
        <div>
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Recent pipeline runs · {environment}
          </p>
          <Card className="border-border bg-card/80 p-0 backdrop-blur-md">
            <div className="overflow-hidden rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2">Run</th>
                    <th className="px-4 py-2">Commit</th>
                    <th className="px-4 py-2">Trigger</th>
                    <th className="px-4 py-2">Duration</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-4 text-center text-xs text-muted-foreground">No pipeline runs for {environment}</td></tr>
                  ) : (
                    filteredRuns.map((r) => {
                      const s = runStatus[r.status];
                      const SIcon = s.Icon;
                      return (
                        <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs text-primary">{r.id}</td>
                          <td className="px-4 py-2">
                            <div className="leading-tight">
                              <p className="font-mono text-xs">{r.commit}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {r.message} · <span className="text-muted-foreground/70">{r.author}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {r.trigger}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{r.duration}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className={cn("gap-1 text-[10px]", s.className)}>
                            <SIcon className="h-3 w-3" /> {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{r.when}</td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function DeploySection({ flowName, flowId, environment = "dev", mode = "orchestration" }: PipelineSectionProps) {
  // Order: dev → staging → production
  const envs: DeployEnvDetail[] = [
    {
      name: "dev",
      cluster: "dev-us-east",
      namespace: "agents-dev",
      region: "us-east-1",
      image: `synapse/${flowName}:0.5.0-rc2`,
      replicas: { ready: 1, desired: 1 },
      cpu: "0.3 / 1 cores",
      memory: "0.6 / 2 Gi",
      health: "healthy",
      lastDeploy: "5h ago",
      envVars: {
        NODE_ENV: "development",
        LOG_LEVEL: "debug",
        DATABASE_URL: "postgres://app:dev@db-dev.svc:5432/agents",
        OPENAI_API_KEY: "sk-dev-XXXXXXXXXXXX",
        GEMINI_API_KEY: "g-dev-XXXXXXXXXXXX",
        FEATURE_FLAGS: "router_v2,async_tools",
      },
    },
    {
      name: "staging",
      cluster: "stg-eu-west",
      namespace: "agents-stg",
      region: "eu-west-1",
      image: `synapse/${flowName}:0.5.0-rc1`,
      replicas: { ready: 2, desired: 3 },
      cpu: "0.8 / 2 cores",
      memory: "1.1 / 4 Gi",
      health: "degraded",
      lastDeploy: "12m ago",
      envVars: {
        NODE_ENV: "staging",
        LOG_LEVEL: "info",
        DATABASE_URL: "postgres://app:stg@db-stg.svc:5432/agents",
        OPENAI_API_KEY: "sk-stg-XXXXXXXXXXXX",
        GEMINI_API_KEY: "g-stg-XXXXXXXXXXXX",
        FEATURE_FLAGS: "router_v2",
      },
    },
    {
      name: "production",
      cluster: "prod-eu-west",
      namespace: "agents-prod",
      region: "eu-west-1",
      image: `synapse/${flowName}:0.4.0`,
      replicas: { ready: 4, desired: 4 },
      cpu: "1.2 / 2 cores",
      memory: "1.8 / 4 Gi",
      health: "healthy",
      lastDeploy: "8m ago",
      envVars: {
        NODE_ENV: "production",
        LOG_LEVEL: "warn",
        DATABASE_URL: "postgres://app:prod@db-prod.svc:5432/agents",
        OPENAI_API_KEY: "sk-prod-XXXXXXXXXXXX",
        GEMINI_API_KEY: "g-prod-XXXXXXXXXXXX",
      },
    },
  ];

  // Get the selected environment details
  const selectedEnv = envs.find((e) => e.name === environment);
  if (!selectedEnv) return null;

  const promote = (envName: string) => {
    const next = envName === "dev" ? "staging" : envName === "staging" ? "production" : null;
    if (!next) return;
    toast.success(`Promovendo ${flowName} de ${envName} → ${next}`);
  };

  return (
    <div className="space-y-8">
      {/* ===================== DEPLOY ENVIRONMENT DETAILS ===================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base font-semibold">Deploy environment</p>
            <p className="text-xs text-muted-foreground">
              Kubernetes cluster and workload configuration
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            <Box className="h-3 w-3" /> {selectedEnv.replicas.ready} active replicas
          </Badge>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active Pods", value: `${selectedEnv.replicas.ready} / ${selectedEnv.replicas.desired}`, icon: Box, accent: "text-success" },
            { label: "CPU Usage", value: selectedEnv.cpu, icon: Cpu, accent: "text-info" },
            { label: "Memory Usage", value: selectedEnv.memory, icon: MemoryStick, accent: "text-accent" },
            { label: "Last Deploy", value: selectedEnv.lastDeploy, icon: Clock, accent: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-border bg-card/80 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                </div>
                <s.icon className={cn("h-6 w-6", s.accent)} />
              </div>
            </Card>
          ))}
        </div>

        {/* Infrastructure Metrics Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* CPU Chart */}
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold">CPU Usage</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <Cpu className="h-5 w-5 text-info" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cpuData}>
                <defs>
                  <linearGradient id="gcpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                <ReferenceLine y={80} stroke="oklch(0.7 0.18 30)" strokeDasharray="3 3" label={{ value: "Max: 80%", position: "right", fill: "oklch(0.7 0.18 30)", fontSize: 10 }} />
                <Line type="monotone" dataKey="usage" stroke="oklch(0.7 0.18 235)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Memory Chart */}
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold">Memory Usage</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <MemoryStick className="h-5 w-5 text-accent" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={memoryData}>
                <defs>
                  <linearGradient id="gmem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                <ReferenceLine y={90} stroke="oklch(0.7 0.18 30)" strokeDasharray="3 3" label={{ value: "Max: 90%", position: "right", fill: "oklch(0.7 0.18 30)", fontSize: 10 }} />
                <Line type="monotone" dataKey="usage" stroke="oklch(0.82 0.17 180)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Active Pods Chart */}
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold">Active Pods</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <Box className="h-5 w-5 text-success" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={podsData}>
                <defs>
                  <linearGradient id="gpods" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} domain={[0, 15]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value} pods`} />
                <ReferenceLine y={12} stroke="oklch(0.7 0.18 30)" strokeDasharray="3 3" label={{ value: "Max: 12", position: "right", fill: "oklch(0.7 0.18 30)", fontSize: 10 }} />
                <Line type="monotone" dataKey="active" stroke="oklch(0.82 0.17 180)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <EnvironmentDetailPanel
          env={selectedEnv}
          flowName={flowName}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.success(`Redeploy disparado em ${environment}`)}
          >
            <Rocket className="h-4 w-4" /> Redeploy
          </Button>
          {environment !== "production" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => promote(environment)}
            >
              Promote <ArrowRight className="h-4 w-4" />
              <span className="capitalize">{environment === "dev" ? "staging" : "production"}</span>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
