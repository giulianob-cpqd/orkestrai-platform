export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "firing" | "acknowledged" | "resolved" | "silenced";
export type AlertCategory =
  | "infrastructure"
  | "application"
  | "cost"
  | "llm"
  | "security"
  | "sla";

export type MetricKind =
  | "cpu"
  | "memory"
  | "disk"
  | "pods"
  | "network"
  | "gpu"
  | "tokens"
  | "cost"
  | "latency"
  | "error_rate"
  | "queue_depth"
  | "human_task_backlog"
  | "rag_freshness"
  | "auth_failures";

export type ComparisonOp = ">" | ">=" | "<" | "<=" | "==";
export type ChannelKind = "email" | "slack" | "teams" | "pagerduty" | "webhook";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: AlertCategory;
  metric: MetricKind;
  scope: { type: "global" | "namespace" | "flow" | "agent" | "team"; value?: string };
  condition: { op: ComparisonOp; threshold: number; unit: string; window: string };
  severity: AlertSeverity;
  channels: ChannelKind[];
  runbook?: string;
  cooldown: string;
  createdAt: string;
  lastTriggered?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  category: AlertCategory;
  metric: MetricKind;
  severity: AlertSeverity;
  status: AlertStatus;
  value: number;
  threshold: number;
  unit: string;
  source: string;
  startedAt: string;
  ackBy?: string;
  resolvedAt?: string;
  message: string;
}

export const METRIC_LABEL: Record<MetricKind, string> = {
  cpu: "CPU usage",
  memory: "Memory usage",
  disk: "Disk usage",
  pods: "Pod count / restarts",
  network: "Network throughput",
  gpu: "GPU utilization",
  tokens: "LLM tokens / min",
  cost: "Hourly cost",
  latency: "P95 latency",
  error_rate: "Error rate",
  queue_depth: "Queue depth",
  human_task_backlog: "Human task backlog",
  rag_freshness: "RAG index freshness",
  auth_failures: "Auth failures",
};

export const CATEGORY_LABEL: Record<AlertCategory, string> = {
  infrastructure: "Infrastructure",
  application: "Application",
  cost: "Cost",
  llm: "LLM",
  security: "Security",
  sla: "SLA",
};

