import { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Severity = "info" | "success" | "warning";
type Alert = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: Severity;
  read: boolean;
};

const initialAlerts: Alert[] = [
  {
    id: "a1",
    title: "Deploy succeeded",
    description: "Research Orchestration · production",
    time: "12m ago",
    severity: "success",
    read: false,
  },
  {
    id: "a2",
    title: "High latency detected",
    description: "Technical Writer agent p95 above 1.2s",
    time: "1h ago",
    severity: "warning",
    read: false,
  },
  {
    id: "a3",
    title: "New template available",
    description: "RAG Knowledge Base v2 published",
    time: "3h ago",
    severity: "info",
    read: false,
  },
  {
    id: "a4",
    title: "Pipeline finished",
    description: "Intent Router build #142 passed",
    time: "yesterday",
    severity: "success",
    read: true,
  },
];

const iconBySeverity = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
} as const;

const toneBySeverity = {
  success: "text-success",
  warning: "text-warning",
  info: "text-primary",
} as const;

export function NotificationsMenu() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const unread = alerts.filter((a) => !a.read).length;

  const markAll = () => setAlerts((xs) => xs.map((a) => ({ ...a, read: true })));
  const markOne = (id: string) =>
    setAlerts((xs) => xs.map((a) => (a.id === id ? { ...a, read: true } : a)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Notifications</span>
            <span className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={markAll}
            disabled={unread === 0}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all
          </Button>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {alerts.map((a) => {
            const Icon = iconBySeverity[a.severity];
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => markOne(a.id)}
                  className={`flex w-full items-start gap-3 border-b border-border/50 px-3 py-2.5 text-left transition hover:bg-muted/40 ${
                    a.read ? "opacity-70" : ""
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${toneBySeverity[a.severity]}`} />
                  <div className="flex-1 leading-tight">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                  {!a.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
