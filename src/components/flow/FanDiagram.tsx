import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";
import type { FanItem } from "@/data/flows";

function Pill({ item }: { item: FanItem }) {
  const Icon = resolveIcon(item.icon);
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border bg-card/80 px-3 py-2 backdrop-blur-md"
      style={{
        borderColor: `color-mix(in oklch, var(--node-${item.variant}) 45%, transparent)`,
        boxShadow: `0 0 18px color-mix(in oklch, var(--node-${item.variant}) 18%, transparent)`,
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `color-mix(in oklch, var(--node-${item.variant}) 18%, transparent)`,
          color: `var(--node-${item.variant})`,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {item.meta} · {item.variant}
        </p>
      </div>
    </div>
  );
}

function Column({
  title,
  side,
  items,
}: {
  title: string;
  side: "in" | "out";
  items: FanItem[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground",
          side === "out" && "justify-end",
        )}
      >
        {side === "in" && <span className="h-px flex-1 bg-border" />}
        <span>{title}</span>
        {side === "out" && <span className="h-px flex-1 bg-border" />}
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            None
          </div>
        ) : (
          items.map((it, i) => <Pill key={`${side}-${i}`} item={it} />)
        )}
      </div>
    </div>
  );
}

export interface FanDiagramProps {
  fanIn: FanItem[];
  fanOut: FanItem[];
  /** Center label, e.g. flow name */
  centerLabel: string;
  centerSubtitle?: string;
}

export function FanDiagram({ fanIn, fanOut, centerLabel, centerSubtitle }: FanDiagramProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
      <Column title="Fan-in · ingress" side="in" items={fanIn} />

      <div className="flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-2">
          <div className="hidden items-center gap-1 text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-[image:var(--gradient-primary)] px-5 py-4 text-center shadow-[var(--shadow-glow)]">
            <p className="font-display text-sm font-bold text-primary-foreground">
              {centerLabel}
            </p>
            {centerSubtitle && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/80">
                {centerSubtitle}
              </p>
            )}
          </div>
          <div className="hidden items-center gap-1 text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <Column title="Fan-out · egress" side="out" items={fanOut} />
    </div>
  );
}
