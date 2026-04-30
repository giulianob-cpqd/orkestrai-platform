import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { orchestrationNodeCatalog } from "@/components/flow/nodeCatalog";
import { getTemplate } from "@/data/templates";
import { getOrchestration } from "@/data/flows";

const searchSchema = z.object({
  template: z.string().optional(),
  appId: z.string().optional(),
});

export const Route = createFileRoute("/orchestrations/new")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "New orchestration · OrkestrAI" }] }),
  component: NewOrchestrationPage,
});

function NewOrchestrationPage() {
  const { template, appId } = Route.useSearch();
  const tpl = template ? getTemplate(template) : undefined;
  const app = appId ? getOrchestration(appId) : undefined;
  const initialNodes = tpl?.flow?.nodes ?? [];
  const initialEdges = tpl?.flow?.edges ?? [];

  const title = app ? `${app.slug}.flow` : "new-orchestration.flow";
  const subtitle = app
    ? `${app.name} · v0.1.0`
    : tpl
      ? `From template · ${tpl.name}`
      : "Untitled orchestration";

  const backHref = appId ? `/orchestrations/${appId}` : "/";
  const backLabel = appId ? "Back to detail" : "Back to orchestrations";

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <FlowBuilder
        catalog={orchestrationNodeCatalog}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        paletteTitle="Orchestration"
        paletteSubtitle="Agents, endpoints, queues"
        runLabel="Deploy flow"
        assistantMode="orchestration"
        backHref={backHref}
        backLabel={backLabel}
        flowName={app?.slug ?? "new-orchestration"}
        appId={appId}
      />
    </AppLayout>
  );
}
