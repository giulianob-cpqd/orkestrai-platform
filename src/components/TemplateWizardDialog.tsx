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
  const [visibility, setVisibility] = useState("pessoal");
  const [parameters, setParameters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && template) {
      setStep(1);
      setName(template.name);
      setDescription(template.description);
      // Initialize parameters with default values
      if (template.parameters) {
        const initialParams: Record<string, string> = {};
        template.parameters.forEach((p) => {
          initialParams[p.id] = p.defaultValue || "";
        });
        setParameters(initialParams);
      }
    }
  }, [open, template]);

  if (!template) return null;

  const slug = slugify(name) || "untitled";
  const target = template.kind === "agent" ? "/agents/new" : "/orchestrations/new";
  
  // Calculate total steps: 1 (basic) + 1 (parameters if has any) + 1 (config)
  const hasParameters = template.parameters && template.parameters.length > 0;
  const totalSteps = hasParameters ? 3 : 2;

  const finish = () => {
    if (!name.trim()) {
      toast.error("Informe o nome da aplicação");
      return;
    }
    onOpenChange(false);

    const appId = slug || "untitled";
    const ownerEmail = `${team.toLowerCase().replace(/\s+/g, "")}@orkestrai.ai`;
    const baseTags = template.id === "__blank__" ? [] : (template.tags ?? []);
    const defaultEnvironment = "dev";
    const defaultArea = "General";

    // Always catalog the application first
    if (template.kind === "agent") {
      addAgentFlow({
        id: appId, name, slug, description, area: defaultArea, team,
        owner: ownerEmail,
        version: "v0.1.0",
        status: "deploying",
        tags: [template.source, ...baseTags],
        codeLevel: template.source === "highcode" ? "highcode" : "lowcode",
        fanIn: [], fanOut: [], rags: [],
        envStatus: {
          [defaultEnvironment]: { status: "deploying", version: "v0.1.0" },
        },
      });
    } else {
      addOrchestration({
        id: appId, name, slug, description, area: defaultArea, team,
        owner: ownerEmail,
        version: "v0.1.0",
        status: "deploying",
        tags: [template.source, ...baseTags],
        codeLevel: template.source === "highcode" ? "highcode" : "lowcode",
        fanIn: [], fanOut: [], agents: [],
        envStatus: {
          [defaultEnvironment]: { status: "deploying", version: "v0.1.0" },
        },
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
      // Pass parameters to editor
      if (Object.keys(parameters).length > 0) {
        search.templateParams = JSON.stringify(parameters);
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
            <span className="text-muted-foreground">· passo {step} de {totalSteps}</span>
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
        ) : step === 2 && hasParameters ? (
          <div className="space-y-4">
            <div>
              <p className="font-display text-sm font-semibold mb-3">Configurar parâmetros do template</p>
              <p className="text-xs text-muted-foreground mb-4">
                Customize os parâmetros que serão substituídos no template ao criar a aplicação.
              </p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {template.parameters?.map((param) => (
                <div key={param.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">{param.name}</Label>
                    {param.required && (
                      <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                        required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                  {param.type === "select" && param.options ? (
                    <Select value={parameters[param.id] || ""} onValueChange={(v) => setParameters({ ...parameters, [param.id]: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {param.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param.type === "number" ? (
                    <Input
                      type="number"
                      value={parameters[param.id] || ""}
                      onChange={(e) => setParameters({ ...parameters, [param.id]: e.target.value })}
                      placeholder={param.defaultValue}
                    />
                  ) : (
                    <Input
                      value={parameters[param.id] || ""}
                      onChange={(e) => setParameters({ ...parameters, [param.id]: e.target.value })}
                      placeholder={param.defaultValue}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Visibilidade</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                  <SelectItem value="equipe">Equipe</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <p className="font-semibold">Resumo</p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                <li>name: {name}</li>
                <li>slug: {slug}</li>
                <li>team: {team}</li>
                <li>visibility: {visibility}</li>
                <li>template: {template.id}</li>
                {template.source === "highcode" && template.repoUrl && (
                  <li>repo: {template.repoUrl}</li>
                )}
                {Object.keys(parameters).length > 0 && (
                  <>
                    <li className="mt-2 font-semibold text-foreground">parameters:</li>
                    {Object.entries(parameters).map(([key, value]) => (
                      <li key={key} className="ml-4">
                        {key}: {value || "(empty)"}
                      </li>
                    ))}
                  </>
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
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" /> Voltar
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
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
