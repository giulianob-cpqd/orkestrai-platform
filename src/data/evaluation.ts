// ─── Types ────────────────────────────────────────────────────────────────────

export type EvalMetric =
  | "faithfulness"
  | "answer_relevancy"
  | "context_precision"
  | "context_recall"
  | "coherence"
  | "groundedness"
  | "toxicity"
  | "bias"
  | "bleu"
  | "rouge"
  | "exact_match"
  | "f1_score";

export type EvalStatus = "draft" | "queued" | "running" | "completed" | "failed";

export type EvalTarget = "agent" | "orchestration" | "rag" | "model";

export type EvalJudge = "llm" | "heuristic" | "human";

export interface EvalMetricResult {
  metric: EvalMetric;
  score: number;        // 0–1
  threshold: number;    // minimum passing score
  passed: boolean;
  samples: number;
}

export interface EvalRun {
  id: string;
  suiteId: string;
  suiteName: string;
  status: EvalStatus;
  startedAt?: string;
  completedAt?: string;
  durationMin?: number;
  totalSamples: number;
  passedSamples: number;
  failedSamples: number;
  metrics: EvalMetricResult[];
  judge: EvalJudge;
  judgeModel?: string;
  triggeredBy: string;
  environment: "dev" | "staging" | "production";
}

