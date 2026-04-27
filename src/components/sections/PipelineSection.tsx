import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, GitBranch, Box, CheckCircle2, Clock, AlertTriangle, Container } from "lucide-react";
import { cn } from "@/lib/utils";

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

export interface PipelineSectionProps {
  flowName: string;
}

export function PipelineSection({ flowName }: PipelineSectionProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-base font-semibold">Pipelines & Deploy</p>
          <p className="text-xs text-muted-foreground">
            Build & deploy this orchestration to your Kubernetes clusters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" /> Connect repo
          </Button>
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Rocket className="h-3.5 w-3.5" /> Deploy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Active replicas", value: "6", icon: Box, accent: "text-primary" },
          { label: "Clusters", value: "2", icon: Container, accent: "text-info" },
          { label: "Successful runs (24h)", value: "38", icon: CheckCircle2, accent: "text-success" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="font-display text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className={cn("h-8 w-8", s.accent)} />
            </div>
          </Card>
        ))}
      </div>

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
  );
}
