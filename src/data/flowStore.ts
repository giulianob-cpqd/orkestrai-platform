/**
 * In-memory store that persists flow graphs (nodes + edges) per application ID.
 * The FlowBuilder auto-saves here on every change, and detail pages read
 * fan-in / fan-out from the saved nodes.
 */
import type { Node, Edge } from "@xyflow/react";
import type { FanItem } from "./flows";
import type { IconName } from "@/lib/icons";

export interface SavedFlow {
  nodes: Node[];
  edges: Edge[];
}

const store = new Map<string, SavedFlow>();

export function saveFlow(appId: string, nodes: Node[], edges: Edge[]) {
  store.set(appId, { nodes: [...nodes], edges: [...edges] });
}

export function getFlow(appId: string): SavedFlow | undefined {
  return store.get(appId);
}

/**
 * Derive fan-in items from the saved flow.
 * Filtered by mode:
 * - Agent: only "input"
 * - Orchestration: only "endpoint", "cron", "consumer"
 */
export function deriveFanIn(appId: string, mode: "agent" | "orchestration" = "orchestration"): FanItem[] {
  const flow = store.get(appId);
  if (!flow) return [];
  const INGRESS_AGENT = new Set(["input"]);
  const INGRESS_ORCH = new Set(["endpoint", "cron", "consumer"]);
  const allowed = mode === "agent" ? INGRESS_AGENT : INGRESS_ORCH;
  return flow.nodes
    .filter((n) => {
      const v = (n.data as { variant?: string })?.variant ?? "";
      return allowed.has(v);
    })
    .map((n) => nodeToFanItem(n))
    .filter(Boolean) as FanItem[];
}

/**
 * Derive fan-out items from the saved flow.
 * Filtered by mode:
 * - Agent: only "llm", "memory", "tool", "mcp"
 * - Orchestration: only "producer", "humantask", "db", "cloud", "tool"
 */
export function deriveFanOut(appId: string, mode: "agent" | "orchestration" = "orchestration"): FanItem[] {
  const flow = store.get(appId);
  if (!flow) return [];
  const EGRESS_AGENT = new Set(["llm", "memory", "tool", "mcp"]);
  const EGRESS_ORCH = new Set(["producer", "humantask", "db", "cloud", "tool"]);
  const allowed = mode === "agent" ? EGRESS_AGENT : EGRESS_ORCH;
  return flow.nodes
    .filter((n) => {
      const v = (n.data as { variant?: string })?.variant ?? "";
      return allowed.has(v);
    })
    .map((n) => nodeToFanItem(n))
    .filter(Boolean) as FanItem[];
}

/**
 * Derive RAG items from the saved flow (agent flows).
 */
export function deriveRags(appId: string): { id: string; name: string; meta: string }[] {
  const flow = store.get(appId);
  if (!flow) return [];
  return flow.nodes
    .filter((n) => {
      const v = (n.data as { variant?: string })?.variant ?? "";
      return v === "rag";
    })
    .map((n) => {
      const d = n.data as Record<string, unknown>;
      return {
        id: (d.ragId as string) ?? n.id,
        name: (d.label as string) ?? "RAG",
        meta: (d.meta as string) ?? "",
      };
    });
}

const VARIANT_MAP: Record<string, FanItem["variant"]> = {
  endpoint: "endpoint",
  cron: "endpoint",
  consumer: "queue",
  producer: "queue",
  queue: "queue",
  db: "db",
  cloud: "cloud",
  tool: "tool",
  mcp: "mcp",
  llm: "llm",
  rag: "rag",
  agentref: "agentref",
  memory: "memory",
  output: "output",
  input: "input",
};

/* ---- Seed handled by __root.tsx on client side ---- */

function nodeToFanItem(node: Node): FanItem | null {
  const d = node.data as Record<string, unknown>;
  const variant = (d.variant as string) ?? "";
  const mapped = VARIANT_MAP[variant];
  if (!mapped) return null;
  return {
    label: (d.label as string) ?? variant,
    meta: (d.meta as string) ?? "",
    icon: (d.icon as IconName) ?? "Send",
    variant: mapped,
  };
}
