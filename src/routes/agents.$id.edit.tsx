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
    data: { label: "Input", description: "Incoming message", icon: "Send", variant: "input", meta: "text · multimodal", nodeType: "input" } },
  { id: "a2", type: "agent", position: { x: 320, y: 60 },
    data: { label: "Conversation Memory", description: "Last 20 turns + summary", icon: "MemoryStick", variant: "memory", meta: "buffer + summary", nodeType: "memory" } },
  { id: "a3", type: "agent", position: { x: 320, y: 220 },
    data: { label: "Knowledge Base", description: "Internal docs RAG", icon: "Database", variant: "rag", meta: "pgvector · 12k docs", nodeType: "rag", ragId: "rag/internal-docs" } },
  { id: "a4", type: "agent", position: { x: 320, y: 380 },
    data: { label: "Web Search", description: "Tavily API tool", icon: "Wrench", variant: "tool", meta: "GET /search", nodeType: "tool", apiId: "tavily.search" } },
  { id: "a5", type: "agent", position: { x: 320, y: 520 },
    data: { label: "Filesystem MCP", description: "Local file access", icon: "Server", variant: "mcp", meta: "stdio", nodeType: "mcp", mcpId: "mcp/filesystem" } },
  { id: "ap", type: "agent", position: { x: 660, y: 280 },
    data: { label: "Prompt", description: "Template + system prompt", icon: "Wand2", variant: "prompt", meta: "main composer", nodeType: "prompt",
      template: "You are a helpful research assistant.\n\nUser: {{input}}\nMemory: {{memory}}\nContext: {{rag}}\nTools: {{tools}}" } },
  { id: "a6", type: "agent", position: { x: 980, y: 280 },
    data: { label: "Gemini 2.5 Pro", description: "Reasoning core", icon: "Brain", variant: "llm", meta: "temp 0.4 · 8k ctx", nodeType: "llm" } },
  { id: "a7", type: "agent", position: { x: 1280, y: 280 },
    data: { label: "Response", description: "Streamed output", icon: "Send", variant: "output", meta: "stream · json", nodeType: "output", format: "sse" } },
];

const e = (id: string, source: string, target: string, targetHandle?: string): Edge => ({
  id, source, target, targetHandle, animated: true, markerEnd: { type: MarkerType.ArrowClosed },
});

const initialEdges: Edge[] = [
  e("ae1", "a1", "ap", "input"),
  e("ae2", "a2", "ap", "memory"),
  e("ae3", "a3", "ap", "rag"),
  e("ae4", "a4", "ap", "tools"),
  e("ae5", "a5", "ap", "tools"),
  e("ae6", "ap", "a6"),
  e("ae7", "a6", "a7"),
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
