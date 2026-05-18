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

export interface NodeGroup {
  name: string;
  items: NodeTemplate[];
}

/* ---------- Agent Builder palette ---------- */
export const agentNodeCatalog: NodeTemplate[] = [
  { type: "input", variant: "input", label: "Input", description: "Incoming user message", icon: "Send", meta: "text · multimodal" },
  { type: "prompt", variant: "prompt", label: "Prompt", description: "Template + system instructions", icon: "Wand2", meta: "main composer" },
  { type: "task", variant: "task", label: "Task", description: "Named capability of the agent", icon: "ListChecks", meta: "default" },
  { type: "conversation", variant: "conversation", label: "Conversation", description: "Enable chat interface", icon: "MessageCircle", meta: "multi-turn · stateful" },
  { type: "llm", variant: "llm", label: "LLM Model", description: "Reasoning core", icon: "Brain", meta: "gpt-5 · gemini-2.5-pro" },
  { type: "memory", variant: "memory", label: "Memory", description: "Conversational / episodic", icon: "MemoryStick", meta: "buffer · summary · vector" },
  { type: "rag", variant: "rag", label: "RAG Retriever", description: "Knowledge base lookup", icon: "Database", meta: "pgvector · pinecone" },
  { type: "tool", variant: "tool", label: "Tool / API", description: "External capability", icon: "Wrench", meta: "REST · GraphQL" },
  { type: "db", variant: "db", label: "Tool / Database", description: "Query a registered database", icon: "Database", meta: "SQL · NoSQL" },
  { type: "mcp", variant: "mcp", label: "MCP Server", description: "Model Context Protocol", icon: "Server", meta: "stdio · http" },
  { type: "output", variant: "output", label: "Output", description: "Agent output", icon: "Send", meta: "stream · json" },
];

/* ---------- Orchestration palette (flat for backward compat) ---------- */
export const orchestrationNodeCatalog: NodeTemplate[] = [
  // Message / Communication
  { type: "endpoint", variant: "endpoint", label: "REST Request", description: "REST API endpoint", icon: "Webhook", meta: "POST /v1/chat" },
  { type: "output", variant: "output", label: "REST Response", description: "REST response to caller", icon: "Send", meta: "JSON" },
  { type: "grpcreq", variant: "grpcreq", label: "gRPC Request", description: "gRPC service call", icon: "Zap", meta: "proto · unary" },
  { type: "grpcres", variant: "grpcres", label: "gRPC Response", description: "gRPC response stream", icon: "Zap", meta: "proto · stream" },
  { type: "wsreq", variant: "wsreq", label: "WebSocket Request", description: "WebSocket connection", icon: "Cable", meta: "ws:// · wss://" },
  { type: "wsres", variant: "wsres", label: "WebSocket Response", description: "WebSocket message out", icon: "Cable", meta: "frames · json" },
  { type: "consumer", variant: "consumer", label: "Message Consumer", description: "Subscribes to topic / queue", icon: "Inbox", meta: "kafka · rabbitmq · nats" },
  { type: "producer", variant: "producer", label: "Message Producer", description: "Publishes to topic / queue", icon: "Megaphone", meta: "kafka · rabbitmq · nats" },
  // Triggers
  { type: "cron", variant: "cron", label: "Cron Job", description: "Scheduled trigger", icon: "Clock", meta: "0 2 * * *" },
  // Tasks
  { type: "agentref", variant: "agentref", label: "Agent Task", description: "Reference to a published agent", icon: "Bot", meta: "v1 · cataloged" },
  { type: "scripttask", variant: "scripttask", label: "Script Task", description: "Custom code execution", icon: "FileCode2", meta: "js · python · shell" },
  { type: "humantask", variant: "humantask", label: "Human Task", description: "Manual approval or input", icon: "UserCheck", meta: "approve · review · input" },
  // Coordination
  { type: "router", variant: "router", label: "Router", description: "Conditional branching", icon: "Route", meta: "if · switch · intent" },
  { type: "loop", variant: "loop", label: "Loop", description: "Repeat until condition", icon: "Repeat", meta: "for · while · retry" },
  { type: "validator", variant: "validator", label: "Validator", description: "Check data quality", icon: "ShieldCheck", meta: "schema · rubric" },
  { type: "merge", variant: "merge", label: "Wait", description: "Wait for branches", icon: "Hourglass", meta: "all · any · first" },
  // Tools
  { type: "db", variant: "db", label: "Database", description: "Postgres · MySQL · Mongo · Redis", icon: "Database", meta: "select · upsert" },
  { type: "cloud", variant: "cloud", label: "Cloud Service", description: "S3 · Lambda · BigQuery", icon: "Cloud", meta: "aws · gcp · azure" },
  { type: "tool", variant: "tool", label: "API", description: "Third-party REST call", icon: "Globe", meta: "GET · POST" },
  // Information
  { type: "humaninfo", variant: "humaninfo", label: "Human Info", description: "Informational message", icon: "AlertCircle", meta: "notify · alert" },
];

