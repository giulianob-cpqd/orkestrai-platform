export type QuotaScopeKind = "user" | "team" | "area";
export type QuotaTargetKind =
  | "flow"
  | "agent"
  | "llm"
  | "api"
  | "mcp"
  | "rag"
  | "global";

export type QuotaMetric =
  | "tokens"
  | "requests"
  | "cost_usd"
  | "executions"
  | "concurrent_runs"
  | "storage_gb"
  | "cpu_cores"
  | "memory_gb"
  | "gpu_hours";

export type QuotaPeriod = "minute" | "hour" | "day" | "month";

export type QuotaAction = "block" | "warn" | "throttle";

export type RateLimitType = "requests_per_second" | "requests_per_minute" | "concurrent_connections" | "bandwidth_mbps";

export interface RateLimitRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scopeKind: QuotaScopeKind;
  scopeId: string;
  scopeLabel: string;
  targetKind: QuotaTargetKind;
  targetId: string;
  targetLabel: string;
  type: RateLimitType;
  limit: number;
  current: number;
  action: QuotaAction;
  environment: "dev" | "staging" | "production";
  updatedAt: string;
}

export interface QuotaRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scopeKind: QuotaScopeKind;
  scopeId: string; // e.g. "user:ana", "team:platform", "area:engineering"
  scopeLabel: string;
  targetKind: QuotaTargetKind;
  targetId: string; // "*" for any
  targetLabel: string;
  metric: QuotaMetric;
  limit: number;
  used: number;
  period: QuotaPeriod;
  action: QuotaAction;
  environment: "dev" | "staging" | "production";
  updatedAt: string;
}

export const scopeOptions: Record<QuotaScopeKind, { id: string; label: string }[]> = {
  user: [
    { id: "user:ana.silva", label: "ana.silva@inspire.ai" },
    { id: "user:bruno.costa", label: "bruno.costa@inspire.ai" },
    { id: "user:carla.mendes", label: "carla.mendes@inspire.ai" },
    { id: "user:diego.rocha", label: "diego.rocha@inspire.ai" },
  ],
  team: [
    { id: "team:platform", label: "Platform" },
    { id: "team:growth", label: "Growth" },
    { id: "team:research", label: "Research" },
    { id: "team:support", label: "Support" },
  ],
  area: [
    { id: "area:engineering", label: "Engineering" },
    { id: "area:marketing", label: "Marketing" },
    { id: "area:finance", label: "Finance" },
    { id: "area:operations", label: "Operations" },
  ],
};

