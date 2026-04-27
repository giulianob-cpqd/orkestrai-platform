import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type Node, type Edge, MarkerType } from "@xyflow/react";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { agentNodeCatalog } from "@/components/flow/nodeCatalog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Share2 } from "lucide-react";
import { getAgentFlow } from "@/data/flows";

export const Route = createFileRoute("/agents/$id/edit")({
  loader: ({ params }) => {
    const flow = getAgentFlow(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit ${loaderData?.flow?.name ?? "agent"} · Synapse` },
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
  component: EditAgent,
});

const initialNodes: Node[] = [
  { id: "a1", type: "agent", position: { x: 40, y: 200 },
    data: { label: "User Prompt", description: "Incoming message", icon: "Send", variant: "input", meta: "text · multimodal" } },
  { id: "a2", type: "agent", position: { x: 320, y: 60 },
    data: { label: "Conversation Memory", description: "Last 20 turns + summary", icon: "MemoryStick", variant: "memory", meta: "buffer + summary" } },
  { id: "a3", type: "agent", position: { x: 320, y: 220 },
    data: { label: "Knowledge Base", description: "Internal docs RAG", icon: "Database", variant: "rag", meta: "pgvector · 12k docs" } },
  { id: "a4", type: "agent", position: { x: 320, y: 380 },
    data: { label: "Web Search", description: "Tavily API tool", icon: "Wrench", variant: "tool", meta: "GET /search" } },
  { id: "a5", type: "agent", position: { x: 320, y: 520 },
    data: { label: "Filesystem MCP", description: "Local file access", icon: "Server", variant: "mcp", meta: "stdio" } },
  { id: "a6", type: "agent", position: { x: 660, y: 280 },
    data: { label: "Gemini 2.5 Pro", description: "Reasoning core", icon: "Brain", variant: "llm", meta: "temp 0.4 · 8k ctx" } },
  { id: "a7", type: "agent", position: { x: 980, y: 280 },
    data: { label: "Agent Response", description: "Streamed output", icon: "Send", variant: "output", meta: "stream · json" } },
];

const e = (id: string, source: string, target: string): Edge => ({
  id, source, target, animated: true, markerEnd: { type: MarkerType.ArrowClosed },
});

const initialEdges: Edge[] = [
  e("ae1", "a1", "a6"), e("ae2", "a2", "a6"), e("ae3", "a3", "a6"),
  e("ae4", "a4", "a6"), e("ae5", "a5", "a6"), e("ae6", "a6", "a7"),
];

function EditAgent() {
  const { flow } = Route.useLoaderData();
  const params = Route.useParams();

  return (
    <AppLayout
      title={`${flow.slug}.agent`}
      subtitle={`${flow.name} · ${flow.version}`}
      actions={
        <>
          <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5">
            <Link to="/agents/$id" params={{ id: params.id }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" /> Publish
          </Button>
        </>
      }
    >
      <FlowBuilder
        catalog={agentNodeCatalog}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        paletteTitle="Agent Parts"
        paletteSubtitle="LLM · RAG · Memory · Tools"
        runLabel="Test agent"
        assistantMode="agent"
      />
    </AppLayout>
  );
}
