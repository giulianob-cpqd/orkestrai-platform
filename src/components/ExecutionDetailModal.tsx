import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot, Database, Globe, Server, FileSearch, Info, AlertTriangle,
  CheckCircle2, ClipboardList, Clock, User as UserIcon, X,
} from "lucide-react";
import { getExecution, STATUS_LABEL, TRIGGER_LABEL, type HumanTask, type ExecutionLog } from "@/data/executions";
import { StatusBadge } from "@/routes/executions.index";
import { toast } from "sonner";

interface ExecutionDetailModalProps {
  executionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

function fmtDur(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const KIND_ICON = {
  api: Globe, mcp: Server, rag: FileSearch, database: Database,
} as const;

export function ExecutionDetailModal({ executionId, open, onOpenChange }: ExecutionDetailModalProps) {
  const exec = getExecution(executionId);
  const [tasks, setTasks] = useState<HumanTask[]>(exec?.humanTasks ?? []);

  if (!exec) return null;

  function submitTask(id: string, values: Record<string, string>) {
    setTasks((prev) =>
      prev.map((t) => t.id === id
        ? { ...t, state: "completed", submittedAt: new Date().toISOString(), submittedValue: values }
        : t)
    );
    toast.success("Tarefa humana enviada");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{exec.flowName}</span>
            <Badge variant="outline">{exec.version}</Badge>
            <StatusBadge status={exec.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header — sempre aberto */}
          <Card className="p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Correlation: <code className="text-xs">{exec.correlationId}</code>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field icon={Clock} label="Início" value={fmt(exec.startedAt)} />
              <Field icon={Clock} label="Término" value={fmt(exec.endedAt)} />
              <Field icon={Clock} label="Duração total" value={fmtDur(exec.durationMs)} />
              <Field icon={UserIcon} label="Acionamento" value={`${TRIGGER_LABEL[exec.trigger]} · ${exec.triggerDetail}`} />
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Parâmetros de entrada</h3>
                <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto border max-h-40">
                  {JSON.stringify(exec.parameters, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Saída final</h3>
                <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto border min-h-[80px] max-h-40">
                  {exec.output ? JSON.stringify(exec.output, null, 2) : "— ainda processando —"}
                </pre>
              </div>
            </div>
          </Card>

          <Accordion type="multiple" className="space-y-3">
            <AccordionItem value="agents" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-medium">Agentes chamados</span>
                  <Badge variant="secondary" className="ml-2">{exec.agentCalls.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {exec.agentCalls.map((a) => (
                  <Card key={a.id} className="p-3 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{a.name} <span className="text-muted-foreground font-normal">· {a.role}</span></div>
                        <div className="text-xs text-muted-foreground">
                          {fmt(a.startedAt)} → {fmt(a.endedAt)} · {fmtDur(a.durationMs)}
                        </div>
                      </div>
                      <Badge variant={a.status === "success" ? "outline" : "destructive"}>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <CodeBlock label="input" value={a.input} />
                      <CodeBlock label="output" value={a.output} />
                    </div>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="external" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium">Chamadas externas</span>
                  <Badge variant="secondary" className="ml-2">{exec.externalCalls.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">APIs · MCP · RAGs · Databases</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {exec.externalCalls.map((c) => {
                  const Icon = KIND_ICON[c.kind];
                  return (
                    <Card key={c.id} className="p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{c.name} <span className="text-muted-foreground font-normal">· {c.operation}</span></div>
                            <div className="text-xs text-muted-foreground">
                              {fmt(c.startedAt)} → {fmt(c.endedAt)} · {fmtDur(c.durationMs)} · <span className="uppercase">{c.kind}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={c.status === "success" ? "outline" : "destructive"}>{c.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <CodeBlock label="request" value={c.request} />
                        <CodeBlock label="response" value={c.response} />
                      </div>
                    </Card>
                  );
                })}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="info" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="font-medium">Human Info</span>
                  <Badge variant="secondary" className="ml-2">{exec.humanInfos.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">Mensagens informativas do fluxo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {exec.humanInfos.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma informação emitida.</p>}
                {exec.humanInfos.map((h) => {
                  const Icon = h.level === "warning" ? AlertTriangle : h.level === "success" ? CheckCircle2 : Info;
                  const tone =
                    h.level === "warning" ? "text-warning" :
                    h.level === "success" ? "text-success" : "text-primary";
                  return (
                    <Card key={h.id} className="p-4 space-y-2 bg-muted/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={`h-4 w-4 mt-1 ${tone}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{h.title}</h4>
                            <div className="text-sm text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-1">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc list-inside mb-1">{children}</ul>,
                                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                  em: ({ children }) => <em className="italic">{children}</em>,
                                }}
                              >
                                {h.message}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{fmt(h.emittedAt)}</span>
                      </div>
                    </Card>
                  );
                })}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tasks" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="font-medium">Human Task</span>
                  <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">Formulários para interação</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa humana neste fluxo.</p>}
                {tasks.map((t) => (
                  <HumanTaskCard key={t.id} task={t} onSubmit={(v) => submitTask(t.id, v)} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="raw" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-primary" />
                  <span className="font-medium">Payload bruto</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto border max-h-[400px]">
                  {JSON.stringify(exec, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <pre className="text-xs bg-background/60 rounded p-2 border overflow-auto max-h-40">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function HumanTaskCard({ task, onSubmit }: { task: HumanTask; onSubmit: (v: Record<string, string>) => void }) {
  const [values, setValues] = useState<Record<string, string | boolean>>(
    Object.fromEntries(task.fields.map((f) => [f.name, f.value ?? (f.type === "checkbox" ? false : "")]))
  );
  const done = task.state === "completed";

  return (
    <>
      <Card className="p-4 space-y-4 bg-muted/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-sm">{task.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
            {task.assignedTo && <div className="text-xs text-muted-foreground mt-2">👤 Atribuído a: {task.assignedTo}</div>}
          </div>
          <Badge variant={done ? "outline" : "secondary"}>{done ? "✓ Concluída" : "⏳ Pendente"}</Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          {task.fields.map((f) => (
            <div key={f.name}>
              {f.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={f.name}
                    disabled={done}
                    checked={values[f.name] === true || values[f.name] === "true"}
                    onCheckedChange={(checked) => setValues({ ...values, [f.name]: checked })}
                  />
                  <label htmlFor={f.name} className="text-sm font-medium cursor-pointer">
                    {f.label}
                  </label>
                </div>
              ) : f.type === "checkbox-group" ? (
                <div>
                  <label className="text-xs font-medium mb-2 block">{f.label}</label>
                  <div className="space-y-2">
                    {f.options?.map((o) => (
                      <div key={o} className="flex items-center gap-2">
                        <Checkbox
                          id={`${f.name}_${o}`}
                          disabled={done}
                          checked={(values[f.name] as string)?.includes(o) ?? false}
                          onCheckedChange={(checked) => {
                            const current = ((values[f.name] as string) || "").split(",").filter(Boolean);
                            const updated = checked
                              ? [...current, o]
                              : current.filter((item) => item !== o);
                            setValues({ ...values, [f.name]: updated.join(",") });
                          }}
                        />
                        <label htmlFor={`${f.name}_${o}`} className="text-sm cursor-pointer">
                          {o}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : f.type === "select" ? (
                <div>
                  <label className="text-xs font-medium mb-1 block">{f.label}</label>
                  <select
                    disabled={done}
                    className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  >
                    <option value="">Selecione uma opção</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ) : f.type === "textarea" ? (
                <div>
                  <label className="text-xs font-medium mb-1 block">{f.label}</label>
                  <textarea
                    disabled={done}
                    className="w-full min-h-[100px] rounded-md border bg-background p-2 text-sm"
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium mb-1 block">{f.label}</label>
                  <input
                    disabled={done}
                    type={f.type}
                    className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    placeholder={f.type === "email" ? "seu@email.com" : "Digite aqui..."}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!done && (
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setValues(Object.fromEntries(task.fields.map((f) => [f.name, f.value ?? (f.type === "checkbox" ? false : "")])));
              }}
            >
              Limpar
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                const stringValues = Object.fromEntries(
                  Object.entries(values).map(([k, v]) => [k, String(v)])
                );
                onSubmit(stringValues);
              }}
            >
              Enviar
            </Button>
          </div>
        )}
        
        {done && task.submittedAt && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            ✓ Enviado em {fmt(task.submittedAt)}
          </div>
        )}
      </Card>
    </>
  );
}
