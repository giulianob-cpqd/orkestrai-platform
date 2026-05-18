import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, Send, Plus, MessageSquare, Sparkles, User as UserIcon, ChevronDown, Search, X } from "lucide-react";
import { agentFlows } from "@/data/flows";
import { useRequireAuth, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations · OrkestrAI" },
      { name: "description", content: "Converse com agentes que possuem rota de conversação." },
    ],
  }),
  component: ConversationsPage,
});

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  ts: string;
}

interface Conversation {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
}

function ConversationsPage() {
  const ok = useRequireAuth();
  const { user } = useAuth();
  const conversableAgents = useMemo(() => agentFlows.filter((a) => a.hasConversation), []);
  const [agentId, setAgentId] = useState(conversableAgents[0]?.id ?? "");
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    conversableAgents[0]
      ? [{ id: "c1", title: "Nova conversa", agentId: conversableAgents[0].id, messages: [] }]
      : []
  );
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId);
  const activeAgent = agentFlows.find((a) => a.id === (active?.agentId ?? agentId));
  
  // Filter conversations by selected agent
  const filteredConversations = conversations.filter((c) => c.agentId === agentId);
  
  // Filter conversations by search query
  const searchedConversations = filteredConversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  if (!ok) return null;

  function selectAgent(newAgentId: string) {
    setAgentId(newAgentId);
    // Set active to first conversation of new agent or create new one
    const firstConvOfAgent = conversations.find((c) => c.agentId === newAgentId);
    if (firstConvOfAgent) {
      setActiveId(firstConvOfAgent.id);
    } else {
      const id = `c${Date.now()}`;
      setConversations((prev) => [
        { id, title: "Nova conversa", agentId: newAgentId, messages: [] },
        ...prev,
      ]);
      setActiveId(id);
    }
  }

  function newConversation() {
    if (!agentId) return;
    const id = `c${Date.now()}`;
    setConversations((prev) => [
      { id, title: "Nova conversa", agentId, messages: [] },
      ...prev,
    ]);
    setActiveId(id);
  }

  function send() {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    const userMsg: Message = { id: `m${Date.now()}`, role: "user", content: text, ts: new Date().toISOString() };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
              messages: [...c.messages, userMsg],
            }
          : c
      )
    );
    setDraft("");
    // simulate agent reply
    setTimeout(() => {
      const responses = [
        "## Análise Completa\n\nEntendi sua pergunta. Deixe-me fornecer uma análise detalhada:\n\n- **Ponto 1**: Consideração importante\n- **Ponto 2**: Aspecto relevante\n- **Ponto 3**: Detalhe significativo",
        "## Resposta\n\nÓtima questão! Aqui está minha análise:\n\n> Esta é uma observação importante que merece atenção especial.",
        "## Processamento\n\nVou processar isso e fornecer uma resposta estruturada:\n\n1. Primeiro passo\n2. Segundo passo\n3. Conclusão",
        "## Considerações\n\nInteressante ponto. Considere o seguinte:\n\n**Importante**: Isso requer uma análise cuidadosa dos detalhes.",
        "## Recomendações\n\nBaseado na sua pergunta, recomendo:\n\n- Opção A: Mais eficiente\n- Opção B: Mais segura\n- Opção C: Mais flexível",
        "## Análise Detalhada\n\nDeixe-me pensar sobre isso e responder adequadamente.\n\n```\nExemplo de implementação\n```",
        "## Parecer\n\nEssa é uma questão importante. Aqui está meu parecer:\n\n**Conclusão**: A melhor abordagem é considerar todos os fatores.",
        "## Resposta Completa\n\nCompreendi. Vou elaborar uma resposta completa:\n\n- Contexto\n- Análise\n- Solução",
        "## Observação\n\nExcelente observação. Minha análise:\n\n**Fato**: Isso é relevante para o contexto atual.",
        "## Estrutura\n\nVou abordar isso de forma estruturada:\n\n### Seção 1\nDetalhes importantes\n\n### Seção 2\nConsiderações adicionais",
        "## Descobertas\n\nEntendido. Aqui está o que descobri:\n\n- Descoberta 1\n- Descoberta 2\n- Descoberta 3",
        "## Explicação\n\nÓtimo questionamento. Deixe-me explicar:\n\n**Conceito**: Explicação clara e concisa.",
        "## Solução Fundamentada\n\nVou fornecer uma resposta bem fundamentada:\n\n1. **Base teórica**: Princípios aplicáveis\n2. **Aplicação prática**: Como usar\n3. **Resultado esperado**: Benefícios",
        "## Análise Cuidadosa\n\nIsso requer uma análise cuidadosa. Veja:\n\n- Aspecto técnico\n- Aspecto prático\n- Aspecto estratégico",
        "## Detalhamento\n\nPerfeito, vou detalhar isso para você:\n\n**Resumo**: Síntese das informações principais.",
        "## Resposta Fundamentada\n\nCompreendi perfeitamente. Minha resposta:\n\n> A solução mais adequada considera múltiplos fatores.",
        "## Solução Proposta\n\nVou elaborar uma solução para sua questão:\n\n- **Problema**: Identificação clara\n- **Solução**: Abordagem recomendada\n- **Benefícios**: Vantagens esperadas",
        "## Perspectiva\n\nExcelente pergunta. Aqui está minha perspectiva:\n\n**Insight**: Observação relevante sobre o tema.",
        "## Resposta Útil\n\nDeixe-me fornecer uma resposta completa e útil:\n\n```markdown\n- Ponto 1\n- Ponto 2\n- Ponto 3\n```",
        "## Detalhes Completos\n\nEntendi bem. Vou responder com detalhes:\n\n**Resumo executivo**: Informação essencial em uma linha.\n\nDetalhes adicionais para melhor compreensão.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        role: "agent",
        content: randomResponse,
        ts: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, reply] } : c))
      );
    }, 700);
  }

  return (
    <AppLayout title="Conversations" subtitle="Converse com agentes Conversations-enabled">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-sm text-muted-foreground">
            Converse com agentes que possuem rota de conversação — teste comportamentos e respostas em tempo real.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex h-[calc(100vh-14rem)]">
        {/* Sidebar de conversas */}
        <aside className="w-72 border-r border-border bg-card/40 flex flex-col">
          {/* New Conversation Button */}
          <div className="p-3 border-b border-border">
            <Button onClick={newConversation} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Nova conversa
            </Button>
          </div>

          {/* Search Input */}
          <div className="px-2 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-8 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {searchedConversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {filteredConversations.length === 0 ? "Nenhuma conversa" : "Nenhuma conversa encontrada"}
                </div>
              ) : (
                searchedConversations.map((c) => {
                  const ag = agentFlows.find((a) => a.id === c.agentId);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "w-full text-left rounded-md px-2.5 py-2 text-sm transition border border-transparent",
                        c.id === activeId ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate font-medium">{c.title}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 ml-5 truncate">
                        {ag?.name} · {ag?.version}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main */}
        <section className="flex-1 flex flex-col">
          {/* Agent Header with Selector */}
          <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-card/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-semibold">{activeAgent?.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{activeAgent?.description}</div>
              </div>
            </div>
            {activeAgent && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeAgent.version}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Bot className="h-3.5 w-3.5" />
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {conversableAgents.map((a) => (
                      <DropdownMenuItem
                        key={a.id}
                        onClick={() => selectAgent(a.id)}
                        className={cn(a.id === agentId && "bg-primary/10")}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.version}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {active?.messages.length === 0 && (
                <div className="text-center py-16">
                  <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h2 className="font-display text-xl font-semibold">Comece uma conversa</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pergunte algo a {activeAgent?.name}.
                  </p>
                </div>
              )}
              {active?.messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      m.role === "user" ? "bg-secondary" : "bg-primary/15 text-primary"
                    )}
                  >
                    {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <Card className={cn("p-3 max-w-[80%] text-sm", m.role === "user" ? "bg-primary/10" : "bg-card")}>
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-1.5 mb-0.5" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-0.5" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-0.5" {...props} />,
                            li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-primary/30 pl-2 italic text-muted-foreground mb-2" {...props} />,
                            code: ({ node, inline, ...props }) => 
                              inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                              ) : (
                                <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto mb-2" {...props} />
                              ),
                            pre: ({ node, ...props }) => <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-2" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border bg-card/30 p-4">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={`Mensagem para ${activeAgent?.name ?? "agente"}...`}
                className="min-h-[52px] resize-none"
                disabled={!active}
              />
              <Button onClick={send} disabled={!draft.trim() || !active} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Logado como {user?.name} · Enter envia, Shift+Enter quebra linha
            </p>
          </div>
        </section>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
