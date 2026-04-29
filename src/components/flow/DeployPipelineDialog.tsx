import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Loader2,
  Clock,
  Rocket,
  GitCommit,
  Hammer,
  TestTube2,
  Container,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowName?: string;
}

type StageState = "idle" | "running" | "done";
interface Stage {
  key: string;
  name: string;
  description: string;
  icon: typeof Rocket;
  duration: number; // ms
}

const STAGES: Stage[] = [
  { key: "checkout", name: "Checkout", description: "git clone main @ a3f12c4", icon: GitCommit, duration: 1200 },
  { key: "build", name: "Build", description: "docker build · multi-stage", icon: Hammer, duration: 1800 },
  { key: "test", name: "Test", description: "unit + integration suites", icon: TestTube2, duration: 1600 },
  { key: "push", name: "Push image", description: "registry.inspire.ai/...", icon: Container, duration: 1300 },
  { key: "deploy", name: "Deploy → dev", icon: Server, description: "kubectl rollout · agents-dev", duration: 1500 },
];

export function DeployPipelineDialog({ open, onOpenChange, flowName = "flow" }: Props) {
  const [states, setStates] = useState<Record<string, StageState>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStates({});
    setDone(false);
    let cancelled = false;
    (async () => {
      for (const s of STAGES) {
        if (cancelled) return;
        setStates((prev) => ({ ...prev, [s.key]: "running" }));
        await new Promise((r) => setTimeout(r, s.duration));
        if (cancelled) return;
        setStates((prev) => ({ ...prev, [s.key]: "done" }));
      }
      setDone(true);
    })();
    return () => { cancelled = true; };
  }, [open]);

  const total = STAGES.length;
  const completed = STAGES.filter((s) => states[s.key] === "done").length;
  const pct = Math.round((completed / total) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Deploying {flowName}
          </DialogTitle>
          <DialogDescription>
            Pipeline de CI/CD em execução · destino: <span className="font-mono">agents-dev</span> (cluster <span className="font-mono">dev-us-east</span>)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
          </div>

          <div className="space-y-2">
            {STAGES.map((s) => {
              const st = states[s.key] ?? "idle";
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 transition-all",
                    st === "running" && "border-info/40 bg-info/5",
                    st === "done" && "border-success/30 bg-success/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md",
                      st === "done" ? "bg-success/15 text-success" :
                      st === "running" ? "bg-info/15 text-info" :
                      "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{s.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-[10px]",
                      st === "done" && "border-success/40 text-success",
                      st === "running" && "border-info/40 text-info",
                      st === "idle" && "border-border text-muted-foreground",
                    )}
                  >
                    {st === "done" && <CheckCircle2 className="h-3 w-3" />}
                    {st === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {st === "idle" && <Clock className="h-3 w-3" />}
                    {st}
                  </Badge>
                </div>
              );
            })}
          </div>

          {done && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
              <p className="font-semibold text-success">Deploy concluído</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {flowName}:0.5.0-rc{Math.floor(Math.random() * 9) + 1} · agents-dev · 1/1 pods ready
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant={done ? "default" : "ghost"}
            onClick={() => onOpenChange(false)}
            className={cn(done && "bg-[image:var(--gradient-primary)] text-primary-foreground")}
          >
            {done ? "Fechar" : "Executando..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
