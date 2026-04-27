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
  | "input";

export interface AgentNodeData {
  label: string;
  description?: string;
  icon: IconName;
  variant: NodeVariant;
  meta?: string;
  [key: string]: unknown;
}

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as AgentNodeData;
  const Icon = resolveIcon(d.icon);
  const v = d.variant;
  return (
    <div
      className={cn(
        "min-w-[210px] rounded-xl border-2 bg-card/95 backdrop-blur-md transition-all",
        `border-[var(--node-${v})]/50`,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      style={{ boxShadow: `0 0 24px color-mix(in oklch, var(--node-${v}) 25%, transparent)` }}
    >
      <Handle type="target" position={Position.Left} />
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
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
