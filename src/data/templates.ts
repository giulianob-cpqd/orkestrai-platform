/**
 * Reusable starting points for Agents and Orchestrations.
 * A template is *either* an agent or an orchestration — never both.
 * Source can be `lowcode` (built from a flow) or `highcode` (linked to a code repo).
 */
import { type Node, type Edge, MarkerType } from "@xyflow/react";

export type TemplateKind = "agent" | "orchestration";
export type TemplateSource = "lowcode" | "highcode";

export interface Template {
  id: string;
  name: string;
  description: string;
  kind: TemplateKind;
  source: TemplateSource;
  tags: string[];
  author: string;
  updatedAt: string;
  /* Either a flow snapshot (lowcode) or a repo url (highcode) */
  flow?: { nodes: Node[]; edges: Edge[] };
  repoUrl?: string;
  /* Parameters to be configured when using the template (lowcode only) */
  parameters?: Array<{
    id: string;
    name: string;
    description: string;
    type: "text" | "select" | "number";
    required: boolean;
    options?: string[];
    defaultValue?: string;
  }>;
}

const e = (id: string, source: string, target: string, targetHandle?: string): Edge => ({
  id,
  source,
  target,
  targetHandle,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
});

/* ---------- AGENT TEMPLATES ---------- */
const ragAssistantNodes: Node[] = [
  { id: "t1", type: "agent", position: { x: 40, y: 200 },
    data: { label: "Input", icon: "Send", variant: "input", nodeType: "input", description: "User question", meta: "text" } },
  { id: "t2", type: "agent", position: { x: 320, y: 80 },
    data: { label: "Conversation Memory", icon: "MemoryStick", variant: "memory", nodeType: "memory", description: "Buffer + summary", meta: "20 turns" } },
  { id: "t3", type: "agent", position: { x: 320, y: 240 },
    data: { label: "Knowledge Base", icon: "Database", variant: "rag", nodeType: "rag", description: "Internal docs", meta: "pgvector", ragId: "rag/internal-docs" } },
  { id: "t4", type: "agent", position: { x: 660, y: 200 },
    data: { label: "Prompt", icon: "Wand2", variant: "prompt", nodeType: "prompt", description: "RAG QA template",
      template: "You are a helpful assistant.\nUse the provided context to answer.\n\nContext: {{rag}}\nMemory: {{memory}}\nUser: {{input}}" } },
  { id: "t5", type: "agent", position: { x: 980, y: 200 },
    data: { label: "Gemini 2.5 Pro", icon: "Brain", variant: "llm", nodeType: "llm", llmId: "google/gemini-2.5-pro", meta: "temp 0.3" } },
  { id: "t6", type: "agent", position: { x: 1280, y: 200 },
    data: { label: "Response", icon: "Send", variant: "output", nodeType: "output", format: "sse", meta: "SSE stream" } },
];
const ragAssistantEdges: Edge[] = [
  e("te1", "t1", "t4", "input"),
  e("te2", "t2", "t4", "memory"),
  e("te3", "t3", "t4", "rag"),
  e("te4", "t4", "t5"),
  e("te5", "t5", "t6"),
];

/* ---------- ORCHESTRATION TEMPLATES ---------- */
const restToAgentNodes: Node[] = [
  { id: "o1", type: "agent", position: { x: 40, y: 200 },
    data: { label: "POST /v1/chat", icon: "Webhook", variant: "endpoint", nodeType: "endpoint", protocol: "rest", path: "POST /v1/chat", meta: "REST" } },
  { id: "o2", type: "agent", position: { x: 360, y: 200 },
    data: { label: "Researcher", icon: "Bot", variant: "agentref", nodeType: "agentref", agentId: "agent_research", meta: "v3" } },
  { id: "o3", type: "agent", position: { x: 680, y: 200 },
    data: { label: "Response", icon: "Send", variant: "output", nodeType: "output", meta: "auto" } },
];
const restToAgentEdges: Edge[] = [e("oe1", "o1", "o2"), e("oe2", "o2", "o3")];

