import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import type { Template } from "@/data/templates";
import { addOrchestration, addAgentFlow } from "@/data/flows";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 40);

export function TemplateWizardDialog({ open, onOpenChange, template }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState("Platform");
  const [area, setArea] = useState("General");
  const [environment, setEnvironment] = useState("dev");
  const [visibility, setVisibility] = useState("private");
  const [llm, setLlm] = useState("google/gemini-2.5-pro");

  useEffect(() => {
    if (open && template) {
      setStep(1);
      setName(template.name);
      setDescription(template.description);
    }
  }, [open, template]);

  if (!template) return null;

  const slug = slugify(name) || "untitled";
  const target = template.kind === "agent" ? "/agents/new" : "/orchestrations/new";

  const finish = () => {
    if (!name.trim()) {
      toast.error("Informe o nome da aplicação");
      return;
    }
    onOpenChange(false);

    const appId = slug || "untitled";
    const ownerEmail = `${team.toLowerCase().replace(/\s+/g, "")}@orkestrai.ai`;
    const baseTags = template.id === "__blank__" ? [] : (template.tags ?? []);

    // Always catalog the application first
    if (template.kind === "agent") {
      addAgentFlow({
        id: appId, name, slug, description, area, team,
        owner: ownerEmail,
        version: "v0.1.0",
        status: "draft",
        tags: [template.source, ...baseTags],
        fanIn: [], fanOut: [], rags: [],
      });
    } else {
      addOrchestration({
        id: appId, name, slug, description, area, team,
        owner: ownerEmail,
        version: "v0.1.0",
        status: "draft",
        tags: [template.source, ...baseTags],
        fanIn: [], fanOut: [], agents: [],
      });
    }

    if (template.source === "highcode") {
      // High-code: go to detail page (pipeline will run)
      toast.success(`"${name}" catalogado. Pipeline de deploy iniciado.`);
      if (template.kind === "agent") {
        navigate({ to: "/agents/$id", params: { id: appId } });
      } else {
        navigate({ to: "/orchestrations/$id", params: { id: appId } });
      }
    } else {
      // Low-code / blank: go to editor
      toast.success(`"${name}" catalogado. Abrindo editor.`);
      const search: Record<string, string> = { appId };
      if (template.id !== "__blank__") {
        search.template = template.id;
      }
      navigate({ to: target, search });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Novo {template.kind === "agent" ? "agente" : "orquestração"} a partir de template
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Template:
            <Badge variant="outline" className="border-primary/40 text-primary">
              {template.name}
            </Badge>
            <span className="text-muted-foreground">· passo {step} de 2</span>
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Nome da aplicação</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Customer Support Assistant"
              />
              <p className="font-mono text-[10px] text-muted-foreground">slug: {slug}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Time responsável</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Platform">Platform</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Customer Success">Customer Success</SelectItem>
                  <SelectItem value="Data">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Ambiente inicial</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Visibilidade</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {template.kind === "agent" && (
              <div className="space-y-2">
                <Label className="text-xs">LLM padrão</Label>
                <Select value={llm} onValueChange={setLlm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                    <SelectItem value="anthropic/claude-4.5-sonnet">Claude 4.5 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <p className="font-semibold">Resumo</p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                <li>name: {name}</li>
                <li>slug: {slug}</li>
                <li>team: {team}</li>
                <li>env: {environment}</li>
                <li>visibility: {visibility}</li>
                {template.kind === "agent" && <li>llm: {llm}</li>}
                <li>template: {template.id}</li>
                {template.source === "highcode" && template.repoUrl && (
                  <li>repo: {template.repoUrl}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" /> Voltar
              </Button>
            )}
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                Próximo <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                onClick={finish}
                className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" /> Criar e abrir
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
