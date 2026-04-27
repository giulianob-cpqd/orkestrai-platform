import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Plug, Plus } from "lucide-react";

export const Route = createFileRoute("/apis")({
  head: () => ({ meta: [{ title: "APIs · Synapse" }] }),
  component: APIsPage,
});

const apis: CatalogItem[] = [
  { id: "tavily.search", name: "Tavily Search", description: "Web search optimized for LLMs.", tags: ["REST", "auth: api-key"], meta: [{ label: "Method", value: "GET" }, { label: "p99", value: "780ms" }], status: "active", icon: Plug, accent: "info" },
  { id: "salesforce.crm", name: "Salesforce CRM", description: "Read & write opportunities, accounts, contacts.", tags: ["REST", "OAuth2"], meta: [{ label: "Endpoints", value: "24" }, { label: "Quota", value: "10k/day" }], status: "active", icon: Plug, accent: "primary" },
  { id: "stripe.payments", name: "Stripe Payments", description: "Charges, refunds, subscriptions.", tags: ["REST", "webhook"], meta: [{ label: "Endpoints", value: "12" }, { label: "Env", value: "live" }], status: "active", icon: Plug, accent: "accent" },
  { id: "internal.invoices", name: "Internal Invoicing", description: "GraphQL gateway to billing service.", tags: ["GraphQL", "JWT"], meta: [{ label: "Schema", value: "v3.2" }, { label: "Errors 24h", value: "0.4%" }], status: "draft", icon: Plug, accent: "warning" },
  { id: "github.api", name: "GitHub", description: "Repos, issues, PRs and code search.", tags: ["REST", "PAT"], meta: [{ label: "Rate", value: "5k/h" }, { label: "Scopes", value: "4" }], status: "active", icon: Plug, accent: "success" },
  { id: "weather.openmeteo", name: "Open-Meteo", description: "Free weather forecast API, no key required.", tags: ["public", "no-auth"], meta: [{ label: "p50", value: "210ms" }, { label: "Cost", value: "free" }], status: "active", icon: Plug, accent: "destructive" },
];

function APIsPage() {
  return (
    <AppLayout title="APIs" subtitle="External and internal API integrations">
      <div className="p-6">
        <PageHeader title="APIs" description="HTTP integrations agents can call as tools.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Add API
          </Button>
        </PageHeader>
        <CatalogGrid items={apis} />
      </div>
    </AppLayout>
  );
}
