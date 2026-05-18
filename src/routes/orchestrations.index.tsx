import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Workflow, Users, ArrowRight, Bot, Building2, Code2, GitBranch } from "lucide-react";
import { orchestrations } from "@/data/flows";
import { useEnvironment } from "@/lib/EnvironmentContext";
import { cn } from "@/lib/utils";
import { NewFromTemplateDialog } from "@/components/NewFromTemplateDialog";
import { useState } from "react";

export const Route = createFileRoute("/orchestrations/")({
  head: () => ({
    meta: [
      { title: "Orchestrations · OrkestrAI" },
      { name: "description", content: "Catalog of multi-agent orchestration flows." },
    ],
  }),
  component: OrchestrationsList,
});

function OrchestrationsList() {
  const [open, setOpen] = useState(false);
  const { activeEnv } = useEnvironment();
  
  return (
    <AppLayout title="Orchestrations" subtitle="Multi-agent flows">
      <NewFromTemplateDialog open={open} onOpenChange={setOpen} kind="orchestration" />
      <div className="p-6">
        <PageHeader
          title="Orchestrations"
          description="Flows that coordinate multiple agents through endpoints, queues and services."
        >
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New orchestration
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {orchestrations.map((o) => {
            const info = o.envStatus?.[activeEnv];
            const st = info?.status === "not_deployed" ? "draft" : (info?.status ?? o.status);
            const ver = info?.version ?? o.version;
            
            return (
              <Link
                key={o.id}
                to="/orchestrations/$id"
                params={{ id: o.id }}
                className="group block"
              >
                <Card className="h-full border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Workflow className="h-5 w-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="font-display text-base font-semibold">{o.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{ver}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {o.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[10px]",
                          st === "active" ? "border-success/40 text-success" : st === "draft" ? "border-warning/40 text-warning" : st === "deploying" ? "border-blue-400/40 text-blue-400" : "border-destructive/40 text-destructive",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {st}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 text-[10px]",
                          o.codeLevel === "lowcode"
                            ? "border-primary/40 text-primary"
                            : "border-warning/40 text-warning",
                        )}
                      >
                        {o.codeLevel === "lowcode" ? <GitBranch className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
                        {o.codeLevel}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="leading-tight">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          Team
                        </p>
                        <p className="text-xs font-semibold">{o.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="leading-tight">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          Area
                        </p>
                        <p className="text-xs font-semibold">{o.area}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="leading-tight">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          Agents
                        </p>
                        <p className="text-xs font-semibold">{o.agents.length} referenced</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open detail <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
