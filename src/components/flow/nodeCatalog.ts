import type { IconName } from "@/lib/icons";
import type { NodeVariant } from "./AgentNode";

export interface NodeTemplate {
  type: string;
  variant: NodeVariant;
  label: string;
  description: string;
  icon: IconName;
  meta?: string;
}

/* ---------- Agent Builder palette ---------- */
export const agentNodeCatalog: NodeTemplate[] = [
  { type: "input", variant: "input", label: "Input", description: "Incoming user message", icon: "Send", meta: "text · multimodal" },
  { type: "prompt", variant: "prompt", label: "Prompt", description: "Template + system instructions", icon: "Wand2", meta: "main composer" },
  { type: "task", variant: "task", label: "Task", description: "Named capability of the agent", icon: "ListChecks", meta: "default" },
  { type: "llm", variant: "llm", label: "LLM Model", description: "Reasoning core", icon: "Brain", meta: "gpt-5 · gemini-2.5-pro" },
  { type: "memory", variant: "memory", label: "Memory", description: "Conversational / episodic", icon: "MemoryStick", meta: "buffer · summary · vector" },
  { type: "rag", variant: "rag", label: "RAG Retriever", description: "Knowledge base lookup", icon: "Database", meta: "pgvector · pinecone" },
  { type: "tool", variant: "tool", label: "Tool / API", description: "External capability", icon: "Wrench", meta: "REST · GraphQL" },
  { type: "mcp", variant: "mcp", label: "MCP Server", description: "Model Context Protocol", icon: "Server", meta: "stdio · http" },
  { type: "output", variant: "output", label: "Response", description: "Agent output", icon: "Send", meta: "stream · json" },
];

/* ---------- Orchestration palette ---------- */
export const orchestrationNodeCatalog: NodeTemplate[] = [
  { type: "endpoint", variant: "endpoint", label: "Request", description: "REST · gRPC · SSE · WebSocket · GraphQL", icon: "Webhook", meta: "POST /v1/chat" },
  { type: "cron", variant: "cron", label: "Cron Job", description: "Scheduled trigger", icon: "Clock", meta: "0 2 * * *" },
  { type: "consumer", variant: "consumer", label: "Message Consumer", description: "Subscribes to topic / queue", icon: "Inbox", meta: "kafka · rabbitmq · nats" },
  { type: "producer", variant: "producer", label: "Message Producer", description: "Publishes to topic / queue", icon: "Megaphone", meta: "kafka · rabbitmq · nats" },
  { type: "agentref", variant: "agentref", label: "Agent", description: "Reference to a published agent", icon: "Bot", meta: "v1 · cataloged" },
  { type: "coord", variant: "coord", label: "Coordination", description: "Sequential · parallel · router · debate", icon: "GitBranch", meta: "supervisor pattern" },
  { type: "db", variant: "db", label: "Database", description: "Postgres · MySQL · Mongo · Redis", icon: "Database", meta: "select · upsert" },
  { type: "cloud", variant: "cloud", label: "Cloud Service", description: "S3 · Lambda · BigQuery", icon: "Cloud", meta: "aws · gcp · azure" },
  { type: "tool", variant: "tool", label: "External API", description: "Third-party REST call", icon: "Globe", meta: "GET · POST" },
  { type: "output", variant: "output", label: "Response", description: "Stream back to caller", icon: "Send", meta: "SSE · WS · JSON" },
];

export const nodeCatalog = orchestrationNodeCatalog;
