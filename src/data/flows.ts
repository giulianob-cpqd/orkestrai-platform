import type { IconName } from "@/lib/icons";

export interface FanItem {
  label: string;
  meta: string;
  icon: IconName;
  variant:
    | "endpoint"
    | "queue"
    | "db"
    | "cloud"
    | "tool"
    | "mcp"
    | "llm"
    | "rag"
    | "agentref"
    | "memory"
    | "output"
    | "input";
}

export interface EnvDeployInfo {
  status: "active" | "draft" | "error" | "not_deployed" | "deploying";
  version: string;
  flowId?: string; // Reference to the flow JSON for this env
}

export interface OrchestrationFlow {
  id: string;
  name: string;
  slug: string;
  description: string;
  area: string;
  team: string;
  owner: string;
  version: string;
  status: "active" | "draft" | "error" | "deploying";
  tags: string[];
  codeLevel: "highcode" | "lowcode";
  fanIn: FanItem[];
  fanOut: FanItem[];
  agents: { id: string; name: string; role: string }[];
  envStatus?: Record<string, EnvDeployInfo>;
  repoUrl?: string;
}

export interface AgentFlow {
  id: string;
  name: string;
  slug: string;
  description: string;
  area: string;
  team: string;
  owner: string;
  version: string;
  status: "active" | "draft" | "error" | "deploying";
  tags: string[];
  codeLevel: "highcode" | "lowcode";
  fanIn: FanItem[];
  fanOut: FanItem[];
  rags: { id: string; name: string; meta: string }[];
  envStatus?: Record<string, EnvDeployInfo>;
  hasConversation?: boolean;
  repoUrl?: string;
}

