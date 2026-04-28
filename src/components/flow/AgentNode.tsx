import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { resolveIcon, type IconName } from "@/lib/icons";

export type NodeVariant =
  | "llm"
  | "agent"
  | "tool"
  | "rag"
  | "mcp"
  | "output"
  | "memory"
  | "db"
  | "cloud"
  | "endpoint"
  | "queue"
  | "agentref"
  | "coord"
  | "input"
  | "prompt"
  | "cron";

export interface AgentNodeData {
  label: string;
  description?: string;
  icon: IconName;
  variant: NodeVariant;
  meta?: string;
  nodeType?: string;
  [key: string]: unknown;
}

const PROMPT_HANDLES = [
  { id: "input", color: "var(--node-input)", label: "in" },
  { id: "memory", color: "var(--node-memory)", label: "mem" },
  { id: "tools", color: "var(--node-tool)", label: "tools" },
  { id: "rag", color: "var(--node-rag)", label: "rag" },
] as const;

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as AgentNodeData;
  const Icon = resolveIcon(d.icon);
  const v = d.variant;
  const isPrompt = d.nodeType === "prompt" || v === "prompt";

  return (
    <div
      className={cn(
        "min-w-[210px] rounded-xl border-2 bg-card/95 backdrop-blur-md transition-all",
        `border-[var(--node-${v})]/50`,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      style={{ boxShadow: `0 0 24px color-mix(in oklch, var(--node-${v}) 25%, transparent)` }}
    >
      {isPrompt ? (
        PROMPT_HANDLES.map((h, i) => (
          <Handle
            key={h.id}
            id={h.id}
            type="target"
            position={Position.Left}
            style={{
              top: `${20 + i * 22}%`,
              background: h.color,
              width: 10,
              height: 10,
              border: "2px solid var(--background)",
            }}
          />
        ))
      ) : (
        <Handle type="target" position={Position.Left} />
      )}

      <div className="flex items-center gap-3 p-3">
        <div
          className={cn("flex h-9 w-9 items-center justify-center rounded-lg")}
          style={{
            background: `color-mix(in oklch, var(--node-${v}) 18%, transparent)`,
            color: `var(--node-${v})`,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {v}
          </span>
          <span className="text-sm font-semibold">{d.label}</span>
        </div>
      </div>
      {(d.description || d.meta) && (
        <div className="border-t border-border/50 px-3 py-2">
          {d.description && (
            <p className="text-xs text-muted-foreground">{d.description}</p>
          )}
          {d.meta && (
            <p className="mt-1 font-mono text-[10px] text-primary">{d.meta}</p>
          )}
          {isPrompt && (
            <div className="mt-2 flex flex-wrap gap-1">
              {PROMPT_HANDLES.map((h) => (
                <span
                  key={h.id}
                  className="rounded-sm border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider"
                  style={{ borderColor: h.color, color: h.color }}
                >
                  {h.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