export const defaultRules: AlertRule[] = [
  {
    id: "rule-cpu-spike",
    name: "CPU spike on orchestration pods",
    description: "Triggers when CPU usage exceeds 85% for 5 minutes on any flow pod.",
    enabled: true,
    category: "infrastructure",
    metric: "cpu",
    scope: { type: "namespace", value: "orchestrations" },
    condition: { op: ">", threshold: 85, unit: "%", window: "5m" },
    severity: "warning",
    channels: ["slack", "email"],
    cooldown: "15m",
    runbook: "https://runbooks/cpu",
    createdAt: "2025-04-12T10:00:00Z",
    lastTriggered: "2026-05-12T09:14:00Z",
  },
  {
    id: "rule-mem-oom",
    name: "Memory near OOM",
    description: "Memory above 90% sustained — pod likely to OOMKill.",
    enabled: true,
    category: "infrastructure",
    metric: "memory",
    scope: { type: "global" },
    condition: { op: ">", threshold: 90, unit: "%", window: "3m" },
    severity: "critical",
    channels: ["pagerduty", "slack"],
    cooldown: "10m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-disk",
    name: "Disk pressure",
    description: "Persistent volume above 80% capacity.",
    enabled: true,
    category: "infrastructure",
    metric: "disk",
    scope: { type: "global" },
    condition: { op: ">", threshold: 80, unit: "%", window: "10m" },
    severity: "warning",
    channels: ["email"],
    cooldown: "1h",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-pod-restarts",
    name: "Pod crash loop",
    description: "More than 3 restarts in 10 minutes for the same pod.",
    enabled: true,
    category: "infrastructure",
    metric: "pods",
    scope: { type: "global" },
    condition: { op: ">=", threshold: 3, unit: "restarts", window: "10m" },
    severity: "critical",
    channels: ["pagerduty", "slack"],
    cooldown: "5m",
    createdAt: "2025-04-12T10:00:00Z",
    lastTriggered: "2026-05-11T22:01:00Z",
  },
  {
    id: "rule-gpu",
    name: "GPU saturation",
    description: "GPU utilization above 95% for inference workloads.",
    enabled: true,
    category: "infrastructure",
    metric: "gpu",
    scope: { type: "flow", value: "knowledge-ingestion" },
    condition: { op: ">", threshold: 95, unit: "%", window: "5m" },
    severity: "warning",
    channels: ["slack"],
    cooldown: "30m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-tokens",
    name: "LLM token surge",
    description: "Token throughput suddenly 3x baseline — possible runaway loop.",
    enabled: true,
    category: "llm",
    metric: "tokens",
    scope: { type: "global" },
    condition: { op: ">", threshold: 1_500_000, unit: "tokens/min", window: "5m" },
    severity: "critical",
    channels: ["pagerduty", "slack", "email"],
    cooldown: "10m",
    createdAt: "2025-04-12T10:00:00Z",
    lastTriggered: "2026-05-12T08:42:00Z",
  },
  {
    id: "rule-cost-hour",
    name: "Hourly cost budget",
    description: "Hourly spend across all flows exceeds $250/hour.",
    enabled: true,
    category: "cost",
    metric: "cost",
    scope: { type: "global" },
    condition: { op: ">", threshold: 250, unit: "USD/h", window: "1h" },
    severity: "warning",
    channels: ["email", "slack"],
    cooldown: "1h",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-cost-flow",
    name: "Per-flow cost anomaly",
    description: "Single flow cost 5x the 7-day baseline.",
    enabled: true,
    category: "cost",
    metric: "cost",
    scope: { type: "flow" },
    condition: { op: ">", threshold: 5, unit: "x baseline", window: "30m" },
    severity: "critical",
    channels: ["pagerduty", "email"],
    cooldown: "30m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-latency",
    name: "P95 latency degradation",
    description: "P95 above 2s for orchestration HTTP triggers.",
    enabled: true,
    category: "application",
    metric: "latency",
    scope: { type: "global" },
    condition: { op: ">", threshold: 2000, unit: "ms", window: "5m" },
    severity: "warning",
    channels: ["slack"],
    cooldown: "15m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-error-rate",
    name: "Flow error rate",
    description: "Error rate above 5% in any rolling 5-min window.",
    enabled: true,
    category: "application",
    metric: "error_rate",
    scope: { type: "global" },
    condition: { op: ">", threshold: 5, unit: "%", window: "5m" },
    severity: "critical",
    channels: ["pagerduty", "slack"],
    cooldown: "10m",
    createdAt: "2025-04-12T10:00:00Z",
    lastTriggered: "2026-05-12T07:20:00Z",
  },
  {
    id: "rule-queue",
    name: "Queue depth growing",
    description: "Pending executions queue above 500.",
    enabled: false,
    category: "application",
    metric: "queue_depth",
    scope: { type: "global" },
    condition: { op: ">", threshold: 500, unit: "items", window: "5m" },
    severity: "warning",
    channels: ["slack"],
    cooldown: "20m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-human-task",
    name: "Human task backlog",
    description: "Human-in-the-loop tasks pending > 30 minutes.",
    enabled: true,
    category: "application",
    metric: "human_task_backlog",
    scope: { type: "global" },
    condition: { op: ">", threshold: 30, unit: "min", window: "5m" },
    severity: "info",
    channels: ["email"],
    cooldown: "30m",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-rag",
    name: "RAG index stale",
    description: "Document group not re-indexed in over 24h.",
    enabled: true,
    category: "application",
    metric: "rag_freshness",
    scope: { type: "global" },
    condition: { op: ">", threshold: 24, unit: "hours", window: "1h" },
    severity: "info",
    channels: ["email"],
    cooldown: "6h",
    createdAt: "2025-04-12T10:00:00Z",
  },
  {
    id: "rule-auth",
    name: "Auth failure burst",
    description: "More than 20 auth failures per minute — possible attack.",
    enabled: true,
    category: "security",
    metric: "auth_failures",
    scope: { type: "global" },
    condition: { op: ">", threshold: 20, unit: "/min", window: "1m" },
    severity: "critical",
    channels: ["pagerduty", "email"],
    cooldown: "5m",
    createdAt: "2025-04-12T10:00:00Z",
  },
];

