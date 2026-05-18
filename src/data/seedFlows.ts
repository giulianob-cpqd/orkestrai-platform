/**
 * Seeds the flow store with pre-defined flows for every existing application.
 * Called once at app startup so detail pages always have ingress/egress data.
 */
import { saveFlow } from "./flowStore";

/* Use plain objects — avoid importing @xyflow/react at module level (breaks SSR) */
type Node = { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> };
type Edge = { id: string; source: string; target: string; targetHandle?: string; animated: boolean; markerEnd: { type: string } };

const e = (id: string, src: string, tgt: string, handle?: string): Edge => ({
  id, source: src, target: tgt, targetHandle: handle, animated: true,
  markerEnd: { type: "arrowclosed" },
});

/* ═══════════════════════════════════════════
   ORCHESTRATIONS
   ═══════════════════════════════════════════ */

const orchResearch: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    { id: "r1", type: "agent", position: { x: 40, y: 200 }, data: { label: "POST /v1/research", icon: "Webhook", variant: "endpoint", nodeType: "endpoint", meta: "REST · bearer" } },
    { id: "r2", type: "agent", position: { x: 40, y: 360 }, data: { label: "events.user.asked", icon: "Inbox", variant: "consumer", nodeType: "consumer", meta: "Kafka · 6 partitions" } },
    { id: "r3", type: "agent", position: { x: 320, y: 120 }, data: { label: "Intent Router", icon: "Route", variant: "router", nodeType: "router", meta: "3 paths", conditions: ["research", "sql", "default"] } },
    { id: "r4", type: "agent", position: { x: 620, y: 40 }, data: { label: "Researcher", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "v3 · published" } },
    { id: "r5", type: "agent", position: { x: 620, y: 200 }, data: { label: "SQL Analyst", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "v2 · published" } },
    { id: "r6", type: "agent", position: { x: 620, y: 360 }, data: { label: "Technical Writer", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "v1 · published" } },
    { id: "r7", type: "agent", position: { x: 940, y: 120 }, data: { label: "Warehouse", icon: "Database", variant: "db", nodeType: "db", meta: "PostgreSQL" } },
    { id: "r8", type: "agent", position: { x: 940, y: 280 }, data: { label: "S3 Reports", icon: "Cloud", variant: "cloud", nodeType: "cloud", meta: "aws · us-east-1" } },
    { id: "r9", type: "agent", position: { x: 940, y: 440 }, data: { label: "events.research.done", icon: "Megaphone", variant: "producer", nodeType: "producer", meta: "Kafka" } },
    { id: "r10", type: "agent", position: { x: 1220, y: 200 }, data: { label: "SSE Stream", icon: "Send", variant: "output", nodeType: "output", meta: "text/event-stream" } },
  ],
  edges: [
    e("re1", "r1", "r3"), e("re2", "r2", "r3"),
    e("re3", "r3", "r4", undefined), e("re4", "r3", "r5", undefined), e("re5", "r3", "r6", undefined),
    e("re6", "r5", "r7"), e("re7", "r4", "r8"), e("re8", "r6", "r9"),
    e("re9", "r4", "r10"), e("re10", "r5", "r10"),
  ],
};

const orchSupport: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    { id: "s1", type: "agent", position: { x: 40, y: 160 }, data: { label: "POST /v1/tickets", icon: "Webhook", variant: "endpoint", nodeType: "endpoint", meta: "REST · hmac" } },
    { id: "s2", type: "agent", position: { x: 40, y: 320 }, data: { label: "support.inbound", icon: "Inbox", variant: "consumer", nodeType: "consumer", meta: "RabbitMQ" } },
    { id: "s3", type: "agent", position: { x: 320, y: 240 }, data: { label: "Intent Router", icon: "Route", variant: "router", nodeType: "router", meta: "triage", conditions: ["urgent", "normal", "info"] } },
    { id: "s4", type: "agent", position: { x: 620, y: 100 }, data: { label: "Critic Reviewer", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "QA" } },
    { id: "s5", type: "agent", position: { x: 620, y: 260 }, data: { label: "Summarizer", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "Writer" } },
    { id: "s6", type: "agent", position: { x: 620, y: 420 }, data: { label: "Approval", icon: "UserCheck", variant: "humantask", nodeType: "humantask", meta: "manager review" } },
    { id: "s7", type: "agent", position: { x: 940, y: 100 }, data: { label: "Salesforce API", icon: "Globe", variant: "tool", nodeType: "tool", meta: "REST · oauth2" } },
    { id: "s8", type: "agent", position: { x: 940, y: 260 }, data: { label: "Tickets DB", icon: "Database", variant: "db", nodeType: "db", meta: "PostgreSQL" } },
    { id: "s9", type: "agent", position: { x: 940, y: 420 }, data: { label: "support.resolved", icon: "Megaphone", variant: "producer", nodeType: "producer", meta: "RabbitMQ" } },
    { id: "s10", type: "agent", position: { x: 1220, y: 260 }, data: { label: "Response", icon: "Send", variant: "output", nodeType: "output", meta: "JSON" } },
  ],
  edges: [
    e("se1", "s1", "s3"), e("se2", "s2", "s3"),
    e("se3", "s3", "s4"), e("se4", "s3", "s5"), e("se5", "s3", "s6"),
    e("se6", "s4", "s7"), e("se7", "s5", "s8"), e("se8", "s6", "s9"),
    e("se9", "s5", "s10"),
  ],
};

