import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type Node, type Edge, MarkerType } from "@xyflow/react";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { orchestrationNodeCatalog } from "@/components/flow/nodeCatalog";
import { getOrchestration } from "@/data/flows";

export const Route = createFileRoute("/orchestrations/$id/edit")({
  loader: ({ params }) => {
    const flow = getOrchestration(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit ${loaderData?.flow?.name ?? "orchestration"} · Synapse` },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout title="Not found">
      <div className="p-6 text-sm text-muted-foreground">
        Orchestration not found.{" "}
        <Link to="/orchestrations" className="text-primary underline">
          Back to list
        </Link>
      </div>
    </AppLayout>
  ),
  component: EditOrchestration,
});

const initialNodes: Node[] = [
  {
    id: "f1",
    type: "agent",
    position: { x: 40, y: 200 },
    data: { label: "POST /v1/research", description: "REST request", icon: "Webhook", variant: "endpoint", meta: "REST · auth bearer", nodeType: "endpoint", protocol: "rest", path: "POST /v1/research" },
  },
  {
    id: "f2",
    type: "agent",
    position: { x: 320, y: 60 },
    data: { label: "Intent Router", description: "Classifies user intent", icon: "GitBranch", variant: "coord", meta: "router · 3 paths", nodeType: "coord" },
  },
  {
    id: "f3",
    type: "agent",
    position: { x: 620, y: 0 },
    data: { label: "Researcher", description: "agent_research_v3", icon: "Bot", variant: "agentref", meta: "v3 · published", nodeType: "agentref", agentId: "agent_research_v3" },
  },
  {
    id: "f4",
    type: "agent",
    position: { x: 620, y: 140 },
    data: { label: "SQL Analyst", description: "agent_sql_v2", icon: "Bot", variant: "agentref", meta: "v2 · published", nodeType: "agentref", agentId: "agent_sql_v2" },
  },
  {
    id: "f5",
    type: "agent",
    position: { x: 320, y: 320 },
    data: { label: "events.research", description: "Kafka producer", icon: "Megaphone", variant: "producer", meta: "kafka · partitions 6", nodeType: "producer", broker: "kafka", topic: "events.research" },
  },
  {
    id: "f6",
    type: "agent",
    position: { x: 620, y: 320 },
    data: { label: "Warehouse", description: "Postgres analytics DB", icon: "Database", variant: "db", meta: "PostgreSQL · upsert", nodeType: "db", dbType: "postgres", dbOperation: "upsert" },
  },
  {
    id: "f7",
    type: "agent",
    position: { x: 620, y: 460 },
    data: { label: "S3 Reports", description: "Persist artifacts", icon: "Cloud", variant: "cloud", meta: "aws · us-east-1", nodeType: "cloud" },
  },
  {
    id: "f8",
    type: "agent",
    position: { x: 940, y: 200 },
    data: { label: "Response", description: "SSE back to client", icon: "Send", variant: "output", meta: "SSE", nodeType: "output", format: "sse" },
  },
];

const e = (id: string, source: string, target: string): Edge => ({
  id, source, target, animated: true, markerEnd: { type: MarkerType.ArrowClosed },
});

const initialEdges: Edge[] = [
  e("fe1", "f1", "f2"), e("fe2", "f2", "f3"), e("fe3", "f2", "f4"),
  e("fe4", "f1", "f5"), e("fe5", "f4", "f6"), e("fe6", "f3", "f7"),
  e("fe7", "f3", "f8"), e("fe8", "f4", "f8"),
];

function EditOrchestration() {
  const { flow } = Route.useLoaderData();
  const params = Route.useParams();

  return (
    <AppLayout
      title={`${flow.slug}.flow`}
      subtitle={`${flow.name} · ${flow.version}`}
    >
      <FlowBuilder
        catalog={orchestrationNodeCatalog}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        paletteTitle="Orchestration"
        paletteSubtitle="Agents, endpoints, queues"
        runLabel="Deploy flow"
        assistantMode="orchestration"
        backHref={`/orchestrations/${params.id}`}
        backLabel="Back to flow"
        flowName={flow.slug}
      />
    </AppLayout>
  );
}
