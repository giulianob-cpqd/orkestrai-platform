import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { agentNodeCatalog } from "@/components/flow/nodeCatalog";
import { getTemplate } from "@/data/templates";
import { getAgentFlow } from "@/data/flows";

const searchSchema = z.object({
  template: z.string().optional(),
  appId: z.string().optional(),
});

export const Route = createFileRoute("/agents/new")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "New agent · OrkestrAI" }] }),
  component: NewAgentPage,
});

function NewAgentPage() {
  const { template, appId } = Route.useSearch();
  const tpl = template ? getTemplate(template) : undefined;
  const app = appId ? getAgentFlow(appId) : undefined;
  const initialNodes = tpl?.flow?.nodes ?? [];
  const initialEdges = tpl?.flow?.edges ?? [];

  const title = app ? `${app.slug}.agent` : "new-agent.agent";
  const subtitle = app
    ? `${app.name} · v0.1.0`
    : tpl
      ? `From template · ${tpl.name}`
      : "Untitled agent";

  const backHref = appId ? `/agents/${appId}` : "/agents";
  const backLabel = appId ? "Back to detail" : "Back to agents";

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <FlowBuilder
        catalog={agentNodeCatalog}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        paletteTitle="Agent Parts"
        paletteSubtitle="LLM · RAG · Memory · Tools"
        runLabel="Deploy agent"
        assistantMode="agent"
        backHref={backHref}
        backLabel={backLabel}
        flowName={app?.slug ?? "new-agent"}
        appId={appId}
      />
    </AppLayout>
  );
}
