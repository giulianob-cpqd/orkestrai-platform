import { Handle, Position, NodeProps } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentNodeData {
  label: string;
  description?: string;
  icon: LucideIcon;
  variant: "llm" | "agent" | "tool" | "rag" | "mcp" | "output";
  meta?: string;
  [key: string]: unknown;
}

const variantStyles: Record<AgentNodeData["variant"], string> = {
  llm: "border-[var(--node-llm)]/50 shadow-[0_0_24px_oklch(0.7_0.18_235/25%)]",
  agent: "border-[var(--node-agent)]/50 shadow-[0_0_24px_oklch(0.82_0.17_180/25%)]",
  tool: "border-[var(--node-tool)]/50 shadow-[0_0_24px_oklch(0.78_0.16_75/25%)]",
  rag: "border-[var(--node-rag)]/50 shadow-[0_0_24px_oklch(0.7_0.18_300/25%)]",
  mcp: "border-[var(--node-mcp)]/50 shadow-[0_0_24px_oklch(0.75_0.18_155/25%)]",
  output: "border-[var(--node-output)]/50 shadow-[0_0_24px_oklch(0.7_0.2_25/25%)]",
};

const variantIconBg: Record<AgentNodeData["variant"], string> = {
  llm: "bg-[var(--node-llm)]/15 text-[var(--node-llm)]",
  agent: "bg-[var(--node-agent)]/15 text-[var(--node-agent)]",
  tool: "bg-[var(--node-tool)]/15 text-[var(--node-tool)]",
  rag: "bg-[var(--node-rag)]/15 text-[var(--node-rag)]",
  mcp: "bg-[var(--node-mcp)]/15 text-[var(--node-mcp)]",
  output: "bg-[var(--node-output)]/15 text-[var(--node-output)]",
};

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as AgentNodeData;
  const Icon = d.icon;
  return (
    <div
      className={cn(
        "min-w-[200px] rounded-xl border-2 bg-card/95 backdrop-blur-md transition-all",
        variantStyles[d.variant],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-3 p-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            variantIconBg[d.variant],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {d.variant}
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
