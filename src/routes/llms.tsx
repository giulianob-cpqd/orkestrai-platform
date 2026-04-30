import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/llms")({
  head: () => ({ meta: [{ title: "LLMs · Inspire" }] }),
  component: LLMsPage,
});

const envFields: EnvFieldDef[] = [
  { key: "endpoint", label: "Endpoint URL", placeholder: "https://api.openai.com/v1" },
  { key: "model", label: "Model identifier", placeholder: "gpt-5" },
  { key: "apiKey", label: "API key", type: "password", placeholder: "sk-..." },
  { key: "maxTokens", label: "Max tokens", type: "number", placeholder: "4096" },
];

const initial: CatalogEntry[] = [
  {
    id: "openai-gpt-5",
    name: "GPT-5",
    description: "Powerful all-rounder with excellent reasoning and nuance.",
    tags: ["OpenAI", "reasoning", "tools"],
    status: "active",
    envs: {
      dev: { endpoint: "https://api.openai.com/v1", model: "gpt-5-mini", apiKey: "sk-dev-***", maxTokens: "4096" },
      staging: { endpoint: "https://api.openai.com/v1", model: "gpt-5", apiKey: "sk-stg-***", maxTokens: "8192" },
      production: { endpoint: "https://api.openai.com/v1", model: "gpt-5", apiKey: "sk-prod-***", maxTokens: "8192" },
    },
  },
  {
    id: "google-gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    description: "Top-tier multimodal model with 1M context window.",
    tags: ["Google", "multimodal", "1M ctx"],
    status: "active",
    envs: {
      dev: { endpoint: "https://generativelanguage.googleapis.com", model: "gemini-2.5-flash", apiKey: "***", maxTokens: "8192" },
      staging: { endpoint: "https://generativelanguage.googleapis.com", model: "gemini-2.5-pro", apiKey: "***", maxTokens: "16384" },
      production: { endpoint: "https://generativelanguage.googleapis.com", model: "gemini-2.5-pro", apiKey: "***", maxTokens: "32768" },
    },
  },
  {
    id: "self-hosted-llama",
    name: "Llama 3.3 70B",
    description: "Self-hosted on internal GPU cluster (vLLM + tensor parallel).",
    tags: ["on-prem", "vLLM"],
    status: "draft",
    envs: {
      dev: { endpoint: "http://llm-dev.svc:8000/v1", model: "llama-3.3-70b", apiKey: "", maxTokens: "4096" },
      staging: { endpoint: "", model: "", apiKey: "", maxTokens: "" },
      production: { endpoint: "", model: "", apiKey: "", maxTokens: "" },
    },
  },
];

function LLMsPage() {
  return (
    <CatalogManager
      title="LLMs"
      subtitle="Registered models and providers"
      description="Model registry available to your agents."
      newButtonLabel="Register model"
      icon={Brain}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