const orchBilling: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    { id: "b1", type: "agent", position: { x: 40, y: 160 }, data: { label: "Cron 02:00 UTC", icon: "Clock", variant: "cron", nodeType: "cron", meta: "0 2 * * *" } },
    { id: "b2", type: "agent", position: { x: 40, y: 320 }, data: { label: "billing.invoice.new", icon: "Inbox", variant: "consumer", nodeType: "consumer", meta: "Kafka" } },
    { id: "b3", type: "agent", position: { x: 320, y: 240 }, data: { label: "SQL Analyst", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "Extractor" } },
    { id: "b4", type: "agent", position: { x: 620, y: 140 }, data: { label: "ERP GraphQL", icon: "Globe", variant: "tool", nodeType: "tool", meta: "POST /graphql" } },
    { id: "b5", type: "agent", position: { x: 620, y: 300 }, data: { label: "Technical Writer", icon: "Bot", variant: "agentref", nodeType: "agentref", meta: "Reporter" } },
    { id: "b6", type: "agent", position: { x: 940, y: 140 }, data: { label: "Finance DW", icon: "Cloud", variant: "cloud", nodeType: "cloud", meta: "BigQuery" } },
    { id: "b7", type: "agent", position: { x: 940, y: 300 }, data: { label: "Reports bucket", icon: "Cloud", variant: "cloud", nodeType: "cloud", meta: "GCS" } },
    { id: "b8", type: "agent", position: { x: 1220, y: 220 }, data: { label: "Response", icon: "Send", variant: "output", nodeType: "output", meta: "report" } },
  ],
  edges: [
    e("be1", "b1", "b3"), e("be2", "b2", "b3"),
    e("be3", "b3", "b4"), e("be4", "b3", "b5"),
    e("be5", "b4", "b6"), e("be6", "b5", "b7"),
    e("be7", "b5", "b8"),
  ],
};

/* ═══════════════════════════════════════════
   AGENTS
   ═══════════════════════════════════════════ */