const eventConsumerNodes: Node[] = [
  { id: "c1", type: "agent", position: { x: 40, y: 200 },
    data: { label: "events.user.created", icon: "Inbox", variant: "consumer", nodeType: "consumer", broker: "kafka", topic: "events.user.created", meta: "Kafka consumer" } },
  { id: "c2", type: "agent", position: { x: 360, y: 200 },
    data: { label: "Intent Router", icon: "GitBranch", variant: "coord", nodeType: "coord", strategy: "router", meta: "router" } },
  { id: "c3", type: "agent", position: { x: 680, y: 100 },
    data: { label: "Summarizer", icon: "Bot", variant: "agentref", nodeType: "agentref", agentId: "agent_summarizer" } },
  { id: "c4", type: "agent", position: { x: 680, y: 300 },
    data: { label: "Tickets DB", icon: "Database", variant: "db", nodeType: "db", dbType: "postgres", dbOperation: "upsert", meta: "PostgreSQL · upsert" } },
  { id: "c5", type: "agent", position: { x: 1000, y: 200 },
    data: { label: "events.user.processed", icon: "Megaphone", variant: "producer", nodeType: "producer", broker: "kafka", topic: "events.user.processed" } },
];
const eventConsumerEdges: Edge[] = [
  e("ce1", "c1", "c2"),
  e("ce2", "c2", "c3"),
  e("ce3", "c2", "c4"),
  e("ce4", "c3", "c5"),
  e("ce5", "c4", "c5"),
];

