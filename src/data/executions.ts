import { orchestrations } from "./flows";

export type ExecutionStatus = "success" | "error" | "running" | "human_review";
export type TriggerKind = "grpc" | "cron" | "rest" | "consumer";
export type Environment = "dev" | "staging" | "production";

export interface ExternalCall {
  id: string;
  kind: "api" | "mcp" | "rag" | "database";
  name: string;
  operation: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  status: "success" | "error";
  request?: unknown;
  response?: unknown;
}

export interface AgentCall {
  id: string;
  name: string;
  role: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  status: "success" | "error";
  input: unknown;
  output: unknown;
}

export interface MessageTemplate {
  id: string;
  name: string;
  markdown: string;
  parameters?: Record<string, string>;
}

export interface HumanInfo {
  id: string;
  title: string;
  message: string;
  level: "info" | "success" | "warning";
  emittedAt: string;
  template?: MessageTemplate;
}

export interface FormStructure {
  id: string;
  name: string;
  description?: string;
  fields: { name: string; label: string; type: "text" | "email" | "number" | "select" | "textarea" | "checkbox" | "checkbox-group"; value?: string; options?: string[] }[];
  parameters?: Record<string, unknown>;
}

export interface HumanTask {
  id: string;
  title: string;
  description: string;
  state: "pending" | "completed" | "skipped";
  assignedTo?: string;
  fields: { name: string; label: string; type: "text" | "email" | "number" | "select" | "textarea" | "checkbox" | "checkbox-group"; value?: string; options?: string[] }[];
  formStructure?: FormStructure;
  submittedAt?: string;
  submittedValue?: Record<string, string>;
}

export interface ExecutionLog {
  id: string;
  flowId: string;
  flowName: string;
  version: string;
  status: ExecutionStatus;
  trigger: TriggerKind;
  triggerDetail: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  parameters: Record<string, unknown>;
  output?: unknown;
  user?: string;
  correlationId: string;
  environment: Environment;
  externalCalls: ExternalCall[];
  agentCalls: AgentCall[];
  humanInfos: HumanInfo[];
  humanTasks: HumanTask[];
}

const TRIGGERS: TriggerKind[] = ["grpc", "cron", "rest", "consumer"];
const STATUSES: ExecutionStatus[] = ["success", "success", "success", "running", "error", "human_review"];
const ENVIRONMENTS: Environment[] = ["dev", "staging", "production"];

// Environment-specific multipliers
const ENV_MULTIPLIERS: Record<Environment, { count: number; errorRate: number }> = {
  dev: { count: 15, errorRate: 0.15 },
  staging: { count: 30, errorRate: 0.08 },
  production: { count: 73, errorRate: 0.02 },
};

function pad(n: number) { return n.toString().padStart(2, "0"); }
function iso(d: Date) { return d.toISOString(); }

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getEnvPrefix(env: Environment): string {
  return env === "dev" ? "dev" : env === "staging" ? "stg" : "prd";
}

