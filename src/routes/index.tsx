import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Workflow, Users, ArrowRight, Bot } from "lucide-react";
import { orchestrations } from "@/data/flows";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orchestrations · Synapse" },
      { name: "description", content: "Catalog of multi-agent orchestration flows." },
    ],
  }),
  component: OrchestrationsList,
});

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function OrchestrationsList() {
  return (
    <AppLayout title="Orchestrations" subtitle="Multi-agent flows">
      <div className="p-6">
        <PageHeader
          title="Orchestrations"
          description="Flows that coordinate multiple agents through endpoints, queues and services."
        >
          <Button asChild size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Link to="/orchestrations/new">
              <Plus className="h-3.5 w-3.5" /> New orchestration
            </Link>
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orchestrations.map((o) => (
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
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {o.id} · {o.version}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("gap-1.5", statusMap[o.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {o.status}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {o.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
