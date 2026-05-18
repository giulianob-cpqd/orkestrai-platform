import { useMemo, useState } from "react";
import type { Node } from "@xyflow/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Webhook, Inbox, Clock, Send, Copy, Check, Terminal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Inbound {
  id: string;
  kind: "endpoint" | "consumer" | "cron" | "input";
  label: string;
  meta?: string;
  protocol?: string;
  broker?: string;
  topic?: string;
  path?: string;
  cron?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  mode: "agent" | "orchestration";
  flowName?: string;
}

function detectInbounds(nodes: Node[], mode: "agent" | "orchestration"): Inbound[] {
  const inbounds: Inbound[] = [];
  for (const n of nodes) {
    const d = n.data as Record<string, unknown>;
    const t = (d.nodeType as string) ?? (d.variant as string);
    if (mode === "agent" && t === "input") {
      inbounds.push({ id: n.id, kind: "input", label: (d.label as string) ?? "Input", meta: (d.meta as string) ?? "text" });
    }
    if (mode === "orchestration") {
      if (t === "endpoint")
        inbounds.push({ id: n.id, kind: "endpoint", label: (d.label as string) ?? "Request", protocol: (d.protocol as string) ?? "rest", path: d.path as string, meta: (d.meta as string) });
      if (t === "consumer")
        inbounds.push({ id: n.id, kind: "consumer", label: (d.label as string) ?? "Consumer", broker: d.broker as string, topic: d.topic as string, meta: (d.meta as string) });
      if (t === "cron")
        inbounds.push({ id: n.id, kind: "cron", label: (d.label as string) ?? "Cron", cron: d.cron as string, meta: (d.meta as string) });
    }
  }
  return inbounds;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={copy}>
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function TestFlowDialog({ open, onOpenChange, nodes, mode, flowName }: Props) {
  const inbounds = useMemo(() => detectInbounds(nodes, mode), [nodes, mode]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [payload, setPayload] = useState<string>('{\n  "message": "Hello"\n}');
  const [headers, setHeaders] = useState<string>('Content-Type: application/json');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [codeTab, setCodeTab] = useState<"interface" | "curl" | "python" | "javascript">("interface");

  const inbound = inbounds.find((i) => i.id === selectedId) ?? inbounds[0];
  const slug = flowName ?? "flow";
  const endpoint = inbound?.path ?? `/v1/${slug}`;

  const curlCode = `curl -X POST https://api.orkestrai.dev${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $ORKESTRAI_API_KEY" \\
  -d '${payload.replace(/\n/g, "\\n").replace(/'/g, "\\'")}'`;

  const pythonCode = `import requests

response = requests.post(
    "https://api.orkestrai.dev${endpoint}",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ['ORKESTRAI_API_KEY']}",
    },
    json=${payload.replace(/\n/g, "\n    ")},
)

print(response.json())`;

  const jsCode = `const response = await fetch("https://api.orkestrai.dev${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${"${"{"}process.env.ORKESTRAI_API_KEY${"}"}}\`,
  },
  body: JSON.stringify(${payload.replace(/\n/g, "\n  ")}),
});

const data = await response.json();
console.log(data);`;

  const run = async () => {
    if (!inbound) return;
    setRunning(true);
    setLogs([]);
    const push = (l: string) => setLogs((prev) => [...prev, l]);
    push(`▶ Test starting on ${inbound.kind}: ${inbound.label}`);
    await new Promise((r) => setTimeout(r, 250));
    if (inbound.kind === "endpoint") push(`→ ${inbound.protocol?.toUpperCase()} ${inbound.path ?? "/"}`);
    if (inbound.kind === "consumer") push(`→ subscribe ${inbound.broker} :: ${inbound.topic}`);
    if (inbound.kind === "cron") push(`→ trigger schedule ${inbound.cron}`);
    if (inbound.kind === "input") push(`→ direct input`);
    await new Promise((r) => setTimeout(r, 350));
    push(`payload bytes: ${payload.length}`);
    await new Promise((r) => setTimeout(r, 400));
    push(`✓ flow executed (mock) — 142ms`);
    push(`response: { "ok": true, "echo": ${payload.replace(/\n/g, " ")} }`);
    setRunning(false);
  };

  const isAsync = inbound?.kind === "consumer" || inbound?.kind === "cron";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Test flow
          </DialogTitle>
          <DialogDescription>
            A interface de teste é montada a partir dos inbounds detectados no canvas
            (Endpoint sync ou Mensageria async).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={codeTab} onValueChange={(v) => setCodeTab(v as typeof codeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interface" className="gap-1.5">
              <Play className="h-3 w-3" /> Interface
            </TabsTrigger>
            <TabsTrigger value="curl" className="gap-1.5">
              <Terminal className="h-3 w-3" /> cURL
            </TabsTrigger>
            <TabsTrigger value="python" className="gap-1.5">
              <Code2 className="h-3 w-3" /> Python
            </TabsTrigger>
            <TabsTrigger value="javascript" className="gap-1.5">
              <Code2 className="h-3 w-3" /> JavaScript
            </TabsTrigger>
          </TabsList>

          {/* Interface tab — original test UI */}
          <TabsContent value="interface" className="mt-4">
            {inbounds.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Nenhum inbound encontrado.
                {mode === "orchestration"
                  ? " Adicione um Request, Message Consumer ou Cron Job."
                  : " Adicione um Input ao agente."}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Inbound</Label>
                  <Select value={inbound?.id} onValueChange={setSelectedId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {inbounds.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          <span className="inline-flex items-center gap-2">
                            {i.kind === "endpoint" && <Webhook className="h-3 w-3" />}
                            {i.kind === "consumer" && <Inbox className="h-3 w-3" />}
                            {i.kind === "cron" && <Clock className="h-3 w-3" />}
                            {i.kind === "input" && <Send className="h-3 w-3" />}
                            {i.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {inbound && (
                    <div className="rounded-md border border-border bg-muted/40 p-3 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                          {inbound.kind}
                        </span>
                        <Badge
                          variant="outline"
                          className={isAsync ? "border-warning/40 text-warning" : "border-success/40 text-success"}
                        >
                          {isAsync ? "async" : "sync"}
                        </Badge>
                      </div>
                      {inbound.protocol && <div>protocol: <span className="font-mono">{inbound.protocol}</span></div>}
                      {inbound.path && <div>path: <span className="font-mono">{inbound.path}</span></div>}
                      {inbound.broker && <div>broker: <span className="font-mono">{inbound.broker}</span></div>}
                      {inbound.topic && <div>topic: <span className="font-mono">{inbound.topic}</span></div>}
                      {inbound.cron && <div>cron: <span className="font-mono">{inbound.cron}</span></div>}
                    </div>
                  )}
                </div>

                <div className="col-span-3 space-y-3">
                  {inbound?.kind === "endpoint" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Headers</Label>
                      <Textarea
                        rows={2}
                        className="font-mono text-xs"
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                      />
                    </div>
                  )}
                  {inbound?.kind === "consumer" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Message key</Label>
                      <Input className="font-mono text-xs" placeholder="user-123" />
                    </div>
                  )}
                  {inbound?.kind === "cron" && (
                    <div className="rounded-md border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
                      Cron jobs disparam sem payload — vamos simular o trigger agora.
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs">
                      {inbound?.kind === "consumer" ? "Message body" : "Payload"}
                    </Label>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={run}
                    disabled={running || !inbound}
                    className="w-full gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {running ? "Running…" : "Run test"}
                  </Button>
                </div>

                <div className="col-span-5 space-y-2">
                  <Label className="text-xs">Execution log</Label>
                  <ScrollArea className="h-40 rounded-md border border-border bg-background/60 p-3">
                    {logs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nada executado ainda.</p>
                    ) : (
                      <pre className="font-mono text-[11px] leading-relaxed">{logs.join("\n")}</pre>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          {/* cURL tab */}
          <TabsContent value="curl" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">cURL command</Label>
                <CopyButton text={curlCode} />
              </div>
              <div className="rounded-md border border-border bg-black/95 p-4">
                <pre className="font-mono text-[11px] leading-relaxed text-green-400 whitespace-pre-wrap">{curlCode}</pre>
              </div>
            </div>
          </TabsContent>

          {/* Python tab */}
          <TabsContent value="python" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Python</Label>
                <CopyButton text={pythonCode} />
              </div>
              <div className="rounded-md border border-border bg-black/95 p-4">
                <pre className="font-mono text-[11px] leading-relaxed text-blue-300 whitespace-pre-wrap">{pythonCode}</pre>
              </div>
            </div>
          </TabsContent>

          {/* JavaScript tab */}
          <TabsContent value="javascript" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">JavaScript</Label>
                <CopyButton text={jsCode} />
              </div>
              <div className="rounded-md border border-border bg-black/95 p-4">
                <pre className="font-mono text-[11px] leading-relaxed text-yellow-300 whitespace-pre-wrap">{jsCode}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