export const defaultEvents: AlertEvent[] = [
  {
    id: "evt-1",
    ruleId: "rule-tokens",
    ruleName: "LLM token surge",
    category: "llm",
    metric: "tokens",
    severity: "critical",
    status: "firing",
    value: 2_140_000,
    threshold: 1_500_000,
    unit: "tokens/min",
    source: "flow: customer-support-router",
    startedAt: "2026-05-12T08:42:00Z",
    message: "Token throughput 2.14M/min — investigate prompt loop in agent triage.",
  },
  {
    id: "evt-2",
    ruleId: "rule-error-rate",
    ruleName: "Flow error rate",
    category: "application",
    metric: "error_rate",
    severity: "critical",
    status: "acknowledged",
    value: 8.4,
    threshold: 5,
    unit: "%",
    source: "flow: invoice-extraction",
    startedAt: "2026-05-12T07:20:00Z",
    ackBy: "ana.silva",
    message: "Error rate 8.4% — downstream OCR API returning 503.",
  },
  {
    id: "evt-3",
    ruleId: "rule-cpu-spike",
    ruleName: "CPU spike on orchestration pods",
    category: "infrastructure",
    metric: "cpu",
    severity: "warning",
    status: "firing",
    value: 92,
    threshold: 85,
    unit: "%",
    source: "ns: orchestrations / pod knowledge-rag-7c8",
    startedAt: "2026-05-12T09:14:00Z",
    message: "CPU 92% sustained on knowledge-rag pod.",
  },
  {
    id: "evt-4",
    ruleId: "rule-pod-restarts",
    ruleName: "Pod crash loop",
    category: "infrastructure",
    metric: "pods",
    severity: "critical",
    status: "resolved",
    value: 5,
    threshold: 3,
    unit: "restarts",
    source: "ns: agents / pod summarizer-2a1",
    startedAt: "2026-05-11T22:01:00Z",
    resolvedAt: "2026-05-11T22:34:00Z",
    message: "Crash loop resolved after image rollback.",
  },
  {
    id: "evt-5",
    ruleId: "rule-cost-hour",
    ruleName: "Hourly cost budget",
    category: "cost",
    metric: "cost",
    severity: "warning",
    status: "firing",
    value: 312,
    threshold: 250,
    unit: "USD/h",
    source: "global",
    startedAt: "2026-05-12T08:00:00Z",
    message: "Hourly spend $312 — driven by GPT-5 traffic in knowledge-ingestion.",
  },
  {
    id: "evt-6",
    ruleId: "rule-mem-oom",
    ruleName: "Memory near OOM",
    category: "infrastructure",
    metric: "memory",
    severity: "critical",
    status: "silenced",
    value: 94,
    threshold: 90,
    unit: "%",
    source: "ns: agents / pod embedder-5d2",
    startedAt: "2026-05-12T05:11:00Z",
    message: "Silenced during scheduled reindex window.",
  },
  {
    id: "evt-7",
    ruleId: "rule-human-task",
    ruleName: "Human task backlog",
    category: "application",
    metric: "human_task_backlog",
    severity: "info",
    status: "firing",
    value: 47,
    threshold: 30,
    unit: "min",
    source: "flow: contract-review",
    startedAt: "2026-05-12T08:55:00Z",
    message: "12 human tasks waiting > 47min for legal review.",
  },
  {
    id: "evt-8",
    ruleId: "rule-rag",
    ruleName: "RAG index stale",
    category: "application",
    metric: "rag_freshness",
    severity: "info",
    status: "firing",
    value: 36,
    threshold: 24,
    unit: "hours",
    source: "group: product-docs",
    startedAt: "2026-05-12T02:00:00Z",
    message: "Product docs group last reindexed 36h ago.",
  },
];
