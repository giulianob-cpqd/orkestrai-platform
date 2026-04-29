import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { orchestrationNodeCatalog } from "@/components/flow/nodeCatalog";
import { getTemplate } from "@/data/templates";

const searchSchema = z.object({
  template: z.string().optional(),
});

export const Route = createFileRoute("/orchestrations/new")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "New orchestration · Inspire" }] }),
  component: NewOrchestrationPage,
});

function NewOrchestrationPage() {
  const { template } = Route.useSearch();
  const tpl = template ? getTemplate(template) : undefined;
  const usingHighcode = tpl?.source === "highcode";
  const initialNodes = tpl?.flow?.nodes ?? [];
  const initialEdges = tpl?.flow?.edges ?? [];

  return (
    <AppLayout
      title="new-orchestration.flow"
      subtitle={tpl ? `From template · ${tpl.name}` : "Untitled orchestration"}
    >
      {usingHighcode ? (
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-12">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-display text-lg font-semibold">High-code template</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Este template aponta para um repositório:{" "}
              <a href={tpl?.repoUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                {tpl?.repoUrl}
              </a>
            </p>
          </div>
        </div>
      ) : (
        <FlowBuilder
          catalog={orchestrationNodeCatalog}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          paletteTitle="Orchestration"
          paletteSubtitle="Agents, endpoints, queues"
          runLabel="Deploy flow"
          assistantMode="orchestration"
          backHref="/"
          backLabel="Back to orchestrations"
          flowName="new-orchestration"
        />
      )}
    </AppLayout>
  );
}
