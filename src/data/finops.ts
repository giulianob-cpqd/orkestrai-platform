import { orchestrations, agentFlows } from "./flows";
import { trainingJobs } from "./training";

export type CostKind = "kubernetes" | "llm" | "external_api";
export type Environment = "dev" | "staging" | "production";

export interface CostBreakdown {
  kubernetes: number;
  llm: number;
  externalApi: number;
}

export interface AgentCost {
  id: string;
  name: string;
  team: string;
  invocations: number;
  tokensIn: number;
  tokensOut: number;
  costs: CostBreakdown;
  topLLM: string;
  llms: { name: string; calls: number; tokens: number; cost: number }[];
}

export interface FlowCost {
  id: string;
  name: string;
  team: string;
  area: string;
  app: string;
  namespace: string;
  invocations: number;
  costs: CostBreakdown;
  agentIds: string[];
  agentCosts: { agentId: string; agentName: string; cost: number }[];
  externalApis: { name: string; calls: number; cost: number }[];
  llms: { name: string; calls: number; tokens: number; cost: number }[];
  k8s: { cpu: number; memory: number; gpu: number; storage: number; network: number };
}

export interface TrainingCost {
  id: string;
  name: string;
  kind: string;
  team: string;
  status: string;
  costUsd: number;
  durationMin: number;
  gpuType: string;
  gpuCount: number;
  owner: string;
  createdAt: string;
}

const AREAS: Record<string, string> = {
  "Knowledge Platform": "Data & AI",
  "Customer Success": "Operations",
  "Finance Ops": "Finance",
  "Platform Core": "Engineering",
  Data: "Data & AI",
  Quality: "Engineering",
};

// Environment-specific multipliers based on infrastructure
const ENV_MULTIPLIERS: Record<Environment, { replicas: number; cpuMultiplier: number; memMultiplier: number; invocationMultiplier: number }> = {
  dev: { replicas: 1, cpuMultiplier: 0.5, memMultiplier: 0.5, invocationMultiplier: 0.2 },
  staging: { replicas: 2.5, cpuMultiplier: 1, memMultiplier: 1, invocationMultiplier: 0.6 },
  production: { replicas: 4, cpuMultiplier: 2, memMultiplier: 2, invocationMultiplier: 1 },
};

