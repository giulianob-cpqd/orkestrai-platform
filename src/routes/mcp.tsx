import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/mcp")({
  head: () => ({ meta: [{ title: "MCP Servers · Inspire" }] }),
  component: MCPPage,
});

const envFields: EnvFieldDef[] = [
  { key: "url", label: "Server URL", placeholder: "https://mcp.example.com" },
  { key: "transport", label: "Transport", placeholder: "http | sse | stdio" },
  { key: "token", label: "Auth token", type: "password" },
  { key: "tools", label: "Allowed tools (comma)", placeholder: "search,fetch,write" },
];

const initial: CatalogEntry[] = [
  {
    id: "mcp-postgres",
    name: "Postgres MCP",
    description: "Query Postgres databases with safety guards.",
    tags: ["http", "readonly"],
    status: "active",
    envs: {
      dev: { url: "https://mcp-pg-dev.svc", transport: "http", token: "***", tools: "query,schema" },
      staging: { url: "https://mcp-pg-stg.svc", transport: "http", token: "***", tools: "query,schema" },
      production: { url: "https://mcp-pg.svc", transport: "http", token: "***", tools: "query" },
    },
  },
  {
    id: "mcp-notion",
    name: "Notion MCP",
    description: "Read pages, search workspace, create blocks.",
    tags: ["http", "OAuth"],
    status: "active",
    envs: {
      dev: { url: "https://mcp.notion.com", transport: "http", token: "secret_dev_***", tools: "search,read" },
      staging: { url: "https://mcp.notion.com", transport: "http", token: "secret_stg_***", tools: "search,read,write" },
      production: { url: "https://mcp.notion.com", transport: "http", token: "secret_prod_***", tools: "search,read,write" },
    },
  },
  {
    id: "mcp-slack",
    name: "Slack MCP",
    description: "Post messages, read channels, manage threads.",
    tags: ["http", "bot-token"],
    status: "active",
    envs: {
      dev: { url: "https://mcp-slack.svc", transport: "sse", token: "xoxb-dev-***", tools: "post,read" },
      staging: { url: "https://mcp-slack.svc", transport: "sse", token: "xoxb-stg-***", tools: "post,read" },
      production: { url: "https://mcp-slack.svc", transport: "sse", token: "xoxb-prod-***", tools: "post,read" },
    },
  },
];

function MCPPage() {
  return (
    <CatalogManager
      title="MCP Servers"
      subtitle="Model Context Protocol catalog"
      description="Connected MCP endpoints exposing tool catalogs."
      newButtonLabel="Connect server"
      icon={Server}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
