import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileQuestion, Code2, GitBranch, Sparkles } from "lucide-react";
import { templatesByKind, getTemplate, type TemplateKind, type Template } from "@/data/templates";
import { TemplateWizardDialog } from "@/components/TemplateWizardDialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: TemplateKind;
}

/** Virtual blank template used when user picks "Blank flow" */
function makeBlankTemplate(kind: TemplateKind): Template {
  return {
    id: "__blank__",
    name: kind === "agent" ? "New Agent" : "New Orchestration",
    description: "",
    kind,
    source: "lowcode",
    tags: [],
    author: "",
    updatedAt: "",
  };
}

export function NewFromTemplateDialog({ open, onOpenChange, kind }: Props) {
  const [selected, setSelected] = useState<string | "blank" | null>(null);
  const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null);
  const list = templatesByKind(kind);

  const proceed = () => {
    if (!selected) return;
    onOpenChange(false);
    if (selected === "blank") {
      setTimeout(() => setWizardTemplate(makeBlankTemplate(kind)), 200);
    } else {
      const tpl = getTemplate(selected);
      if (tpl) {
        setTimeout(() => setWizardTemplate(tpl), 200);
      }
    }
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {kind === "agent" ? "Novo agente" : "Nova orquestração"}
            </DialogTitle>
            <DialogDescription>
              Comece a partir de um template ou de um fluxo em branco.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card
                onClick={() => setSelected("blank")}
                className={cn(
                  "cursor-pointer border-border bg-card/80 p-4 transition-all hover:border-primary/60",
                  selected === "blank" && "border-primary ring-2 ring-primary/40",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">Blank flow</p>
                    <p className="text-[11px] text-muted-foreground">Comece do zero no canvas.</p>
                  </div>
                </div>
              </Card>

              {list.map((t) => (
                <Card
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={cn(
                    "cursor-pointer border-border bg-card/80 p-4 transition-all hover:border-primary/60",
                    selected === t.id && "border-primary ring-2 ring-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-semibold">{t.name}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[10px]",
                        t.source === "lowcode"
                          ? "border-primary/40 text-primary"
                          : "border-warning/40 text-warning",
                      )}
                    >
                      {t.source === "lowcode" ? <GitBranch className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
                      {t.source}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={proceed}
              disabled={!selected}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemplateWizardDialog
        open={!!wizardTemplate}
        onOpenChange={(o) => { if (!o) setWizardTemplate(null); }}
        template={wizardTemplate}
      />
    </>
  );
}
