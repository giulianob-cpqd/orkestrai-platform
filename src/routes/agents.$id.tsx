import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Users, User, GitBranch, Database } from "lucide-react";
import { getAgentFlow } from "@/data/flows";
import { FanDiagram } from "@/components/flow/FanDiagram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agents/$id")({
  loader: ({ params }) => {
    const flow = getAgentFlow(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.flow.name ?? "Agent"} · Synapse` },
      { name: "description", content: loaderData?.flow.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout title="Not found">
      <div className="p-6 text-sm text-muted-foreground">
        Agent not found.{" "}
        <Link to="/agents" className="text-primary underline">
          Back to list
        </Link>
      </div>
    </AppLayout>
  ),
  component: AgentDetail,
});

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function AgentDetail() {
  const { flow } = Route.useLoaderData();

  return (
    <AppLayout title={flow.name} subtitle={`Agent · ${flow.version}`}>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-7 gap-1 text-muted-foreground">
              <Link to="/agents">
                <ArrowLeft className="h-3.5 w-3.5" /> Agents
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
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {flow.team}</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {flow.owner}</span>
              <span className="flex items-center gap-1.5 font-mono"><GitBranch className="h-3.5 w-3.5" /> {flow.id}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flow.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
              ))}
            </div>
          </div>
          <Button asChild size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Link to="/agents/$id/edit" params={{ id: flow.id }}>
              <Pencil className="h-3.5 w-3.5" /> Edit agent
            </Link>
          </Button>
        </div>

        <Card className="border-border bg-card/60 p-5 backdrop-blur-md">
          <div className="mb-4">
            <p className="font-display text-base font-semibold">Fan-in / Fan-out</p>
            <p className="text-xs text-muted-foreground">
              Inputs feeding the agent and the LLMs, APIs, MCPs and outputs it relies on.
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
          <div className="mb-4">
            <p className="font-display text-base font-semibold">Knowledge bases (RAGs)</p>
            <p className="text-xs text-muted-foreground">
              {flow.rags.length} retriever{flow.rags.length === 1 ? "" : "s"} bound to this agent
            </p>
          </div>
          {flow.rags.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No RAGs attached.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {flow.rags.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3"
                  style={{ boxShadow: "0 0 18px color-mix(in oklch, var(--node-rag) 18%, transparent)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in oklch, var(--node-rag) 18%, transparent)", color: "var(--node-rag)" }}
                  >
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {r.meta} · {r.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