export const orchestrations: OrchestrationFlow[] = [
  {
    id: "orch_research",
    name: "Research Orchestration",
    slug: "research-orchestration",
    description:
      "Receives research questions, classifies intent and dispatches to specialist agents that aggregate web + warehouse data.",
    area: "AI & Machine Learning",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v0.4.0",
    status: "active",
    tags: ["multi-agent", "router", "streaming"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "POST /v1/research", meta: "REST · bearer", icon: "Webhook", variant: "endpoint" },
      { label: "events.user.asked", meta: "Kafka · 6 partitions", icon: "Radio", variant: "queue" },
    ],
    fanOut: [
      { label: "Tavily Web API", meta: "GET /search", icon: "Globe", variant: "tool" },
      { label: "Warehouse", meta: "Postgres · analytics", icon: "Database", variant: "db" },
      { label: "S3 Reports", meta: "aws · us-east-1", icon: "Cloud", variant: "cloud" },
      { label: "events.research.done", meta: "Kafka · 3 partitions", icon: "Radio", variant: "queue" },
      { label: "SSE Stream", meta: "text/event-stream", icon: "Send", variant: "output" },
    ],
    agents: [
      { id: "agent_router", name: "Intent Router", role: "Classifier" },
      { id: "agent_research", name: "Researcher", role: "Specialist" },
      { id: "agent_sql", name: "SQL Analyst", role: "Specialist" },
      { id: "agent_writer", name: "Technical Writer", role: "Composer" },
    ],
    envStatus: {
      dev: { status: "active", version: "v0.4.0" },
      staging: { status: "active", version: "v0.3.0" },
      production: { status: "active", version: "v0.3.0" },
    },
    repoUrl: "https://github.com/inspire-ai/orchestration-research",
  },
  {
    id: "orch_support",
    name: "Customer Support Triage",
    slug: "support-triage",
    description:
      "Classifies incoming support tickets, escalates to specialist agents and writes case state back to CRM.",
    area: "Customer Experience",
    team: "Customer Success",
    owner: "leo.fernandes@synapse.ai",
    version: "v0.2.3",
    status: "active",
    tags: ["triage", "crm", "rabbitmq"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "POST /v1/tickets", meta: "REST · hmac", icon: "Webhook", variant: "endpoint" },
      { label: "support.inbound", meta: "RabbitMQ · topic", icon: "Radio", variant: "queue" },
    ],
    fanOut: [
      { label: "Salesforce API", meta: "REST · oauth2", icon: "Globe", variant: "tool" },
      { label: "Tickets DB", meta: "Postgres · primary", icon: "Database", variant: "db" },
      { label: "Slack MCP", meta: "stdio", icon: "Server", variant: "mcp" },
      { label: "support.resolved", meta: "RabbitMQ", icon: "Radio", variant: "queue" },
    ],
    agents: [
      { id: "agent_router", name: "Intent Router", role: "Classifier" },
      { id: "agent_critic", name: "Critic Reviewer", role: "QA" },
      { id: "agent_summarizer", name: "Summarizer", role: "Writer" },
    ],
    envStatus: {
      dev: { status: "active", version: "v0.2.3" },
      staging: { status: "active", version: "v0.2.3" },
      production: { status: "active", version: "v0.2.0" },
    },
    repoUrl: "https://github.com/inspire-ai/orchestration-support-triage",
  },
  {
    id: "orch_billing",
    name: "Invoice Reconciliation",
    slug: "invoice-recon",
    description:
      "Reads invoice events, matches against ERP and produces a reconciliation report nightly.",
    area: "Finance",
    team: "Finance Ops",
    owner: "mariana.lopes@synapse.ai",
    version: "v0.1.0",
    status: "draft",
    tags: ["batch", "graphql", "report"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "Cron 02:00 UTC", meta: "scheduler", icon: "Webhook", variant: "endpoint" },
      { label: "billing.invoice.new", meta: "Kafka", icon: "Radio", variant: "queue" },
    ],
    fanOut: [
      { label: "ERP GraphQL", meta: "POST /graphql", icon: "Globe", variant: "tool" },
      { label: "Finance DW", meta: "BigQuery", icon: "Cloud", variant: "cloud" },
      { label: "Reports bucket", meta: "GCS", icon: "Cloud", variant: "cloud" },
    ],
    agents: [
      { id: "agent_sql", name: "SQL Analyst", role: "Extractor" },
      { id: "agent_writer", name: "Technical Writer", role: "Reporter" },
    ],
    envStatus: {
      dev: { status: "draft", version: "v0.1.0" },
      staging: { status: "not_deployed", version: "-" },
      production: { status: "not_deployed", version: "-" },
    },
    repoUrl: "https://github.com/inspire-ai/orchestration-invoice-reconciliation",
  },
  {
    id: "orch_approval",
    name: "Expense Approval Workflow",
    slug: "expense-approval",
    description:
      "Routes expense reports through approval chain with human review and decision gates.",
    area: "Finance",
    team: "Finance Ops",
    owner: "mariana.lopes@synapse.ai",
    version: "v0.3.0",
    status: "active",
    tags: ["human-in-loop", "approval", "workflow"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "expenses.submitted", meta: "Kafka · partition 2", icon: "Inbox", variant: "queue" },
    ],
    fanOut: [
      { label: "expenses.approved", meta: "Kafka · partition 1", icon: "Megaphone", variant: "queue" },
    ],
    agents: [
      { id: "agent_validator", name: "Expense Validator", role: "Checker" },
      { id: "agent_router", name: "Approval Router", role: "Classifier" },
    ],
    envStatus: {
      dev: { status: "active", version: "v0.3.0" },
      staging: { status: "active", version: "v0.3.0" },
      production: { status: "active", version: "v0.2.0" },
    },
    repoUrl: "https://github.com/inspire-ai/orchestration-expense-approval",
  },
  {
    id: "orch_content_review",
    name: "Content Review Pipeline",
    slug: "content-review",
    description:
      "Processes user-generated content through moderation and human review stages with feedback loops.",
    area: "Content & Moderation",
    team: "Quality",
    owner: "leo.fernandes@synapse.ai",
    version: "v0.2.0",
    status: "active",
    tags: ["moderation", "human-review", "feedback"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "grpc.ContentService/Review", meta: "gRPC · unary", icon: "Zap", variant: "endpoint" },
    ],
    fanOut: [
      { label: "grpc.ContentService/Publish", meta: "gRPC · unary", icon: "Zap", variant: "output" },
    ],
    agents: [
      { id: "agent_moderation", name: "Content Moderator", role: "Classifier" },
      { id: "agent_feedback", name: "Feedback Generator", role: "Composer" },
    ],
    envStatus: {
      dev: { status: "active", version: "v0.2.0" },
      staging: { status: "active", version: "v0.2.0" },
      production: { status: "active", version: "v0.1.0" },
    },
    repoUrl: "https://github.com/inspire-ai/orchestration-content-review",
  },
];

