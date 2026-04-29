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
    data: { label: "Researcher", icon: "Bot", variant: "agentref", nodeType: "agentref", agentId: "agent_research_v3", meta: "v3" } },
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
    data: { label: "Summarizer", icon: "Bot", variant: "agentref", nodeType: "agentref", agentId: "agent_summarizer_v1" } },
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
  },
];

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id);
}
export function templatesByKind(kind: TemplateKind) {
  return templates.filter((t) => t.kind === kind);
}
