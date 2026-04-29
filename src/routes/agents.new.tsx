import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { agentNodeCatalog } from "@/components/flow/nodeCatalog";
import { getTemplate } from "@/data/templates";

const searchSchema = z.object({
  template: z.string().optional(),
});

export const Route = createFileRoute("/agents/new")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "New agent · Inspire" }] }),
  component: NewAgentPage,
});

function NewAgentPage() {
  const { template } = Route.useSearch();
  const tpl = template ? getTemplate(template) : undefined;
  const usingHighcode = tpl?.source === "highcode";
  const initialNodes = tpl?.flow?.nodes ?? [];
  const initialEdges = tpl?.flow?.edges ?? [];

  return (
    <AppLayout
      title="new-agent.agent"
      subtitle={tpl ? `From template · ${tpl.name}` : "Untitled agent"}
    >
      {usingHighcode ? (
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-12">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-display text-lg font-semibold">High-code template</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Este template aponta para um repositório de código:{" "}
              <a href={tpl?.repoUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                {tpl?.repoUrl}
              </a>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Conecte seu Git para clonar e editar como agente high-code.
            </p>
          </div>
        </div>
      ) : (
        <FlowBuilder
          catalog={agentNodeCatalog}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          paletteTitle="Agent Parts"
          paletteSubtitle="LLM · RAG · Memory · Tools"
          runLabel="Deploy agent"
          assistantMode="agent"
          backHref="/agents"
          backLabel="Back to agents"
          flowName="new-agent"
        />
      )}
    </AppLayout>
  );
}
