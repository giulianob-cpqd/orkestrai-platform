import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/apis")({
  head: () => ({ meta: [{ title: "APIs · OrkestrAI" }] }),
  component: APIsPage,
});

const envFields: EnvFieldDef[] = [
  { key: "baseUrl", label: "Base URL", placeholder: "https://api.example.com" },
  { key: "authType", label: "Auth type", placeholder: "bearer | api-key | oauth2" },
  { key: "apiKey", label: "API key / token", type: "password" },
  { key: "timeoutMs", label: "Timeout (ms)", type: "number", placeholder: "10000" },
];

const initial: CatalogEntry[] = [
  {
    id: "tavily-search",
    name: "Tavily Search",
    description: "Web search optimized for LLMs.",
    tags: ["REST", "search"],
    status: "active",
    envs: {
      dev: { baseUrl: "https://api.tavily.com", authType: "api-key", apiKey: "tvly-dev-***", timeoutMs: "8000" },
      staging: { baseUrl: "https://api.tavily.com", authType: "api-key", apiKey: "tvly-stg-***", timeoutMs: "8000" },
      production: { baseUrl: "https://api.tavily.com", authType: "api-key", apiKey: "tvly-prod-***", timeoutMs: "5000" },
    },
  },
  {
    id: "stripe-payments",
    name: "Stripe Payments",
    description: "Charges, refunds, subscriptions.",
    tags: ["REST", "webhook"],
    status: "active",
    envs: {
      dev: { baseUrl: "https://api.stripe.com", authType: "bearer", apiKey: "sk_test_***", timeoutMs: "10000" },
      staging: { baseUrl: "https://api.stripe.com", authType: "bearer", apiKey: "sk_test_***", timeoutMs: "10000" },
      production: { baseUrl: "https://api.stripe.com", authType: "bearer", apiKey: "sk_live_***", timeoutMs: "10000" },
    },
  },
  {
    id: "salesforce-crm",
    name: "Salesforce CRM",
    description: "Read & write opportunities, accounts, contacts.",
    tags: ["REST", "OAuth2"],
    status: "active",
    envs: {
      dev: { baseUrl: "https://acme--dev.my.salesforce.com", authType: "oauth2", apiKey: "***", timeoutMs: "15000" },
      staging: { baseUrl: "https://acme--stg.my.salesforce.com", authType: "oauth2", apiKey: "***", timeoutMs: "15000" },
      production: { baseUrl: "https://acme.my.salesforce.com", authType: "oauth2", apiKey: "***", timeoutMs: "15000" },
    },
  },
];

function APIsPage() {
  return (
    <CatalogManager
      title="APIs"
      subtitle="External and internal API integrations"
      description="HTTP integrations agents can call as tools."
      newButtonLabel="Add API"
      icon={Plug}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
