import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Wand2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type { NodeTemplate } from "./nodeCatalog";

export type AssistantMode = "agent" | "orchestration";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  generated?: { nodes: number; edges: number };
}

interface Props {
  mode: AssistantMode;
  catalog: NodeTemplate[];
  onApply: (nodes: Node[], edges: Edge[]) => void;
}

const SUGGESTIONS_AGENT = [
  "Agente de suporte com RAG no Postgres e memória de conversa",
  "Agente que consulta API de clima e responde via GPT-5",
  "Agente RAG sobre documentos PDF com MCP filesystem",
];

const SUGGESTIONS_ORCH = [
  "Cron diário que roda um agente de relatório e grava no Postgres",
  "Endpoint REST que dispara agente de triagem e publica em Kafka",
  "Webhook → agente classificador → roteia para 2 agentes em paralelo → Postgres",
];

let gid = 5000;
const nid = () => `ai-${++gid}`;

function generateFlow(
  prompt: string,
  mode: AssistantMode,
  catalog: NodeTemplate[],
): { nodes: Node[]; edges: Edge[] } {
  const p = prompt.toLowerCase();
  const pick = (type: string) => catalog.find((c) => c.type === type);
  const sequence: NodeTemplate[] = [];

  if (mode === "agent") {
    sequence.push(pick("input")!);
    sequence.push(pick("prompt")!);
    if (/rag|knowledge|documento|pdf|base de conhecimento|vetor/.test(p)) sequence.push(pick("rag")!);
    if (/mem[óo]ria|memory|hist[óo]rico|conversa/.test(p)) sequence.push(pick("memory")!);
    if (/api|rest|http|servi[çc]o|tool|ferramenta|clima|weather/.test(p)) sequence.push(pick("tool")!);
    if (/mcp|filesystem|protocol/.test(p)) sequence.push(pick("mcp")!);
    sequence.push(pick("llm")!);
    sequence.push(pick("output")!);
  } else {
    if (/cron|agendado|schedule|di[áa]rio|hor[áa]rio/.test(p)) sequence.push(pick("cron")!);
    else if (/webhook|endpoint|rest|http|grpc|graphql|websocket|sse/.test(p)) sequence.push(pick("endpoint")!);
    else sequence.push(pick("endpoint")!);
    if (/fila|queue|kafka|rabbit|nats|t[óo]pico|topic/.test(p)) sequence.push(pick("queue")!);
    sequence.push(pick("agentref")!);
    if (/paralelo|parallel|roteia|router|coordena|supervisor|debate|sequencial/.test(p)) {
      sequence.push(pick("coord")!);
      sequence.push({ ...pick("agentref")!, label: "Agent B" } as NodeTemplate);
    }
    if (/postgres|mysql|sqlite|mongo|redis|banco|database|db/.test(p)) sequence.push(pick("db")!);
    if (/s3|lambda|bigquery|cloud|aws|gcp|azure/.test(p)) sequence.push(pick("cloud")!);
    if (/api externa|third-party|terceiro/.test(p)) sequence.push(pick("tool")!);
    if (/kafka|rabbit|publica|publish/.test(p) && !sequence.find((s) => s.type === "queue"))
      sequence.push(pick("queue")!);
    sequence.push(pick("output")!);
  }

  const nodes: Node[] = sequence.filter(Boolean).map((tpl, i) => ({
    id: nid(),
    type: "agent",
    position: { x: 80 + i * 220, y: 160 + (i % 2) * 80 },
    data: {
      label: tpl.label,
      description: tpl.description,
      icon: tpl.icon,
      variant: tpl.variant,
      meta: tpl.meta,
      nodeType: tpl.type,
    },
  }));

  const edges: Edge[] = nodes.slice(0, -1).map((n, i) => ({
    id: `e-${n.id}-${nodes[i + 1].id}`,
    source: n.id,
    target: nodes[i + 1].id,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
}

export function AIAssistantPanel({ mode, catalog, onApply }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        mode === "agent"
          ? "Olá! Descreva o agente que você quer criar. Eu monto Prompt, LLMs, RAGs, memória, ferramentas e MCPs no canvas."
          : "Olá! Descreva a orquestração desejada. Eu monto requests, cron jobs, agentes, filas, bancos e coordenação no canvas.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setInput("");
    const userMsg: ChatMessage = { id: nid(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    await new Promise((r) => setTimeout(r, 600));
    const { nodes, edges } = generateFlow(text, mode, catalog);
    onApply(nodes, edges);

    setMessages((m) => [
      ...m,
      {
        id: nid(),
        role: "assistant",
        content: `Pronto! Gerei um esboço com ${nodes.length} nós e ${edges.length} conexões. Diga o que ajustar.`,
        generated: { nodes: nodes.length, edges: edges.length },
      },
    ]);
    setBusy(false);
  };

  const suggestions = mode === "agent" ? SUGGESTIONS_AGENT : SUGGESTIONS_ORCH;

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="space-y-3 p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                    : "border border-border bg-card",
                )}
              >
                {m.content}
                {m.generated && (
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {m.generated.nodes} nodes
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {m.generated.edges} edges
                    </Badge>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 animate-pulse text-primary" />
              Gerando flow…
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length <= 1 && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Sugestões
          </p>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full rounded-md border border-border bg-card px-2.5 py-2 text-left text-xs leading-snug transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
              >
                <Wand2 className="mr-1.5 inline h-3 w-3 text-primary" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder={
              mode === "agent"
                ? "Descreva o agente…"
                : "Descreva a orquestração…"
            }
            className="min-h-[60px] resize-none text-sm"
          />
          <Button
            size="icon"
            onClick={() => send(input)}
            disabled={!input.trim() || busy}
            className="h-10 w-10 shrink-0 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Mock local — gera nodes/edges no canvas a partir da descrição.
        </p>
      </div>
    </div>
  );
}