/* ---------- Grouped orchestration catalog ---------- */
export const orchestrationNodeGroups: NodeGroup[] = [
  {
    name: "Message / Communication",
    items: [
      { type: "endpoint", variant: "endpoint", label: "REST Request", description: "REST API endpoint", icon: "Webhook", meta: "POST /v1/chat" },
      { type: "output", variant: "output", label: "REST Response", description: "REST response to caller", icon: "Send", meta: "JSON" },
      { type: "grpcreq", variant: "grpcreq", label: "gRPC Request", description: "gRPC service call", icon: "Zap", meta: "proto · unary" },
      { type: "grpcres", variant: "grpcres", label: "gRPC Response", description: "gRPC response stream", icon: "Zap", meta: "proto · stream" },
      { type: "wsreq", variant: "wsreq", label: "WebSocket Request", description: "WebSocket connection", icon: "Cable", meta: "ws:// · wss://" },
      { type: "wsres", variant: "wsres", label: "WebSocket Response", description: "WebSocket message out", icon: "Cable", meta: "frames · json" },
      { type: "consumer", variant: "consumer", label: "Message Consumer", description: "Subscribes to topic / queue", icon: "Inbox", meta: "kafka · rabbitmq" },
      { type: "producer", variant: "producer", label: "Message Producer", description: "Publishes to topic / queue", icon: "Megaphone", meta: "kafka · rabbitmq" },
    ],
  },
  {
    name: "Triggers",
    items: [
      { type: "cron", variant: "cron", label: "Cron Job", description: "Scheduled trigger", icon: "Clock", meta: "0 2 * * *" },
    ],
  },
  {
    name: "Tasks",
    items: [
      { type: "agentref", variant: "agentref", label: "Agent Task", description: "Reference to a published agent", icon: "Bot", meta: "v1 · cataloged" },
      { type: "scripttask", variant: "scripttask", label: "Script Task", description: "Custom code execution", icon: "FileCode2", meta: "js · python" },
      { type: "humantask", variant: "humantask", label: "Human Task", description: "Manual approval or input", icon: "UserCheck", meta: "approve · review" },
    ],
  },
  {
    name: "Coordination",
    items: [
      { type: "router", variant: "router", label: "Router", description: "Conditional branching", icon: "Route", meta: "if · switch · intent" },
      { type: "loop", variant: "loop", label: "Loop", description: "Repeat until condition", icon: "Repeat", meta: "for · while · retry" },
      { type: "validator", variant: "validator", label: "Validator", description: "Check data quality", icon: "ShieldCheck", meta: "schema · rubric" },
      { type: "merge", variant: "merge", label: "Wait", description: "Wait for branches", icon: "Hourglass", meta: "all · any · first" },
    ],
  },
  {
    name: "Tools",
    items: [
      { type: "db", variant: "db", label: "Database", description: "Postgres · MySQL · Mongo · Redis", icon: "Database", meta: "select · upsert" },
      { type: "cloud", variant: "cloud", label: "Cloud Service", description: "S3 · Lambda · BigQuery", icon: "Cloud", meta: "aws · gcp · azure" },
      { type: "tool", variant: "tool", label: "API", description: "Third-party REST call", icon: "Globe", meta: "GET · POST" },
    ],
  },
  {
    name: "Information",
    items: [
      { type: "humaninfo", variant: "humaninfo", label: "Human Info", description: "Informational message", icon: "AlertCircle", meta: "notify · alert" },
    ],
  },
];

export const nodeCatalog = orchestrationNodeCatalog;
