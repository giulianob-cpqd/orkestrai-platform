import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertTriangle, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

const latencyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  p50: 200 + Math.sin(i / 3) * 60 + Math.random() * 40,
  p99: 800 + Math.cos(i / 4) * 200 + Math.random() * 150,
}));

const tokenData = Array.from({ length: 12 }, (_, i) => ({
  day: `D${i + 1}`,
  in: Math.round(80 + Math.random() * 60),
  out: Math.round(40 + Math.random() * 30),
}));

const traces = [
  { id: "tr_8a91f2", agent: "Researcher", duration: "2.4s", tokens: "3.2k", status: "ok", time: "12s ago" },
  { id: "tr_8a91f1", agent: "SQL Analyst", duration: "5.1s", tokens: "1.8k", status: "error", time: "18s ago" },
  { id: "tr_8a91f0", agent: "Intent Router", duration: "180ms", tokens: "240", status: "ok", time: "22s ago" },
  { id: "tr_8a91ef", agent: "Tech Writer", duration: "3.8s", tokens: "4.7k", status: "ok", time: "31s ago" },
  { id: "tr_8a91ee", agent: "Critic", duration: "1.2s", tokens: "920", status: "warn", time: "45s ago" },
];

const statusBadge = {
  ok: "border-success/40 text-success",
  error: "border-destructive/40 text-destructive",
  warn: "border-warning/40 text-warning",
};

const tooltipStyle = {
  background: "oklch(0.22 0.022 260 / 95%)",
  border: "1px solid oklch(0.32 0.02 260)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};

export function ObservabilitySection() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-base font-semibold">Observability</p>
        <p className="text-xs text-muted-foreground">
          Live metrics, logs and traces for this orchestration.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Requests / min", value: "1,284", delta: "+12%", icon: Activity, accent: "text-primary" },
          { label: "p99 latency", value: "842ms", delta: "-8%", icon: Zap, accent: "text-info" },
          { label: "Error rate", value: "0.42%", delta: "+0.1%", icon: AlertTriangle, accent: "text-warning" },
          { label: "Spend (24h)", value: "$184.20", delta: "+$12", icon: DollarSign, accent: "text-success" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{s.delta}</p>
              </div>
              <s.icon className={cn("h-6 w-6", s.accent)} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card/80 p-4 backdrop-blur-md lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-semibold">Latency</p>
              <p className="text-xs text-muted-foreground">p50 vs p99 over last 24h</p>
            </div>
            <Badge variant="outline" className="border-success/40 text-success">healthy</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="g50d" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g99d" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.18 300)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 300)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
              <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="p50" stroke="oklch(0.82 0.17 180)" fill="url(#g50d)" strokeWidth={2} />
              <Area type="monotone" dataKey="p99" stroke="oklch(0.7 0.18 300)" fill="url(#g99d)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
          <div className="mb-3">
            <p className="font-display text-sm font-semibold">Token usage</p>
            <p className="text-xs text-muted-foreground">Input vs output (k tokens)</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
              <XAxis dataKey="day" stroke="oklch(0.68 0.02 250)" fontSize={10} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="in" fill="oklch(0.7 0.18 235)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" fill="oklch(0.82 0.17 180)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-semibold">Recent traces</p>
            <p className="text-xs text-muted-foreground">Live tail · auto-refresh 5s</p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-info/40 text-info">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info" /> streaming
          </Badge>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">Trace ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Tokens</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs text-primary">{t.id}</td>
                  <td className="px-4 py-2">{t.agent}</td>
                  <td className="px-4 py-2 font-mono text-xs">{t.duration}</td>
                  <td className="px-4 py-2 font-mono text-xs">{t.tokens}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className={cn("text-[10px]", statusBadge[t.status as keyof typeof statusBadge])}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
