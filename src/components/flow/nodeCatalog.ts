import {
  Brain,
  Bot,
  Wrench,
  Database,
  Server,
  Send,
  MemoryStick,
  Cloud,
  Globe,
  Radio,
  GitBranch,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import type { NodeVariant } from "./AgentNode";

export interface NodeTemplate {
  type: string;
  variant: NodeVariant;
  label: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
}

/* ---------- Agent Builder palette ---------- */
/* Used inside an agent: LLM, RAG, Memory, Tools (APIs/MCP), Prompt I/O */
export const agentNodeCatalog: NodeTemplate[] = [
  {
    type: "input",
    variant: "input",
    label: "Prompt Input",
    description: "Incoming user message",
    icon: Send,
    meta: "text · multimodal",
  },
  {
    type: "llm",
    variant: "llm",
    label: "LLM Model",
    description: "Reasoning core",
    icon: Brain,
    meta: "gpt-5 · gemini-2.5-pro",
  },
  {
    type: "memory",
    variant: "memory",
    label: "Memory",
    description: "Conversational / episodic",
    icon: MemoryStick,
    meta: "buffer · summary · vector",
  },
  {
    type: "rag",
    variant: "rag",
    label: "RAG Retriever",
    description: "Knowledge base lookup",
    icon: Database,
    meta: "pgvector · pinecone",
  },
  {
    type: "tool",
    variant: "tool",
    label: "Tool / API",
    description: "External capability",
    icon: Wrench,
    meta: "REST · GraphQL",
  },
  {
    type: "mcp",
    variant: "mcp",
    label: "MCP Server",
    description: "Model Context Protocol",
    icon: Server,
    meta: "stdio · http",
  },
  {
    type: "output",
    variant: "output",
    label: "Response",
    description: "Agent output",
    icon: Send,
    meta: "stream · json",
  },
];

/* ---------- Orchestration palette ---------- */
/* Flows of agents: agents as nodes + endpoints, queues, DBs, cloud, coordination */
export const orchestrationNodeCatalog: NodeTemplate[] = [
  {
    type: "endpoint",
    variant: "endpoint",
    label: "Endpoint",
    description: "REST · gRPC · WS · GraphQL",
    icon: Webhook,
    meta: "POST /v1/chat",
  },
  {
    type: "agentref",
    variant: "agentref",
    label: "Agent",
    description: "Reference to a published agent",
    icon: Bot,
    meta: "v1 · cataloged",
  },
  {
    type: "coord",
    variant: "coord",
    label: "Coordination",
    description: "Sequential · parallel · router · debate",
    icon: GitBranch,
    meta: "supervisor pattern",
  },
  {
    type: "queue",
    variant: "queue",
    label: "Topic / Queue",
    description: "Kafka · RabbitMQ · NATS",
    icon: Radio,
    meta: "events.user.created",
  },
  {
    type: "db",
    variant: "db",
    label: "Database",
    description: "Postgres · Mongo · Redis",
    icon: Database,
    meta: "select · upsert",
  },
  {
    type: "cloud",
    variant: "cloud",
    label: "Cloud Service",
    description: "S3 · Lambda · BigQuery",
    icon: Cloud,
    meta: "aws · gcp · azure",
  },
  {
    type: "tool",
    variant: "tool",
    label: "External API",
    description: "Third-party REST call",
    icon: Globe,
    meta: "GET · POST",
  },
  {
    type: "output",
    variant: "output",
    label: "Response Sink",
    description: "Stream back to caller",
    icon: Send,
    meta: "SSE · WS",
  },
];

/* Backwards-compat alias used by legacy imports */
export const nodeCatalog = orchestrationNodeCatalog;
