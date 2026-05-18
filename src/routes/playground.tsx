import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Brain, FlaskConical, Database, Send, Sparkles, Play, Copy, Plus, Trash2,
  GitCompare, Cpu, DollarSign, Clock, Search, User as UserIcon,
} from "lucide-react";
import { registeredLlms, registeredRags } from "@/data/registry";
import { trainingJobs } from "@/data/training";

export const Route = createFileRoute("/playground")({
  head: () => ({ meta: [{ title: "Playground · Inspire" }] }),
  component: PlaygroundPage,
});

interface PlaygroundMessage { role: "system" | "user" | "assistant"; content: string; meta?: { latencyMs: number; tokens: number; costUsd: number } }

const mlModels = trainingJobs
  .filter((j) => j.kind.startsWith("ml-") && j.artifactRegistry)
  .map((j) => ({ id: j.artifactRegistry!, name: j.name, kind: j.kind, metrics: j.metrics }));

const customLlmFineTunes = trainingJobs
  .filter((j) => (j.kind.startsWith("llm") || j.kind === "embeddings") && j.artifactRegistry)
  .map((j) => ({ id: j.artifactRegistry!, name: j.name, base: j.baseModel || "—" }));

function PlaygroundPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Playground</h1>
          <p className="text-sm text-muted-foreground">
            Compare LLMs (catálogo e fine-tunes), invoque modelos de Machine Learning e teste pipelines de RAG lado a lado.
          </p>
        </div>

        <Tabs defaultValue="llm">
          <TabsList>
            <TabsTrigger value="llm" className="gap-2"><Brain className="h-4 w-4" /> LLM</TabsTrigger>
            <TabsTrigger value="ml" className="gap-2"><FlaskConical className="h-4 w-4" /> Machine Learning</TabsTrigger>
            <TabsTrigger value="rag" className="gap-2"><Database className="h-4 w-4" /> RAG</TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="mt-4"><LLMPlayground /></TabsContent>
          <TabsContent value="ml" className="mt-4"><MLPlayground /></TabsContent>
          <TabsContent value="rag" className="mt-4"><RAGPlayground /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* ---------------- LLM Playground (compare panes) ---------------- */

interface LlmPane {
  id: string;
  modelId: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  messages: PlaygroundMessage[];
  running: boolean;
}

const allLlmOptions = [
  ...registeredLlms.map((m) => ({ id: m.id, name: m.name, meta: m.meta || "", group: "Catalog" as const })),
  ...customLlmFineTunes.map((m) => ({ id: m.id, name: m.name, meta: `fine-tune · ${m.base}`, group: "Fine-tunes" as const })),
];

function newPane(modelId: string): LlmPane {
  return { id: crypto.randomUUID(), modelId, temperature: 0.7, topP: 0.95, maxTokens: 1024, messages: [], running: false };
}

