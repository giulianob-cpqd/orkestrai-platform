/**
 * Lightweight registries that the FlowBuilder property panel uses to populate
 * select inputs (RAGs, APIs, MCP servers, agents, databases, request types…).
 * Mirrors the catalogs shown in /rags, /apis, /mcp and /agents.
 */

export interface RegistryItem {
  id: string;
  name: string;
  meta?: string;
}

export const registeredRags: RegistryItem[] = [
  { id: "rag/internal-docs", name: "Internal Docs", meta: "pgvector · 12,840 chunks" },
  { id: "rag/product-kb", name: "Product Knowledge", meta: "pinecone · 4,213 chunks" },
  { id: "rag/legal-corpus", name: "Legal Corpus", meta: "qdrant · 28,901 chunks" },
  { id: "rag/code-search", name: "Code Search", meta: "weaviate · 18k files" },
  { id: "rag/customer-tickets", name: "Customer Tickets", meta: "pgvector · 94,210" },
  { id: "rag/research-papers", name: "Research Papers", meta: "pinecone · 32k papers" },
];

export const registeredApis: RegistryItem[] = [
  { id: "tavily.search", name: "Tavily Search", meta: "REST · GET" },
  { id: "salesforce.crm", name: "Salesforce CRM", meta: "REST · OAuth2" },
  { id: "stripe.payments", name: "Stripe Payments", meta: "REST · webhook" },
  { id: "internal.invoices", name: "Internal Invoicing", meta: "GraphQL · JWT" },
  { id: "github.api", name: "GitHub", meta: "REST · PAT" },
  { id: "weather.openmeteo", name: "Open-Meteo", meta: "public · no-auth" },
];

export const registeredMcpServers: RegistryItem[] = [
  { id: "mcp/filesystem", name: "Filesystem MCP", meta: "stdio · 8 tools" },
  { id: "mcp/postgres", name: "Postgres MCP", meta: "http · readonly" },
  { id: "mcp/notion", name: "Notion MCP", meta: "http · OAuth" },
  { id: "mcp/jira", name: "Jira MCP", meta: "http · 9 tools" },
  { id: "mcp/slack", name: "Slack MCP", meta: "http · bot-token" },
  { id: "mcp/k8s", name: "Kubernetes MCP", meta: "stdio · RBAC" },
];

export const registeredAgents: RegistryItem[] = [
  { id: "agent_research_v3", name: "Researcher", meta: "v3.0.1 · published" },
  { id: "agent_writer_v1", name: "Technical Writer", meta: "v1.4.0 · published" },
  { id: "agent_router_v1", name: "Intent Router", meta: "v1.2.0 · published" },
  { id: "agent_sql_v2", name: "SQL Analyst", meta: "v2.1.0 · error" },
  { id: "agent_critic_v2", name: "Critic Reviewer", meta: "v2.0.0 · draft" },
  { id: "agent_summarizer_v1", name: "Summarizer", meta: "v1.1.0 · published" },
];

export const databaseTypes = [
  { id: "postgres", name: "PostgreSQL" },
  { id: "mysql", name: "MySQL" },
  { id: "sqlite", name: "SQLite" },
  { id: "mongodb", name: "MongoDB" },
  { id: "redis", name: "Redis" },
  { id: "mssql", name: "SQL Server" },
  { id: "oracle", name: "Oracle" },
  { id: "cassandra", name: "Cassandra" },
  { id: "dynamodb", name: "DynamoDB" },
  { id: "clickhouse", name: "ClickHouse" },
];

export const requestProtocols = [
  { id: "rest", name: "REST" },
  { id: "graphql", name: "GraphQL" },
  { id: "grpc", name: "gRPC" },
  { id: "sse", name: "SSE" },
  { id: "websocket", name: "WebSocket" },
];

export const registeredLlms: RegistryItem[] = [
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", meta: "Google · 1M ctx" },
  { id: "openai/gpt-5", name: "GPT-5", meta: "OpenAI · reasoning" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", meta: "Google · fast" },
  { id: "openai/gpt-5-mini", name: "GPT-5 mini", meta: "OpenAI · mid-tier" },
  { id: "self-hosted/llama-3.3-70b", name: "Llama 3.3 70B", meta: "self-hosted · vLLM" },
  { id: "google/gemini-2.5-flash-lite", name: "Gemini Flash Lite", meta: "Google · ultra-fast" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", meta: "Anthropic · balanced" },
];

export const coordinationStrategies = [
  { id: "parallel", name: "Parallel", meta: "fan-out → fan-in" },
  { id: "router", name: "Router", meta: "intent-based dispatch" },
];

export const cronPresets = [
  { id: "*/5 * * * *", name: "Every 5 minutes" },
  { id: "0 * * * *", name: "Hourly" },
  { id: "0 */6 * * *", name: "Every 6 hours" },
  { id: "0 0 * * *", name: "Daily 00:00 UTC" },
  { id: "0 2 * * *", name: "Daily 02:00 UTC" },
  { id: "0 0 * * 0", name: "Weekly (Sunday)" },
  { id: "0 0 1 * *", name: "Monthly" },
];