export const targetOptions: Record<QuotaTargetKind, { id: string; label: string }[]> = {
  global: [{ id: "*", label: "All resources" }],
  flow: [
    { id: "*", label: "Any flow" },
    { id: "flow:lead-router", label: "Lead Router" },
    { id: "flow:invoice-extractor", label: "Invoice Extractor" },
    { id: "flow:churn-analyzer", label: "Churn Analyzer" },
  ],
  agent: [
    { id: "*", label: "Any agent" },
    { id: "agent:sdr-assistant", label: "SDR Assistant" },
    { id: "agent:research-bot", label: "Research Bot" },
  ],
  llm: [
    { id: "*", label: "Any LLM" },
    { id: "llm:gpt-4o", label: "GPT-4o" },
    { id: "llm:claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { id: "llm:gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  api: [
    { id: "*", label: "Any API" },
    { id: "api:stripe", label: "Stripe" },
    { id: "api:salesforce", label: "Salesforce" },
    { id: "api:hubspot", label: "HubSpot" },
  ],
  mcp: [
    { id: "*", label: "Any MCP server" },
    { id: "mcp:filesystem", label: "Filesystem MCP" },
    { id: "mcp:github", label: "GitHub MCP" },
  ],
  rag: [
    { id: "*", label: "Any RAG" },
    { id: "rag:product-docs", label: "Product Docs" },
    { id: "rag:policy-kb", label: "Policy KB" },
  ],
};

export const metricMeta: Record<QuotaMetric, { label: string; unit: string }> = {
  tokens: { label: "Tokens", unit: "tokens" },
  requests: { label: "Requests", unit: "req" },
  cost_usd: { label: "Cost", unit: "USD" },
  executions: { label: "Executions", unit: "runs" },
  concurrent_runs: { label: "Concurrent runs", unit: "runs" },
  storage_gb: { label: "Storage", unit: "GB" },
  cpu_cores: { label: "CPU", unit: "cores" },
  memory_gb: { label: "Memory", unit: "GB" },
  gpu_hours: { label: "GPU", unit: "hours" },
};

export const rateLimitMeta: Record<RateLimitType, { label: string; unit: string }> = {
  requests_per_second: { label: "Requests/sec", unit: "req/s" },
  requests_per_minute: { label: "Requests/min", unit: "req/min" },
  concurrent_connections: { label: "Concurrent connections", unit: "conn" },
  bandwidth_mbps: { label: "Bandwidth", unit: "Mbps" },
};

export const initialQuotas: QuotaRule[] = [
  {
    id: "q-1",
    name: "Engineering — daily LLM tokens",
    description: "Cap total tokens across all LLMs for engineering area.",
    enabled: true,
    scopeKind: "area",
    scopeId: "area:engineering",
    scopeLabel: "Engineering",
    targetKind: "llm",
    targetId: "*",
    targetLabel: "Any LLM",
    metric: "tokens",
    limit: 5_000_000,
    used: 3_120_400,
    period: "day",
    action: "throttle",
    environment: "production",
    updatedAt: "2026-05-12T10:24:00Z",
  },
  {
    id: "q-2",
    name: "Platform team — monthly spend",
    enabled: true,
    scopeKind: "team",
    scopeId: "team:platform",
    scopeLabel: "Platform",
    targetKind: "global",
    targetId: "*",
    targetLabel: "All resources",
    metric: "cost_usd",
    limit: 12000,
    used: 8420,
    period: "month",
    action: "warn",
    environment: "production",
    updatedAt: "2026-05-10T08:00:00Z",
  },
  {
    id: "q-3",
    name: "Ana — hourly requests on GPT-4o",
    enabled: true,
    scopeKind: "user",
    scopeId: "user:ana.silva",
    scopeLabel: "ana.silva@inspire.ai",
    targetKind: "llm",
    targetId: "llm:gpt-4o",
    targetLabel: "GPT-4o",
    metric: "requests",
    limit: 500,
    used: 312,
    period: "hour",
    action: "block",
    environment: "production",
    updatedAt: "2026-05-13T14:00:00Z",
  },
  {
    id: "q-4",
    name: "Lead Router — concurrent runs",
    enabled: true,
    scopeKind: "team",
    scopeId: "team:growth",
    scopeLabel: "Growth",
    targetKind: "flow",
    targetId: "flow:lead-router",
    targetLabel: "Lead Router",
    metric: "concurrent_runs",
    limit: 20,
    used: 7,
    period: "minute",
    action: "throttle",
    environment: "production",
    updatedAt: "2026-05-11T16:30:00Z",
  },
  {
    id: "q-5",
    name: "Marketing — daily Stripe calls",
    enabled: false,
    scopeKind: "area",
    scopeId: "area:marketing",
    scopeLabel: "Marketing",
    targetKind: "api",
    targetId: "api:stripe",
    targetLabel: "Stripe",
    metric: "requests",
    limit: 10000,
    used: 0,
    period: "day",
    action: "warn",
    environment: "staging",
    updatedAt: "2026-05-09T11:00:00Z",
  },
  {
    id: "q-6",
    name: "Research — GPU hours / month",
    enabled: true,
    scopeKind: "team",
    scopeId: "team:research",
    scopeLabel: "Research",
    targetKind: "global",
    targetId: "*",
    targetLabel: "All resources",
    metric: "gpu_hours",
    limit: 200,
    used: 142,
    period: "month",
    action: "block",
    environment: "production",
    updatedAt: "2026-05-08T09:15:00Z",
  },
];

export const initialRateLimits: RateLimitRule[] = [
  {
    id: "rl-1",
    name: "LLM Gateway — requests per second",
    description: "Global rate limit for LLM Gateway",
    enabled: true,
    scopeKind: "area",
    scopeId: "area:engineering",
    scopeLabel: "Engineering",
    targetKind: "llm",
    targetId: "*",
    targetLabel: "Any LLM",
    type: "requests_per_second",
    limit: 1000,
    current: 742,
    action: "throttle",
    environment: "production",
    updatedAt: "2026-05-13T15:00:00Z",
  },
  {
    id: "rl-2",
    name: "API Gateway — concurrent connections",
    description: "Max concurrent connections to external APIs",
    enabled: true,
    scopeKind: "team",
    scopeId: "team:platform",
    scopeLabel: "Platform",
    targetKind: "api",
    targetId: "*",
    targetLabel: "Any API",
    type: "concurrent_connections",
    limit: 500,
    current: 287,
    action: "warn",
    environment: "production",
    updatedAt: "2026-05-13T14:30:00Z",
  },
  {
    id: "rl-3",
    name: "RAG Gateway — requests per minute",
    description: "Rate limit for semantic search requests",
    enabled: true,
    scopeKind: "team",
    scopeId: "team:research",
    scopeLabel: "Research",
    targetKind: "rag",
    targetId: "*",
    targetLabel: "Any RAG",
    type: "requests_per_minute",
    limit: 6000,
    current: 4521,
    action: "throttle",
    environment: "production",
    updatedAt: "2026-05-13T15:15:00Z",
  },
  {
    id: "rl-4",
    name: "MCP Server — bandwidth limit",
    description: "Bandwidth limit for MCP Server Serpro",
    enabled: true,
    scopeKind: "area",
    scopeId: "area:engineering",
    scopeLabel: "Engineering",
    targetKind: "mcp",
    targetId: "mcp:filesystem",
    targetLabel: "Filesystem MCP",
    type: "bandwidth_mbps",
    limit: 100,
    current: 45,
    action: "warn",
    environment: "production",
    updatedAt: "2026-05-13T14:45:00Z",
  },
];
