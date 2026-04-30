import type { Node } from "@xyflow/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, MoreHorizontal } from "lucide-react";
import {
  registeredRags,
  registeredApis,
  registeredMcpServers,
  registeredAgents,
  registeredLlms,
  registeredDatabases,
  databaseTypes,
  requestProtocols,
  cronPresets,
  coordinationStrategies,
  agentTasks,
  messagingBrokers,
  dbOperations,
  type RegistryItem,
} from "@/data/registry";

interface Props {
  node: Node | null;
  mode?: "agent" | "orchestration";
  onChange: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  options: RegistryItem[] | { id: string; name: string; meta?: string }[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              <div className="flex flex-col">
                <span className="text-sm">{o.name}</span>
                {"meta" in o && o.meta && (
                  <span className="text-[10px] text-muted-foreground">{o.meta}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DatabaseProperties({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState((data.dbInstructions as string) ?? "");

  return (
    <>
      <SelectField
        label="Database"
        placeholder="Selecione um database do catálogo"
        value={data.dbCatalogId as string | undefined}
        options={registeredDatabases}
        onChange={(v) => {
          const item = registeredDatabases.find((r) => r.id === v);
          onChange({ dbCatalogId: v, label: item?.name ?? "Database", meta: item?.meta });
        }}
      />
      <div className="space-y-2">
        <Label className="text-xs">Instruções (SQL / DSL)</Label>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            className="font-mono text-xs flex-1"
            value={
              (data.dbInstructions as string)
                ? `${((data.dbInstructions as string).split("\n")[0] ?? "").slice(0, 40)}…`
                : "(vazio)"
            }
            placeholder="Clique em [...] para editar"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 shrink-0"
            onClick={() => {
              setDraft((data.dbInstructions as string) ?? "");
              setOpen(true);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Instruções do Database (SQL / DSL)</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={14}
            className="font-mono text-xs resize-none"
            placeholder={"SELECT u.id, u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.created_at >= NOW() - INTERVAL '7 days'\nORDER BY o.total DESC\nLIMIT 100;"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onChange({ dbInstructions: draft });
                setOpen(false);
              }}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScriptTaskProperties({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState((data.script as string) ?? "");
  const lang = (data.scriptLang as string) ?? "javascript";

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Linguagem</Label>
        <Select
          value={lang}
          onValueChange={(v) => onChange({ scriptLang: v, meta: v === "javascript" ? "JavaScript" : "Python" })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Script</Label>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            className="font-mono text-xs flex-1"
            value={
              (data.script as string)
                ? `${((data.script as string).split("\n")[0] ?? "").slice(0, 40)}…`
                : "(vazio)"
            }
            placeholder="Clique em [...] para editar"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 shrink-0"
            onClick={() => {
              setDraft((data.script as string) ?? "");
              setOpen(true);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Editar Script ({lang === "javascript" ? "JavaScript" : "Python"})
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={18}
            className="font-mono text-xs resize-none"
            placeholder={
              lang === "javascript"
                ? '// Seu código JavaScript aqui\nmodule.exports = async (input) => {\n  return { result: input };\n};'
                : '# Seu código Python aqui\ndef handler(input):\n    return {"result": input}'
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onChange({ script: draft });
                setOpen(false);
              }}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PropertiesPanel({ node, mode = "orchestration", onChange, onDelete }: Props) {
  if (!node) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Selecione um nó no canvas para editar suas propriedades.
      </div>
    );
  }

  const data = node.data as Record<string, unknown>;
  const nodeType = (data.nodeType as string) ?? (data.variant as string);
  const label = (data.label as string) ?? "";
  const description = (data.description as string) ?? "";
  const meta = (data.meta as string) ?? "";

  const renderTypeSpecific = () => {
    switch (nodeType) {
      case "prompt":
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">System / Template</Label>
              <Textarea
                rows={6}
                placeholder={'You are a helpful assistant.\n\nUser: {{input}}\nMemory: {{memory}}\nContext: {{rag}}'}
                value={(data.template as string) ?? ""}
                onChange={(e) => onChange({ template: e.target.value })}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Use {"{{input}}"}, {"{{memory}}"}, {"{{rag}}"}, {"{{tools}}"} para
                referenciar os conectores de entrada, memória, contexto e ferramentas.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed">
              <p className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground mb-1">
                Conectores
              </p>
              <ul className="space-y-0.5">
                <li>· <span className="text-[var(--node-input)]">in</span> — Input</li>
                <li>· <span className="text-[var(--node-memory)]">mem</span> — Memory</li>
                <li>· <span className="text-[var(--node-tool)]">tools</span> — Tools / MCP</li>
                <li>· <span className="text-[var(--node-rag)]">rag</span> — RAG context</li>
              </ul>
            </div>
          </>
        );
      case "rag":
        return (
          <SelectField
            label="RAG Index"
            placeholder="Selecione um índice cadastrado"
            value={data.ragId as string | undefined}
            options={registeredRags}
            onChange={(v) => {
              const item = registeredRags.find((r) => r.id === v);
              onChange({ ragId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "tool":
        return (
          <SelectField
            label="API cadastrada"
            placeholder="Selecione uma API"
            value={data.apiId as string | undefined}
            options={registeredApis}
            onChange={(v) => {
              const item = registeredApis.find((r) => r.id === v);
              onChange({ apiId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "mcp":
        return (
          <SelectField
            label="MCP Server"
            placeholder="Selecione um MCP server"
            value={data.mcpId as string | undefined}
            options={registeredMcpServers}
            onChange={(v) => {
              const item = registeredMcpServers.find((r) => r.id === v);
              onChange({ mcpId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "agentref": {
        const agentId = data.agentId as string | undefined;
        const tasks = agentId ? agentTasks[agentId] ?? [] : [];
        const showTaskSelector = tasks.length > 1;
        return (
          <>
            <SelectField
              label="Agente cadastrado"
              placeholder="Selecione um agente publicado"
              value={agentId}
              options={registeredAgents}
              onChange={(v) => {
                const item = registeredAgents.find((r) => r.id === v);
                onChange({ agentId: v, label: item?.name ?? label, meta: item?.meta, taskId: undefined });
              }}
            />
            {showTaskSelector ? (
              <SelectField
                label="Task a executar"
                placeholder="Selecione a task"
                value={data.taskId as string | undefined}
                options={tasks}
                onChange={(v) => {
                  const t = tasks.find((x) => x.id === v);
                  onChange({ taskId: v, meta: `${data.meta ?? ""} · ${t?.name ?? v}`.trim() });
                }}
              />
            ) : agentId ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
                Este agente expõe apenas uma task — será executada por padrão.
              </div>
            ) : null}
          </>
        );
      }
      case "db":
        return <DatabaseProperties data={data} onChange={onChange} />;
      case "consumer":
      case "producer":
        return (
          <>
            <SelectField
              label="Broker"
              placeholder="Selecione o broker"
              value={data.broker as string | undefined}
              options={messagingBrokers}
              onChange={(v) => {
                const item = messagingBrokers.find((b) => b.id === v);
                onChange({ broker: v, meta: item?.name });
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">
                {nodeType === "consumer" ? "Topic / Queue (subscribe)" : "Topic / Queue (publish)"}
              </Label>
              <Input
                className="font-mono text-xs"
                placeholder="events.user.created"
                value={(data.topic as string) ?? ""}
                onChange={(e) => onChange({ topic: e.target.value })}
              />
            </div>
            {nodeType === "consumer" && (
              <div className="space-y-2">
                <Label className="text-xs">Consumer group</Label>
                <Input
                  className="font-mono text-xs"
                  placeholder="orkestrai-orch"
                  value={(data.consumerGroup as string) ?? ""}
                  onChange={(e) => onChange({ consumerGroup: e.target.value })}
                />
              </div>
            )}
          </>
        );
      case "task":
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Task ID</Label>
              <Input
                className="font-mono text-xs"
                placeholder="deep_research"
                value={(data.taskId as string) ?? ""}
                onChange={(e) => onChange({ taskId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição da capacidade</Label>
              <Textarea
                rows={3}
                placeholder="O que essa task faz e quando o agente deve usá-la."
                value={(data.taskDescription as string) ?? ""}
                onChange={(e) => onChange({ taskDescription: e.target.value })}
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
              Um agente pode ter <strong>múltiplas tasks</strong>. No editor de orquestração,
              ao referenciar este agente, o usuário poderá escolher qual task executar.
            </div>
          </>
        );
      case "endpoint":
        return (
          <>
            <SelectField
              label="Protocolo"
              placeholder="Selecione o tipo de request"
              value={(data.protocol as string) ?? "rest"}
              options={requestProtocols}
              onChange={(v) => {
                const item = requestProtocols.find((r) => r.id === v);
                onChange({ protocol: v, meta: `${item?.name} request` });
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">Path / Endpoint</Label>
              <Input
                className="font-mono text-xs"
                placeholder="POST /v1/chat"
                value={(data.path as string) ?? ""}
                onChange={(e) => onChange({ path: e.target.value })}
              />
            </div>
          </>
        );
      case "llm":
        return (
          <SelectField
            label="LLM cadastrado"
            placeholder="Selecione um modelo"
            value={data.llmId as string | undefined}
            options={registeredLlms}
            onChange={(v) => {
              const item = registeredLlms.find((r) => r.id === v);
              onChange({ llmId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "coord":
        return (
          <SelectField
            label="Estratégia"
            placeholder="Parallel ou Router"
            value={(data.strategy as string) ?? ""}
            options={coordinationStrategies}
            onChange={(v) => {
              const item = coordinationStrategies.find((c) => c.id === v);
              onChange({ strategy: v, meta: item?.meta, label: item?.name ?? label });
            }}
          />
        );
      case "output":
        if (mode === "orchestration") {
          return (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              O formato da resposta acompanha automaticamente o protocolo do
              <span className="text-foreground"> Request</span> conectado
              (REST → JSON, SSE → stream, WebSocket → frames, gRPC → stream, GraphQL → response).
            </div>
          );
        }
        return (
          <SelectField
            label="Formato da resposta"
            placeholder="Selecione o formato"
            value={(data.format as string) ?? ""}
            options={[
              { id: "json", name: "JSON" },
              { id: "sse", name: "SSE Stream" },
              { id: "ws", name: "WebSocket" },
              { id: "grpc", name: "gRPC stream" },
              { id: "graphql", name: "GraphQL response" },
            ]}
            onChange={(v) => onChange({ format: v, meta: v.toUpperCase() })}
          />
        );
      case "cron":
        return (
          <>
            <SelectField
              label="Preset"
              placeholder="Selecione um preset"
              value={(data.cron as string) ?? ""}
              options={cronPresets}
              onChange={(v) => {
                const item = cronPresets.find((c) => c.id === v);
                onChange({ cron: v, meta: item?.name });
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">Expressão cron</Label>
              <Input
                className="font-mono text-xs"
                placeholder="0 2 * * *"
                value={(data.cron as string) ?? ""}
                onChange={(e) => onChange({ cron: e.target.value })}
              />
            </div>
          </>
        );
      case "scripttask":
        return <ScriptTaskProperties data={data} onChange={onChange} />;
      case "validator":
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Modo de validação</Label>
              <Select
                value={(data.validatorMode as string) ?? "ai"}
                onValueChange={(v) => onChange({ validatorMode: v, meta: v === "ai" ? "AI · LLM" : "Template · JSON" })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">IA (LLM + Prompt)</SelectItem>
                  <SelectItem value="template">Template JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {((data.validatorMode as string) ?? "ai") === "ai" ? (
              <>
                <SelectField
                  label="LLM para validação"
                  placeholder="Selecione um modelo"
                  value={data.llmId as string | undefined}
                  options={registeredLlms}
                  onChange={(v) => {
                    const item = registeredLlms.find((r) => r.id === v);
                    onChange({ llmId: v });
                  }}
                />
                <div className="space-y-2">
                  <Label className="text-xs">Prompt de validação</Label>
                  <Textarea
                    rows={6}
                    className="font-mono text-xs"
                    placeholder={"Avalie a saída anterior e retorne um JSON:\n{ \"valid\": true/false, \"reason\": \"...\" }"}
                    value={(data.validatorPrompt as string) ?? ""}
                    onChange={(e) => onChange({ validatorPrompt: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    O prompt será enviado ao LLM junto com o output do nó anterior.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Template JSON</Label>
                <Textarea
                  rows={8}
                  className="font-mono text-xs"
                  placeholder={'{\n  "type": "object",\n  "required": ["status", "result"],\n  "properties": {\n    "status": { "enum": ["ok", "error"] },\n    "result": { "type": "string" }\n  }\n}'}
                  value={(data.validatorTemplate as string) ?? ""}
                  onChange={(e) => onChange({ validatorTemplate: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">
                  JSON Schema ou template de validação aplicado ao output do nó anterior.
                </p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label className="text-xs">Nome</Label>
        <Input value={label} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Descrição</Label>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {renderTypeSpecific()}

      <div className="space-y-2">
        <Label className="text-xs">Configuração (livre)</Label>
        <Input
          className="font-mono text-xs"
          value={meta}
          onChange={(e) => onChange({ meta: e.target.value })}
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Tipo
        </p>
        <p className="mt-1 text-sm font-semibold capitalize">{nodeType}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3" /> Remover nó
      </Button>
    </div>
  );
}
