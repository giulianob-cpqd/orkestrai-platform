import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Users, User, GitBranch, Bot } from "lucide-react";
import { getOrchestration, type OrchestrationFlow } from "@/data/flows";
import { FanDiagram } from "@/components/flow/FanDiagram";
import { PipelineSection } from "@/components/sections/PipelineSection";
import { ObservabilitySection } from "@/components/sections/ObservabilitySection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orchestrations/$id/")({
  loader: ({ params }) => {
    const flow = getOrchestration(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.flow.name ?? "Orchestration"} · Synapse` },
      { name: "description", content: loaderData?.flow.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout title="Not found">
      <div className="p-6 text-sm text-muted-foreground">
        Orchestration not found.{" "}
        <Link to="/" className="text-primary underline">
          Back to list
        </Link>
      </div>
    </AppLayout>
  ),
  component: OrchestrationDetail,
});

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function OrchestrationDetail() {
  const { flow } = Route.useLoaderData() as { flow: OrchestrationFlow };

  return (
    <AppLayout title={flow.name} subtitle={`Orchestration · ${flow.version}`}>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-7 gap-1 text-muted-foreground">
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5" /> Orchestrations
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">{flow.name}</h1>
              <Badge variant="outline" className={cn("gap-1.5", statusMap[flow.status])}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {flow.status}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{flow.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {flow.team}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {flow.owner}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <GitBranch className="h-3.5 w-3.5" /> {flow.id}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flow.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <Button asChild size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Link to="/orchestrations/$id/edit" params={{ id: flow.id }}>
              <Pencil className="h-3.5 w-3.5" /> Edit flow
            </Link>
          </Button>
        </div>

        <Card className="border-border bg-card/60 p-5 backdrop-blur-md">
          <div className="mb-4">
            <p className="font-display text-base font-semibold">Fan-in / Fan-out</p>
            <p className="text-xs text-muted-foreground">
              Endpoints and queues that trigger this flow, and the systems it orchestrates.
            </p>
          </div>
          <FanDiagram
            fanIn={flow.fanIn}
            fanOut={flow.fanOut}
            centerLabel={flow.name}
            centerSubtitle={flow.version}
          />
        </Card>

        <Card className="border-border bg-card/60 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-base font-semibold">Agents in this orchestration</p>
              <p className="text-xs text-muted-foreground">
                {flow.agents.length} referenced agents
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {flow.agents.map((a) => (
              <Link
                key={a.id}
                to="/agents/$id"
                params={{ id: a.id }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 transition-all hover:border-accent/50 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {a.role} · {a.id}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline & Deploy</TabsTrigger>
            <TabsTrigger value="observability">Observability</TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="mt-4">
            <PipelineSection flowName={flow.slug} />
          </TabsContent>
          <TabsContent value="observability" className="mt-4">
            <ObservabilitySection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
