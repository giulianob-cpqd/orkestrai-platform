import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { type MessageTemplate } from "@/data/executions";

interface MessageTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: MessageTemplate;
  onSave: (template: MessageTemplate) => void;
}

export function MessageTemplateModal({ open, onOpenChange, template, onSave }: MessageTemplateModalProps) {
  const [name, setName] = useState(template?.name ?? "");
  const [markdown, setMarkdown] = useState(template?.markdown ?? "");
  const [parameters, setParameters] = useState<Record<string, string>>(template?.parameters ?? {});
  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const handleAddParameter = () => {
    if (paramKey.trim()) {
      setParameters({ ...parameters, [paramKey]: paramValue });
      setParamKey("");
      setParamValue("");
    }
  };

  const handleRemoveParameter = (key: string) => {
    const updated = { ...parameters };
    delete updated[key];
    setParameters(updated);
  };

  const handleSave = () => {
    const newTemplate: MessageTemplate = {
      id: template?.id ?? `mt_${Date.now()}`,
      name: name || "Sem nome",
      markdown,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    };
    onSave(newTemplate);
    onOpenChange(false);
  };

  // Replace parameters in markdown for preview
  const previewMarkdown = Object.entries(parameters).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, "g"), value),
    markdown
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Template de Mensagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do template */}
          <div>
            <label className="text-xs font-medium mb-1 block">Nome do template</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Template de Aprovação"
            />
          </div>

          <Separator />

          {/* Editor e Preview */}
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Markdown</label>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Digite seu markdown aqui. Use {{paramName}} para parâmetros.&#10;&#10;Exemplo:&#10;**Título**&#10;Descrição com {{parameter}}"
                  className="min-h-[300px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Use <code className="bg-muted px-1 rounded">{'{{paramName}}'}</code> para inserir parâmetros
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-3">
              <div className="border rounded-lg p-4 bg-muted/20 min-h-[300px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => <code className="bg-muted px-1 rounded text-xs">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-2">{children}</blockquote>,
                    }}
                  >
                    {previewMarkdown || "Nenhum conteúdo para visualizar"}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Parâmetros */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Parâmetros</h3>

            <div className="space-y-2">
              {Object.entries(parameters).map(([key, value]) => (
                <Card key={key} className="p-3 flex items-center justify-between">
                  <div className="text-xs space-y-1">
                    <div>
                      <Badge variant="outline" className="font-mono">{key}</Badge>
                    </div>
                    <div className="text-muted-foreground">Valor: {value}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveParameter(key)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Card>
              ))}
            </div>

            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Nome do parâmetro</label>
                  <Input
                    size="sm"
                    value={paramKey}
                    onChange={(e) => setParamKey(e.target.value)}
                    placeholder="Ex: department"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Valor padrão</label>
                  <Input
                    size="sm"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    placeholder="Ex: Marketing"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleAddParameter} className="w-full h-8">
                <Plus className="h-3 w-3 mr-1" />
                Adicionar parâmetro
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
