import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Server, Plus } from "lucide-react";

export const Route = createFileRoute("/mcp")({
  head: () => ({ meta: [{ title: "MCP Servers · Synapse" }] }),
  component: MCPPage,
});

const servers: CatalogItem[] = [
  { id: "mcp/filesystem", name: "Filesystem MCP", description: "Read & write files in sandboxed workspace.", tags: ["stdio", "official"], meta: [{ label: "Tools", value: "8" }, { label: "Version", value: "1.4.0" }], status: "active", icon: Server, accent: "primary" },
  { id: "mcp/postgres", name: "Postgres MCP", description: "Query Postgres databases with safety guards.", tags: ["http", "readonly"], meta: [{ label: "Tools", value: "5" }, { label: "DBs", value: "3" }], status: "active", icon: Server, accent: "info" },
  { id: "mcp/notion", name: "Notion MCP", description: "Read pages, search workspace, create blocks.", tags: ["http", "OAuth"], meta: [{ label: "Tools", value: "11" }, { label: "Workspace", value: "Acme" }], status: "active", icon: Server, accent: "accent" },
  { id: "mcp/jira", name: "Jira MCP", description: "Create issues, update sprints, search projects.", tags: ["http", "Atlassian"], meta: [{ label: "Tools", value: "9" }, { label: "Projects", value: "12" }], status: "draft", icon: Server, accent: "warning" },
  { id: "mcp/slack", name: "Slack MCP", description: "Post messages, read channels, manage threads.", tags: ["http", "bot-token"], meta: [{ label: "Tools", value: "7" }, { label: "Channels", value: "48" }], status: "active", icon: Server, accent: "success" },
  { id: "mcp/k8s", name: "Kubernetes MCP", description: "Inspect cluster resources, tail pod logs.", tags: ["stdio", "RBAC"], meta: [{ label: "Tools", value: "14" }, { label: "Clusters", value: "2" }], status: "error", icon: Server, accent: "destructive" },
];

function MCPPage() {
  return (
    <AppLayout title="MCP Servers" subtitle="Model Context Protocol catalog">
      <div className="p-6">
        <PageHeader title="MCP Servers" description="Connected MCP endpoints exposing tool catalogs.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Connect server
          </Button>
        </PageHeader>
        <CatalogGrid items={servers} />
      </div>
    </AppLayout>
  );
}
