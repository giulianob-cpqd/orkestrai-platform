import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertTriangle, DollarSign, ChevronDown, Clock, AlertCircle, Copy, X } from "lucide-react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

const errorRateData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  rate: Math.max(0, 0.5 + Math.sin(i / 4) * 0.3 + Math.random() * 0.2),
}));

const throughputData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  requests: Math.round(1000 + Math.sin(i / 3) * 300 + Math.random() * 200),
}));

const costData = Array.from({ length: 12 }, (_, i) => ({
  day: `D${i + 1}`,
  cost: Math.round(150 + Math.random() * 100),
}));

const successRateData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`,
  rate: Math.max(95, 99 - Math.sin(i / 4) * 3 - Math.random() * 2),
}));

// Traces with execution details (flow-based)
const traces = [
  {
    id: "exec_001",
    duration: "15.3s",
    tokens: "10.7k",
    status: "ok",
    time: "12s ago",
    stages: [
      { name: "Intent Router", duration: "180ms", status: "ok", startTime: 0, endTime: 180, input: JSON.stringify({ question: "What is the capital of France?" }), output: JSON.stringify({ intent: "geography", category: "support" }) },
      { name: "Researcher", duration: "2.4s", status: "ok", startTime: 200, endTime: 2600, input: JSON.stringify({ question: "What is the capital of France?", intent: "geography" }), output: JSON.stringify({ answer: "Paris is the capital of France, located in the north-central part of the country.", sources: ["wikipedia", "britannica"] }) },
      { name: "SQL Analyst", duration: "5.1s", status: "error", startTime: 2700, endTime: 7800, input: JSON.stringify({ query: "SELECT * FROM countries WHERE name = 'France'" }), output: JSON.stringify({ error: "Database connection timeout", code: "ECONNREFUSED" }) },
      { name: "SQL Analyst (retry)", duration: "4.8s", status: "ok", startTime: 8000, endTime: 12800, input: JSON.stringify({ query: "SELECT population, area FROM countries WHERE name = 'France'" }), output: JSON.stringify({ population: "67.97M", area: "643,801 km²", gdp: "$2.78T" }) },
      { name: "Tech Writer", duration: "2.1s", status: "ok", startTime: 13000, endTime: 15100, input: JSON.stringify({ data: { population: "67.97M", area: "643,801 km²" }, format: "markdown" }), output: JSON.stringify({ summary: "France is a country in Western Europe with a population of approximately 68 million people and covers an area of 643,801 km²." }) },
    ],
  },
  {
    id: "exec_002",
    duration: "15.2s",
    tokens: "9.8k",
    status: "ok",
    time: "28s ago",
    stages: [
      { name: "Intent Router", duration: "180ms", status: "ok", startTime: 0, endTime: 180, input: JSON.stringify({ question: "Tell me about Python" }), output: JSON.stringify({ intent: "technical", language: "programming" }) },
      { name: "Researcher", duration: "2.3s", status: "ok", startTime: 200, endTime: 2500, input: JSON.stringify({ topic: "Python", type: "programming_language" }), output: JSON.stringify({ description: "Python is a high-level programming language known for its simplicity and readability.", created: 1991, paradigm: "Multi-paradigm" }) },
      { name: "SQL Analyst", duration: "4.9s", status: "ok", startTime: 2600, endTime: 7500, input: JSON.stringify({ query: "SELECT * FROM programming_languages WHERE name = 'Python'" }), output: JSON.stringify({ created: 1991, paradigm: "Multi-paradigm", users: "10M+", ranking: 1 }) },
      { name: "Tech Writer", duration: "2.2s", status: "ok", startTime: 7700, endTime: 9900, input: JSON.stringify({ data: { created: 1991, paradigm: "Multi-paradigm", users: "10M+" }, style: "technical" }), output: JSON.stringify({ summary: "Python is widely used in data science, web development, and automation due to its simplicity and extensive library ecosystem." }) },
      { name: "Critic", duration: "1.1s", status: "ok", startTime: 10100, endTime: 11200, input: JSON.stringify({ summary: "Python is widely used in data science, web development, and automation due to its simplicity and extensive library ecosystem." }), output: JSON.stringify({ quality: "high", accuracy: true, approved: true, feedback: "Summary is accurate and well-structured." }) },
    ],
  },
  {
    id: "exec_003",
    duration: "15.1s",
    tokens: "10.2k",
    status: "completed",
    time: "45s ago",
    stages: [
      { name: "Intent Router", duration: "180ms", status: "ok", startTime: 0, endTime: 180, input: JSON.stringify({ question: "How does photosynthesis work?" }), output: JSON.stringify({ intent: "science", topic: "biology" }) },
      { name: "Researcher", duration: "2.4s", status: "ok", startTime: 200, endTime: 2600, input: JSON.stringify({ topic: "photosynthesis", depth: "detailed" }), output: JSON.stringify({ definition: "Photosynthesis is the process by which plants convert light energy into chemical energy.", process: ["light reactions", "Calvin cycle"] }) },
      { name: "SQL Analyst", duration: "5.0s", status: "ok", startTime: 2700, endTime: 7700, input: JSON.stringify({ query: "SELECT * FROM biology_processes WHERE name = 'photosynthesis'" }), output: JSON.stringify({ stages: ["Light reactions", "Calvin cycle"], inputs: ["light", "water", "CO2"], outputs: ["glucose", "oxygen"] }) },
      { name: "Tech Writer", duration: "2.1s", status: "ok", startTime: 7900, endTime: 10000, input: JSON.stringify({ data: { stages: ["Light reactions", "Calvin cycle"], inputs: ["light", "water", "CO2"] }, format: "educational" }), output: JSON.stringify({ explanation: "Plants use sunlight, water, and CO2 to produce glucose and oxygen through photosynthesis in two main stages." }) },
      { name: "Critic", duration: "1.2s", status: "ok", startTime: 10200, endTime: 11400, input: JSON.stringify({ explanation: "Plants use sunlight, water, and CO2 to produce glucose and oxygen through photosynthesis in two main stages." }), output: JSON.stringify({ accuracy: true, clarity: "high", approved: true, feedback: "Explanation is scientifically accurate and clearly written." }) },
    ],
  },
];

// Executions with logs
const executions = [
  {
    id: "exec_001",
    version: "v1.2.3",
    status: "completed",
    trigger: "manual",
    startTime: "2024-01-15 14:32:45",
    endTime: "2024-01-15 14:33:00",
    duration: "15.3s",
    date: "2024-01-15",
    logs: [
      { id: "log_1", timestamp: "14:32:45.123", level: "info", message: "[Orchestration] Started execution" },
      { id: "log_2", timestamp: "14:32:45.234", level: "info", message: "[Intent Router] Processing input" },
      { id: "log_3", timestamp: "14:32:45.412", level: "info", message: "[Intent Router] Completed in 180ms" },
      { id: "log_4", timestamp: "14:32:45.500", level: "info", message: "[Researcher] Initializing with model gpt-4" },
      { id: "log_5", timestamp: "14:32:47.900", level: "info", message: "[Researcher] Generated 3200 tokens" },
      { id: "log_6", timestamp: "14:32:48.100", level: "info", message: "[SQL Analyst] Initializing with model gpt-4" },
      { id: "log_7", timestamp: "14:32:53.200", level: "error", message: "[SQL Analyst] Database connection timeout after 5.1s" },
      { id: "log_8", timestamp: "14:32:53.300", level: "warn", message: "[Orchestration] Retrying SQL Analyst (attempt 1/3)" },
      { id: "log_9", timestamp: "14:32:58.100", level: "info", message: "[SQL Analyst] Retry successful, completed in 4.8s" },
      { id: "log_10", timestamp: "14:32:58.200", level: "info", message: "[Tech Writer] Processing results" },
      { id: "log_11", timestamp: "14:33:00.300", level: "info", message: "[Tech Writer] Completed in 2.1s" },
      { id: "log_12", timestamp: "14:33:00.456", level: "info", message: "[Orchestration] Completed execution in 15.3s" },
    ],
  },
  {
    id: "exec_002",
    version: "v1.2.3",
    status: "completed",
    trigger: "scheduled",
    startTime: "2024-01-15 14:20:10",
    endTime: "2024-01-15 14:20:25",
    duration: "15.2s",
    date: "2024-01-15",
    logs: [
      { id: "log_1", timestamp: "14:20:10.123", level: "info", message: "[Orchestration] Started execution" },
      { id: "log_2", timestamp: "14:20:10.234", level: "info", message: "[Intent Router] Processing input" },
      { id: "log_3", timestamp: "14:20:10.412", level: "info", message: "[Intent Router] Completed in 180ms" },
      { id: "log_4", timestamp: "14:20:25.456", level: "info", message: "[Orchestration] Completed execution in 15.2s" },
    ],
  },
  {
    id: "exec_003",
    version: "v1.2.2",
    status: "failed",
    trigger: "webhook",
    startTime: "2024-01-15 14:05:30",
    endTime: "2024-01-15 14:05:45",
    duration: "15.1s",
    date: "2024-01-15",
    logs: [
      { id: "log_1", timestamp: "14:05:30.123", level: "info", message: "[Orchestration] Started execution" },
      { id: "log_2", timestamp: "14:05:30.234", level: "info", message: "[Intent Router] Processing input" },
      { id: "log_3", timestamp: "14:05:45.456", level: "error", message: "[Orchestration] Execution failed: timeout" },
    ],
  },
];

// Console-like logs (for modal)
const consoleLogs = [
  { id: "log_1", timestamp: "14:32:45.123", level: "info", message: "[Orchestration] Started execution", source: "orchestration" },
  { id: "log_2", timestamp: "14:32:45.234", level: "info", message: "[Intent Router] Processing input", source: "agent" },
  { id: "log_3", timestamp: "14:32:45.412", level: "info", message: "[Intent Router] Completed in 180ms", source: "agent" },
  { id: "log_4", timestamp: "14:32:45.500", level: "info", message: "[Researcher] Initializing with model gpt-4", source: "agent" },
  { id: "log_5", timestamp: "14:32:47.900", level: "info", message: "[Researcher] Generated 3200 tokens", source: "agent" },
  { id: "log_6", timestamp: "14:32:48.100", level: "info", message: "[SQL Analyst] Initializing with model gpt-4", source: "agent" },
  { id: "log_7", timestamp: "14:32:53.200", level: "error", message: "[SQL Analyst] Database connection timeout after 5.1s", source: "agent" },
  { id: "log_8", timestamp: "14:32:53.300", level: "warn", message: "[Orchestration] Retrying SQL Analyst (attempt 1/3)", source: "orchestration" },
  { id: "log_9", timestamp: "14:32:58.100", level: "info", message: "[SQL Analyst] Retry successful, completed in 4.8s", source: "agent" },
  { id: "log_10", timestamp: "14:32:58.200", level: "info", message: "[Tech Writer] Processing results", source: "agent" },
  { id: "log_11", timestamp: "14:33:00.300", level: "info", message: "[Tech Writer] Completed in 2.1s", source: "agent" },
  { id: "log_12", timestamp: "14:33:00.456", level: "info", message: "[Orchestration] Completed execution in 15.3s", source: "orchestration" },
];

const statusBadge = {
  ok: "border-success/40 text-success",
  error: "border-destructive/40 text-destructive",
  warn: "border-warning/40 text-warning",
  info: "border-info/40 text-info",
};

const tooltipStyle = {
  background: "oklch(0.22 0.022 260 / 95%)",
  border: "1px solid oklch(0.32 0.02 260)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};

function ExecutionDetailModal({
  execution,
  open,
  onOpenChange,
}: {
  execution: (typeof traces[0] & typeof executions[0]) | null;
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const [activeModalTab, setActiveModalTab] = useState<"trace" | "logs">("trace");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  if (!execution) return null;

  const maxTime = Math.max(...execution.stages.map((s) => s.endTime));
  const statusColor = {
    ok: "bg-success/20 border-success/40",
    error: "bg-destructive/20 border-destructive/40",
    warn: "bg-warning/20 border-warning/40",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-primary">{execution.id}</span>
            <Badge variant="outline" className={cn("text-[10px]", statusBadge[execution.status as keyof typeof statusBadge])}>
              {execution.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Internal Tabs */}
        <div className="flex gap-2 border-b border-border mb-4">
          <button
            onClick={() => setActiveModalTab("trace")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeModalTab === "trace"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Trace
          </button>
          <button
            onClick={() => setActiveModalTab("logs")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeModalTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Logs
          </button>
        </div>

        {/* Trace Tab */}
        {activeModalTab === "trace" && (
          <div className="space-y-6">
            {/* Execution Timeline */}
            <div className="space-y-4">
              <div>
                {/* Start Time */}
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <span className="font-mono">Start: {execution.startTime}</span>
                </div>
                
                <div className="space-y-3">
                  {execution.stages.map((stage) => {
                    const startPercent = (stage.startTime / maxTime) * 100;
                    const widthPercent = ((stage.endTime - stage.startTime) / maxTime) * 100;
                    const isExpanded = expandedStage === stage.name;

                    return (
                      <div key={stage.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{stage.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{stage.duration}</span>
                            <Badge variant="outline" className={cn("text-[10px]", statusBadge[stage.status as keyof typeof statusBadge])}>
                              {stage.status}
                            </Badge>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedStage(isExpanded ? null : stage.name)}
                          className={cn(
                            "relative w-full h-8 bg-muted/20 rounded border transition-all cursor-pointer hover:border-primary/50 flex items-center",
                            isExpanded ? "border-primary/50" : "border-border"
                          )}
                        >
                          <div
                            className={cn(
                              "h-6 border-l-2 border-r-2 transition-all flex items-center justify-center rounded",
                              statusColor[stage.status as keyof typeof statusColor]
                            )}
                            style={{
                              marginLeft: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <span className="text-[10px] font-mono font-semibold text-foreground">
                              {stage.duration}
                            </span>
                          </div>
                        </button>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3 p-4 rounded-lg border border-border bg-muted/20 animate-in fade-in slide-in-from-top-2">
                            {/* Input */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">Input</p>
                              <div className="bg-black/30 rounded p-3 border border-border/50 overflow-x-auto">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">{JSON.stringify(JSON.parse(stage.input), null, 2)}</pre>
                              </div>
                            </div>
                            
                            {/* Output */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">Output</p>
                              <div className="bg-black/30 rounded p-3 border border-border/50 overflow-x-auto">
                                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">{JSON.stringify(JSON.parse(stage.output), null, 2)}</pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Total Duration */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">End: {execution.endTime}</span>
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-xs font-semibold">Total Duration</span>
                        <span className="font-mono text-sm font-bold text-primary">{execution.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeModalTab === "logs" && (
          <div className="space-y-4">
            {/* Console Logs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-7 px-2 text-xs"
                  onClick={() => copyToClipboard(execution.logs.map((l) => `[${l.timestamp}] ${l.level.toUpperCase()} ${l.message}`).join("\n"))}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>

              <div className="bg-black/50 rounded border border-border p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto">
                {execution.logs.map((log) => {
                  const levelColors = {
                    info: "text-info",
                    error: "text-destructive",
                    warn: "text-warning",
                  };

                  return (
                    <div key={log.id} className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded transition-colors">
                      <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                      <span className={cn("shrink-0 font-semibold uppercase w-6", levelColors[log.level as keyof typeof levelColors])}>
                        {log.level[0]}
                      </span>
                      <span className="text-foreground flex-1">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ObservabilitySection({ flowType = "agent" }: { flowType?: "agent" | "orchestration" } = {}) {
  const [activeTab, setActiveTab] = useState<"metrics" | "traces-logs">("metrics");
  const [selectedExecution, setSelectedExecution] = useState<(typeof traces[0] & typeof executions[0]) | null>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [showAllComponents, setShowAllComponents] = useState(false);
  const [showAllTasksConversations, setShowAllTasksConversations] = useState(false);
  const [showAllIngress, setShowAllIngress] = useState(false);

  // Merge traces and executions data
  const executionsWithTraces = traces.map((trace) => {
    const execution = executions.find((e) => e.id === trace.id);
    return {
      ...trace,
      ...execution,
    };
  });

  // Calculate average execution time per component
  const componentStats = traces.reduce((acc, trace) => {
    trace.stages.forEach((stage) => {
      const duration = stage.endTime - stage.startTime;
      if (!acc[stage.name]) {
        acc[stage.name] = { name: stage.name, total: 0, count: 0 };
      }
      acc[stage.name].total += duration;
      acc[stage.name].count += 1;
    });
    return acc;
  }, {} as Record<string, { name: string; total: number; count: number }>);

  const componentData = Object.values(componentStats)
    .map((c) => ({
      name: c.name,
      avgTime: Math.round(c.total / c.count),
    }))
    .sort((a, b) => b.avgTime - a.avgTime);

  const top5Components = componentData.slice(0, 5);

  const openExecutionDetail = (execution: (typeof traces[0] & typeof executions[0])) => {
    setSelectedExecution(execution);
    setExecutionModalOpen(true);
  };

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

      {/* Tabs */}
      <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
        <div className="flex gap-2 border-b border-border mb-4">
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "metrics"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("traces-logs")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "traces-logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Traces/Logs
          </button>
        </div>

        {/* Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="space-y-4">
            {/* Latency - Full Width */}
            <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
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

            {/* Error Rate & Success Rate Combined */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">Error Rate & Success Rate</p>
                    <p className="text-xs text-muted-foreground">Percentage over last 24h</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-warning/40 text-warning">0.42% error</Badge>
                    <Badge variant="outline" className="border-success/40 text-success">99.58% success</Badge>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={errorRateData.map((d, i) => ({
                    ...d,
                    errorRate: d.rate,
                    successRate: 100 - d.rate,
                  }))}>
                    <defs>
                      <linearGradient id="gerr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.18 30)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.7 0.18 30)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gsuc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.82 0.17 180)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                    <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <YAxis yAxisId="left" stroke="oklch(0.68 0.02 250)" fontSize={10} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" stroke="oklch(0.68 0.02 250)" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area yAxisId="left" type="monotone" dataKey="errorRate" stroke="oklch(0.7 0.18 30)" fill="url(#gerr)" strokeWidth={2} name="Error Rate %" />
                    <Area yAxisId="right" type="monotone" dataKey="successRate" stroke="oklch(0.82 0.17 180)" fill="url(#gsuc)" strokeWidth={2} name="Success Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">Throughput</p>
                    <p className="text-xs text-muted-foreground">Requests per minute</p>
                  </div>
                  <Badge variant="outline" className="border-info/40 text-info">1,284 req/min</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={throughputData}>
                    <defs>
                      <linearGradient id="gthr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                    <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="requests" stroke="oklch(0.7 0.18 235)" fill="url(#gthr)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Token Usage & Daily Cost */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3">
                  <p className="font-display text-sm font-semibold">Token Usage</p>
                  <p className="text-xs text-muted-foreground">Input vs output (k tokens)</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
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

              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">Daily Cost</p>
                    <p className="text-xs text-muted-foreground">Spend per day (last 12 days)</p>
                  </div>
                  <Badge variant="outline" className="border-success/40 text-success">$1,847</Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                    <XAxis dataKey="day" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <YAxis stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cost" fill="oklch(0.82 0.17 180)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Component Execution Time & Task/Conversation or Ingress */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">
                      {flowType === "agent" ? "Execution Time by Task/Conversation" : "Execution Time by Ingress"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flowType === "agent" 
                        ? "Average execution time per task or conversation" 
                        : "Average execution time per communication channel"}
                    </p>
                  </div>
                  {(flowType === "agent" ? [
                    { name: "Deep Research", time: 3200 },
                    { name: "Quick Lookup", time: 1800 },
                    { name: "Summarize Sources", time: 2400 },
                    { name: "Draft Document", time: 2800 },
                    { name: "Rewrite Section", time: 1900 },
                    { name: "Code Review", time: 2100 },
                    { name: "Bug Analysis", time: 2600 },
                    { name: "Documentation", time: 1700 },
                  ] : [
                    { name: "POST /v1/research", time: 2800 },
                    { name: "events.user.asked", time: 3100 },
                    { name: "support.inbound", time: 2400 },
                    { name: "grpc.ContentService", time: 1900 },
                    { name: "Cron 02:00 UTC", time: 4200 },
                    { name: "webhook.github", time: 2300 },
                    { name: "kafka.events", time: 2700 },
                    { name: "REST /api/v2", time: 1600 },
                  ]).length > 5 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => flowType === "agent" ? setShowAllTasksConversations(!showAllTasksConversations) : setShowAllIngress(!showAllIngress)}
                    >
                      {(flowType === "agent" ? showAllTasksConversations : showAllIngress) ? "Show Top 5" : "Show All"}
                    </Button>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={(flowType === "agent" ? [
                    { name: "Deep Research", time: 3200 },
                    { name: "Quick Lookup", time: 1800 },
                    { name: "Summarize Sources", time: 2400 },
                    { name: "Draft Document", time: 2800 },
                    { name: "Rewrite Section", time: 1900 },
                    { name: "Code Review", time: 2100 },
                    { name: "Bug Analysis", time: 2600 },
                    { name: "Documentation", time: 1700 },
                  ] : [
                    { name: "POST /v1/research", time: 2800 },
                    { name: "events.user.asked", time: 3100 },
                    { name: "support.inbound", time: 2400 },
                    { name: "grpc.ContentService", time: 1900 },
                    { name: "Cron 02:00 UTC", time: 4200 },
                    { name: "webhook.github", time: 2300 },
                    { name: "kafka.events", time: 2700 },
                    { name: "REST /api/v2", time: 1600 },
                  ]).slice(0, (flowType === "agent" ? showAllTasksConversations : showAllIngress) ? undefined : 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                    <XAxis type="number" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="oklch(0.68 0.02 250)" fontSize={10} width={140} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}ms`} />
                    <Bar dataKey="time" fill="oklch(0.7 0.18 180)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-border bg-card/80 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">Component Execution Time</p>
                    <p className="text-xs text-muted-foreground">Average time per component (top 5)</p>
                  </div>
                  {componentData.length > 5 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowAllComponents(!showAllComponents)}
                    >
                      {showAllComponents ? "Show Top 5" : "Show All"}
                    </Button>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={showAllComponents ? componentData : top5Components} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.02 260 / 40%)" />
                    <XAxis type="number" stroke="oklch(0.68 0.02 250)" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="oklch(0.68 0.02 250)" fontSize={10} width={120} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}ms`} />
                    <Bar dataKey="avgTime" fill="oklch(0.7 0.18 235)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* Traces/Logs Tab */}
        {activeTab === "traces-logs" && (
          <div className="space-y-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold">Executions</p>
                <p className="text-xs text-muted-foreground">Click on execution ID to view trace and logs</p>
              </div>
              <Badge variant="outline" className="gap-1.5 border-info/40 text-info">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info" /> streaming
              </Badge>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2">Execution ID</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Version</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Trigger</th>
                    <th className="px-4 py-2">Start</th>
                    <th className="px-4 py-2">End</th>
                    <th className="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executionsWithTraces.map((exec) => (
                    <tr key={exec.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => openExecutionDetail(exec)}
                          className="font-mono text-xs text-primary hover:underline cursor-pointer"
                        >
                          {exec.id}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{exec.date}</td>
                      <td className="px-4 py-2 text-xs font-mono">{exec.version}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className={cn("text-[10px]", statusBadge[exec.status as keyof typeof statusBadge])}>
                          {exec.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-xs capitalize">{exec.trigger}</td>
                      <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{exec.startTime.split(" ")[1]}</td>
                      <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{exec.endTime.split(" ")[1]}</td>
                      <td className="px-4 py-2 text-xs font-mono">{exec.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Execution Detail Modal */}
      <ExecutionDetailModal execution={selectedExecution} open={executionModalOpen} onOpenChange={setExecutionModalOpen} />
    </div>
  );
}