function agentFlow(
  llmLabel: string, llmId: string, llmMeta: string,
  tools: { label: string; variant: string; meta: string; icon: string }[],
  rags: { label: string; meta: string; ragId: string }[],
  hasMemory: boolean,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let x = 40;

  const inp = { id: "ai1", type: "agent", position: { x, y: 240 }, data: { label: "Input", icon: "Send", variant: "input", nodeType: "input", meta: "text" } };
  nodes.push(inp);
  x += 280;

  let slotY = 60;
  if (hasMemory) {
    const mem = { id: "am1", type: "agent", position: { x, y: slotY }, data: { label: "Conversation Memory", icon: "MemoryStick", variant: "memory", nodeType: "memory", meta: "buffer + summary" } };
    nodes.push(mem);
    edges.push(e(`ae-mem`, mem.id, "ap1", "memory"));
    slotY += 160;
  }
  rags.forEach((r, i) => {
    const n = { id: `ar${i}`, type: "agent", position: { x, y: slotY }, data: { label: r.label, icon: "Database", variant: "rag", nodeType: "rag", meta: r.meta, ragId: r.ragId } };
    nodes.push(n);
    edges.push(e(`ae-rag${i}`, n.id, "ap1", "rag"));
    slotY += 160;
  });
  tools.forEach((t, i) => {
    const n = { id: `at${i}`, type: "agent", position: { x, y: slotY }, data: { label: t.label, icon: t.icon, variant: t.variant, nodeType: t.variant, meta: t.meta } };
    nodes.push(n);
    edges.push(e(`ae-tool${i}`, n.id, "ap1", "tools"));
    slotY += 160;
  });

  x += 340;
  const prompt = { id: "ap1", type: "agent", position: { x, y: 240 }, data: { label: "Prompt", icon: "Wand2", variant: "prompt", nodeType: "prompt", meta: "main composer" } };
  nodes.push(prompt);
  edges.push(e("ae-inp", inp.id, prompt.id, "input"));

  x += 320;
  const llm = { id: "al1", type: "agent", position: { x, y: 240 }, data: { label: llmLabel, icon: "Brain", variant: "llm", nodeType: "llm", llmId, meta: llmMeta } };
  nodes.push(llm);
  edges.push(e("ae-llm", prompt.id, llm.id));

  x += 300;
  const out = { id: "ao1", type: "agent", position: { x, y: 240 }, data: { label: "Output", icon: "Send", variant: "output", nodeType: "output", meta: "stream" } };
  nodes.push(out);
  edges.push(e("ae-out", llm.id, out.id));

  return { nodes, edges };
}

const agentResearcher = agentFlow(
  "Gemini 2.5 Pro", "google/gemini-2.5-pro", "temp 0.4 · 8k ctx",
  [
    { label: "Tavily Web Search", variant: "tool", meta: "GET /search", icon: "Wrench" },
    { label: "Filesystem MCP", variant: "mcp", meta: "stdio", icon: "Server" },
  ],
  [
    { label: "Internal Docs", meta: "pgvector · 12k docs", ragId: "rag/internal-docs" },
    { label: "Research Papers", meta: "pinecone · 48k chunks", ragId: "rag/research-papers" },
  ],
  true,
);

const agentWriter = agentFlow(
  "GPT-5", "openai/gpt-5", "temp 0.2",
  [],
  [{ label: "Editorial Style Guide", meta: "pgvector · 320 docs", ragId: "rag/style-guide" }],
  false,
);

const agentRouter = agentFlow(
  "Gemini Flash Lite", "google/gemini-2.5-flash-lite", "temp 0.0",
  [],
  [],
  false,
);

const agentSql = agentFlow(
  "GPT-5 mini", "openai/gpt-5-mini", "temp 0.1",
  [{ label: "Warehouse", variant: "tool", meta: "Postgres", icon: "Wrench" }],
  [{ label: "Schema Catalog", meta: "pgvector · 12 schemas", ragId: "rag/schema-catalog" }],
  false,
);

const agentCritic = agentFlow(
  "Gemini 2.5 Flash", "google/gemini-2.5-flash", "temp 0.3",
  [],
  [{ label: "Quality Rubrics", meta: "pgvector · 80 docs", ragId: "rag/rubrics" }],
  false,
);

const agentSummarizer = agentFlow(
  "Gemini 2.5 Flash", "google/gemini-2.5-flash", "temp 0.2",
  [],
  [],
  false,
);

/* ═══════════════════════════════════════════
   SEED
   ═══════════════════════════════════════════ */

export function seedFlowStore() {
  const environments = ["dev", "staging", "production"];

  // Orchestrations
  environments.forEach((env) => {
    saveFlow("orch_research", orchResearch.nodes, orchResearch.edges, undefined, env);
    saveFlow("orch_support", orchSupport.nodes, orchSupport.edges, undefined, env);
    saveFlow("orch_billing", orchBilling.nodes, orchBilling.edges, undefined, env);
  });

  // Agents
  environments.forEach((env) => {
    saveFlow("agent_research", agentResearcher.nodes, agentResearcher.edges, undefined, env);
    saveFlow("agent_writer", agentWriter.nodes, agentWriter.edges, undefined, env);
    saveFlow("agent_router", agentRouter.nodes, agentRouter.edges, undefined, env);
    saveFlow("agent_sql", agentSql.nodes, agentSql.edges, undefined, env);
    saveFlow("agent_critic", agentCritic.nodes, agentCritic.edges, undefined, env);
    saveFlow("agent_summarizer", agentSummarizer.nodes, agentSummarizer.edges, undefined, env);
  });
}
