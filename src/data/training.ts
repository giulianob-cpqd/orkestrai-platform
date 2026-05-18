export type TrainingKind = "llm-finetune" | "llm-lora" | "llm-rlhf" | "ml-classification" | "ml-regression" | "ml-forecasting" | "ml-clustering" | "embeddings";
export type TrainingStatus = "draft" | "queued" | "running" | "succeeded" | "failed" | "stopped";
export type FrameworkKind = "transformers" | "trl" | "peft" | "unsloth" | "axolotl" | "sklearn" | "xgboost" | "lightgbm" | "pytorch" | "tensorflow";

export interface TrainingJob {
  id: string;
  name: string;
  kind: TrainingKind;
  framework: FrameworkKind;
  baseModel?: string;
  dataset: string;
  datasetRows: number;
  hyperparams: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    seed: number;
  };
  hardware: { gpu: string; count: number; nodes: number };
  status: TrainingStatus;
  progress: number;
  metrics: { loss?: number; valLoss?: number; accuracy?: number; f1?: number; perplexity?: number; rmse?: number };
  costUsd: number;
  durationMin: number;
  owner: string;
  team: string;
  createdAt: string;
  updatedAt: string;
  artifactRegistry?: string;
  tags: string[];
}

export const trainingJobs: TrainingJob[] = [
  {
    id: "trn_001", name: "support-router · LoRA", kind: "llm-lora", framework: "peft", baseModel: "llama-3.3-8b",
    dataset: "tickets-v4", datasetRows: 128_400,
    hyperparams: { epochs: 3, batchSize: 16, learningRate: 2e-4, optimizer: "adamw", seed: 42 },
    hardware: { gpu: "A100 80GB", count: 4, nodes: 1 },
    status: "running", progress: 64,
    metrics: { loss: 0.84, valLoss: 0.91, perplexity: 4.2 },
    costUsd: 184.20, durationMin: 96, owner: "ana.silva", team: "Customer AI",
    createdAt: "2026-05-17T08:12:00Z", updatedAt: "2026-05-18T11:04:00Z",
    artifactRegistry: "registry://llm/support-router/v0.4-rc1", tags: ["lora", "customer", "router"],
  },
  {
    id: "trn_002", name: "invoice-extractor · fine-tune", kind: "llm-finetune", framework: "transformers", baseModel: "mistral-7b-instruct",
    dataset: "invoices-pt-br", datasetRows: 42_180,
    hyperparams: { epochs: 4, batchSize: 8, learningRate: 5e-5, optimizer: "adamw", seed: 7 },
    hardware: { gpu: "H100 80GB", count: 8, nodes: 1 },
    status: "succeeded", progress: 100,
    metrics: { loss: 0.31, valLoss: 0.38, f1: 0.928 },
    costUsd: 612.40, durationMin: 248, owner: "joao.pedro", team: "Finance AI",
    createdAt: "2026-05-12T14:00:00Z", updatedAt: "2026-05-13T05:48:00Z",
    artifactRegistry: "registry://llm/invoice-extractor/v2.1.0", tags: ["finetune", "finance"],
  },
  {
    id: "trn_003", name: "churn-30d · XGBoost", kind: "ml-classification", framework: "xgboost",
    dataset: "subs_features_2026q2", datasetRows: 1_240_000,
    hyperparams: { epochs: 800, batchSize: 0, learningRate: 0.05, optimizer: "tree", seed: 11 },
    hardware: { gpu: "CPU only", count: 0, nodes: 1 },
    status: "succeeded", progress: 100,
    metrics: { accuracy: 0.894, f1: 0.812 },
    costUsd: 22.10, durationMin: 41, owner: "marina.lopes", team: "Growth",
    createdAt: "2026-05-15T09:00:00Z", updatedAt: "2026-05-15T09:41:00Z",
    artifactRegistry: "registry://ml/churn-30d/v7", tags: ["churn", "xgb"],
  },
  {
    id: "trn_004", name: "demand-forecast · Prophet", kind: "ml-forecasting", framework: "sklearn",
    dataset: "sku_daily_4y", datasetRows: 8_400_000,
    hyperparams: { epochs: 1, batchSize: 0, learningRate: 0.01, optimizer: "lbfgs", seed: 0 },
    hardware: { gpu: "CPU only", count: 0, nodes: 4 },
    status: "queued", progress: 0,
    metrics: {},
    costUsd: 0, durationMin: 0, owner: "lucas.r", team: "Supply Chain",
    createdAt: "2026-05-18T10:00:00Z", updatedAt: "2026-05-18T10:00:00Z",
    tags: ["forecast", "scheduled"],
  },
  {
    id: "trn_005", name: "policy-rlhf · sonnet-distill", kind: "llm-rlhf", framework: "trl", baseModel: "sonnet-4.5-distill",
    dataset: "preferences-mix-v2", datasetRows: 96_000,
    hyperparams: { epochs: 2, batchSize: 4, learningRate: 1e-6, optimizer: "adamw", seed: 99 },
    hardware: { gpu: "H100 80GB", count: 16, nodes: 2 },
    status: "failed", progress: 38,
    metrics: { loss: 1.42, valLoss: 1.61 },
    costUsd: 388.00, durationMin: 152, owner: "kai.wong", team: "Platform",
    createdAt: "2026-05-16T22:00:00Z", updatedAt: "2026-05-17T03:32:00Z",
    tags: ["rlhf", "alignment"],
  },
  {
    id: "trn_006", name: "embeddings · docs-pt", kind: "embeddings", framework: "transformers", baseModel: "bge-m3",
    dataset: "internal-docs-pt", datasetRows: 320_000,
    hyperparams: { epochs: 1, batchSize: 64, learningRate: 2e-5, optimizer: "adamw", seed: 3 },
    hardware: { gpu: "A100 40GB", count: 2, nodes: 1 },
    status: "running", progress: 18,
    metrics: { loss: 0.12 },
    costUsd: 22.40, durationMin: 18, owner: "ana.silva", team: "Knowledge",
    createdAt: "2026-05-18T11:00:00Z", updatedAt: "2026-05-18T11:18:00Z",
    tags: ["embeddings", "rag"],
  },
];

export const datasets = [
  { id: "tickets-v4", name: "Customer Tickets v4", rows: 128_400, size: "2.4 GB", modality: "text" },
  { id: "invoices-pt-br", name: "Invoices PT-BR", rows: 42_180, size: "1.8 GB", modality: "text+image" },
  { id: "subs_features_2026q2", name: "Subscriptions Features 2026Q2", rows: 1_240_000, size: "8.6 GB", modality: "tabular" },
  { id: "sku_daily_4y", name: "SKU Daily 4y", rows: 8_400_000, size: "24.3 GB", modality: "timeseries" },
  { id: "preferences-mix-v2", name: "Preference Pairs v2", rows: 96_000, size: "1.2 GB", modality: "text" },
  { id: "internal-docs-pt", name: "Internal Docs PT", rows: 320_000, size: "5.7 GB", modality: "text" },
];

export const gpuTypes = ["CPU only", "T4 16GB", "L4 24GB", "A100 40GB", "A100 80GB", "H100 80GB", "H200 141GB"];
