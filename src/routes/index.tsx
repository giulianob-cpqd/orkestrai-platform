import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { Button } from "@/components/ui/button";
import { Save, Share2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flow Builder · Synapse" },
      { name: "description", content: "Design collaborative AI agent workflows visually." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppLayout
      title="research-assistant.flow"
      subtitle="Multi-agent research pipeline · v0.3.1"
      actions={
        <>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </>
      }
    >
      <FlowBuilder />
    </AppLayout>
  );
}
