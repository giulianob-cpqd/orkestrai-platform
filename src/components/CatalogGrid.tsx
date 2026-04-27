import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  meta: { label: string; value: string }[];
  status?: "active" | "draft" | "error";
  icon: LucideIcon;
  accent?: "primary" | "info" | "warning" | "accent" | "success" | "destructive";
}

const accentMap = {
  primary: "from-primary/20 to-primary/0 text-primary",
  info: "from-info/20 to-info/0 text-info",
  warning: "from-warning/20 to-warning/0 text-warning",
  accent: "from-accent/20 to-accent/0 text-accent",
  success: "from-success/20 to-success/0 text-success",
  destructive: "from-destructive/20 to-destructive/0 text-destructive",
};

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

export function CatalogGrid({ items, footer }: { items: CatalogItem[]; footer?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const accent = item.accent ?? "primary";
        return (
          <Card
            key={item.id}
            className="group relative overflow-hidden border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
                accentMap[accent],
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                    accentMap[accent],
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <p className="font-display text-base font-semibold">{item.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {item.id}
                  </p>
                </div>
              </div>
              {item.status && (
                <Badge variant="outline" className={cn("gap-1.5", statusMap[item.status])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {item.status}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
              {item.meta.map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="text-sm font-semibold">{m.value}</p>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      {footer}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