function rnd(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

function generateAgentCosts(env: Environment): AgentCost[] {
  const multiplier = ENV_MULTIPLIERS[env];
  return agentFlows.map((a, i) => {
    const calls = Math.floor(rnd(i + 1, 800, 12000) * multiplier.invocationMultiplier);
    const tIn = Math.floor(calls * rnd(i + 7, 600, 1800));
    const tOut = Math.floor(calls * rnd(i + 11, 200, 900));
    const llmCost = (tIn / 1_000_000) * 1.5 + (tOut / 1_000_000) * 6;
    const k8s = rnd(i + 3, 40, 220) * multiplier.cpuMultiplier;
    const ext = rnd(i + 5, 5, 90) * multiplier.invocationMultiplier;
    const llmName = a.fanOut.find((f) => f.variant === "llm")?.label ?? "GPT-5";
    const llms = [
      {
        name: llmName,
        calls: Math.floor(calls * 0.7),
        tokens: Math.floor((tIn + tOut) * 0.7),
        cost: llmCost * 0.7,
      },
      {
        name: "Claude 3.5 Sonnet",
        calls: Math.floor(calls * 0.3),
        tokens: Math.floor((tIn + tOut) * 0.3),
        cost: llmCost * 0.3,
      },
    ];
    return {
      id: a.id,
      name: a.name,
      team: a.team,
      invocations: calls,
      tokensIn: tIn,
      tokensOut: tOut,
      topLLM: llmName,
      llms,
      costs: { kubernetes: k8s, llm: llmCost, externalApi: ext },
    };
  });
}

function generateFlowCosts(env: Environment, agentCosts: AgentCost[]): FlowCost[] {
  const multiplier = ENV_MULTIPLIERS[env];
  return orchestrations.map((o, i) => {
    const invocations = Math.floor(rnd(i + 2, 1500, 22000) * multiplier.invocationMultiplier);
    const agentIds = o.agents.map((a) => a.id);
    const agentCostsList = agentIds.map((id) => {
      const a = agentCosts.find((x) => x.id === id);
      return {
        agentId: id,
        agentName: a?.name ?? "Unknown",
        cost: (a?.costs.llm ?? 0) * 0.4,
      };
    });
    const k8sCpu = rnd(i + 13, 80, 320) * multiplier.cpuMultiplier;
    const k8sMem = rnd(i + 17, 60, 240) * multiplier.memMultiplier;
    const k8sGpu = i === 0 ? rnd(i + 19, 200, 800) * multiplier.cpuMultiplier : 0;
    const k8sStorage = rnd(i + 23, 10, 60) * multiplier.cpuMultiplier;
    const k8sNet = rnd(i + 29, 8, 40) * multiplier.cpuMultiplier;
    const k8sTotal = k8sCpu + k8sMem + k8sGpu + k8sStorage + k8sNet;
    const externalApis = o.fanOut
      .filter((f) => f.variant === "tool" || f.variant === "cloud")
      .map((f, idx) => ({
        name: f.label,
        calls: Math.floor(rnd(i * 10 + idx + 1, 500, 8000) * multiplier.invocationMultiplier),
        cost: rnd(i * 10 + idx + 31, 12, 380) * multiplier.invocationMultiplier,
      }));
    const llms = o.agents.map((a, idx) => {
      const ag = agentCosts.find((x) => x.id === a.id);
      return {
        name: ag?.topLLM ?? "GPT-5",
        calls: Math.floor((ag?.invocations ?? 1000) * 0.4),
        tokens: (ag?.tokensIn ?? 0) + (ag?.tokensOut ?? 0),
        cost: (ag?.costs.llm ?? 0) * 0.4 + rnd(i + idx + 41, 5, 30),
      };
    });
    const llmTotal = llms.reduce((s, l) => s + l.cost, 0);
    const extTotal = externalApis.reduce((s, e) => s + e.cost, 0);
    return {
      id: o.id,
      name: o.name,
      team: o.team,
      area: AREAS[o.team] ?? "Other",
      app: o.slug,
      namespace: o.team.toLowerCase().replace(/\s+/g, "-"),
      invocations,
      agentIds,
      agentCosts: agentCostsList,
      externalApis,
      llms,
      k8s: { cpu: k8sCpu, memory: k8sMem, gpu: k8sGpu, storage: k8sStorage, network: k8sNet },
      costs: { kubernetes: k8sTotal, llm: 0, externalApi: extTotal },
    };
  });
}

// Generate costs for each environment
const devAgentCosts = generateAgentCosts("dev");
const stagingAgentCosts = generateAgentCosts("staging");
const productionAgentCosts = generateAgentCosts("production");

const devFlowCosts = generateFlowCosts("dev", devAgentCosts);
const stagingFlowCosts = generateFlowCosts("staging", stagingAgentCosts);
const productionFlowCosts = generateFlowCosts("production", productionAgentCosts);

// Export default (dev) for backward compatibility
export const agentCosts: AgentCost[] = devAgentCosts;
export const flowCosts: FlowCost[] = devFlowCosts;

// Export environment-specific costs
export const agentCostsByEnv = {
  dev: devAgentCosts,
  staging: stagingAgentCosts,
  production: productionAgentCosts,
};

export const flowCostsByEnv = {
  dev: devFlowCosts,
  staging: stagingFlowCosts,
  production: productionFlowCosts,
};

export function totalOf(c: CostBreakdown) {
  return c.kubernetes + c.llm + c.externalApi;
}

export function groupBy<T>(items: T[], key: (i: T) => string) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(it);
  }
  return map;
}

export function sumCosts(list: CostBreakdown[]): CostBreakdown {
  return list.reduce(
    (acc, c) => ({
      kubernetes: acc.kubernetes + c.kubernetes,
      llm: acc.llm + c.llm,
      externalApi: acc.externalApi + c.externalApi,
    }),
    { kubernetes: 0, llm: 0, externalApi: 0 },
  );
}

export function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatUSDFine(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

// Training costs - derived from training jobs
export function getTrainingCosts(env: Environment): TrainingCost[] {
  const multiplier = ENV_MULTIPLIERS[env];
  return trainingJobs.map((job) => ({
    id: job.id,
    name: job.name,
    kind: job.kind,
    team: job.team,
    status: job.status,
    costUsd: job.costUsd * multiplier.invocationMultiplier,
    durationMin: job.durationMin,
    gpuType: job.hardware.gpu,
    gpuCount: job.hardware.count,
    owner: job.owner,
    createdAt: job.createdAt,
  }));
}

export const trainingCostsByEnv = {
  dev: getTrainingCosts("dev"),
  staging: getTrainingCosts("staging"),
  production: getTrainingCosts("production"),
};
