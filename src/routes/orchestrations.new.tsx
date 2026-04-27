import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { orchestrationNodeCatalog } from "@/components/flow/nodeCatalog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Share2 } from "lucide-react";

export const Route = createFileRoute("/orchestrations/new")({
  head: () => ({ meta: [{ title: "New orchestration · Synapse" }] }),
  component: NewOrchestrationPage,
});

function NewOrchestrationPage() {
  return (
    <AppLayout
      title="new-orchestration.flow"
      subtitle="Untitled orchestration"
      actions={
        <>
          <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5">
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </>
      }
    >
      <FlowBuilder
        catalog={orchestrationNodeCatalog}
        initialNodes={[]}
        initialEdges={[]}
        paletteTitle="Orchestration"
        paletteSubtitle="Agents, endpoints, queues"
        runLabel="Deploy flow"
        assistantMode="orchestration"
      />
    </AppLayout>
  );
}