function generateForEnvironment(env: Environment): ExecutionLog[] {
  const list: ExecutionLog[] = [];
  const now = Date.now();
  const count = ENV_MULTIPLIERS[env].count;
  const errorRate = ENV_MULTIPLIERS[env].errorRate;
  const envPrefix = getEnvPrefix(env);

  for (let i = 0; i < count; i++) {
    const flow = orchestrations[i % orchestrations.length];
    const isError = Math.random() < errorRate;
    const status = isError ? "error" : STATUSES[i % STATUSES.length];
    const trigger = TRIGGERS[i % TRIGGERS.length];
    const start = new Date(now - i * 1000 * 60 * 37 - Math.floor(Math.random() * 1000 * 60));
    const duration = 1500 + Math.floor(Math.random() * 18000);
    const end = new Date(start.getTime() + duration);
    const isOpen = status === "running" || status === "human_review";

    const triggerDetail =
      trigger === "rest" ? "POST /v1/" + flow.slug :
      trigger === "cron" ? "0 */6 * * *" :
      trigger === "consumer" ? "events.user.asked · partition 3" :
      "service.orchestration.v1";

    const externalCalls: ExternalCall[] = [
      {
        id: `ec_${i}_1`, kind: "api", name: "Tavily Web", operation: "GET /search",
        startedAt: iso(new Date(start.getTime() + 200)),
        endedAt: iso(new Date(start.getTime() + 1100)),
        durationMs: 900, status: "success",
        request: { q: "best practices llm orchestration", k: 5 },
        response: { results: 5, took_ms: 870 },
      },
      {
        id: `ec_${i}_2`, kind: "database", name: "Warehouse", operation: "SELECT analytics.sessions",
        startedAt: iso(new Date(start.getTime() + 1300)),
        endedAt: iso(new Date(start.getTime() + 1640)),
        durationMs: 340, status: "success",
        request: { sql: "select count(*) from sessions where day=$1", params: ["2026-04-30"] },
        response: { rows: [{ count: 18421 }] },
      },
      {
        id: `ec_${i}_3`, kind: "rag", name: "Internal Docs", operation: "similarity_search(k=4)",
        startedAt: iso(new Date(start.getTime() + 1700)),
        endedAt: iso(new Date(start.getTime() + 1980)),
        durationMs: 280, status: "success",
        request: { query: "policy rollback", k: 4 },
        response: { hits: 4, top_score: 0.83 },
      },
      {
        id: `ec_${i}_4`, kind: "mcp", name: "Filesystem MCP", operation: "tools/call read_file",
        startedAt: iso(new Date(start.getTime() + 2100)),
        endedAt: iso(new Date(start.getTime() + 2280)),
        durationMs: 180, status: status === "error" && i % 6 === 4 ? "error" : "success",
        request: { path: "/reports/q1.md" },
        response: { bytes: 4821 },
      },
    ];

    const agentCalls: AgentCall[] = flow.agents.map((a, idx) => ({
      id: `ag_${i}_${idx}`,
      name: a.name,
      role: a.role,
      startedAt: iso(new Date(start.getTime() + 400 + idx * 1200)),
      endedAt: iso(new Date(start.getTime() + 400 + idx * 1200 + 950)),
      durationMs: 950,
      status: "success",
      input: { prompt: `step ${idx + 1} for ${flow.name}`, context_tokens: 1200 + idx * 80 },
      output: { tokens: 420 + idx * 30, finish_reason: "stop" },
    }));

    const humanInfos: HumanInfo[] = status !== "error" 
      ? [
          { 
            id: `hi_${i}_1`, 
            title: "Informação do fluxo", 
            message: "Processamento iniciado com sucesso.\n\n**Status:**\n- Fluxo: " + flow.name + "\n- Versão: " + flow.version + "\n- Ambiente: " + env, 
            level: "info", 
            emittedAt: iso(new Date(start.getTime() + 1200)),
          },
          ...(status === "human_review" ? [{ 
            id: `hi_${i}_2`, 
            title: "Revisão necessária", 
            message: "O fluxo requer intervenção humana.\n\n**Detalhes:**\n- Tipo: Revisão manual\n- Prioridade: Normal\n- Ação: Aguardando aprovação", 
            level: "warning" as const, 
            emittedAt: iso(new Date(start.getTime() + 4200)),
          }] : []),
        ]
      : [
          { 
            id: `hi_${i}_e`, 
            title: "Erro na execução", 
            message: "Ocorreu um erro durante a execução.\n\n**Detalhes:**\n- Tipo: Erro de processamento\n- Status: Falha\n- Ação: Revisar logs", 
            level: "warning", 
            emittedAt: iso(end),
          },
        ];

    const humanTasks: HumanTask[] = status === "human_review" 
      ? [
          {
            id: `ht_${i}_1`,
            title: "Revisar e aprovar tarefa",
            description: "Revise a tarefa e tome uma decisão.",
            state: "pending" as const,
            assignedTo: "gerente@synapse.ai",
            fields: [
              { name: "decision", label: "Decisão", type: "select", options: ["Aprovar", "Solicitar ajuste", "Rejeitar"], value: "Aprovar" },
              { name: "comments", label: "Comentários", type: "textarea", value: "" },
              { name: "verified", label: "Verificado", type: "checkbox", value: "false" },
              { name: "tags", label: "Tags", type: "checkbox-group", options: ["Urgente", "Normal", "Baixa prioridade", "Bloqueado"], value: "" },
            ],
          },
        ]
      : [];

    list.push({
      id: `exec_${pad(i)}_${flow.id}`,
      flowId: flow.id,
      flowName: flow.name,
      version: flow.version,
      status,
      trigger,
      triggerDetail,
      startedAt: iso(start),
      endedAt: isOpen ? undefined : iso(end),
      durationMs: isOpen ? Date.now() - start.getTime() : duration,
      parameters: {
        question: "Quais foram os principais incidentes do trimestre?",
        locale: "pt-BR",
        max_sources: 6,
      },
      output: status === "success" ? {
        summary: "Foram identificados 3 incidentes relevantes...",
        citations: 4,
      } : status === "error" ? { error: "MCP timeout" } : undefined,
      user: trigger === "grpc" ? "ana.silva@synapse.ai" : undefined,
      correlationId: `${envPrefix}|${generateUUID()}`,
      environment: env,
      externalCalls,
      agentCalls,
      humanInfos,
      humanTasks,
    });
  }
  return list;
}

// Generate executions for all environments
const devExecutions = generateForEnvironment("dev");
const stagingExecutions = generateForEnvironment("staging");
const productionExecutions = generateForEnvironment("production");

// Combine all executions
export const executions: ExecutionLog[] = [
  ...devExecutions,
  ...stagingExecutions,
  ...productionExecutions,
];

// Export environment-specific executions
export const executionsByEnv = {
  dev: devExecutions,
  staging: stagingExecutions,
  production: productionExecutions,
};

export function getExecution(id: string) {
  return executions.find((e) => e.id === id);
}

export const STATUS_LABEL: Record<ExecutionStatus, string> = {
  success: "Sucesso",
  error: "Erro",
  running: "Processando",
  human_review: "Avaliação humana",
};

export const TRIGGER_LABEL: Record<TriggerKind, string> = {
  grpc: "gRPC",
  cron: "CronJob",
  rest: "REST",
  consumer: "Message Consumer",
};