export interface EvalSuite {
  id: string;
  name: string;
  description: string;
  targetKind: EvalTarget;
  targetId: string;
  targetLabel: string;
  metrics: EvalMetric[];
  judge: EvalJudge;
  judgeModel?: string;
  datasetId: string;
  datasetLabel: string;
  samplesCount: number;
  schedule?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastRun?: EvalRun;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export const METRIC_LABEL: Record<EvalMetric, string> = {
  faithfulness:      "Faithfulness",
  answer_relevancy:  "Answer Relevancy",
  context_precision: "Context Precision",
  context_recall:    "Context Recall",
  coherence:         "Coherence",
  groundedness:      "Groundedness",
  toxicity:          "Toxicity",
  bias:              "Bias",
  bleu:              "BLEU",
  rouge:             "ROUGE",
  exact_match:       "Exact Match",
  f1_score:          "F1 Score",
};

export const METRIC_DESC: Record<EvalMetric, string> = {
  faithfulness:      "How factually consistent the answer is with the provided context.",
  answer_relevancy:  "How relevant the generated answer is to the question.",
  context_precision: "Signal-to-noise ratio of the retrieved context chunks.",
  context_recall:    "How much of the ground-truth context was retrieved.",
  coherence:         "Logical flow and clarity of the generated response.",
  groundedness:      "Whether every claim in the answer is supported by the context.",
  toxicity:          "Presence of harmful, offensive or discriminatory language.",
  bias:              "Presence of biased language toward protected attributes.",
  bleu:              "N-gram overlap between generated and reference text.",
  rouge:             "Recall-oriented n-gram overlap with reference text.",
  exact_match:       "Percentage of outputs exactly matching the expected answer.",
  f1_score:          "Token-level F1 overlap between prediction and reference.",
};

export const TARGET_LABEL: Record<EvalTarget, string> = {
  agent:         "Agent",
  orchestration: "Orchestration",
  rag:           "RAG Index",
  model:         "Model",
};

export const JUDGE_LABEL: Record<EvalJudge, string> = {
  llm:       "LLM-as-Judge",
  heuristic: "Heuristic",
  human:     "Human Review",
};

export const ALL_METRICS: EvalMetric[] = [
  "faithfulness",
  "answer_relevancy",
  "context_precision",
  "context_recall",
  "coherence",
  "groundedness",
  "toxicity",
  "bias",
  "bleu",
  "rouge",
  "exact_match",
  "f1_score",
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const lastRunResearch: EvalRun = {
  id: "run_001",
  suiteId: "eval_001",
  suiteName: "Researcher · RAG Quality",
  status: "completed",
  startedAt: "2026-05-22T08:00:00Z",
  completedAt: "2026-05-22T08:14:00Z",
  durationMin: 14,
  totalSamples: 120,
  passedSamples: 104,
  failedSamples: 16,
  judge: "llm",
  judgeModel: "Gemini 2.5 Pro",
  triggeredBy: "ana.silva",
  environment: "production",
  metrics: [
    { metric: "faithfulness",      score: 0.87, threshold: 0.80, passed: true },
    { metric: "answer_relevancy",  score: 0.91, threshold: 0.80, passed: true },
    { metric: "context_recall",    score: 0.78, threshold: 0.75, passed: true },
    { metric: "context_precision", score: 0.69, threshold: 0.70, passed: false },
    { metric: "groundedness",      score: 0.83, threshold: 0.80, passed: true },
  ],
};

const lastRunSupport: EvalRun = {
  id: "run_002",
  suiteId: "eval_002",
  suiteName: "Support Agent · Response Quality",
  status: "completed",
  startedAt: "2026-05-22T06:00:00Z",
  completedAt: "2026-05-22T06:22:00Z",
  durationMin: 22,
  totalSamples: 200,
  passedSamples: 188,
  failedSamples: 12,
  judge: "llm",
  judgeModel: "GPT-5",
  triggeredBy: "ci-bot",
  environment: "production",
  metrics: [
    { metric: "coherence",        score: 0.93, threshold: 0.85, passed: true },
    { metric: "answer_relevancy", score: 0.90, threshold: 0.85, passed: true },
    { metric: "toxicity",         score: 0.04, threshold: 0.10, passed: true },
    { metric: "faithfulness",     score: 0.88, threshold: 0.80, passed: true },
    { metric: "bias",             score: 0.06, threshold: 0.10, passed: true },
  ],
};

const lastRunGpt5: EvalRun = {
  id: "run_003",
  suiteId: "eval_003",
  suiteName: "GPT-5 vs Gemini 2.5 · Benchmark",
  status: "completed",
  startedAt: "2026-05-21T20:00:00Z",
  completedAt: "2026-05-21T20:45:00Z",
  durationMin: 45,
  totalSamples: 500,
  passedSamples: 462,
  failedSamples: 38,
  judge: "heuristic",
  triggeredBy: "leo.fernandes",
  environment: "staging",
  metrics: [
    { metric: "bleu",        score: 0.72, threshold: 0.60, passed: true },
    { metric: "rouge",       score: 0.78, threshold: 0.65, passed: true },
    { metric: "exact_match", score: 0.58, threshold: 0.55, passed: true },
    { metric: "f1_score",    score: 0.81, threshold: 0.70, passed: true },
  ],
};

const lastRunSql: EvalRun = {
  id: "run_004",
  suiteId: "eval_004",
  suiteName: "SQL Analyst · Accuracy",
  status: "failed",
  startedAt: "2026-05-22T10:00:00Z",
  completedAt: "2026-05-22T10:08:00Z",
  durationMin: 8,
  totalSamples: 80,
  passedSamples: 41,
  failedSamples: 39,
  judge: "heuristic",
  triggeredBy: "ci-bot",
  environment: "staging",
  metrics: [
    { metric: "exact_match", score: 0.51, threshold: 0.70, passed: false },
    { metric: "f1_score",    score: 0.62, threshold: 0.70, passed: false },
    { metric: "bleu",        score: 0.49, threshold: 0.60, passed: false },
  ],
};

export const defaultSuites: EvalSuite[] = [
  {
    id: "eval_001",
    name: "Researcher · RAG Quality",
    description: "Measures faithfulness, relevancy and retrieval quality of the Researcher agent over a curated Q&A dataset.",
    targetKind: "agent",
    targetId: "agent_research",
    targetLabel: "Researcher",
    metrics: ["faithfulness", "answer_relevancy", "context_recall", "context_precision", "groundedness"],
    judge: "llm",
    judgeModel: "Gemini 2.5 Pro",
    datasetId: "support-executions-30d-v1",
    datasetLabel: "Support executions · 30d",
    samplesCount: 120,
    schedule: "daily",
    enabled: true,
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-05-22T08:14:00Z",
    lastRun: lastRunResearch,
  },
  {
    id: "eval_002",
    name: "Support Agent · Response Quality",
    description: "Evaluates coherence, relevancy and safety of the support agent responses across 200 real conversation samples.",
    targetKind: "agent",
    targetId: "agent_router",
    targetLabel: "Intent Router",
    metrics: ["coherence", "answer_relevancy", "toxicity", "faithfulness", "bias"],
    judge: "llm",
    judgeModel: "GPT-5",
    datasetId: "invoice-conversations-v2",
    datasetLabel: "Invoice conversations · v2",
    samplesCount: 200,
    schedule: "on_deploy",
    enabled: true,
    createdAt: "2026-04-12T10:00:00Z",
    updatedAt: "2026-05-22T06:22:00Z",
    lastRun: lastRunSupport,
  },
  {
    id: "eval_003",
    name: "GPT-5 vs Gemini 2.5 · Benchmark",
    description: "Heuristic benchmark comparing GPT-5 and Gemini 2.5 Pro on a standardized 500-sample NLG dataset.",
    targetKind: "model",
    targetId: "openai-gpt-5",
    targetLabel: "GPT-5",
    metrics: ["bleu", "rouge", "exact_match", "f1_score"],
    judge: "heuristic",
    datasetId: "rag-internal-docs-draft",
    datasetLabel: "RAG internal docs · draft",
    samplesCount: 500,
    enabled: true,
    createdAt: "2026-04-20T14:00:00Z",
    updatedAt: "2026-05-21T20:45:00Z",
    lastRun: lastRunGpt5,
  },
  {
    id: "eval_004",
    name: "SQL Analyst · Accuracy",
    description: "Tests SQL generation accuracy of the SQL Analyst agent against a labeled dataset of natural language → SQL pairs.",
    targetKind: "agent",
    targetId: "agent_sql",
    targetLabel: "SQL Analyst",
    metrics: ["exact_match", "f1_score", "bleu"],
    judge: "heuristic",
    datasetId: "error-logs-enriched-v1",
    datasetLabel: "Error logs enriched · v1",
    samplesCount: 80,
    schedule: "weekly",
    enabled: true,
    createdAt: "2026-05-01T11:00:00Z",
    updatedAt: "2026-05-22T10:08:00Z",
    lastRun: lastRunSql,
  },
  {
    id: "eval_005",
    name: "Knowledge Base · Retrieval",
    description: "Evaluates context precision and recall of the internal docs RAG index on a set of domain-specific questions.",
    targetKind: "rag",
    targetId: "rag/internal-docs",
    targetLabel: "Internal Docs",
    metrics: ["context_precision", "context_recall", "groundedness"],
    judge: "llm",
    judgeModel: "Claude Sonnet 4.5",
    datasetId: "support-executions-30d-v1",
    datasetLabel: "Support executions · 30d",
    samplesCount: 60,
    schedule: "weekly",
    enabled: false,
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-05-10T12:00:00Z",
  },
];

export const defaultRuns: EvalRun[] = [
  lastRunResearch,
  lastRunSupport,
  lastRunGpt5,
  lastRunSql,
  {
    id: "run_005",
    suiteId: "eval_001",
    suiteName: "Researcher · RAG Quality",
    status: "completed",
    startedAt: "2026-05-21T08:00:00Z",
    completedAt: "2026-05-21T08:12:00Z",
    durationMin: 12,
    totalSamples: 120,
    passedSamples: 98,
    failedSamples: 22,
    judge: "llm",
    judgeModel: "Gemini 2.5 Pro",
    triggeredBy: "ci-bot",
    environment: "production",
    metrics: [
      { metric: "faithfulness",      score: 0.82, threshold: 0.80, passed: true },
      { metric: "answer_relevancy",  score: 0.88, threshold: 0.80, passed: true },
      { metric: "context_recall",    score: 0.74, threshold: 0.75, passed: false },
      { metric: "context_precision", score: 0.71, threshold: 0.70, passed: true },
      { metric: "groundedness",      score: 0.80, threshold: 0.80, passed: true },
    ],
  },
  {
    id: "run_006",
    suiteId: "eval_002",
    suiteName: "Support Agent · Response Quality",
    status: "running",
    startedAt: "2026-05-22T12:00:00Z",
    totalSamples: 200,
    passedSamples: 0,
    failedSamples: 0,
    judge: "llm",
    judgeModel: "GPT-5",
    triggeredBy: "ci-bot",
    environment: "production",
    metrics: [],
  },
];
