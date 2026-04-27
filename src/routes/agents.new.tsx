import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { agentNodeCatalog } from "@/components/flow/nodeCatalog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Share2 } from "lucide-react";

export const Route = createFileRoute("/agents/new")({
  head: () => ({ meta: [{ title: "New agent · Synapse" }] }),
  component: NewAgentPage,
});

function NewAgentPage() {
  return (
    <AppLayout
      title="new-agent.agent"
      subtitle="Untitled agent"
      actions={
        <>
          <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5">
            <Link to="/agents">
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
        initialNodes={[]}
        initialEdges={[]}
        paletteTitle="Agent Parts"
        paletteSubtitle="LLM · RAG · Memory · Tools"
        runLabel="Test agent"
      />
    </AppLayout>
  );
}
