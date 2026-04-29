import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutTemplate, Plus, Workflow, Bot, Code2, GitBranch } from "lucide-react";
import { templates, type Template } from "@/data/templates";
import { agentFlows, orchestrations } from "@/data/flows";
import { TemplateWizardDialog } from "@/components/TemplateWizardDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/templates/")({
  head: () => ({
    meta: [
      { title: "Templates · Inspire" },
      { name: "description", content: "Reusable templates for agents and orchestrations." },
    ],
  }),
  component: TemplatesList,
});

function TemplateCard({ t, onUse }: { t: Template; onUse: (t: Template) => void }) {
  return (
    <Card className="h-full border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              t.kind === "agent" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary",
            )}
          >
            {t.kind === "agent" ? <Bot className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">{t.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.kind} · {t.source}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5",
            t.source === "lowcode"
              ? "border-primary/40 text-primary"
              : "border-warning/40 text-warning",
          )}
        >
          {t.source === "lowcode" ? <GitBranch className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
          {t.source}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {t.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>{t.author}</span>
        <span className="font-mono">{t.updatedAt}</span>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onUse(t)}>
          Use template
        </Button>
      </div>
    </Card>
  );
}

function CreateTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"agent" | "orchestration">("agent");
  const [source, setSource] = useState<"lowcode" | "highcode">("lowcode");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [flowId, setFlowId] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState("");

  const baseFlows = kind === "agent" ? agentFlows : orchestrations;

  const submit = () => {
    if (!name.trim()) return;
    if (source === "lowcode" && !flowId) {
      toast.error("Selecione um fluxo base.");
      return;
    }
    if (source === "highcode" && !repoUrl.trim()) {
      toast.error("Informe a URL do repositório.");
      return;
    }
    toast.success(`Template "${name}" criado (mock).`);
    setOpen(false);
    setName("");
    setDescription("");
    setFlowId("");
    setRepoUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> New template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Templates são <strong>ou</strong> um agente <strong>ou</strong> uma orquestração.
            Você pode partir de um fluxo low-code existente ou de um repositório de código high-code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <Select value={kind} onValueChange={(v) => { setKind(v as "agent" | "orchestration"); setFlowId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="orchestration">Orchestration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Origem</Label>
              <Select value={source} onValueChange={(v) => setSource(v as "lowcode" | "highcode")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowcode">Low-code (fluxo)</SelectItem>
                  <SelectItem value="highcode">High-code (repositório)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Support RAG" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {source === "lowcode" ? (
            <div className="space-y-2">
              <Label className="text-xs">
                {kind === "agent" ? "Agente base" : "Orquestração base"}
              </Label>
              <Select value={flowId} onValueChange={setFlowId}>
                <SelectTrigger><SelectValue placeholder="Selecione um fluxo" /></SelectTrigger>
                <SelectContent>
                  {baseFlows.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Repositório (Git URL)</Label>
              <Input
                className="font-mono text-xs"
                placeholder="https://github.com/org/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
            Criar template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesList() {
  const agentTpls = templates.filter((t) => t.kind === "agent");
  const orchTpls = templates.filter((t) => t.kind === "orchestration");

  return (
    <AppLayout title="Templates" subtitle="Reusable starting points">
      <div className="p-6">
        <PageHeader
          title="Templates"
          description="Catálogo de templates de agentes e orquestrações — low-code (fluxo) ou high-code (repositório)."
        >
          <CreateTemplateDialog />
        </PageHeader>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <LayoutTemplate className="h-3.5 w-3.5" /> All ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Agents ({agentTpls.length})
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="gap-1.5">
              <Workflow className="h-3.5 w-3.5" /> Orchestrations ({orchTpls.length})
            </TabsTrigger>
          </TabsList>

          {[
            { v: "all", list: templates },
            { v: "agent", list: agentTpls },
            { v: "orchestration", list: orchTpls },
          ].map(({ v, list }) => (
            <TabsContent key={v} value={v} className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((t) => (
                  <TemplateCard key={t.id} t={t} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
