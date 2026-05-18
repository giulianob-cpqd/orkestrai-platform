/**
 * In-memory store that persists flow graphs (nodes + edges) per application ID and environment.
 * The FlowBuilder auto-saves here on every change, and detail pages read
 * fan-in / fan-out from the saved nodes.
 * 
 * Key format: `${appId}:${environment}` for environment-specific flows
 * Legacy format: `${appId}` for backward compatibility
 */
import type { Node, Edge } from "@xyflow/react";
import type { FanItem } from "./flows";
import type { IconName } from "@/lib/icons";

export interface SavedFlow {
  nodes: Node[];
  edges: Edge[];
  params?: { key: string; value: string }[];
}

const store = new Map<string, SavedFlow>();
const versionStore = new Map<string, string>();
const versionHistoryStore = new Map<string, string[]>();

/** Generate a key for environment-specific flows */
function getFlowKey(appId: string, environment?: string): string {
  return environment ? `${appId}:${environment}` : appId;
}

export function saveFlow(appId: string, nodes: Node[], edges: Edge[], params?: { key: string; value: string }[], environment?: string) {
  const key = getFlowKey(appId, environment);
  const existing = store.get(key);
  store.set(key, { nodes: [...nodes], edges: [...edges], params: params ?? existing?.params });
}

export function getVersion(appId: string, environment?: string): string {
  const key = getFlowKey(appId, environment);
  return versionStore.get(key) ?? "v0.1.0";
}

export function incrementVersion(appId: string, environment?: string): string {
  const key = getFlowKey(appId, environment);
  const current = getVersion(appId, environment);
  const match = current.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    versionStore.set(key, "v0.1.1");
    addToVersionHistory(appId, "v0.1.1", environment);
    return "v0.1.1";
  }
  const [, major, minor, patch] = match;
  const next = `v${major}.${minor}.${Number(patch) + 1}`;
  versionStore.set(key, next);
  addToVersionHistory(appId, next, environment);
  return next;
}

export function addToVersionHistory(appId: string, version: string, environment?: string): void {
  const key = getFlowKey(appId, environment);
  const history = versionHistoryStore.get(key) ?? [];
  if (!history.includes(version)) {
    history.unshift(version); // Add to beginning (most recent first)
    versionHistoryStore.set(key, history);
  }
}

export function getVersionHistory(appId: string, environment?: string): string[] {
  const key = getFlowKey(appId, environment);
  const history = versionHistoryStore.get(key);
  
  // If no history exists, initialize with default versions
  if (!history) {
    const currentVersion = getVersion(appId, environment);
    // Generate two previous versions based on current version
    const match = currentVersion.match(/^v(\d+)\.(\d+)\.(\d+)$/);
    if (match) {
      const [, major, minor, patch] = match;
      const majorNum = Number(major);
      const minorNum = Number(minor);
      const patchNum = Number(patch);
      
      // Create two previous versions
      const prevVersion1 = patchNum > 0 
        ? `v${major}.${minor}.${patchNum - 1}`
        : minorNum > 0
          ? `v${major}.${minorNum - 1}.0`
          : `v${majorNum - 1}.0.0`;
      
      const prevVersion2 = prevVersion1.match(/^v(\d+)\.(\d+)\.(\d+)$/)
        ? (() => {
            const m = prevVersion1.match(/^v(\d+)\.(\d+)\.(\d+)$/)!;
            const [, maj, min, pat] = m;
            const p = Number(pat);
            return p > 0 
              ? `v${maj}.${min}.${p - 1}`
              : Number(min) > 0
                ? `v${maj}.${Number(min) - 1}.0`
                : `v${Number(maj) - 1}.0.0`;
          })()
        : `v0.1.0`;
      
      const defaultHistory = [currentVersion, prevVersion1, prevVersion2];
      versionHistoryStore.set(key, defaultHistory);
      return defaultHistory;
    }
  }
  
  return history ?? [];
}

export function saveParams(appId: string, params: { key: string; value: string }[], environment?: string) {
  const key = getFlowKey(appId, environment);
  const existing = store.get(key);
  if (existing) {
    existing.params = [...params];
  } else {
    store.set(key, { nodes: [], edges: [], params: [...params] });
  }
}

export function getParams(appId: string, environment?: string): { key: string; value: string }[] {
  const key = getFlowKey(appId, environment);
  return store.get(key)?.params ?? [];
}

export function getFlow(appId: string, environment?: string): SavedFlow | undefined {
  const key = getFlowKey(appId, environment);
  return store.get(key);
}

/**
 * Derive fan-in items from the saved flow.
 * Filtered by mode:
 * - Agent: only "input"
 * - Orchestration: only "endpoint", "cron", "consumer"
 */
export function deriveFanIn(appId: string, mode: "agent" | "orchestration" = "orchestration", environment?: string): FanItem[] {
  const flow = getFlow(appId, environment);
  if (!flow) return [];
  const INGRESS_AGENT = new Set(["input"]);
  const INGRESS_ORCH = new Set(["endpoint", "cron", "consumer", "grpcreq", "wsreq"]);
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
export function deriveFanOut(appId: string, mode: "agent" | "orchestration" = "orchestration", environment?: string): FanItem[] {
  const flow = getFlow(appId, environment);
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
export function deriveRags(appId: string, environment?: string): { id: string; name: string; meta: string }[] {
  const flow = getFlow(appId, environment);
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
