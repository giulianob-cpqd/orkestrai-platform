import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Server, Cpu, MemoryStick, Box, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeployEnvDetail } from "./KubernetesEnvDialog";

const healthBadge = {
  healthy: "border-success/40 text-success",
  degraded: "border-warning/40 text-warning",
  down: "border-destructive/40 text-destructive",
};

const isSecret = (k: string) =>
  /KEY|SECRET|TOKEN|PASSWORD|PWD|DSN/.test(k.toUpperCase());

const mask = (v: string) => "•".repeat(Math.min(v.length, 18));

interface EnvironmentDetailPanelProps {
  env: DeployEnvDetail;
  flowName: string;
}

export function EnvironmentDetailPanel({ env, flowName }: EnvironmentDetailPanelProps) {
  const vars = Object.entries(env.envVars ?? {});

  return (
    <div className="space-y-6">
      {/* ===================== CLUSTER STATS ===================== */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Box className="h-3 w-3" /> Pods
            </p>
            <p className="mt-2 text-lg font-semibold">
              {env.replicas.ready}/{env.replicas.desired}
            </p>
          </Card>
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Cpu className="h-3 w-3" /> CPU
            </p>
            <p className="mt-2 font-mono text-xs">{env.cpu}</p>
          </Card>
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <MemoryStick className="h-3 w-3" /> Memory
            </p>
            <p className="mt-2 font-mono text-xs">{env.memory}</p>
          </Card>
          <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Last deploy
            </p>
            <p className="mt-2 text-xs">{env.lastDeploy}</p>
          </Card>
        </div>
      </section>

      {/* ===================== CLUSTER INFO ===================== */}
      <section className="space-y-4">
        <p className="font-display text-base font-semibold">Cluster configuration</p>

        <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-2 font-mono text-[11px] sm:grid-cols-2">
            <p><span className="text-muted-foreground">infrastructure:</span> kubernetes</p>
            <p><span className="text-muted-foreground">environment:</span> <span className="capitalize">{env.name}</span></p>
            <p><span className="text-muted-foreground">cluster:</span> {env.cluster}</p>
            <p><span className="text-muted-foreground">namespace:</span> {env.namespace}</p>
            <p><span className="text-muted-foreground">region:</span> {env.region}</p>
            <p className="truncate"><span className="text-muted-foreground">image:</span> {env.image}</p>
          </div>
        </Card>
      </section>

      {/* ===================== ENVIRONMENT VARIABLES ===================== */}
      <section className="space-y-4">
        <p className="font-display text-base font-semibold">Environment variables</p>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {vars.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-xs text-muted-foreground">No variables defined.</td></tr>
              ) : vars.map(([k, v]) => {
                const secret = isSecret(k);
                return (
                  <tr key={k} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">{k}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {secret ? mask(v) : v}
                    </td>
                    <td className="px-4 py-2">
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
      </section>
    </div>
  );
}
