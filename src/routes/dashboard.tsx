import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Bot,
  Workflow,
  LayoutTemplate,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { orchestrations } from "@/data/flows";
import { useRequireAuth, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Inspire" },
      { name: "description", content: "Overview of your AI agents, orchestrations and deployments." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const ok = useRequireAuth();
  const { user } = useAuth();
  if (!ok) return null;

  const kpis = [
    { label: "Active orchestrations", value: "12", delta: "+2 this week", icon: Workflow, tone: "text-primary" },
    { label: "Agents deployed", value: "37", delta: "+5 this week", icon: Bot, tone: "text-success" },
    { label: "Templates", value: "8", delta: "1 new", icon: LayoutTemplate, tone: "text-warning" },
    { label: "Requests / 24h", value: "184k", delta: "+12.4%", icon: TrendingUp, tone: "text-primary" },
  ];

  const recent = [
    { kind: "deploy", title: "Research Orchestration", env: "production", status: "success", time: "12m ago" },
    { kind: "build", title: "Intent Router agent", env: "staging", status: "running", time: "27m ago" },
    { kind: "deploy", title: "SQL Analyst agent", env: "dev", status: "success", time: "1h ago" },
    { kind: "alert", title: "Technical Writer agent", env: "production", status: "warning", time: "3h ago" },
  ];

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back, ${user?.name.split(" ")[0]}`}>
      <div className="space-y-6 p-6">
        <PageHeader
          title={`Welcome back, ${user?.name.split(" ")[0]} 👋`}
          description="A quick view of your platform activity, deployments and AI workloads."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="border-border bg-card/80 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {k.label}
                </p>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card/80 p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Recent activity</h2>
                <p className="text-xs text-muted-foreground">Builds, deploys and platform alerts.</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="space-y-2">
              {recent.map((r, i) => {
                const Icon =
                  r.status === "success" ? CheckCircle2 : r.status === "warning" ? AlertTriangle : Clock;
                const tone =
                  r.status === "success"
                    ? "text-success"
                    : r.status === "warning"
                    ? "text-warning"
                    : "text-primary";
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${tone}`} />
                      <div className="leading-tight">
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {r.kind} · {r.env}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{r.time}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="border-border bg-card/80 p-5">
            <h2 className="font-display text-lg font-semibold">Quick actions</h2>
            <p className="text-xs text-muted-foreground">Jump back into building.</p>
            <div className="mt-4 space-y-2">
              <QuickAction to="/orchestrations/new" icon={Workflow} label="New orchestration" />
              <QuickAction to="/agents/new" icon={Bot} label="New agent" />
              <QuickAction to="/templates" icon={LayoutTemplate} label="Browse templates" />
            </div>
          </Card>
        </div>

        <Card className="border-border bg-card/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Top orchestrations</h2>
              <p className="text-xs text-muted-foreground">Most active multi-agent flows.</p>
            </div>
            <Link to="/orchestrations" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {orchestrations.slice(0, 4).map((o) => (
              <Link
                key={o.id}
                to="/orchestrations/$id"
                params={{ id: o.id }}
                className="group flex items-center justify-between rounded-md border border-border/50 bg-background/40 p-3 transition hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{o.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {o.agents.length} agents · {o.version}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {o.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Workflow;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