export const templates: Template[] = [
  {
    id: "tpl_rag_assistant",
    name: "RAG Assistant",
    description: "Single-agent QA with conversational memory and a RAG retriever over internal docs.",
    kind: "agent",
    source: "lowcode",
    tags: ["rag", "qa", "memory"],
    author: "ana.silva@inspire.ai",
    updatedAt: "2026-04-12",
    flow: { nodes: ragAssistantNodes, edges: ragAssistantEdges },
    repoUrl: "https://github.com/inspire-ai/template-rag-assistant",
    parameters: [
      { id: "rag_id", name: "Knowledge Base ID", description: "ID of the RAG to use for retrieval", type: "text", required: true, defaultValue: "rag/internal-docs" },
      { id: "llm_model", name: "LLM Model", description: "Language model to use", type: "select", required: true, options: ["google/gemini-2.5-pro", "openai/gpt-4", "anthropic/claude-3"], defaultValue: "google/gemini-2.5-pro" },
      { id: "temperature", name: "Temperature", description: "Model temperature (0-1)", type: "number", required: false, defaultValue: "0.3" },
      { id: "memory_turns", name: "Memory Turns", description: "Number of conversation turns to remember", type: "number", required: false, defaultValue: "20" },
    ],
  },
  {
    id: "tpl_router_agent",
    name: "Intent Router Agent",
    description: "Lightweight classifier agent — routes user input into one of N labels.",
    kind: "agent",
    source: "lowcode",
    tags: ["classifier", "fast"],
    author: "leo.fernandes@inspire.ai",
    updatedAt: "2026-03-30",
    flow: {
      nodes: [
        { id: "r1", type: "agent", position: { x: 40, y: 200 }, data: { label: "Input", icon: "Send", variant: "input", nodeType: "input" } },
        { id: "r2", type: "agent", position: { x: 360, y: 200 }, data: { label: "Prompt", icon: "Wand2", variant: "prompt", nodeType: "prompt", template: "Classify the user input into: support | sales | billing.\n\nUser: {{input}}" } },
        { id: "r3", type: "agent", position: { x: 680, y: 200 }, data: { label: "Gemini Flash Lite", icon: "Brain", variant: "llm", nodeType: "llm", llmId: "google/gemini-2.5-flash-lite" } },
        { id: "r4", type: "agent", position: { x: 1000, y: 200 }, data: { label: "Response", icon: "Send", variant: "output", nodeType: "output", format: "json" } },
      ],
      edges: [e("re1", "r1", "r2", "input"), e("re2", "r2", "r3"), e("re3", "r3", "r4")],
    },
    repoUrl: "https://github.com/inspire-ai/template-intent-router",
    parameters: [
      { id: "categories", name: "Classification Categories", description: "Comma-separated list of categories to classify into", type: "text", required: true, defaultValue: "support, sales, billing" },
      { id: "llm_model", name: "LLM Model", description: "Language model to use", type: "select", required: true, options: ["google/gemini-2.5-flash-lite", "openai/gpt-4-turbo", "anthropic/claude-3-haiku"], defaultValue: "google/gemini-2.5-flash-lite" },
    ],
  },
  {
    id: "tpl_code_agent",
    name: "Code-Linked Agent",
    description: "High-code agent backed by a Git repo (Python). Use when behavior is fully custom.",
    kind: "agent",
    source: "highcode",
    tags: ["highcode", "python"],
    author: "platform@inspire.ai",
    updatedAt: "2026-04-02",
    repoUrl: "https://github.com/inspire-ai/agent-template-python",
    parameters: [
      { id: "model_name", name: "Model Name", description: "Name of the model to use", type: "text", required: true, defaultValue: "gpt-4" },
      { id: "temperature", name: "Temperature", description: "Model temperature (0-1)", type: "number", required: false, defaultValue: "0.7" },
      { id: "max_tokens", name: "Max Tokens", description: "Maximum tokens to generate", type: "number", required: false, defaultValue: "2000" },
    ],
  },
  {
    id: "tpl_rest_to_agent",
    name: "REST → Agent",
    description: "Minimal orchestration: REST endpoint dispatches to a single agent and streams the response.",
    kind: "orchestration",
    source: "lowcode",
    tags: ["rest", "single-agent"],
    author: "ana.silva@inspire.ai",
    updatedAt: "2026-04-20",
    flow: { nodes: restToAgentNodes, edges: restToAgentEdges },
    repoUrl: "https://github.com/inspire-ai/template-rest-to-agent",
    parameters: [
      { id: "endpoint_path", name: "Endpoint Path", description: "REST endpoint path (e.g., /v1/chat)", type: "text", required: true, defaultValue: "/v1/chat" },
      { id: "agent_id", name: "Agent ID", description: "ID of the agent to dispatch to", type: "text", required: true, defaultValue: "agent_research" },
    ],
  },
  {
    id: "tpl_event_pipeline",
    name: "Event Pipeline",
    description: "Kafka consumer → router → agent + DB upsert → producer. Async, no inbound HTTP.",
    kind: "orchestration",
    source: "lowcode",
    tags: ["kafka", "async", "pipeline"],
    author: "leo.fernandes@inspire.ai",
    updatedAt: "2026-04-18",
    flow: { nodes: eventConsumerNodes, edges: eventConsumerEdges },
    repoUrl: "https://github.com/inspire-ai/template-event-pipeline",
    parameters: [
      { id: "input_topic", name: "Input Topic", description: "Kafka topic to consume from", type: "text", required: true, defaultValue: "events.user.created" },
      { id: "output_topic", name: "Output Topic", description: "Kafka topic to produce to", type: "text", required: true, defaultValue: "events.user.processed" },
      { id: "router_agent", name: "Router Agent", description: "Agent to use for routing", type: "text", required: true, defaultValue: "agent_router" },
      { id: "processor_agent", name: "Processor Agent", description: "Agent to process events", type: "text", required: true, defaultValue: "agent_summarizer" },
    ],
  },
  {
    id: "tpl_orch_repo",
    name: "High-Code Orchestration",
    description: "Orchestration whose graph lives in a TypeScript repo. Imported as a black-box step.",
    kind: "orchestration",
    source: "highcode",
    tags: ["highcode", "typescript"],
    author: "platform@inspire.ai",
    updatedAt: "2026-04-05",
    repoUrl: "https://github.com/inspire-ai/orchestration-template-ts",
    parameters: [
      { id: "api_endpoint", name: "API Endpoint", description: "Base URL for the orchestration API", type: "text", required: true, defaultValue: "https://api.example.com" },
      { id: "auth_token", name: "Auth Token", description: "Authentication token for API access", type: "text", required: true },
      { id: "timeout", name: "Timeout (ms)", description: "Request timeout in milliseconds", type: "number", required: false, defaultValue: "30000" },
    ],
  },
];

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id);
}
export function templatesByKind(kind: TemplateKind) {
  return templates.filter((t) => t.kind === kind);
}
