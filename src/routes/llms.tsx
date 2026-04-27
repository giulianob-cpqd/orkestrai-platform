import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";

export const Route = createFileRoute("/llms")({
  head: () => ({ meta: [{ title: "LLMs · Synapse" }] }),
  component: LLMsPage,
});

const llms: CatalogItem[] = [
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Top-tier multimodal model with 1M context window.",
    tags: ["multimodal", "1M ctx", "tools"],
    meta: [
      { label: "Provider", value: "Google" },
      { label: "Cost / 1M in", value: "$1.25" },
    ],
    status: "active", icon: Brain, accent: "info",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "Powerful all-rounder with excellent reasoning and nuance.",
    tags: ["reasoning", "vision", "tools"],
    meta: [
      { label: "Provider", value: "OpenAI" },
      { label: "Cost / 1M in", value: "$2.50" },
    ],
    status: "active", icon: Brain, accent: "primary",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Balanced speed and capability for high-volume workloads.",
    tags: ["fast", "cheap"],
    meta: [
      { label: "Provider", value: "Google" },
      { label: "p50", value: "420ms" },
    ],
    status: "active", icon: Brain, accent: "success",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 mini",
    description: "Lower cost and latency, keeps most reasoning strength.",
    tags: ["mid-tier"],
    meta: [
      { label: "Provider", value: "OpenAI" },
      { label: "Cost / 1M in", value: "$0.40" },
    ],
    status: "active", icon: Brain, accent: "accent",
  },
  {
    id: "self-hosted/llama-3.3-70b",
    name: "Llama 3.3 70B",
    description: "Self-hosted on internal GPU cluster. vLLM + tensor parallel.",
    tags: ["on-prem", "vLLM", "GPU"],
    meta: [
      { label: "Cluster", value: "k8s/llm-prod" },
      { label: "Replicas", value: "4" },
    ],
    status: "draft", icon: Brain, accent: "warning",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini Flash Lite",
    description: "Fastest and cheapest for classification and simple workloads.",
    tags: ["classifier", "ultra-fast"],
    meta: [
      { label: "Provider", value: "Google" },
      { label: "p50", value: "120ms" },
    ],
    status: "active", icon: Brain, accent: "destructive",
  },
];

function LLMsPage() {
  return (
    <AppLayout title="LLMs" subtitle="Registered models and providers">
      <div className="p-6">
        <PageHeader title="LLMs" description="Model registry available to your agents.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Register model
          </Button>
        </PageHeader>
        <CatalogGrid items={llms} />
      </div>
    </AppLayout>
  );
}
