import {
  Bot,
  Brain,
  Database,
  Webhook,
  Radio,
  Cloud,
  Send,
  Globe,
  Server,
  MemoryStick,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type FanIcon = LucideIcon;

export interface FanItem {
  label: string;
  meta: string;
  icon: FanIcon;
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

export interface OrchestrationFlow {
  id: string;
  name: string;
  slug: string;
  description: string;
  team: string;
  owner: string;
  version: string;
  status: "active" | "draft" | "error";
  tags: string[];
  /** ingress: who triggers this flow */
  fanIn: FanItem[];
  /** egress: what this flow calls / writes to */
  fanOut: FanItem[];
  /** agents referenced inside the orchestration */
  agents: { id: string; name: string; role: string }[];
}

export interface AgentFlow {
  id: string;
  name: string;
  slug: string;
  description: string;
  team: string;
  owner: string;
  version: string;
  status: "active" | "draft" | "error";
  tags: string[];
  fanIn: FanItem[];
  fanOut: FanItem[];
  rags: { id: string; name: string; meta: string }[];
}

export const orchestrations: OrchestrationFlow[] = [
  {
    id: "orch_research_v4",
    name: "Research Orchestration",
    slug: "research-orchestration",
    description:
      "Receives research questions, classifies intent and dispatches to specialist agents that aggregate web + warehouse data.",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v0.4.0",
    status: "active",
    tags: ["multi-agent", "router", "streaming"],
    fanIn: [
      { label: "POST /v1/research", meta: "REST · bearer", icon: Webhook, variant: "endpoint" },
      { label: "events.user.asked", meta: "Kafka · 6 partitions", icon: Radio, variant: "queue" },
    ],
    fanOut: [
      { label: "Tavily Web API", meta: "GET /search", icon: Globe, variant: "tool" },
      { label: "Warehouse", meta: "Postgres · analytics", icon: Database, variant: "db" },
      { label: "S3 Reports", meta: "aws · us-east-1", icon: Cloud, variant: "cloud" },
      { label: "events.research.done", meta: "Kafka · 3 partitions", icon: Radio, variant: "queue" },
      { label: "SSE Stream", meta: "text/event-stream", icon: Send, variant: "output" },
    ],
    agents: [
      { id: "agent_router_v1", name: "Intent Router", role: "Classifier" },
      { id: "agent_research_v3", name: "Researcher", role: "Specialist" },
      { id: "agent_sql_v2", name: "SQL Analyst", role: "Specialist" },
      { id: "agent_writer_v1", name: "Technical Writer", role: "Composer" },
    ],
  },
  {
    id: "orch_support_v2",
    name: "Customer Support Triage",
    slug: "support-triage",
    description:
      "Classifies incoming support tickets, escalates to specialist agents and writes case state back to CRM.",
    team: "Customer Success",
    owner: "leo.fernandes@synapse.ai",
    version: "v0.2.3",
    status: "active",
    tags: ["triage", "crm", "rabbitmq"],
    fanIn: [
      { label: "POST /v1/tickets", meta: "REST · hmac", icon: Webhook, variant: "endpoint" },
      { label: "support.inbound", meta: "RabbitMQ · topic", icon: Radio, variant: "queue" },
    ],
    fanOut: [
      { label: "Salesforce API", meta: "REST · oauth2", icon: Globe, variant: "tool" },
      { label: "Tickets DB", meta: "Postgres · primary", icon: Database, variant: "db" },
      { label: "Slack MCP", meta: "stdio", icon: Server, variant: "mcp" },
      { label: "support.resolved", meta: "RabbitMQ", icon: Radio, variant: "queue" },
    ],
    agents: [
      { id: "agent_router_v1", name: "Intent Router", role: "Classifier" },
      { id: "agent_critic_v2", name: "Critic Reviewer", role: "QA" },
      { id: "agent_summarizer_v1", name: "Summarizer", role: "Writer" },
    ],
  },
  {
    id: "orch_billing_v1",
    name: "Invoice Reconciliation",
    slug: "invoice-recon",
    description:
      "Reads invoice events, matches against ERP and produces a reconciliation report nightly.",
    team: "Finance Ops",
    owner: "mariana.lopes@synapse.ai",
    version: "v0.1.0",
    status: "draft",
    tags: ["batch", "graphql", "report"],
    fanIn: [
      { label: "Cron 02:00 UTC", meta: "scheduler", icon: Webhook, variant: "endpoint" },
      { label: "billing.invoice.new", meta: "Kafka", icon: Radio, variant: "queue" },
    ],
    fanOut: [
      { label: "ERP GraphQL", meta: "POST /graphql", icon: Globe, variant: "tool" },
      { label: "Finance DW", meta: "BigQuery", icon: Cloud, variant: "cloud" },
      { label: "Reports bucket", meta: "GCS", icon: Cloud, variant: "cloud" },
    ],
    agents: [
      { id: "agent_sql_v2", name: "SQL Analyst", role: "Extractor" },
      { id: "agent_writer_v1", name: "Technical Writer", role: "Reporter" },
    ],
  },
];

export const agentFlows: AgentFlow[] = [
  {
    id: "agent_research_v3",
    name: "Researcher",
    slug: "researcher",
    description: "Plans, decomposes and delegates web research tasks across tools.",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v3.0.1",
    status: "active",
    tags: ["ReAct", "multi-tool", "stream"],
    fanIn: [
      { label: "Prompt Input", meta: "text · multimodal", icon: Send, variant: "input" },
      { label: "Conversation Memory", meta: "buffer + summary", icon: MemoryStick, variant: "memory" },
    ],
    fanOut: [
      { label: "Gemini 2.5 Pro", meta: "temp 0.4 · 8k ctx", icon: Brain, variant: "llm" },
      { label: "Tavily Web Search", meta: "GET /search", icon: Wrench, variant: "tool" },
      { label: "Filesystem MCP", meta: "stdio", icon: Server, variant: "mcp" },
      { label: "Streamed Response", meta: "SSE", icon: Send, variant: "output" },
    ],
    rags: [
      { id: "rag_internal_docs", name: "Internal Docs", meta: "pgvector · 12k docs" },
      { id: "rag_research_papers", name: "Research Papers", meta: "pinecone · 48k chunks" },
    ],
  },
  {
    id: "agent_writer_v1",
    name: "Technical Writer",
    slug: "tech-writer",
    description: "Turns research notes into structured markdown documentation.",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v1.4.0",
    status: "active",
    tags: ["CoT", "markdown", "long-context"],
    fanIn: [{ label: "Notes Payload", meta: "json", icon: Send, variant: "input" }],
    fanOut: [
      { label: "GPT-5", meta: "temp 0.2", icon: Brain, variant: "llm" },
      { label: "Markdown Out", meta: "stream", icon: Send, variant: "output" },
    ],
    rags: [{ id: "rag_style_guide", name: "Editorial Style Guide", meta: "pgvector · 320 docs" }],
  },
  {
    id: "agent_router_v1",
    name: "Intent Router",
    slug: "intent-router",
    description: "Classifies user input and dispatches to the right specialist agent.",
    team: "Platform Core",
    owner: "leo.fernandes@synapse.ai",
    version: "v1.2.0",
    status: "active",
    tags: ["classifier", "fast"],
    fanIn: [{ label: "Prompt Input", meta: "text", icon: Send, variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash Lite", meta: "temp 0.0", icon: Brain, variant: "llm" },
      { label: "Route Decision", meta: "json", icon: Send, variant: "output" },
    ],
    rags: [],
  },
  {
    id: "agent_sql_v2",
    name: "SQL Analyst",
    slug: "sql-analyst",
    description: "Generates and executes safe parameterized queries on warehouse.",
    team: "Data",
    owner: "mariana.lopes@synapse.ai",
    version: "v2.1.0",
    status: "error",
    tags: ["function-calling", "guardrails"],
    fanIn: [{ label: "Question", meta: "natural language", icon: Send, variant: "input" }],
    fanOut: [
      { label: "GPT-5 mini", meta: "temp 0.1", icon: Brain, variant: "llm" },
      { label: "Warehouse", meta: "Postgres", icon: Database, variant: "db" },
      { label: "Result Set", meta: "json", icon: Send, variant: "output" },
    ],
    rags: [{ id: "rag_schema_catalog", name: "Schema Catalog", meta: "pgvector · 12 schemas" }],
  },
  {
    id: "agent_critic_v2",
    name: "Critic Reviewer",
    slug: "critic",
    description: "Reviews outputs against rubric and triggers revision loops.",
    team: "Quality",
    owner: "leo.fernandes@synapse.ai",
    version: "v2.0.0",
    status: "draft",
    tags: ["self-reflect", "evaluator"],
    fanIn: [{ label: "Draft Payload", meta: "json", icon: Send, variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash", meta: "temp 0.3", icon: Brain, variant: "llm" },
      { label: "Verdict", meta: "json", icon: Send, variant: "output" },
    ],
    rags: [{ id: "rag_rubrics", name: "Quality Rubrics", meta: "pgvector · 80 docs" }],
  },
  {
    id: "agent_summarizer_v1",
    name: "Summarizer",
    slug: "summarizer",
    description: "Produces hierarchical summaries with citations.",
    team: "Knowledge Platform",
    owner: "ana.silva@synapse.ai",
    version: "v1.1.0",
    status: "active",
    tags: ["map-reduce", "citations"],
    fanIn: [{ label: "Documents", meta: "text[]", icon: Send, variant: "input" }],
    fanOut: [
      { label: "Gemini 2.5 Flash", meta: "temp 0.2", icon: Brain, variant: "llm" },
      { label: "Summary", meta: "markdown", icon: Send, variant: "output" },
    ],
    rags: [],
  },
];

export function getOrchestration(id: string) {
  return orchestrations.find((o) => o.id === id);
}
export function getAgentFlow(id: string) {
  return agentFlows.find((a) => a.id === id);
}
