import { useState } from "react";
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
import { toast } from "sonner";

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

export interface PipelineSectionProps {
  flowName: string;
}

export function PipelineSection({ flowName }: PipelineSectionProps) {
  const [activeEnv, setActiveEnv] = useState<DeployEnvDetail | null>(null);

  const pipelines: Pipeline[] = [
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
    },
  ];

  const runs: PipelineRun[] = [
    { id: "run_2841", trigger: "git push", commit: "a3f12c4", message: "fix: retry on 429 from web search", author: "ana.silva", duration: "3m 12s", status: "success", when: "8m ago", env: "prod" },
    { id: "run_2840", trigger: "git push", commit: "9b1e8d2", message: "feat: add multilingual classifier", author: "leo.fernandes", duration: "4m 02s", status: "running", when: "12m ago", env: "staging" },
    { id: "run_2839", trigger: "manual", commit: "7e44a91", message: "chore: bump base image to 1.32", author: "mariana.lopes", duration: "2m 48s", status: "success", when: "1h ago", env: "prod" },
    { id: "run_2838", trigger: "schedule", commit: "55ab02f", message: "test: add eval rubric snapshot", author: "ci-bot", duration: "1m 19s", status: "failed", when: "2h ago", env: "staging" },
    { id: "run_2837", trigger: "git push", commit: "31cd9a0", message: "refactor: extract router config", author: "ana.silva", duration: "3m 41s", status: "success", when: "5h ago", env: "dev" },
  ];

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

  const promote = (envName: string) => {
    const next = envName === "dev" ? "staging" : envName === "staging" ? "production" : null;
    if (!next) return;
    toast.success(`Promovendo ${flowName} de ${envName} → ${next}`);
  };

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
            { label: "Active pipelines", value: String(pipelines.length), icon: Container, accent: "text-info" },
            { label: "Runs (24h)", value: "38", icon: GitCommit, accent: "text-accent" },
            { label: "Success rate", value: "96%", icon: CheckCircle2, accent: "text-success" },
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
            Active pipelines
          </p>
          <div className="space-y-3">
            {pipelines.map((p) => (
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
            ))}
          </div>
        </div>

        {/* Recent runs */}
        <div>
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Recent pipeline runs
          </p>
          <Card className="border-border bg-card/80 p-0 backdrop-blur-md">
            <div className="overflow-hidden rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2">Run</th>
                    <th className="px-4 py-2">Commit</th>
                    <th className="px-4 py-2">Trigger</th>
                    <th className="px-4 py-2">Env</th>
                    <th className="px-4 py-2">Duration</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
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
                        <td className="px-4 py-2 font-mono text-xs">{r.env}</td>
                        <td className="px-4 py-2 font-mono text-xs">{r.duration}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className={cn("gap-1 text-[10px]", s.className)}>
                            <SIcon className="h-3 w-3" /> {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{r.when}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ===================== DEPLOY ENVIRONMENTS ===================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="font-display text-base font-semibold">Deploy environments</p>
            <p className="text-xs text-muted-foreground">
              Workloads em execução nos clusters Kubernetes — promova entre estágios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
              <Box className="h-3 w-3" /> 7 active replicas
            </Badge>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Kubernetes environments · dev → staging → production
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {envs.map((env) => {
              const canPromote = env.name !== "production";
              const promoteTarget = env.name === "dev" ? "staging" : "production";
              return (
                <Card
                  key={env.name}
                  onClick={() => setActiveEnv(env)}
                  className="cursor-pointer border-border bg-card/80 p-4 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Server className="h-4 w-4" />
                      </div>
                      <div className="leading-tight">
                        <p className="font-display text-sm font-semibold capitalize">{env.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {env.region}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("gap-1.5", healthBadge[env.health])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {env.health}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 font-mono text-[11px]">
                    <p>
                      <span className="text-muted-foreground">cluster:</span> {env.cluster}
                    </p>
                    <p>
                      <span className="text-muted-foreground">namespace:</span> {env.namespace}
                    </p>
                    <p className="truncate">
                      <span className="text-muted-foreground">image:</span> {env.image}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <Box className="h-3 w-3" /> Pods
                      </p>
                      <p className="text-sm font-semibold">
                        {env.replicas.ready}/{env.replicas.desired}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <Cpu className="h-3 w-3" /> CPU
                      </p>
                      <p className="font-mono text-xs">{env.cpu}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <MemoryStick className="h-3 w-3" /> Mem
                      </p>
                      <p className="font-mono text-xs">{env.memory}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      last deploy · {env.lastDeploy}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Redeploy disparado em ${env.name}`);
                        }}
                      >
                        <Rocket className="h-3 w-3" /> Redeploy
                      </Button>
                      {canPromote && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs border-primary/40 text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            promote(env.name);
                          }}
                        >
                          Promote <ArrowRight className="h-3 w-3" />
                          <span className="capitalize">{promoteTarget}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <KubernetesEnvDialog
        open={!!activeEnv}
        onOpenChange={(o) => { if (!o) setActiveEnv(null); }}
        env={activeEnv}
      />
    </div>
  );
}