function LLMPlayground() {
  const [system, setSystem] = useState("You are a helpful, concise assistant.");
  const [input, setInput] = useState("");
  const [panes, setPanes] = useState<LlmPane[]>([
    newPane(registeredLlms[0].id),
    newPane(registeredLlms[1].id),
  ]);

  function addPane() {
    if (panes.length >= 4) return;
    setPanes((p) => [...p, newPane(allLlmOptions[p.length % allLlmOptions.length].id)]);
  }
  function removePane(id: string) { setPanes((p) => p.filter((x) => x.id !== id)); }
  function updatePane(id: string, patch: Partial<LlmPane>) {
    setPanes((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x));
  }

  function runAll() {
    if (!input.trim()) return;
    const userMsg: PlaygroundMessage = { role: "user", content: input };
    setPanes((p) => p.map((x) => ({ ...x, running: true, messages: [...x.messages, userMsg] })));
    setInput("");
    panes.forEach((pane) => {
      const latency = 400 + Math.floor(Math.random() * 1800);
      window.setTimeout(() => {
        const tokens = 120 + Math.floor(Math.random() * 600);
        const cost = +(tokens * 0.000015).toFixed(5);
        const opt = allLlmOptions.find((o) => o.id === pane.modelId);
        const reply: PlaygroundMessage = {
          role: "assistant",
          content: `**${opt?.name}** would answer:\n\n${userMsg.content
            .split(" ")
            .map((w) => w[0]?.toUpperCase() + w.slice(1))
            .join(" ")}.\n\n(simulated · ${tokens} tokens · ${latency}ms)`,
          meta: { latencyMs: latency, tokens, costUsd: cost },
        };
        setPanes((p) => p.map((x) => x.id === pane.id ? { ...x, running: false, messages: [...x.messages, reply] } : x));
      }, latency);
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> System prompt</span>
            <Button size="sm" variant="outline" onClick={addPane} disabled={panes.length >= 4} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add model ({panes.length}/4)
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={system} onChange={(e) => setSystem(e.target.value)} className="min-h-[60px]" />
        </CardContent>
      </Card>

      <div className={`grid gap-4 ${panes.length === 1 ? "grid-cols-1" : panes.length === 2 ? "grid-cols-1 lg:grid-cols-2" : panes.length === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"}`}>
        {panes.map((pane) => (
          <LlmPaneCard key={pane.id} pane={pane} onChange={(p) => updatePane(pane.id, p)} onRemove={() => removePane(pane.id)} />
        ))}
      </div>

      <Card>
        <CardContent className="flex items-end gap-2 p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo e compare as respostas..."
            className="min-h-[60px]"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runAll(); }}
          />
          <Button onClick={runAll} className="gap-2"><Send className="h-4 w-4" /> Run all</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LlmPaneCard({ pane, onChange, onRemove }: { pane: LlmPane; onChange: (p: Partial<LlmPane>) => void; onRemove: () => void }) {
  const totals = pane.messages.reduce(
    (acc, m) => ({ tokens: acc.tokens + (m.meta?.tokens || 0), cost: acc.cost + (m.meta?.costUsd || 0) }),
    { tokens: 0, cost: 0 },
  );
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Select value={pane.modelId} onValueChange={(v) => onChange({ modelId: v })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Catalog", "Fine-tunes"].map((g) => (
                <div key={g}>
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{g}</div>
                  {allLlmOptions.filter((o) => o.group === g).map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name} <span className="text-xs text-muted-foreground">· {o.meta}</span></SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <ParamSlider label="Temp" value={pane.temperature} min={0} max={2} step={0.1} onChange={(v) => onChange({ temperature: v })} />
          <ParamSlider label="Top-p" value={pane.topP} min={0} max={1} step={0.05} onChange={(v) => onChange({ topP: v })} />
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Max</Label>
            <Input type="number" className="h-7" value={pane.maxTokens} onChange={(e) => onChange({ maxTokens: Number(e.target.value) })} />
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-72 rounded border bg-muted/20 p-3">
          {pane.messages.length === 0 && (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">No messages yet</div>
          )}
          <div className="space-y-3">
            {pane.messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                    m.role === "user" ? "bg-secondary" : "bg-primary/15 text-primary"
                  )}
                >
                  {m.role === "user" ? <UserIcon className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                </div>
                <div className={cn("max-w-[70%] rounded-lg p-2 text-xs", m.role === "user" ? "bg-primary/10" : "bg-card border border-border")}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.meta && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[9px] text-muted-foreground">
                      <span><Clock className="mr-0.5 inline h-2 w-2" />{m.meta.latencyMs}ms</span>
                      <span><Cpu className="mr-0.5 inline h-2 w-2" />{m.meta.tokens}t</span>
                      <span><DollarSign className="mr-0.5 inline h-2 w-2" />${m.meta.costUsd.toFixed(5)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pane.running && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs">
                  <Brain className="h-3 w-3" />
                </div>
                <div className="text-xs text-muted-foreground">generating…</div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Σ {totals.tokens} tok</span>
          <span>Σ ${totals.cost.toFixed(5)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ParamSlider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

/* ---------------- ML Playground ---------------- */

const mlSchemas: Record<string, { features: { name: string; type: "number" | "select"; options?: string[]; default: string | number }[] }> = {
  default: {
    features: [
      { name: "tenure_months", type: "number", default: 12 },
      { name: "monthly_spend", type: "number", default: 89.9 },
      { name: "tickets_30d", type: "number", default: 2 },
      { name: "plan", type: "select", options: ["basic", "pro", "enterprise"], default: "pro" },
    ],
  },
};

function MLPlayground() {
  const models = mlModels.length > 0 ? mlModels : [{ id: "registry://ml/churn-30d/v7", name: "Churn 30d · XGBoost", kind: "ml-classification", metrics: { f1: 0.812 } }];
  const [modelId, setModelId] = useState(models[0].id);
  const schema = mlSchemas.default;
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(schema.features.map((f) => [f.name, f.default])),
  );
  const [batchCsv, setBatchCsv] = useState("tenure_months,monthly_spend,tickets_30d,plan\n12,89.9,2,pro\n36,199,0,enterprise\n3,29.9,5,basic");
  const [result, setResult] = useState<{ prediction: string; confidence: number; shap: { feature: string; weight: number }[] } | null>(null);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  function predict() {
    const score = 0.2 + Math.random() * 0.7;
    setResult({
      prediction: score > 0.5 ? "churn" : "retain",
      confidence: +score.toFixed(3),
      shap: schema.features.map((f) => ({ feature: f.name, weight: +(Math.random() * 2 - 1).toFixed(3) })),
    });
  }

  function predictBatch() {
    const rows = batchCsv.trim().split("\n").slice(1);
    const out = ["prediction,confidence", ...rows.map(() => {
      const s = +(Math.random()).toFixed(3);
      return `${s > 0.5 ? "churn" : "retain"},${s}`;
    })].join("\n");
    setBatchResult(out);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle className="text-sm">Model</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={modelId} onValueChange={setModelId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {models.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="font-mono">{modelId}</div>
            {Object.entries(models.find((m) => m.id === modelId)?.metrics || {}).map(([k, v]) => (
              <div key={k}>{k}: <span className="text-foreground">{String(v)}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-sm">Single inference</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {schema.features.map((f) => (
              <div key={f.name}>
                <Label className="text-xs">{f.name}</Label>
                {f.type === "number" ? (
                  <Input type="number" value={values[f.name] as number} onChange={(e) => setValues({ ...values, [f.name]: Number(e.target.value) })} />
                ) : (
                  <Select value={values[f.name] as string} onValueChange={(v) => setValues({ ...values, [f.name]: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
          <Button onClick={predict} className="gap-2"><Play className="h-4 w-4" /> Predict</Button>
          {result && (
            <div className="rounded border bg-muted/20 p-3 text-sm">
              <div className="flex items-center justify-between">
                <Badge className="text-sm">{result.prediction}</Badge>
                <span className="text-xs text-muted-foreground">confidence {result.confidence}</span>
              </div>
              <Separator className="my-2" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">SHAP-like contributions</div>
              <div className="mt-1 space-y-1">
                {result.shap.map((s) => (
                  <div key={s.feature} className="flex items-center gap-2 text-xs">
                    <span className="w-32 text-muted-foreground">{s.feature}</span>
                    <div className="relative h-2 flex-1 rounded bg-muted">
                      <div
                        className={`absolute top-0 h-2 rounded ${s.weight >= 0 ? "bg-emerald-500/60 left-1/2" : "bg-red-500/60 right-1/2"}`}
                        style={{ width: `${Math.min(50, Math.abs(s.weight) * 50)}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono">{s.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader><CardTitle className="text-sm">Batch inference (CSV)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Textarea value={batchCsv} onChange={(e) => setBatchCsv(e.target.value)} className="min-h-[160px] font-mono text-xs" />
            <Textarea readOnly value={batchResult || "Run to see predictions..."} className="min-h-[160px] font-mono text-xs" />
          </div>
          <div className="flex gap-2">
            <Button onClick={predictBatch} className="gap-2"><Play className="h-4 w-4" /> Predict batch</Button>
            {batchResult && (
              <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(batchResult)}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- RAG Playground ---------------- */

const retrievalStrategies = [
  { id: "hybrid", name: "Hybrid Search (BM25 + Vector)" },
  { id: "semantic", name: "Semantic Chunking" },
  { id: "parent-child", name: "Parent-Child Retrieval" },
  { id: "graph", name: "Graph RAG" },
  { id: "rerank", name: "Vector + Cross-encoder Rerank" },
];

interface RetrievedChunk { id: string; source: string; score: number; text: string }

function RAGPlayground() {
  const [ragId, setRagId] = useState(registeredRags[0].id);
  const [strategy, setStrategy] = useState("hybrid");
  const [topK, setTopK] = useState(5);
  const [rerank, setRerank] = useState(true);
  const [query, setQuery] = useState("Como configurar o failover do gateway de pagamentos?");
  const [chunks, setChunks] = useState<RetrievedChunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [modelId, setModelId] = useState(registeredLlms[0].id);

  function retrieve() {
    const synth = Array.from({ length: topK }).map((_, i) => ({
      id: `c${i + 1}`,
      source: `${registeredRags.find((r) => r.id === ragId)?.name} · doc_${i + 14}.md#sec-${i + 2}`,
      score: +(0.95 - i * 0.07 - Math.random() * 0.02).toFixed(3),
      text: `Trecho #${i + 1} relacionado a "${query}". O gateway de pagamentos usa estratégia de failover ativo-passivo com health checks a cada 5s e cutover automático após 3 falhas consecutivas...`,
    }));
    setChunks(synth);
    setAnswer("");
  }

  function generate() {
    const ctx = chunks.length ? chunks : [];
    const used = ctx.slice(0, 3).map((c, i) => `[${i + 1}]`).join(" ");
    setAnswer(
      `Com base no índice **${registeredRags.find((r) => r.id === ragId)?.name}** e na estratégia **${strategy}**, o failover do gateway é ativo-passivo, com health checks a cada 5s e cutover após 3 falhas. ${used}\n\n_Modelo: ${registeredLlms.find((m) => m.id === modelId)?.name}_`,
    );
  }

  const useMemoizedChunks = useMemo(() => chunks, [chunks]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-sm">Retrieval config</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">RAG index</Label>
            <Select value={ragId} onValueChange={setRagId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{registeredRags.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="mt-1 text-[11px] text-muted-foreground">{registeredRags.find((r) => r.id === ragId)?.meta}</div>
          </div>
          <div>
            <Label className="text-xs">Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{retrievalStrategies.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Top-K: {topK}</Label>
            <Slider value={[topK]} min={1} max={15} step={1} onValueChange={(v) => setTopK(v[0])} />
          </div>
          <div className="flex items-center justify-between rounded border p-2">
            <Label className="text-xs">Rerank (cross-encoder)</Label>
            <Switch checked={rerank} onCheckedChange={setRerank} />
          </div>
          <Separator />
          <div>
            <Label className="text-xs">Generator LLM</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{registeredLlms.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Query</span>
            <Badge variant="outline" className="gap-1 font-normal"><GitCompare className="h-3 w-3" /> retrieval → grounded answer</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
            </div>
            <Button onClick={retrieve} variant="outline" className="gap-2"><Database className="h-4 w-4" /> Retrieve</Button>
            <Button onClick={generate} className="gap-2" disabled={chunks.length === 0}><Send className="h-4 w-4" /> Answer</Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Retrieved chunks</div>
              <ScrollArea className="h-80 rounded border bg-muted/20 p-2">
                {useMemoizedChunks.length === 0 && (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">No retrievals yet</div>
                )}
                <div className="space-y-2">
                  {useMemoizedChunks.map((c, i) => (
                    <div key={c.id} className="rounded border bg-card p-2 text-xs">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono">[{i + 1}] {c.source}</span>
                        <Badge variant="outline" className="font-mono font-normal">{c.score}</Badge>
                      </div>
                      <div className="text-muted-foreground">{c.text}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Grounded answer</div>
              <div className="h-80 overflow-auto rounded border bg-muted/20 p-3 text-sm whitespace-pre-wrap">
                {answer || <span className="text-muted-foreground">Run retrieval, then generate to see the answer.</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
