import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Server, Cpu, MemoryStick, Box, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeployEnvDetail {
  name: string;
  cluster: string;
  namespace: string;
  region: string;
  image: string;
  replicas: { ready: number; desired: number };
  cpu: string;
  memory: string;
  health: "healthy" | "degraded" | "down";
  lastDeploy: string;
  envVars?: Record<string, string>;
}

const healthBadge = {
  healthy: "border-success/40 text-success",
  degraded: "border-warning/40 text-warning",
  down: "border-destructive/40 text-destructive",
};

const isSecret = (k: string) =>
  /KEY|SECRET|TOKEN|PASSWORD|PWD|DSN/.test(k.toUpperCase());

const mask = (v: string) => "•".repeat(Math.min(v.length, 18));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  env: DeployEnvDetail | null;
}

export function KubernetesEnvDialog({ open, onOpenChange, env }: Props) {
  if (!env) return null;
  const vars = Object.entries(env.envVars ?? {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Server className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="capitalize">{env.name} environment</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {env.region} · {env.cluster}
              </p>
            </div>
            <Badge variant="outline" className={cn("ml-auto gap-1.5", healthBadge[env.health])}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {env.health}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detalhes do cluster Kubernetes e variáveis de ambiente injetadas no workload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <Box className="h-3 w-3" /> Pods
              </p>
              <p className="mt-1 text-base font-semibold">
                {env.replicas.ready}/{env.replicas.desired}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <Cpu className="h-3 w-3" /> CPU
              </p>
              <p className="mt-1 font-mono text-xs">{env.cpu}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <MemoryStick className="h-3 w-3" /> Memory
              </p>
              <p className="mt-1 font-mono text-xs">{env.memory}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Last deploy
              </p>
              <p className="mt-1 text-xs">{env.lastDeploy}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/60 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Cluster info
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1 font-mono text-[11px] sm:grid-cols-2">
              <p><span className="text-muted-foreground">cluster:</span> {env.cluster}</p>
              <p><span className="text-muted-foreground">namespace:</span> {env.namespace}</p>
              <p><span className="text-muted-foreground">region:</span> {env.region}</p>
              <p className="truncate"><span className="text-muted-foreground">image:</span> {env.image}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <KeyRound className="h-3 w-3" /> Environment variables ({vars.length})
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2">Key</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {vars.length === 0 ? (
                    <tr><td colSpan={3} className="px-3 py-4 text-center text-xs text-muted-foreground">No variables defined.</td></tr>
                  ) : vars.map(([k, v]) => {
                    const secret = isSecret(k);
                    return (
                      <tr key={k} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-xs">{k}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {secret ? mask(v) : v}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px]", secret ? "border-warning/40 text-warning" : "border-border text-muted-foreground")}>
                            {secret ? "secret" : "configmap"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
