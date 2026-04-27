import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Agents · Synapse" }] }),
  component: AgentsPage,
});

const agents: CatalogItem[] = [
  {
    id: "agent_research_v3",
    name: "Researcher",
    description: "Plans, decomposes and delegates web research tasks across tools.",
    tags: ["ReAct", "multi-tool", "stream"],
    meta: [
      { label: "LLM", value: "gemini-2.5-pro" },
      { label: "Tools", value: "6" },
    ],
    status: "active",
    icon: Bot,
    accent: "primary",
  },
  {
    id: "agent_writer_v1",
    name: "Technical Writer",
    description: "Turns research notes into structured markdown documentation.",
    tags: ["CoT", "markdown", "long-context"],
    meta: [
      { label: "LLM", value: "gpt-5" },
      { label: "Avg latency", value: "3.2s" },
    ],
    status: "active",
    icon: Bot,
    accent: "accent",
  },
  {
    id: "agent_critic_v2",
    name: "Critic Reviewer",
    description: "Reviews outputs against rubric and triggers revision loops.",
    tags: ["self-reflect", "evaluator"],
    meta: [
      { label: "LLM", value: "gemini-2.5-flash" },
      { label: "Pass rate", value: "94%" },
    ],
    status: "draft",
    icon: Bot,
    accent: "info",
  },
  {
    id: "agent_router_v1",
    name: "Intent Router",
    description: "Classifies user input and dispatches to the right specialist agent.",
    tags: ["classifier", "fast"],
    meta: [
      { label: "LLM", value: "gemini-2.5-flash-lite" },
      { label: "p99", value: "180ms" },
    ],
    status: "active",
    icon: Bot,
    accent: "success",
  },
  {
    id: "agent_sql_v2",
    name: "SQL Analyst",
    description: "Generates and executes safe parameterized queries on warehouse.",
    tags: ["function-calling", "guardrails"],
    meta: [
      { label: "LLM", value: "gpt-5-mini" },
      { label: "Schemas", value: "12" },
    ],
    status: "error",
    icon: Bot,
    accent: "warning",
  },
  {
    id: "agent_summarizer_v1",
    name: "Summarizer",
    description: "Produces hierarchical summaries with citations.",
    tags: ["map-reduce", "citations"],
    meta: [
      { label: "LLM", value: "gemini-2.5-flash" },
      { label: "Tokens/day", value: "1.2M" },
    ],
    status: "active",
    icon: Bot,
    accent: "destructive",
  },
];

function AgentsPage() {
  return (
    <AppLayout title="Agents" subtitle="Catalog of deployable AI agents">
      <div className="p-6">
        <PageHeader title="Agents" description="Reusable agent definitions across flows.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New agent
          </Button>
        </PageHeader>
        <CatalogGrid items={agents} />
      </div>
    </AppLayout>
  );
}