export const agentFlows: AgentFlow[] = [
  {
    id: "agent_research",
    name: "Researcher",
    slug: "researcher",
    description: "Plans, decomposes and delegates web research tasks across tools.",
    area: "AI & Machine Learning",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v3.0.1",
    status: "active",
    tags: ["ReAct", "multi-tool", "stream"],
    codeLevel: "lowcode",
    fanIn: [
      { label: "Input", meta: "text · multimodal", icon: "Send", variant: "input" },
      { label: "Conversation Memory", meta: "buffer + summary", icon: "MemoryStick", variant: "memory" },
    ],
    fanOut: [
      { label: "Gemini 2.5 Pro", meta: "temp 0.4 · 8k ctx", icon: "Brain", variant: "llm" },
      { label: "Tavily Web Search", meta: "GET /search", icon: "Wrench", variant: "tool" },
      { label: "Filesystem MCP", meta: "stdio", icon: "Server", variant: "mcp" },
      { label: "Streamed Response", meta: "SSE", icon: "Send", variant: "output" },
    ],
    rags: [
      { id: "rag_internal_docs", name: "Internal Docs", meta: "pgvector · 12k docs" },
      { id: "rag_research_papers", name: "Research Papers", meta: "pinecone · 48k chunks" },
    ],
    envStatus: {
      dev: { status: "active", version: "v3.0.1" },
      staging: { status: "active", version: "v3.0.0" },
      production: { status: "active", version: "v3.0.0" },
    },
    hasConversation: true,
    repoUrl: "https://github.com/inspire-ai/agent-researcher",
  },
  {
    id: "agent_writer",
    name: "Technical Writer",
    slug: "tech-writer",
    description: "Turns research notes into structured markdown documentation.",
    area: "AI & Machine Learning",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v1.4.0",
    status: "active",
    tags: ["CoT", "markdown", "long-context"],
    codeLevel: "lowcode",
    fanIn: [{ label: "Notes Payload", meta: "json", icon: "Send", variant: "input" }],
    fanOut: [
      { label: "GPT-5", meta: "temp 0.2", icon: "Brain", variant: "llm" },
      { label: "Markdown Out", meta: "stream", icon: "Send", variant: "output" },
    ],
    rags: [{ id: "rag_style_guide", name: "Editorial Style Guide", meta: "pgvector · 320 docs" }],
    envStatus: {
      dev: { status: "active", version: "v1.4.0" },
      staging: { status: "active", version: "v1.4.0" },
      production: { status: "active", version: "v1.3.0" },
    },
    hasConversation: true,
    repoUrl: "https://github.com/inspire-ai/agent-technical-writer",
  },
  {
    id: "agent_router",
    name: "Intent Router",
    slug: "intent-router",
    description: "Classifies user input and dispatches to the right specialist agent.",
    area: "Platform Engineering",
    team: "Platform Core",
    owner: "leo.fernandes@synapse.ai",
    version: "v1.2.0",
    status: "active",
    tags: ["classifier", "fast"],
    codeLevel: "lowcode",
    fanIn: [{ label: "Input", meta: "text", icon: "Send", variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash Lite", meta: "temp 0.0", icon: "Brain", variant: "llm" },
      { label: "Route Decision", meta: "json", icon: "Send", variant: "output" },
    ],
    rags: [],
    envStatus: {
      dev: { status: "active", version: "v1.2.0" },
      staging: { status: "active", version: "v1.2.0" },
      production: { status: "active", version: "v1.2.0" },
    },
    repoUrl: "https://github.com/inspire-ai/agent-intent-router",
  },
  {
    id: "agent_sql",
    name: "SQL Analyst",
    slug: "sql-analyst",
    description: "Generates and executes safe parameterized queries on warehouse.",
    area: "Data Engineering",
    team: "Data",
    owner: "mariana.lopes@synapse.ai",
    version: "v2.1.0",
    status: "error",
    tags: ["function-calling", "guardrails"],
    codeLevel: "lowcode",
    fanIn: [{ label: "Question", meta: "natural language", icon: "Send", variant: "input" }],
    fanOut: [
      { label: "GPT-5 mini", meta: "temp 0.1", icon: "Brain", variant: "llm" },
      { label: "Warehouse", meta: "Postgres", icon: "Database", variant: "db" },
      { label: "Result Set", meta: "json", icon: "Send", variant: "output" },
    ],
    rags: [{ id: "rag_schema_catalog", name: "Schema Catalog", meta: "pgvector · 12 schemas" }],
    envStatus: {
      dev: { status: "error", version: "v2.1.0" },
      staging: { status: "active", version: "v2.0.0" },
      production: { status: "active", version: "v2.0.0" },
    },
    repoUrl: "https://github.com/inspire-ai/agent-sql-analyst",
  },
  {
    id: "agent_critic",
    name: "Critic Reviewer",
    slug: "critic",
    description: "Reviews outputs against rubric and triggers revision loops.",
    area: "Quality Assurance",
    team: "Quality",
    owner: "leo.fernandes@synapse.ai",
    version: "v2.0.0",
    status: "draft",
    tags: ["self-reflect", "evaluator"],
    codeLevel: "lowcode",
    fanIn: [{ label: "Draft Payload", meta: "json", icon: "Send", variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash", meta: "temp 0.3", icon: "Brain", variant: "llm" },
      { label: "Verdict", meta: "json", icon: "Send", variant: "output" },
    ],
    rags: [{ id: "rag_rubrics", name: "Quality Rubrics", meta: "pgvector · 80 docs" }],
    envStatus: {
      dev: { status: "draft", version: "v2.0.0" },
      staging: { status: "not_deployed", version: "-" },
      production: { status: "not_deployed", version: "-" },
    },
    repoUrl: "https://github.com/inspire-ai/agent-critic-reviewer",
  },
  {
    id: "agent_summarizer",
    name: "Summarizer",
    slug: "summarizer",
    description: "Produces hierarchical summaries with citations.",
    area: "AI & Machine Learning",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v1.1.0",
    status: "active",
    tags: ["map-reduce", "citations"],
    codeLevel: "lowcode",
    fanIn: [{ label: "Documents", meta: "text[]", icon: "Send", variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash", meta: "temp 0.2", icon: "Brain", variant: "llm" },
      { label: "Summary", meta: "markdown", icon: "Send", variant: "output" },
    ],
    rags: [],
    envStatus: {
      dev: { status: "active", version: "v1.1.0" },
      staging: { status: "active", version: "v1.1.0" },
      production: { status: "active", version: "v1.0.0" },
    },
    hasConversation: true,
    repoUrl: "https://github.com/inspire-ai/agent-summarizer",
  },
];

export function getOrchestration(id: string) {
  return orchestrations.find((o) => o.id === id);
}
export function getAgentFlow(id: string) {
  return agentFlows.find((a) => a.id === id);
}

export function addOrchestration(flow: OrchestrationFlow) {
  if (!orchestrations.find((o) => o.id === flow.id)) {
    orchestrations.unshift(flow);
  }
}
export function addAgentFlow(flow: AgentFlow) {
  if (!agentFlows.find((a) => a.id === flow.id)) {
    agentFlows.unshift(flow);
  }
}

export function updateOrchestration(id: string, patch: Partial<OrchestrationFlow>) {
  const o = orchestrations.find((x) => x.id === id);
  if (o) Object.assign(o, patch);
}
export function updateAgentFlow(id: string, patch: Partial<AgentFlow>) {
  const a = agentFlows.find((x) => x.id === id);
  if (a) Object.assign(a, patch);
}

export function setOrchestrationStatus(id: string, status: OrchestrationFlow["status"]) {
  const o = orchestrations.find((x) => x.id === id);
  if (o) o.status = status;
}
export function setAgentFlowStatus(id: string, status: AgentFlow["status"]) {
  const a = agentFlows.find((x) => x.id === id);
  if (a) a.status = status;
}
export function setAppStatus(id: string, status: "active" | "draft" | "error") {
  setOrchestrationStatus(id, status);
  setAgentFlowStatus(id, status);
}

export function setAppEnvStatus(id: string, environment: string, status: "active" | "draft" | "error" | "not_deployed") {
  const o = orchestrations.find((x) => x.id === id);
  if (o) {
    if (!o.envStatus) o.envStatus = {};
    o.envStatus[environment] = { ...o.envStatus[environment], status };
  }
  const a = agentFlows.find((x) => x.id === id);
  if (a) {
    if (!a.envStatus) a.envStatus = {};
    a.envStatus[environment] = { ...a.envStatus[environment], status };
  }
}

export function getAppVersion(id: string): string {
  const o = orchestrations.find((x) => x.id === id);
  if (o) return o.version;
  const a = agentFlows.find((x) => x.id === id);
  if (a) return a.version;
  return "v0.1.0";
}

export function bumpAppVersion(id: string): string {
  const bump = (v: string) => {
    const match = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return "v0.2.0";
    return `v${match[1]}.${Number(match[2]) + 1}.0`;
  };
  const o = orchestrations.find((x) => x.id === id);
  if (o) { o.version = bump(o.version); return o.version; }
  const a = agentFlows.find((x) => x.id === id);
  if (a) { a.version = bump(a.version); return a.version; }
  return "v0.2.0";
}
